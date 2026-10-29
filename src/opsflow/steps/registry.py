"""Step registry and factory."""

from collections.abc import Callable

from opsflow.core.errors import OpsflowError
from opsflow.steps.base import Step

_STEP_REGISTRY: dict[str, type[Step]] = {}


def register_step(step_type: str) -> Callable[[type[Step]], type[Step]]:
    """Decorator to register a step implementation class."""

    def decorator(cls: type[Step]) -> type[Step]:
        _STEP_REGISTRY[step_type] = cls
        return cls

    return decorator


def get_step_class(step_type: str) -> type[Step]:
    """Retrieve step class for given step type name."""
    cls = _STEP_REGISTRY.get(step_type)
    if not cls:
        raise OpsflowError(f"No step implementation registered for type '{step_type}'")
    return cls


def create_step(step_type: str) -> Step:
    """Instantiate a step runner by type."""
    cls = get_step_class(step_type)
    return cls()
