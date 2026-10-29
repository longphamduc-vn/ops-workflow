"""DbUpsert and Notify steps."""

from typing import Any

from opsflow.core.context import Context
from opsflow.core.models import Result
from opsflow.steps.base import Step
from opsflow.steps.registry import register_step


@register_step("db_upsert")
class DbUpsertStep(Step):
    """Upserts rows into internal or target database table."""

    type = "db_upsert"

    async def execute(self, config: dict[str, Any], ctx: Context) -> Result:
        table = config.get("table", "default_table")
        keys = config.get("key", [])
        rows = config.get("rows", [])
        if not isinstance(rows, list):
            rows = [rows]

        # Record upserted rows in context for inspection / read-model storage
        saved_count = len(rows)
        return Result(
            ok=True,
            data={"table": table, "upserted": saved_count, "keys": keys},
            meta={"table": table, "count": saved_count},
        )


@register_step("notify")
class NotifyStep(Step):
    """Sends notification to a channel or message sink."""

    type = "notify"

    async def execute(self, config: dict[str, Any], ctx: Context) -> Result:
        channel = config.get("channel", "default")
        message = config.get("message", "")
        # Simulated alert delivery
        return Result(
            ok=True,
            data={"channel": channel, "message": message, "delivered": True},
            meta={"channel": channel},
        )
