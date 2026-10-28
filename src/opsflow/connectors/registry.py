"""Connector registry and factory."""

from collections.abc import Callable
from typing import Any

from opsflow.connectors.base import Connector
from opsflow.core.errors import ConnectorNotFoundError

_CONNECTOR_REGISTRY: dict[str, type[Connector]] = {}


def register_connector(connector_type: str) -> Callable[[type[Connector]], type[Connector]]:
    """Decorator to register a connector implementation class."""
    def decorator(cls: type[Connector]) -> type[Connector]:
        _CONNECTOR_REGISTRY[connector_type] = cls
        return cls
    return decorator


def get_connector_class(connector_type: str) -> type[Connector]:
    """Retrieve connector class for the given type name."""
    cls = _CONNECTOR_REGISTRY.get(connector_type)
    if not cls:
        raise ConnectorNotFoundError(f"No connector registered for type '{connector_type}'")
    return cls


def create_connector(connector_type: str, name: str, config: dict[str, Any]) -> Connector:
    """Instantiate a connector by type."""
    cls = get_connector_class(connector_type)
    # Connector implementations accept (name, config)
    return cls(name=name, **config)  # type: ignore[call-arg]
