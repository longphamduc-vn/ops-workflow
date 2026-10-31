"""Call step: invokes an operation on an external connector."""

from typing import Any

from opsflow.core.context import Context
from opsflow.core.errors import ConnectorNotFoundError
from opsflow.core.logger import dev_log_call, dev_log_call_response
from opsflow.core.models import Result
from opsflow.steps.base import Step
from opsflow.steps.registry import register_step


@register_step("call")
class CallStep(Step):
    """Executes a call to a configured external connector."""

    type = "call"

    async def execute(self, config: dict[str, Any], ctx: Context) -> Result:
        connector_name = config.get("connector")
        if not connector_name:
            return Result(
                ok=False,
                error=None,
                meta={"error": "Missing 'connector' in call step configuration"},
            )

        connector = getattr(ctx, "connectors", {}).get(connector_name)
        if not connector:
            raise ConnectorNotFoundError(
                f"Connector '{connector_name}' not found in execution context"
            )

        operation = config.get("operation", "")
        # Forward parameters, in_datasets, and params
        params: dict[str, Any] = {
            "params": config.get("params", {}),
            "in_datasets": config.get("in_datasets"),
            "out_datasets": config.get("out_datasets"),
        }
        params.update(config.get("params", {}))

        dev_log_call(
            connector=connector_name,
            operation=operation,
            params=params.get("params"),
            in_datasets=params.get("in_datasets"),
        )

        res: Result = await connector.call(operation, params)

        dev_log_call_response(
            connector=connector_name,
            operation=operation,
            ok=res.ok,
            data=res.data,
            error=res.error,
            meta=res.meta,
        )
        return res
