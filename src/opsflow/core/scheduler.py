"""Parallel DAG workflow scheduler with persistence and crash-resume support."""

import asyncio
import uuid
from collections.abc import Callable
from typing import Any

from opsflow.core.context import Context
from opsflow.core.dag import DAG
from opsflow.core.executor import StepExecutor
from opsflow.core.models import Result, StepConfig, WorkflowDefinition
from opsflow.steps.base import Step
from opsflow.steps.registry import create_step
from opsflow.store.repository import RunRepository


class WorkflowScheduler:
    """Orchestrates parallel step execution based on DAG dependencies and error handling strategies."""

    def __init__(
        self,
        workflow: WorkflowDefinition,
        connectors: dict[str, Any] | None = None,
        repository: RunRepository | None = None,
        max_concurrency: int = 5,
        step_factory: Callable[[str], Step] | None = None,
    ) -> None:
        self.workflow = workflow
        self.connectors = connectors or {}
        self.repository = repository
        self.max_concurrency = max_concurrency
        self.step_factory = step_factory or create_step
        self.dag = DAG(workflow.steps)

    async def run(
        self,
        inputs: dict[str, Any] | None = None,
        run_id: str | None = None,
        resume_from_existing: bool = False,
    ) -> tuple[str, str, Context]:
        """Execute a workflow run.

        Returns (run_id, final_status, context).
        final_status is 'success' or 'failed'.
        """
        active_run_id = run_id or f"run_{uuid.uuid4().hex[:16]}"
        effective_inputs = inputs or {}

        # 1. Initialize context with connectors
        ctx = Context(
            run_id=active_run_id,
            inputs=effective_inputs,
            env=self.workflow.env,
            connectors=self.connectors,
        )

        # 2. Check existing state if resuming
        if resume_from_existing and self.repository:
            existing_steps = await self.repository.get_step_runs(active_run_id)
            for sr in existing_steps:
                # Reuse succeeded or skipped step results; retry failed steps
                if sr.status in ("success", "skipped"):
                    ctx.record_step_status(sr.step_id, sr.status)
                    if sr.outputs and "data" in sr.outputs:
                        ctx.record_step_output(sr.step_id, sr.outputs["data"])

        # 3. Persist run start
        if self.repository:
            existing_run = await self.repository.get_run(active_run_id)
            if not existing_run:
                await self.repository.create_run(
                    active_run_id, self.workflow.name, effective_inputs
                )
            await self.repository.update_run_status(active_run_id, "running")

        # 4. Schedule step executions
        completed_steps: set[str] = {
            s.id
            for s in self.workflow.steps
            if ctx.step_statuses.get(s.id) in ("success", "skipped")
        }
        failed_steps: set[str] = set()

        semaphore = asyncio.Semaphore(self.max_concurrency)
        running_tasks: dict[str, asyncio.Task[Result]] = {}
        stop_scheduling = False

        strategy = self.workflow.on_error.strategy if self.workflow.on_error else "stop"

        while len(completed_steps) + len(failed_steps) < len(self.workflow.steps):
            if stop_scheduling:
                break

            # Find ready steps whose dependencies have all completed or failed
            ready_steps = []
            for step in self.workflow.steps:
                if (
                    step.id in completed_steps
                    or step.id in failed_steps
                    or step.id in running_tasks
                ):
                    continue

                # Check if all dependencies have finished
                deps_finished = all(
                    dep in completed_steps or dep in failed_steps for dep in step.needs
                )
                if deps_finished:
                    # If any dependency failed and strategy is 'continue', check if step can run
                    dep_failed = any(dep in failed_steps for dep in step.needs)
                    if dep_failed and step.run_if == "all_success":
                        # Mark as skipped directly
                        ctx.record_step_status(step.id, "skipped")
                        completed_steps.add(step.id)
                        if self.repository:
                            await self.repository.create_or_update_step_run(
                                active_run_id, step.id, "skipped"
                            )
                        continue

                    ready_steps.append(step)

            if not ready_steps and not running_tasks:
                # No more progress can be made (deadlock or blocked by failures)
                break

            # Launch ready steps
            for step in ready_steps:
                executor = StepExecutor(
                    step_config=step,
                    defaults=self.workflow.defaults,
                    step_factory=self.step_factory,
                )

                async def _run_step(st: StepConfig = step, ex: StepExecutor = executor) -> Result:
                    async with semaphore:
                        # Persist running status before execution
                        if self.repository:
                            await self.repository.create_or_update_step_run(
                                active_run_id, st.id, "running"
                            )
                        res: Result = await ex.execute(ctx)
                        # Persist final step status
                        if self.repository:
                            err_dict = (
                                {
                                    "kind": res.error.kind,
                                    "code": res.error.code,
                                    "message": res.error.message,
                                }
                                if res.error
                                else None
                            )
                            await self.repository.create_or_update_step_run(
                                active_run_id,
                                st.id,
                                ctx.step_statuses.get(st.id, "failed"),
                                attempt=res.meta.get("attempts", 1),
                                latency_ms=res.meta.get("latency_ms", 0),
                                outputs=res.data,
                                error=err_dict,
                            )
                        return res

                running_tasks[step.id] = asyncio.create_task(_run_step())

            if not running_tasks:
                break

            # Wait for at least one task to finish
            done, _ = await asyncio.wait(
                running_tasks.values(),
                return_when=asyncio.FIRST_COMPLETED,
            )

            # Process completed tasks
            done_step_ids = [sid for sid, task in running_tasks.items() if task in done]
            for sid in done_step_ids:
                task = running_tasks.pop(sid)
                task.result()

                step_obj = self.dag.step_map[sid]
                step_status = ctx.step_statuses.get(sid, "failed")

                if step_status == "failed" and not step_obj.continue_on_error:
                    failed_steps.add(sid)
                    if strategy == "stop":
                        stop_scheduling = True
                        # Cancel remaining running tasks
                        for _running_id, t in list(running_tasks.items()):
                            t.cancel()
                        break
                else:
                    completed_steps.add(sid)

        # 5. Final status and outputs
        has_critical_failure = bool(failed_steps)
        final_status = "failed" if has_critical_failure else "success"

        # Evaluate publish if success
        final_outputs: dict[str, Any] = {}
        if final_status == "success" and self.workflow.publish:
            pub_source = ctx.interpolate(self.workflow.publish.source)
            final_outputs = {self.workflow.publish.dataset: pub_source}

        if self.repository:
            err_summary = {"failed_steps": list(failed_steps)} if has_critical_failure else None
            await self.repository.update_run_status(
                active_run_id,
                status=final_status,
                outputs=final_outputs,
                error=err_summary,
            )

        return active_run_id, final_status, ctx
