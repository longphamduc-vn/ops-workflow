"""Step execution engine with retry, timeout, and condition handling."""

import asyncio
import random
import re
import time
from collections.abc import Callable
from typing import Any

from opsflow.core.context import Context
from opsflow.core.logger import dev_log_step_finish, dev_log_step_start
from opsflow.core.models import (
    ErrorInfo,
    Result,
    RetryConfig,
    StepConfig,
    StepDefaults,
)
from opsflow.steps.base import Step
from opsflow.steps.registry import create_step

DURATION_REGEX = re.compile(r"^(\d+(?:\.\d+)?)\s*(ms|s|m|h)?$")


def parse_duration_seconds(duration: str | int | float | None) -> float:
    """Parse duration string like '30s', '500ms', '2m', '1h' into floating seconds."""
    if duration is None:
        return 30.0
    if isinstance(duration, (int, float)):
        return float(duration)

    match = DURATION_REGEX.match(duration.strip())
    if not match:
        return 30.0

    val = float(match.group(1))
    unit = match.group(2) or "s"

    if unit == "ms":
        return val / 1000.0
    elif unit == "s":
        return val
    elif unit == "m":
        return val * 60.0
    elif unit == "h":
        return val * 3600.0
    return val


def calculate_backoff_delay(
    attempt: int,
    base_delay_sec: float,
    strategy: str = "exponential",
    max_cap_sec: float = 60.0,
) -> float:
    """Calculate retry delay with exponential/fixed backoff and ±10% jitter."""
    if strategy == "fixed":
        delay = base_delay_sec
    else:
        delay = base_delay_sec * (2 ** (attempt - 1))

    delay = min(delay, max_cap_sec)
    jitter_factor = random.uniform(0.9, 1.1)
    return delay * jitter_factor


class StepExecutor:
    """Executes an individual step evaluating conditions, timeouts, and retry policies."""

    def __init__(
        self,
        step_config: StepConfig,
        defaults: StepDefaults | None = None,
        step_factory: Callable[[str], Step] | None = None,
    ) -> None:
        self.step_config = step_config
        self.defaults = defaults or StepDefaults()
        self.step_factory = step_factory or create_step

    def should_run(self, ctx: Context) -> tuple[bool, str | None]:
        """Check run_if dependency condition and if data condition."""
        # 1. Evaluate run_if
        run_if = self.step_config.run_if
        dep_statuses = [ctx.step_statuses.get(dep, "pending") for dep in self.step_config.needs]

        if run_if == "all_success":
            if any(status != "success" for status in dep_statuses):
                return False, f"run_if 'all_success' not met. Dependency statuses: {dep_statuses}"
        elif run_if == "all_success_or_skipped":
            if any(status not in ("success", "skipped") for status in dep_statuses):
                return False, f"run_if 'all_success_or_skipped' not met. Statuses: {dep_statuses}"
        elif run_if == "failure":
            if not any(status == "failed" for status in dep_statuses):
                return False, "run_if 'failure' not met (no dependencies failed)"

        # 2. Evaluate 'if' condition on data
        if self.step_config.if_cond:
            try:
                cond_result = ctx.evaluate_condition(self.step_config.if_cond)
                if not cond_result:
                    return False, f"if condition '{self.step_config.if_cond}' evaluated to False"
            except Exception as exc:
                return False, f"if condition evaluation error: {exc}"

        return True, None

    async def execute(self, ctx: Context) -> Result:
        """Execute the step lifecycle, recording statuses and outputs."""
        should_execute, skip_reason = self.should_run(ctx)
        if not should_execute:
            ctx.record_step_status(self.step_config.id, "skipped")
            dev_log_step_finish(self.step_config.id, self.step_config.type, "skipped", 0)
            return Result(
                ok=True,
                data=None,
                meta={"skipped": True, "reason": skip_reason},
            )

        ctx.record_step_status(self.step_config.id, "running")
        dev_log_step_start(self.step_config.id, self.step_config.type, self.step_config.with_params)

        # Determine effective timeout
        timeout_str = self.step_config.timeout or self.defaults.timeout
        timeout_sec = parse_duration_seconds(timeout_str)

        # Determine effective retry policy
        retry_policy = self.step_config.retry or self.defaults.retry or RetryConfig()
        max_attempts = retry_policy.max_attempts if self.step_config.idempotent else 1
        base_delay_sec = parse_duration_seconds(retry_policy.delay)

        # Instantiate runner
        step_runner = self.step_factory(self.step_config.type)

        attempt = 0
        last_result: Result | None = None
        start_time = time.monotonic()

        while attempt < max_attempts:
            attempt += 1

            # Interpolate parameters at execution time
            if self.step_config.type == "foreach":
                # For foreach, interpolate items and options, but keep nested 'step' un-interpolated
                # so it is dynamically evaluated per-item inside ForeachStep
                interpolated_with = dict(self.step_config.with_params)
                for k, v in self.step_config.with_params.items():
                    if k != "step":
                        interpolated_with[k] = ctx.interpolate(v)
            else:
                interpolated_with = ctx.interpolate(self.step_config.with_params)

            try:
                result = await asyncio.wait_for(
                    step_runner.execute(interpolated_with, ctx),
                    timeout=timeout_sec,
                )
                last_result = result
            except TimeoutError:
                last_result = Result(
                    ok=False,
                    error=ErrorInfo(
                        kind="timeout",
                        code="TIMEOUT",
                        message=f"Step '{self.step_config.id}' timed out after {timeout_sec}s",
                        retryable=True,
                    ),
                    meta={"attempt": attempt},
                )
            except Exception as exc:
                last_result = Result(
                    ok=False,
                    error=ErrorInfo(
                        kind="internal",
                        code=exc.__class__.__name__,
                        message=str(exc),
                        retryable=False,
                    ),
                    meta={"attempt": attempt},
                )

            if last_result.ok:
                break

            # Check if retryable
            err = last_result.error
            is_retryable = err and err.retryable and (err.kind in retry_policy.on)
            if not is_retryable or attempt >= max_attempts:
                break

            delay = calculate_backoff_delay(attempt, base_delay_sec, strategy=retry_policy.backoff)
            await asyncio.sleep(delay)

        elapsed_ms = int((time.monotonic() - start_time) * 1000)
        assert last_result is not None
        last_result.meta.update({"attempts": attempt, "latency_ms": elapsed_ms})

        if last_result.ok:
            ctx.record_step_status(self.step_config.id, "success")
            outputs = self._extract_outputs(last_result.data, ctx)
            ctx.record_step_output(self.step_config.id, outputs)
            last_result.data = outputs
            dev_log_step_finish(
                self.step_config.id,
                self.step_config.type,
                "success",
                elapsed_ms,
                outputs=outputs,
            )
        else:
            ctx.record_step_status(self.step_config.id, "failed")
            dev_log_step_finish(
                self.step_config.id,
                self.step_config.type,
                "failed",
                elapsed_ms,
                error=last_result.error,
            )

        return last_result

    def _extract_outputs(self, data: Any, ctx: Context) -> Any:
        """Process step outputs declaration against returned data."""
        if not self.step_config.outputs:
            return data

        extracted: dict[str, Any] = {}
        for out_name, out_spec in self.step_config.outputs.items():
            if isinstance(out_spec, str) and out_spec.startswith("$."):
                prop = out_spec[2:]
                if isinstance(data, dict):
                    extracted[out_name] = data.get(prop)
                else:
                    extracted[out_name] = data
            else:
                extracted[out_name] = ctx.interpolate(out_spec)
        return extracted
