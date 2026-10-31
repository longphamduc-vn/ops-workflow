"""Skeleton and baseline tests for opsflow."""

from opsflow.core.errors import CycleError, OpsflowError, ValidationError


def test_core_errors_hierarchy() -> None:
    err = ValidationError(
        message="Invalid step",
        field_path="steps[0].id",
        rule_number=1,
        suggestion="Ensure step id is unique",
    )
    assert isinstance(err, OpsflowError)
    assert err.field_path == "steps[0].id"
    assert "Rule 1" in str(err)
    assert "Suggestion" in str(err)

    cycle_err = CycleError("Dependency cycle detected", ["step_a", "step_b", "step_a"])
    assert "step_a -> step_b -> step_a" in str(cycle_err)
