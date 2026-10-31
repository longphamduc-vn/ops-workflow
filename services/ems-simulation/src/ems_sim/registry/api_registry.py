"""API definition registry."""

import logging
from pathlib import Path

import yaml

from ems_sim.models.definition import ApiDefinition

logger = logging.getLogger(__name__)


class ApiRegistry:
    """Stores and resolves API definitions by ID and (method, path)."""

    def __init__(self) -> None:
        self._apis: dict[str, ApiDefinition] = {}
        self._route_map: dict[tuple[str, str], ApiDefinition] = {}

    def register(self, api_def: ApiDefinition) -> None:
        self._apis[api_def.id] = api_def
        method = api_def.endpoint.method.upper()
        # Normalize path
        path = api_def.endpoint.path
        if not path.startswith("/"):
            path = "/" + path
        self._route_map[(method, path)] = api_def

    def resolve(self, method: str, path: str) -> ApiDefinition | None:
        """Resolve API definition by HTTP method and relative URL path."""
        norm_method = method.upper()
        norm_path = path if path.startswith("/") else "/" + path

        # Direct match
        if (norm_method, norm_path) in self._route_map:
            return self._route_map[(norm_method, norm_path)]

        # Trailing slash tolerance
        alt_path = norm_path.rstrip("/") if norm_path.endswith("/") else norm_path + "/"
        if (norm_method, alt_path) in self._route_map:
            return self._route_map[(norm_method, alt_path)]

        return None

    def get_by_id(self, api_id: str) -> ApiDefinition | None:
        return self._apis.get(api_id)

    def list_all(self) -> list[ApiDefinition]:
        return list(self._apis.values())

    def load_from_directory(self, directory: Path) -> int:
        count = 0
        if not directory.exists():
            return count

        for file_path in directory.glob("*.yaml"):
            try:
                with open(file_path, encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                    if data and "id" in data:
                        api_def = ApiDefinition.model_validate(data)
                        self.register(api_def)
                        count += 1
            except Exception as e:
                logger.error(f"Failed to load API definition from {file_path}: {e}")
        return count
