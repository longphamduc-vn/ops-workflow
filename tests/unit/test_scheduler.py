"""Unit tests for WorkflowScheduler execution, topological order, and crash-resume simulation."""

import asyncio
from typing import Any

import pytest

from opsflow.core.context import Context
from opsflow.core.models import (
    ErrorInfo,
    OnErrorConfig,
    Result,
    StepConfig,
    TriggerConfig,
    WorkflowDefinition,
)
from opsflow.core.scheduler import WorkflowScheduler
from opsflow.store.repository import RunRepository


class FakeStepRunner:
    def __init__(self, recorder: list[str], fail_steps: set[str] | None = None) -> None:
        self.recorder = recorder
        self.fail_steps = fail_steps or set()

    async def execute(self, config: dict[str, Any], ctx: Context) -> Result:
        step_id = config.get("_id", "unknown")
        # Simulating slight delay to test parallel scheduling
        await asyncio.sleep(0.01)
        self.recorder.append(step_id)

        if step_id in self.fail_steps:
            return Result(
                ok=False,
                error=ErrorInfo(
                    kind="business",
                    code="FAIL",
                    message=f"Step {step_id} simulated failure",
                    retryable=False,
                ),
            )
        return Result(ok=True, data={"step": step_id, "done": True})


@pytest.mark.asyncio
async def test_scheduler_runs_in_topological_order() -> None:
    recorder: list[str] = []

    def make_runner(st_type: str) -> FakeStepRunner:
        return FakeStepRunner(recorder)

    # Graph: a -> b, a -> c, (b, c) -> d
    wf = WorkflowDefinition(
        version="1.0",
        name="topo-test",
        trigger=TriggerConfig(type="manual"),
        steps=[
            StepConfig(id="d", type="call", needs=["b", "c"], with_params={"_id": "d"}),
            StepConfig(id="c", type="call", needs=["a"], with_params={"_id": "c"}),
            StepConfig(id="b", type="call", needs=["a"], with_params={"_id": "b"}),
            StepConfig(id="a", type="call", with_params={"_id": "a"}),
        ],
    )

    scheduler = WorkflowScheduler(wf, step_factory=make_runner)
    run_id, status, ctx = await scheduler.run()

    assert status == "success"
    assert recorder[0] == "a"
    assert recorder[-1] == "d"
    assert set(recorder[1:3]) == {"b", "c"}
    assert ctx.step_statuses["d"] == "success"


@pytest.mark.asyncio
async def test_scheduler_on_error_stop_strategy() -> None:
    recorder: list[str] = []
    # step_b fails; step_c depends on step_b and should not run
    wf = WorkflowDefinition(
        version="1.0",
        name="stop-strategy-test",
        trigger=TriggerConfig(type="manual"),
        on_error=OnErrorConfig(strategy="stop"),
        steps=[
            StepConfig(id="a", type="call", with_params={"_id": "a"}),
            StepConfig(id="b", type="call", needs=["a"], with_params={"_id": "b"}),
            StepConfig(id="c", type="call", needs=["b"], with_params={"_id": "c"}),
        ],
    )

    runner = FakeStepRunner(recorder, fail_steps={"b"})
    scheduler = WorkflowScheduler(wf, step_factory=lambda _: runner)
    run_id, status, ctx = await scheduler.run()

    assert status == "failed"
    assert "a" in recorder
    assert "b" in recorder
    assert "c" not in recorder
    assert ctx.step_statuses["b"] == "failed"
    assert "c" not in ctx.step_statuses


@pytest.mark.asyncio
async def test_scheduler_crash_resume_simulation(tmp_path: Any) -> None:
    db_path = tmp_path / "test_store.db"
    repo = RunRepository(f"sqlite+aiosqlite:///{db_path}")
    await repo.init_db()

    recorder: list[str] = []

    # Run 1: s1 succeeds, s2 fails
    wf = WorkflowDefinition(
        version="1.0",
        name="crash-resume-test",
        trigger=TriggerConfig(type="manual"),
        steps=[
            StepConfig(id="s1", type="call", with_params={"_id": "s1"}),
            StepConfig(id="s2", type="call", needs=["s1"], with_params={"_id": "s2"}),
            StepConfig(id="s3", type="call", needs=["s2"], with_params={"_id": "s3"}),
        ],
    )

    runner_run1 = FakeStepRunner(recorder, fail_steps={"s2"})
    scheduler1 = WorkflowScheduler(wf, repository=repo, step_factory=lambda _: runner_run1)
    run_id, status1, ctx1 = await scheduler1.run()

    assert status1 == "failed"
    assert recorder == ["s1", "s2"]
    assert ctx1.step_statuses["s1"] == "success"
    assert ctx1.step_statuses["s2"] == "failed"

    # Now simulate crash recovery:
    # Run 2: resume the same run_id, but now the issue at s2 is resolved (no fail_steps)
    recorder.clear()
    runner_run2 = FakeStepRunner(recorder, fail_steps=set())
    scheduler2 = WorkflowScheduler(wf, repository=repo, step_factory=lambda _: runner_run2)

    run_id_resumed, status2, ctx2 = await scheduler2.run(run_id=run_id, resume_from_existing=True)

    assert status2 == "success"
    # s1 was already completed in the store, so it was NOT re-executed!
    assert "s1" not in recorder
    assert recorder == ["s2", "s3"]
    assert ctx2.step_statuses["s1"] == "success"
    assert ctx2.step_statuses["s2"] == "success"
    assert ctx2.step_statuses["s3"] == "success"
