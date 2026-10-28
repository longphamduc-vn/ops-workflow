"""Unit tests for StepExecutor retry, timeout, and condition handling."""

import asyncio
from typing import Any

import pytest

from opsflow.core.context import Context
from opsflow.core.executor import StepExecutor
from opsflow.core.models import ErrorInfo, Result, RetryConfig, StepConfig


class FlakyStepRunner:
    type = "flaky"

    def __init__(self, fail_times: int = 1, error_kind: str = "network", retryable: bool = True) -> None:
        self.fail_times = fail_times
        self.calls = 0
        self.error_kind = error_kind
        self.retryable = retryable

    async def execute(self, config: dict[str, Any], ctx: Context) -> Result:
        self.calls += 1
        if self.calls <= self.fail_times:
            return Result(
                ok=False,
                error=ErrorInfo(
                    kind=self.error_kind,  # type: ignore[arg-type]
                    code="ERR_FAIL",
                    message="Transient failure",
                    retryable=self.retryable,
                ),
            )
        return Result(ok=True, data={"result": "success", "calls": self.calls})


class SlowStepRunner:
    type = "slow"

    async def execute(self, config: dict[str, Any], ctx: Context) -> Result:
        await asyncio.sleep(0.5)
        return Result(ok=True, data="finished")


@pytest.mark.asyncio
async def test_step_retry_succeeds_on_second_attempt() -> None:
    runner = FlakyStepRunner(fail_times=1, error_kind="network", retryable=True)
    step_cfg = StepConfig(
        id="s1",
        type="call",
        retry=RetryConfig(max_attempts=3, delay="10ms", on=["network"]),
    )
    executor = StepExecutor(step_cfg, step_factory=lambda _: runner)
    ctx = Context(run_id="run_retry")

    res = await executor.execute(ctx)
    assert res.ok is True
    assert runner.calls == 2
    assert ctx.step_statuses["s1"] == "success"
    assert res.meta["attempts"] == 2


@pytest.mark.asyncio
async def test_step_no_retry_when_not_retryable() -> None:
    runner = FlakyStepRunner(fail_times=3, error_kind="business", retryable=False)
    step_cfg = StepConfig(
        id="s1",
        type="call",
        retry=RetryConfig(max_attempts=3, delay="10ms", on=["network"]),
    )
    executor = StepExecutor(step_cfg, step_factory=lambda _: runner)
    ctx = Context(run_id="run_no_retry")

    res = await executor.execute(ctx)
    assert res.ok is False
    assert runner.calls == 1  # Should not retry
    assert ctx.step_statuses["s1"] == "failed"


@pytest.mark.asyncio
async def test_step_idempotent_false_disables_retry() -> None:
    runner = FlakyStepRunner(fail_times=2, error_kind="network", retryable=True)
    step_cfg = StepConfig(
        id="s1",
        type="call",
        idempotent=False,  # auto-retry disabled!
        retry=RetryConfig(max_attempts=3, delay="10ms", on=["network"]),
    )
    executor = StepExecutor(step_cfg, step_factory=lambda _: runner)
    ctx = Context(run_id="run_non_idempotent")

    res = await executor.execute(ctx)
    assert res.ok is False
    assert runner.calls == 1
    assert ctx.step_statuses["s1"] == "failed"


@pytest.mark.asyncio
async def test_step_timeout_triggers_failure() -> None:
    runner = SlowStepRunner()
    step_cfg = StepConfig(
        id="s1",
        type="call",
        timeout="50ms",
        retry=RetryConfig(max_attempts=1),
    )
    executor = StepExecutor(step_cfg, step_factory=lambda _: runner)
    ctx = Context(run_id="run_timeout")

    res = await executor.execute(ctx)
    assert res.ok is False
    assert res.error is not None
    assert res.error.kind == "timeout"
    assert ctx.step_statuses["s1"] == "failed"


@pytest.mark.asyncio
async def test_step_if_data_condition_skips() -> None:
    runner = FlakyStepRunner()
    step_cfg = StepConfig(
        id="s1",
        type="call",
        if_cond="inputs['skip_me'] == False",
    )
    executor = StepExecutor(step_cfg, step_factory=lambda _: runner)
    ctx = Context(run_id="run_skip", inputs={"skip_me": True})

    res = await executor.execute(ctx)
    assert res.ok is True
    assert res.meta.get("skipped") is True
    assert ctx.step_statuses["s1"] == "skipped"
    assert runner.calls == 0
