"""Workflow YAML parsing and schema loading."""

from pathlib import Path
from typing import Any

import yaml
from pydantic import ValidationError as PydanticValidationError

from opsflow.core.errors import ValidationError
from opsflow.core.models import WorkflowDefinition


def _normalize_yaml_keys(obj: Any) -> Any:
    """Normalize YAML dictionary keys to handle YAML 1.1 boolean keywords like 'on' and 'off'."""
    if isinstance(obj, dict):
        normalized: dict[str, Any] = {}
        for k, v in obj.items():
            if k is True:
                str_k = "on"
            elif k is False:
                str_k = "off"
            else:
                str_k = str(k)
            normalized[str_k] = _normalize_yaml_keys(v)
        return normalized
    elif isinstance(obj, list):
        return [_normalize_yaml_keys(item) for item in obj]
    return obj


def parse_workflow_yaml(content: str, source_path: str = "<string>") -> dict[str, Any]:
    """Parse raw YAML content safely into a dictionary."""
    try:
        data = yaml.safe_load(content)
    except yaml.YAMLError as exc:
        raise ValidationError(
            message=f"YAML parsing error: {exc}",
            field_path="",
            suggestion="Verify YAML syntax, indentations, and special characters",
        ) from exc

    if not isinstance(data, dict):
        raise ValidationError(
            message="Workflow definition must be a YAML mapping/object",
            field_path="",
            suggestion="Ensure root level contains top-level keys like version, name, trigger, steps",
        )
    return _normalize_yaml_keys(data)  # type: ignore[no-any-return]


def load_workflow_from_file(path: Path | str) -> WorkflowDefinition:
    """Load, parse, and instantiate a WorkflowDefinition from a file."""
    file_path = Path(path)
    if not file_path.exists():
        raise ValidationError(
            message=f"Workflow file not found: {file_path}",
            field_path="path",
            suggestion="Check the file path and ensure it exists and is readable",
        )

    content = file_path.read_text(encoding="utf-8")
    return load_workflow_from_string(content, source_path=str(file_path))


def load_workflow_from_string(content: str, source_path: str = "<string>") -> WorkflowDefinition:
    """Load, parse, and instantiate a WorkflowDefinition from YAML string content."""
    raw_data = parse_workflow_yaml(content, source_path=source_path)

    try:
        return WorkflowDefinition.model_validate(raw_data)
    except PydanticValidationError as exc:
        first_err = exc.errors()[0]
        field_path = ".".join(str(p) for p in first_err["loc"])
        msg = first_err["msg"]
        raise ValidationError(
            message=msg,
            field_path=field_path,
            suggestion=f"Check field '{field_path}' against workflow specification schema",
        ) from exc
