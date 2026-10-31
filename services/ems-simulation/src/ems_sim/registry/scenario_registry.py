"""Scenario registry for dynamic execution conditions."""

import logging
from pathlib import Path

import yaml

from ems_sim.models.definition import ScenarioDefinition
from ems_sim.models.protocol import NexacroRequest, NexacroResponse

logger = logging.getLogger(__name__)


class ScenarioRegistry:
    """Stores and evaluates simulation scenarios."""

    def __init__(self) -> None:
        self._scenarios: dict[str, ScenarioDefinition] = {}
        self._scenarios_by_api: dict[str, list[ScenarioDefinition]] = {}

    def register(self, scenario: ScenarioDefinition) -> None:
        self._scenarios[scenario.id] = scenario
        if scenario.api_id not in self._scenarios_by_api:
            self._scenarios_by_api[scenario.api_id] = []
        self._scenarios_by_api[scenario.api_id].append(scenario)
        # Keep sorted by priority ascending (lower number = higher priority)
        self._scenarios_by_api[scenario.api_id].sort(key=lambda s: s.priority)

    def match(self, api_id: str, request: NexacroRequest) -> ScenarioDefinition | None:
        """Find highest priority active scenario matching the request."""
        candidates = self._scenarios_by_api.get(api_id, [])
        for sc in candidates:
            if not sc.enabled:
                continue

            match_criteria = sc.match
            if not match_criteria:
                continue

            # Check parameter match
            param_match = match_criteria.get("params", {})
            param_ok = True
            for k, expected_v in param_match.items():
                actual_v = request.get_param(k)
                if str(actual_v) != str(expected_v):
                    param_ok = False
                    break
            if not param_ok:
                continue

            # Check dataset row match
            ds_match = match_criteria.get("datasets", {})
            ds_ok = True
            for ds_name, filter_dict in ds_match.items():
                first_row = request.get_first_row(ds_name)
                for field_name, expected_val in filter_dict.items():
                    if str(first_row.get(field_name, "")) != str(expected_val):
                        ds_ok = False
                        break
                if not ds_ok:
                    break
            if not ds_ok:
                continue

            return sc

        return None

    def list_all(self) -> list[ScenarioDefinition]:
        return list(self._scenarios.values())

    def load_from_directory(self, directory: Path) -> int:
        count = 0
        if not directory.exists():
            return count

        for file_path in directory.glob("*.yaml"):
            try:
                with open(file_path, encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                    if data and "id" in data:
                        sc_def = ScenarioDefinition(
                            id=data["id"],
                            api_id=data["api_id"],
                            enabled=data.get("enabled", True),
                            priority=data.get("priority", 100),
                            match=data.get("match", {}),
                            response=NexacroResponse.model_validate(data["response"]),
                        )
                        self.register(sc_def)
                        count += 1
            except Exception as e:
                logger.error(f"Failed to load scenario from {file_path}: {e}")
        return count
