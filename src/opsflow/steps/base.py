"""Step protocol definition."""

from typing import Any, ClassVar, Protocol

from opsflow.core.context import Context
from opsflow.core.models import Result


class Step(Protocol):
    """Protocol for workflow step execution."""

    type: ClassVar[str]

    async def execute(self, config: dict[str, Any], ctx: Context) -> Result:
        """Execute step logic with given parameters and context, returning a Result."""
        ...
