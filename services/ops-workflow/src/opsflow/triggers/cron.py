"""Cron scheduling trigger using APScheduler."""

from collections.abc import Callable
from typing import Any

from apscheduler.schedulers.asyncio import AsyncIOScheduler  # type: ignore[import-untyped]
from apscheduler.triggers.cron import CronTrigger  # type: ignore[import-untyped]

from opsflow.core.models import WorkflowDefinition


class CronTriggerManager:
    """Manages scheduled cron jobs for workflows."""

    def __init__(self, default_timezone: str = "Asia/Ho_Chi_Minh") -> None:
        self.default_timezone = default_timezone
        self.scheduler = AsyncIOScheduler(timezone=default_timezone)

    def schedule_workflow(
        self,
        workflow: WorkflowDefinition,
        run_callback: Callable[[WorkflowDefinition], Any],
    ) -> bool:
        """Register a workflow with a cron trigger."""
        if workflow.trigger.type != "cron" or not workflow.trigger.cron:
            return False

        tz = workflow.trigger.timezone or self.default_timezone
        parts = workflow.trigger.cron.strip().split()
        if len(parts) != 5:
            return False

        minute, hour, day, month, day_of_week = parts
        trigger = CronTrigger(
            minute=minute,
            hour=hour,
            day=day,
            month=month,
            day_of_week=day_of_week,
            timezone=tz,
        )

        self.scheduler.add_job(
            func=run_callback,
            trigger=trigger,
            args=[workflow],
            id=f"cron_{workflow.name}",
            replace_existing=True,
        )
        return True

    def start(self) -> None:
        """Start the scheduler in the current asyncio event loop."""
        if not self.scheduler.running:
            self.scheduler.start()

    def shutdown(self) -> None:
        """Gracefully stop the scheduler."""
        if self.scheduler.running:
            self.scheduler.shutdown(wait=False)

    def get_scheduled_job_ids(self) -> list[str]:
        """Return IDs of currently active cron jobs."""
        return [job.id for job in self.scheduler.get_jobs()]
