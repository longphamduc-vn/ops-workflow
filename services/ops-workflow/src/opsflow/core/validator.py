"""Comprehensive semantic and structural validation for opsflow workflows.

Implements all 10 validator rules required by section 10 of AGENTS.md.
"""

import re
from pathlib import Path
from typing import Any

from opsflow.core.dag import DAG
from opsflow.core.errors import ValidationError
from opsflow.core.models import (
    WorkflowDefinition,
)
from opsflow.core.parser import load_workflow_from_file, load_workflow_from_string

# Regex pattern for extracting ${steps.<step_id>...}
STEP_REF_PATTERN = re.compile(r"\$\{steps\.([a-zA-Z0-9_]+)[^\}]*\}")
# Regex for valid dataset identifier: e.g. equipment_status, dataset_v1
DATASET_IDENTIFIER_PATTERN = re.compile(r"^[a-z][a-z0-9_]*$")
# Sensitive field names to scan for hard-coded secrets
SECRET_FIELD_NAMES = {
    "password",
    "token",
    "api_key",
    "secret",
    "access_token",
    "auth_token",
    "client_secret",
}


def _extract_step_references(val: Any) -> list[str]:
    """Recursively search for step references ${steps.<step_id>...} in strings, dicts, or lists."""
    refs: list[str] = []
    if isinstance(val, str):
        refs.extend(STEP_REF_PATTERN.findall(val))
    elif isinstance(val, dict):
        for v in val.values():
            refs.extend(_extract_step_references(v))
    elif isinstance(val, list):
        for item in val:
            refs.extend(_extract_step_references(item))
    return refs


def _scan_for_hardcoded_secrets(obj: Any, current_path: str) -> list[ValidationError]:
    """Scan arbitrary nested objects for non-templated secret values (Rule 6)."""
    errors: list[ValidationError] = []

    if isinstance(obj, dict):
        for k, v in obj.items():
            field_name = str(k).lower()
            field_path = f"{current_path}.{k}" if current_path else str(k)

            if any(secret_kw in field_name for secret_kw in SECRET_FIELD_NAMES):
                # If value is string and not formatted like ${secrets.SOMETHING}
                if isinstance(v, str) and not (v.startswith("${secrets.") and v.endswith("}")):
                    errors.append(
                        ValidationError(
                            message=f"Hard-coded secret detected in field '{field_path}'. Secrets must not be stored in plain text.",
                            field_path=field_path,
                            rule_number=6,
                            suggestion=f"Replace plain text with '${{secrets.{field_name.upper()}}}'",
                        )
                    )
            errors.extend(_scan_for_hardcoded_secrets(v, field_path))
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            errors.extend(_scan_for_hardcoded_secrets(item, f"{current_path}[{i}]"))

    return errors


