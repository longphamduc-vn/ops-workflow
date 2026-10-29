"""Connector protocol definition."""

from typing import Any, Protocol

from opsflow.core.models import Result


class Connector(Protocol):
    """Protocol for external system integrations."""

    name: str

    async def authenticate(self) -> None:
        """Perform authentication against the external system."""
        ...

    async def call(self, operation: str, params: dict[str, Any]) -> Result:
        """Invoke an operation on the external system and return normalized Result."""
        ...

    async def health_check(self) -> bool:
        """Verify connectivity and health of the external system."""
        ...

    async def close(self) -> None:
        """Release underlying connections or resources."""
        ...
