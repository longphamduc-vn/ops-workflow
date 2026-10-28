"""Core exception classes for the opsflow workflow engine.

All engine-specific errors derive from OpsflowError. Dedicated sub-exceptions
are provided for validation, DAG cycle detection, step execution, and connector faults.
"""

from typing import Any


class OpsflowError(Exception):
    """Base exception for all opsflow engine errors."""

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class ValidationError(OpsflowError):
    """Raised when a workflow specification violates schema or semantic rules."""

    def __init__(
        self,
        message: str,
        field_path: str,
        rule_number: int | None = None,
        suggestion: str | None = None,
    ) -> None:
        super().__init__(message)
        self.field_path = field_path
        self.rule_number = rule_number
        self.suggestion = suggestion

    def __str__(self) -> str:
        parts = [f"Validation error at '{self.field_path}': {self.message}"]
        if self.rule_number is not None:
            parts.append(f"(Rule {self.rule_number})")
        if self.suggestion:
            parts.append(f"Suggestion: {self.suggestion}")
        return " ".join(parts)


class CycleError(OpsflowError):
    """Raised when a workflow dependency graph contains a cycle."""

    def __init__(self, message: str, cycle_path: list[str]) -> None:
        super().__init__(message)
        self.cycle_path = cycle_path

    def __str__(self) -> str:
        path_str = " -> ".join(self.cycle_path)
        return f"{self.message}: {path_str}"


class ExpressionError(OpsflowError):
    """Raised when expression evaluation fails or attempts unauthorized access."""


class ExecutionError(OpsflowError):
    """Raised when a workflow run encounters an unrecoverable runtime error."""


class StepExecutionError(ExecutionError):
    """Raised when a specific step execution fails."""

    def __init__(self, step_id: str, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(f"Step '{step_id}' failed: {message}")
        self.step_id = step_id
        self.details = details or {}


class StepTimeoutError(StepExecutionError):
    """Raised when a step exceeds its configured timeout duration."""


class ConnectorNotFoundError(OpsflowError):
    """Raised when a referenced connector is not registered or configured."""


class SecretNotFoundError(OpsflowError):
    """Raised when a referenced secret cannot be retrieved from the provider."""
