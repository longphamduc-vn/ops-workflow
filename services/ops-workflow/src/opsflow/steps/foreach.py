"""Foreach step: parallel or bounded iteration over an item collection."""

import asyncio
from typing import Any

from opsflow.core.context import Context
from opsflow.core.logger import dev_log_foreach
from opsflow.core.models import Result
from opsflow.steps.base import Step
from opsflow.steps.registry import create_step, register_step


@register_step("foreach")
class ForeachStep(Step):
    """Iterates over an array of items, running a sub-step for each item."""

    type = "foreach"

    async def execute(self, config: dict[str, Any], ctx: Context) -> Result:
        items = config.get("items")
        if not items:
            return Result(ok=True, data=[])

        if not isinstance(items, list):
            items = [items]

        concurrency = int(config.get("concurrency", 1))
        on_item_error = config.get("on_item_error", "fail")
        child_step_config = config.get("step")

        dev_log_foreach(items_count=len(items), concurrency=concurrency, on_error=on_item_error)

        if not isinstance(child_step_config, dict):
            return Result(ok=False, meta={"error": "Missing 'step' configuration in foreach"})

        child_type = child_step_config.get("type", "call")
        child_with = child_step_config.get("with", {})

        semaphore = asyncio.Semaphore(concurrency)
        has_error = False
        error_msg = ""

        async def _run_item(idx: int, item: Any) -> Any:
            nonlocal has_error, error_msg
            async with semaphore:
                child_ctx = ctx.with_item(item)
                interpolated_with = child_ctx.interpolate(child_with)
                runner = create_step(child_type)

                try:
                    res = await runner.execute(interpolated_with, child_ctx)
                    if not res.ok:
                        if on_item_error == "fail":
                            has_error = True
                            error_msg = res.error.message if res.error else "Child step failed"
                            return None
                        return None
                    return res.data
                except Exception as exc:
                    if on_item_error == "fail":
                        has_error = True
                        error_msg = str(exc)
                    return None

        tasks = [_run_item(i, it) for i, it in enumerate(items)]
        completed_outputs = await asyncio.gather(*tasks)

        if has_error and on_item_error == "fail":
            return Result(ok=False, meta={"error": f"Foreach item failure: {error_msg}"})

        final_outputs = [out for out in completed_outputs if out is not None]
        return Result(ok=True, data=final_outputs)
