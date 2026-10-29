"""Unit tests for ApprovalStep."""

import pytest

from opsflow.core.context import Context
from opsflow.steps.approval import ApprovalStep


@pytest.mark.asyncio
async def test_approval_step_approved_via_inputs() -> None:
    step = ApprovalStep()
    ctx = Context(
        run_id="run_app_01",
        inputs={
            "approval_decision": "approved",
            "approved_by": "alice@company.com",
            "approval_comment": "LGTM",
        },
    )

    res = await step.execute({"assignees": ["alice@company.com"], "timeout": "1h"}, ctx)
    assert res.ok is True
    assert res.data["status"] == "approved"
    assert res.data["approved_by"] == "alice@company.com"
    assert res.data["comment"] == "LGTM"


@pytest.mark.asyncio
async def test_approval_step_rejected_via_inputs() -> None:
    step = ApprovalStep()
    ctx = Context(
        run_id="run_app_02",
        inputs={
            "approval_decision": "rejected",
            "approved_by": "bob@company.com",
            "approval_comment": "Budget exceeded",
        },
    )

    res = await step.execute({"assignees": ["bob@company.com"]}, ctx)
    assert res.ok is False
    assert res.error is not None
    assert res.error.code == "APPROVAL_REJECTED"
    assert "Budget exceeded" in res.error.message


@pytest.mark.asyncio
async def test_approval_step_timeout_policy_approve() -> None:
    step = ApprovalStep()
    ctx = Context(run_id="run_app_03", inputs={})

    res = await step.execute(
        {
            "assignees": ["manager@company.com"],
            "timeout": "2h",
            "on_timeout": "approve",
            "timed_out": True,
        },
        ctx,
    )
    assert res.ok is True
    assert res.data["status"] == "approved_by_timeout"
    assert res.data["timeout"] == "2h"


@pytest.mark.asyncio
async def test_approval_step_timeout_policy_reject() -> None:
    step = ApprovalStep()
    ctx = Context(run_id="run_app_04", inputs={})

    res = await step.execute(
        {
            "assignees": ["manager@company.com"],
            "timeout": "30m",
            "on_timeout": "reject",
            "timed_out": True,
        },
        ctx,
    )
    assert res.ok is False
    assert res.error is not None
    assert res.error.code == "APPROVAL_TIMEOUT"


@pytest.mark.asyncio
async def test_approval_step_pending_without_decision() -> None:
    step = ApprovalStep()
    ctx = Context(run_id="run_app_05", inputs={})

    res = await step.execute({"assignees": ["lead@company.com"]}, ctx)
    assert res.ok is False
    assert res.error is not None
    assert res.error.code == "APPROVAL_PENDING"
