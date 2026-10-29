"""Approval step: pauses or validates human-in-the-loop decisions."""

from datetime import UTC, datetime
from typing import Any, ClassVar

from opsflow.core.context import Context
from opsflow.core.models import ErrorInfo, Result
from opsflow.steps.base import Step
from opsflow.steps.registry import register_step


@register_step("approval")
class ApprovalStep(Step):
    """Workflow step requiring human-in-the-loop sign-off."""

    type: ClassVar[str] = "approval"

    async def execute(self, config: dict[str, Any], ctx: Context) -> Result:
        """Evaluate approval decision from context inputs or policies."""
        assignees = config.get("assignees", [])
        if isinstance(assignees, str):
            assignees = [a.strip() for a in assignees.split(",") if a.strip()]

        timeout = config.get("timeout", "24h")
        on_timeout = str(config.get("on_timeout", "reject")).lower()
        message = config.get("message", "Approval required")

        # Check if an explicit decision was injected in context inputs
        step_id = config.get("_step_id", "")
        approvals_map = ctx.inputs.get("approvals", {})
        decision_info = approvals_map.get(step_id) if isinstance(approvals_map, dict) else None

        if not decision_info and "approval_decision" in ctx.inputs:
            decision_info = {
                "decision": ctx.inputs.get("approval_decision"),
                "by": ctx.inputs.get("approved_by", "system_user"),
                "comment": ctx.inputs.get("approval_comment", ""),
            }

        if decision_info:
            decision = str(decision_info.get("decision", "")).lower()
            decided_by = str(decision_info.get("by", "unknown"))
            comment = str(decision_info.get("comment", ""))

            if decision in ("approve", "approved", "ok", "yes"):
                return Result(
                    ok=True,
                    data={
                        "status": "approved",
                        "assignees": assignees,
                        "approved_by": decided_by,
                        "comment": comment,
                        "decided_at": datetime.now(UTC).isoformat(),
                    },
                )
            else:
                return Result(
                    ok=False,
                    error=ErrorInfo(
                        kind="business",
                        code="APPROVAL_REJECTED",
                        message=f"Approval rejected by {decided_by}: {comment}",
                        retryable=False,
                    ),
                )

        # Check for simulated or real timeout handling
        if config.get("timed_out") is True or config.get("timeout_elapsed") is True:
            if on_timeout == "approve":
                return Result(
                    ok=True,
                    data={
                        "status": "approved_by_timeout",
                        "assignees": assignees,
                        "timeout": timeout,
                        "reason": f"Auto-approved after timeout policy ({on_timeout})",
                        "decided_at": datetime.now(UTC).isoformat(),
                    },
                )
            else:
                return Result(
                    ok=False,
                    error=ErrorInfo(
                        kind="timeout",
                        code="APPROVAL_TIMEOUT",
                        message=f"Approval timed out after {timeout} (policy: {on_timeout})",
                        retryable=False,
                    ),
                )

        # Default fallback: If default_decision is explicitly configured in step
        default_decision = config.get("default_decision")
        if default_decision == "approve":
            return Result(
                ok=True,
                data={
                    "status": "approved",
                    "assignees": assignees,
                    "approved_by": "default_policy",
                    "comment": message,
                    "decided_at": datetime.now(UTC).isoformat(),
                },
            )

        # If no decision and no timeout, pause / fail pending approval
        return Result(
            ok=False,
            error=ErrorInfo(
                kind="business",
                code="APPROVAL_PENDING",
                message=f"Approval pending for assignees: {assignees}. No decision provided.",
                retryable=False,
            ),
        )