class WorkflowValidator:
    """Validator enforcing the 10 core validation rules on a WorkflowDefinition."""

    def __init__(
        self,
        workflow: WorkflowDefinition,
        known_datasets: dict[str, str] | None = None,
    ) -> None:
        self.workflow = workflow
        self.known_datasets = known_datasets or {}
        self.errors: list[ValidationError] = []

    def validate(self) -> list[ValidationError]:
        """Run all validator checks and return a list of discovered ValidationErrors."""
        self.errors = []
        self._check_rule_1_unique_step_ids()
        self._check_rule_2_needs_exist()
        self._check_rule_3_no_cycles()
        self._check_rule_4_connectors_declared()
        self._check_rule_5_step_output_references()
        self._check_rule_6_no_hardcoded_secrets()
        self._check_rule_7_nexacro_allowed_services()
        self._check_rule_8_foreach_concurrency()
        self._check_rule_9_publish_dataset()

        return self.errors

    def _check_rule_1_unique_step_ids(self) -> None:
        """Rule 1: Step ids are unique."""
        seen: set[str] = set()
        for i, step in enumerate(self.workflow.steps):
            if step.id in seen:
                self.errors.append(
                    ValidationError(
                        message=f"Duplicate step id '{step.id}' detected.",
                        field_path=f"steps[{i}].id",
                        rule_number=1,
                        suggestion=f"Rename step '{step.id}' to a unique identifier.",
                    )
                )
            seen.add(step.id)

    def _check_rule_2_needs_exist(self) -> None:
        """Rule 2: Every needs entry refers to an existing id."""
        all_ids = {s.id for s in self.workflow.steps}
        for i, step in enumerate(self.workflow.steps):
            for j, dep in enumerate(step.needs):
                if dep not in all_ids:
                    self.errors.append(
                        ValidationError(
                            message=f"Step '{step.id}' references non-existent step '{dep}' in needs.",
                            field_path=f"steps[{i}].needs[{j}]",
                            rule_number=2,
                            suggestion=f"Declare step '{dep}' in steps list or remove it from needs.",
                        )
                    )

    def _check_rule_3_no_cycles(self) -> None:
        """Rule 3: No dependency cycles (report the cycle path)."""
        dag = DAG(self.workflow.steps)
        cycle = dag.detect_cycles()
        if cycle:
            cycle_str = " -> ".join(cycle)
            self.errors.append(
                ValidationError(
                    message=f"Dependency cycle detected: {cycle_str}",
                    field_path="steps",
                    rule_number=3,
                    suggestion="Break the circular dependency by removing or reversing one of the 'needs' links.",
                )
            )

    def _check_rule_4_connectors_declared(self) -> None:
        """Rule 4: Every referenced connector: is declared."""
        declared_connectors = set(self.workflow.connectors.keys())

        for i, step in enumerate(self.workflow.steps):
            # Check direct step.with_params
            conn = step.with_params.get("connector")
            if conn and isinstance(conn, str) and conn not in declared_connectors:
                self.errors.append(
                    ValidationError(
                        message=f"Referenced connector '{conn}' is not declared in workflow connectors.",
                        field_path=f"steps[{i}].with.connector",
                        rule_number=4,
                        suggestion=f"Declare '{conn}' under 'connectors' section in workflow definition.",
                    )
                )

            # Check foreach child step connector
            if step.type == "foreach":
                child_step = step.with_params.get("step")
                if isinstance(child_step, dict):
                    child_with = child_step.get("with", {})
                    if isinstance(child_with, dict):
                        child_conn = child_with.get("connector")
                        if (
                            child_conn
                            and isinstance(child_conn, str)
                            and child_conn not in declared_connectors
                        ):
                            self.errors.append(
                                ValidationError(
                                    message=f"Child step in foreach '{step.id}' references undeclared connector '{child_conn}'.",
                                    field_path=f"steps[{i}].with.step.with.connector",
                                    rule_number=4,
                                    suggestion=f"Declare '{child_conn}' under 'connectors' section.",
                                )
                            )

    def _check_rule_5_step_output_references(self) -> None:
        """Rule 5: ${steps.x...} references only steps in the current step's needs chain."""
        dag = DAG(self.workflow.steps)

        for i, step in enumerate(self.workflow.steps):
            ancestors = dag.get_ancestors(step.id)
            # Scan step condition, with_params, and outputs
            step_data: dict[str, Any] = {
                "if": step.if_cond,
                "with": step.with_params,
                "outputs": step.outputs,
            }
            refs = _extract_step_references(step_data)
            for ref in refs:
                if ref not in ancestors:
                    self.errors.append(
                        ValidationError(
                            message=f"Step '{step.id}' references '${{steps.{ref}...}}', but '{ref}' is not in its dependency chain (needs).",
                            field_path=f"steps[{i}].with",
                            rule_number=5,
                            suggestion=f"Add '{ref}' to step '{step.id}.needs' or access an ancestor step's output.",
                        )
                    )

    def _check_rule_6_no_hardcoded_secrets(self) -> None:
        """Rule 6: No hard-coded secrets (only ${secrets.*}); scan password, token, etc."""
        # Scan connectors
        for conn_name, conn in self.workflow.connectors.items():
            conn_dict = conn.model_dump()
            secret_errs = _scan_for_hardcoded_secrets(conn_dict, f"connectors.{conn_name}")
            self.errors.extend(secret_errs)

        # Scan steps
        for i, step in enumerate(self.workflow.steps):
            step_dict = step.model_dump()
            secret_errs = _scan_for_hardcoded_secrets(step_dict, f"steps[{i}]")
            self.errors.extend(secret_errs)

    def _check_rule_7_nexacro_allowed_services(self) -> None:
        """Rule 7: Nexacro: every operation must be in allowed_services."""
        for i, step in enumerate(self.workflow.steps):
            conn_name = step.with_params.get("connector")
            op = step.with_params.get("operation")
            if conn_name and op:
                conn = self.workflow.connectors.get(conn_name)
                if conn and conn.type == "nexacro":
                    if op not in conn.allowed_services:
                        self.errors.append(
                            ValidationError(
                                message=f"Operation '{op}' is not in allowed_services for Nexacro connector '{conn_name}'.",
                                field_path=f"steps[{i}].with.operation",
                                rule_number=7,
                                suggestion=f"Add '{op}' to connector '{conn_name}.allowed_services' or verify service name.",
                            )
                        )

            # Also check nested step in foreach
            if step.type == "foreach":
                child_step = step.with_params.get("step")
                if isinstance(child_step, dict):
                    child_with = child_step.get("with", {})
                    if isinstance(child_with, dict):
                        c_conn_name = child_with.get("connector")
                        c_op = child_with.get("operation")
                        if c_conn_name and c_op:
                            conn = self.workflow.connectors.get(c_conn_name)
                            if conn and conn.type == "nexacro":
                                if c_op not in conn.allowed_services:
                                    self.errors.append(
                                        ValidationError(
                                            message=f"Operation '{c_op}' in foreach child step is not in allowed_services for Nexacro connector '{c_conn_name}'.",
                                            field_path=f"steps[{i}].with.step.with.operation",
                                            rule_number=7,
                                            suggestion=f"Add '{c_op}' to connector '{c_conn_name}.allowed_services'.",
                                        )
                                    )

    def _check_rule_8_foreach_concurrency(self) -> None:
        """Rule 8: foreach: concurrency >= 1 and not above the connector's max_concurrent."""
        for i, step in enumerate(self.workflow.steps):
            if step.type == "foreach":
                concurrency = step.with_params.get("concurrency", 1)
                if not isinstance(concurrency, int) or concurrency < 1:
                    self.errors.append(
                        ValidationError(
                            message=f"Foreach step '{step.id}' concurrency must be an integer >= 1 (got {concurrency}).",
                            field_path=f"steps[{i}].with.concurrency",
                            rule_number=8,
                            suggestion="Set concurrency to a positive integer.",
                        )
                    )
                    continue

                # Check against child connector limits
                child_step = step.with_params.get("step")
                if isinstance(child_step, dict):
                    child_with = child_step.get("with", {})
                    if isinstance(child_with, dict):
                        conn_name = child_with.get("connector")
                        if conn_name and conn_name in self.workflow.connectors:
                            conn = self.workflow.connectors[conn_name]
                            max_c = conn.limits.max_concurrent
                            if concurrency > max_c:
                                self.errors.append(
                                    ValidationError(
                                        message=f"Foreach step '{step.id}' concurrency ({concurrency}) exceeds connector '{conn_name}' max_concurrent ({max_c}).",
                                        field_path=f"steps[{i}].with.concurrency",
                                        rule_number=8,
                                        suggestion=f"Reduce concurrency to {max_c} or increase connector '{conn_name}' limits.max_concurrent.",
                                    )
                                )

    def _check_rule_9_publish_dataset(self) -> None:
        """Rule 9: publish.dataset names are unique across all workflows and valid identifiers."""
        if not self.workflow.publish:
            return

        dataset = self.workflow.publish.dataset
        if not DATASET_IDENTIFIER_PATTERN.match(dataset):
            self.errors.append(
                ValidationError(
                    message=f"Dataset name '{dataset}' is not a valid identifier (must match '^[a-z][a-z0-9_]*$').",
                    field_path="publish.dataset",
                    rule_number=9,
                    suggestion="Rename dataset to follow snake_case identifier rules (e.g. 'equipment_status').",
                )
            )

        # Cross-workflow uniqueness check
        if dataset in self.known_datasets:
            owner_wf = self.known_datasets[dataset]
            if owner_wf != self.workflow.name:
                self.errors.append(
                    ValidationError(
                        message=f"Dataset name '{dataset}' is already published by workflow '{owner_wf}'. Dataset names must be unique across workflows.",
                        field_path="publish.dataset",
                        rule_number=9,
                        suggestion=f"Use a distinct dataset name or version it (e.g. '{dataset}_v2').",
                    )
                )


def validate_workflow(
    workflow_or_path: WorkflowDefinition | str | Path,
    known_datasets: dict[str, str] | None = None,
) -> list[ValidationError]:
    """Validate a workflow definition or file path against all validation rules."""
    if isinstance(workflow_or_path, (str, Path)):
        path = Path(workflow_or_path)
        if path.exists():
            wf = load_workflow_from_file(path)
        else:
            # Try parsing string content directly
            wf = load_workflow_from_string(str(workflow_or_path))
    else:
        wf = workflow_or_path

    validator = WorkflowValidator(wf, known_datasets=known_datasets)
    return validator.validate()


def validate_workflow_strict(
    workflow_or_path: WorkflowDefinition | str | Path,
    known_datasets: dict[str, str] | None = None,
) -> None:
    """Validate workflow and raise the first ValidationError if any rules are violated."""
    errors = validate_workflow(workflow_or_path, known_datasets=known_datasets)
    if errors:
        raise errors[0]
