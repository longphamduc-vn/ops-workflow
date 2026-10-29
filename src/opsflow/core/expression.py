"""Safe expression interpolation and sandboxed condition evaluation.

Complies with section 7 of AGENTS.md: No eval, sandboxed functions, strict namespace scoping.
"""

import re
from collections.abc import Sequence
from datetime import UTC, datetime
from typing import Any

from simpleeval import SimpleEval  # type: ignore[import-untyped]

from opsflow.core.errors import ExpressionError
from opsflow.secrets.provider import get_secret_provider

EXPR_PATTERN = re.compile(r"\$\{([a-zA-Z0-9_.]+)\}")


def _resolve_dotted_path(root: Any, path: Sequence[str]) -> Any:
    """Safely traverse a nested dictionary or object hierarchy by path segments."""
    curr = root
    for segment in path:
        if curr is None:
            return None
        if isinstance(curr, dict):
            curr = curr.get(segment)
        elif isinstance(curr, (list, tuple)):
            try:
                idx = int(segment)
                curr = curr[idx]
            except (ValueError, IndexError):
                return None
        elif hasattr(curr, segment):
            curr = getattr(curr, segment)
        else:
            return None
    return curr


class ExpressionEvaluator:
    """Evaluates expressions and interpolations against a workflow execution context."""

    def __init__(
        self,
        inputs: dict[str, Any] | None = None,
        env: dict[str, str] | None = None,
        step_outputs: dict[str, Any] | None = None,
        item: Any = None,
        run_id: str = "run_default",
        started_at: str | None = None,
    ) -> None:
        self.inputs = inputs or {}
        self.env = env or {}
        self.step_outputs = step_outputs or {}
        self.item = item
        self.run_id = run_id
        self.started_at = started_at or datetime.now(UTC).isoformat()
        self.secret_provider = get_secret_provider()

    def _resolve_variable(self, expr: str) -> Any:
        """Resolve a variable from allowed namespaces: inputs, env, secrets, steps, item, run."""
        parts = expr.split(".")
        namespace = parts[0]

        if namespace == "inputs":
            if len(parts) < 2:
                return self.inputs
            return _resolve_dotted_path(self.inputs, parts[1:])

        elif namespace == "env":
            if len(parts) < 2:
                return self.env
            return self.env.get(parts[1])

        elif namespace == "secrets":
            if len(parts) < 2:
                raise ExpressionError("Secret expression requires key name: '${secrets.KEY}'")
            return self.secret_provider.get_secret(parts[1])

        elif namespace == "steps":
            # ${steps.<step_id>.outputs...}
            if len(parts) < 2:
                return self.step_outputs
            step_id = parts[1]
            step_data = self.step_outputs.get(step_id, {})
            if len(parts) == 2:
                return step_data
            if parts[2] == "outputs":
                # Support both wrapped {"outputs": ...} and direct step_data
                target = (
                    step_data["outputs"]
                    if isinstance(step_data, dict) and "outputs" in step_data
                    else step_data
                )
                if len(parts) == 3:
                    return target
                return _resolve_dotted_path(target, parts[3:])
            return _resolve_dotted_path(step_data, parts[2:])

        elif namespace == "item":
            if len(parts) == 1:
                return self.item
            return _resolve_dotted_path(self.item, parts[1:])

        elif namespace == "run":
            if len(parts) >= 2:
                if parts[1] == "id":
                    return self.run_id
                elif parts[1] == "started_at":
                    return self.started_at
            return {"id": self.run_id, "started_at": self.started_at}

        raise ExpressionError(
            f"Unauthorized or unknown expression namespace '{namespace}'. Allowed: inputs, env, secrets, steps, item, run."
        )

    def interpolate(self, val: Any) -> Any:
        """Recursively interpolate ${...} expressions in strings, dictionaries, or lists."""
        if isinstance(val, str):
            # Check if entire string is exactly a single ${...} expression
            stripped = val.strip()
            match = EXPR_PATTERN.fullmatch(stripped)
            if match:
                var_name = match.group(1)
                return self._resolve_variable(var_name)

            # Otherwise, perform string substitution
            def repl(m: re.Match[str]) -> str:
                res = self._resolve_variable(m.group(1))
                return "" if res is None else str(res)

            return EXPR_PATTERN.sub(repl, val)

        elif isinstance(val, dict):
            return {k: self.interpolate(v) for k, v in val.items()}
        elif isinstance(val, list):
            return [self.interpolate(v) for v in val]
        return val

    def evaluate_condition(self, condition: str) -> bool:
        """Evaluate a boolean condition string safely without eval()."""
        if not condition or not condition.strip():
            return True

        # Pre-process expressions like any(steps.normalize.outputs, status == 'fault')
        evaluator = SimpleEval()

        # Build context variables
        eval_names: dict[str, Any] = {
            "inputs": self.inputs,
            "env": self.env,
            "steps": {
                sid: data.get("outputs", data) if isinstance(data, dict) else data
                for sid, data in self.step_outputs.items()
            },
            "item": self.item,
            "run": {"id": self.run_id, "started_at": self.started_at},
        }
        evaluator.names = eval_names

        # Custom safe functions
        def safe_any(iterable: Any, key_fn: Any = None) -> bool:
            if not iterable:
                return False
            if key_fn is None:
                return any(iterable)
            return any(key_fn(x) for x in iterable)

        def safe_all(iterable: Any, key_fn: Any = None) -> bool:
            if not iterable:
                return True
            if key_fn is None:
                return all(iterable)
            return all(key_fn(x) for x in iterable)

        def safe_contains(collection: Any, item: Any) -> bool:
            if collection is None:
                return False
            return item in collection

        evaluator.functions = {
            "any": safe_any,
            "all": safe_all,
            "len": len,
            "contains": safe_contains,
        }

        # Check for predicate pattern like: any(steps.normalize.outputs, status == 'fault')
        predicate_match = re.match(
            r"any\((.+?),\s*([a-zA-Z0-9_]+)\s*==\s*['\"](.+?)['\"]\)", condition.strip()
        )
        if predicate_match:
            collection_expr = predicate_match.group(1).strip()
            field_name = predicate_match.group(2).strip()
            target_val = predicate_match.group(3).strip()

            collection = self.interpolate(f"${{{collection_expr}}}")
            if isinstance(collection, list):
                return any(
                    isinstance(elem, dict) and str(elem.get(field_name)) == target_val
                    for elem in collection
                )
            return False

        try:
            result = evaluator.eval(condition)
            return bool(result)
        except Exception as exc:
            raise ExpressionError(f"Condition evaluation failed for '{condition}': {exc}") from exc
