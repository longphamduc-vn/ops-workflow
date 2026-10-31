"""Transform step: data transformation using JMESPath and value mappings."""

from typing import Any

import jmespath

from opsflow.core.context import Context
from opsflow.core.logger import dev_log_transform
from opsflow.core.models import Result
from opsflow.steps.base import Step
from opsflow.steps.registry import register_step


def _apply_mappings(data: Any, mappings: dict[str, dict[str, Any]]) -> Any:
    """Apply dictionary value mappings recursively to transformed data."""
    if isinstance(data, list):
        return [_apply_mappings(item, mappings) for item in data]
    elif isinstance(data, dict):
        mapped = dict(data)
        for field, mapping in mappings.items():
            if field in mapped:
                orig_val = str(mapped[field])
                if orig_val in mapping:
                    mapped[field] = mapping[orig_val]
        return mapped
    return data


@register_step("transform")
class TransformStep(Step):
    """Executes data query and transformation using JMESPath."""

    type = "transform"

    async def execute(self, config: dict[str, Any], ctx: Context) -> Result:
        raw_input = config.get("input")
        expression = config.get("expression", "@")
        mappings = config.get("mappings") or {}

        try:
            # Query with jmespath
            transformed = jmespath.search(expression, raw_input)
            if mappings and isinstance(mappings, dict):
                transformed = _apply_mappings(transformed, mappings)

            dev_log_transform(
                engine=config.get("engine", "jmespath"),
                expression=expression,
                input_data=raw_input,
                output_data=transformed,
            )

            return Result(ok=True, data=transformed)
        except Exception as exc:
            return Result(
                ok=False,
                error=None,
                meta={"error": f"Transform evaluation error: {exc}"},
            )
