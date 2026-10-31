"""Fixture registry storing sample requests and responses."""

import json
import logging
from pathlib import Path

from ems_sim.models.definition import FixtureDefinition
from ems_sim.models.protocol import NexacroRequest, NexacroResponse

logger = logging.getLogger(__name__)


class FixtureRegistry:
    """Stores and retrieves API fixtures."""

    def __init__(self) -> None:
        self._fixtures: dict[str, FixtureDefinition] = {}
        self._fixtures_by_api: dict[str, list[FixtureDefinition]] = {}

    def register(self, fixture: FixtureDefinition) -> None:
        self._fixtures[fixture.id] = fixture
        if fixture.api_id not in self._fixtures_by_api:
            self._fixtures_by_api[fixture.api_id] = []
        self._fixtures_by_api[fixture.api_id].append(fixture)

    def get(self, fixture_id: str) -> FixtureDefinition | None:
        return self._fixtures.get(fixture_id)

    def find_for_request(self, api_id: str, request: NexacroRequest) -> FixtureDefinition | None:
        """Find matching fixture for a given API and request parameters."""
        candidates = self._fixtures_by_api.get(api_id, [])
        if not candidates:
            return None

        # Try exact parameter match first
        for fix in candidates:
            match_params = fix.match.get("params", {})
            if match_params:
                matched = True
                for k, v in match_params.items():
                    if request.get_param(k) != v:
                        matched = False
                        break
                if matched:
                    return fix

        # Return default fixture for this API
        return candidates[0]

    def load_from_directory(self, directory: Path) -> int:
        count = 0
        if not directory.exists():
            return count

        for file_path in directory.glob("*.json"):
            try:
                with open(file_path, encoding="utf-8") as f:
                    data = json.load(f)
                    if data and "id" in data:
                        fix_def = FixtureDefinition(
                            id=data["id"],
                            api_id=data["api_id"],
                            match=data.get("match", {}),
                            response=NexacroResponse.model_validate(data["response"]),
                        )
                        self.register(fix_def)
                        count += 1
            except Exception as e:
                logger.error(f"Failed to load fixture from {file_path}: {e}")
        return count
