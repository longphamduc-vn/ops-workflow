"""Join step: relational joins between collections."""

from typing import Any

from opsflow.core.context import Context
from opsflow.core.models import Result
from opsflow.steps.base import Step
from opsflow.steps.registry import register_step


@register_step("join")
class JoinStep(Step):
    """Performs inner, left, or outer join between two lists of dicts."""

    type = "join"

    async def execute(self, config: dict[str, Any], ctx: Context) -> Result:
        left = config.get("left") or []
        right = config.get("right") or []
        on_key = config.get("on")
        how = config.get("how", "inner")

        if not isinstance(left, list) or not isinstance(right, list) or not on_key:
            return Result(ok=True, data=[])

        left_key = on_key[0] if isinstance(on_key, list) else on_key
        right_key = on_key[1] if isinstance(on_key, list) else on_key

        # Index right list by key
        right_map: dict[Any, list[dict[str, Any]]] = {}
        for r_item in right:
            if isinstance(r_item, dict):
                k = r_item.get(right_key)
                right_map.setdefault(k, []).append(r_item)

        matched_right_keys: set[Any] = set()
        joined: list[dict[str, Any]] = []

        for l_item in left:
            if not isinstance(l_item, dict):
                continue
            k = l_item.get(left_key)
            if k in right_map:
                matched_right_keys.add(k)
                for r_item in right_map[k]:
                    combined = dict(l_item)
                    combined.update(r_item)
                    joined.append(combined)
            elif how in ("left", "outer"):
                joined.append(dict(l_item))

        if how == "outer":
            for r_item in right:
                if isinstance(r_item, dict):
                    k = r_item.get(right_key)
                    if k not in matched_right_keys:
                        joined.append(dict(r_item))

        return Result(ok=True, data=joined)
