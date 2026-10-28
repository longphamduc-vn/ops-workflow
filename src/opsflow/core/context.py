"""Execution context for workflow runs and steps."""

from datetime import UTC, datetime
from typing import Any

from opsflow.core.expression import ExpressionEvaluator


class Context:
    """Carries workflow runtime state, inputs, outputs, and variable interpolation."""

    def __init__(
        self,
        run_id: str,
        inputs: dict[str, Any] | None = None,
        env: dict[str, str] | None = None,
        step_outputs: dict[str, Any] | None = None,
        step_statuses: dict[str, str] | None = None,
        item: Any = None,
        started_at: str | None = None,
        connectors: dict[str, Any] | None = None,
    ) -> None:
        self.run_id = run_id
        self.inputs = inputs if inputs is not None else {}
        self.env = env if env is not None else {}
        self.step_outputs = step_outputs if step_outputs is not None else {}
        self.step_statuses = step_statuses if step_statuses is not None else {}
        self.item = item
        self.started_at = started_at or datetime.now(UTC).isoformat()
        self.connectors: dict[str, Any] = connectors if connectors is not None else {}

    @property
    def _evaluator(self) -> ExpressionEvaluator:
        """Create a fresh evaluator bound to current live context state."""
        return ExpressionEvaluator(
            inputs=self.inputs,
            env=self.env,
            step_outputs=self.step_outputs,
            item=self.item,
            run_id=self.run_id,
            started_at=self.started_at,
        )

    def interpolate(self, val: Any) -> Any:
        """Interpolate ${...} expressions against the current context."""
        return self._evaluator.interpolate(val)

    def evaluate_condition(self, condition: str) -> bool:
        """Evaluate a boolean condition string against current context state."""
        return self._evaluator.evaluate_condition(condition)

    def record_step_status(self, step_id: str, status: str) -> None:
        """Update the execution status of a step."""
        self.step_statuses[step_id] = status

    def record_step_output(self, step_id: str, outputs: Any) -> None:
        """Record the output data of a completed step."""
        self.step_outputs[step_id] = outputs

    def with_item(self, item: Any) -> "Context":
        """Create a child context bound to a foreach loop item."""
        return Context(
            run_id=self.run_id,
            inputs=self.inputs,
            env=self.env,
            step_outputs=self.step_outputs,
            step_statuses=self.step_statuses,
            item=item,
            started_at=self.started_at,
            connectors=self.connectors,
        )
