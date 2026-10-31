"""Core Simulation Engine coordinating handlers, scenarios, and fixtures."""

import logging

from ems_sim.database.repository import SimulationRepository
from ems_sim.engine.handlers import get_handler
from ems_sim.models.definition import ApiDefinition
from ems_sim.models.protocol import Dataset, NexacroRequest, NexacroResponse
from ems_sim.registry.dataset_registry import DatasetRegistry
from ems_sim.registry.fixture_registry import FixtureRegistry
from ems_sim.registry.scenario_registry import ScenarioRegistry

logger = logging.getLogger(__name__)


class SimulationEngine:
    """Executes configurable simulation behavior based on API definition and request state."""

    def __init__(
        self,
        dataset_registry: DatasetRegistry,
        fixture_registry: FixtureRegistry,
        scenario_registry: ScenarioRegistry,
    ) -> None:
        self.dataset_registry = dataset_registry
        self.fixture_registry = fixture_registry
        self.scenario_registry = scenario_registry

    async def execute(
        self,
        api_def: ApiDefinition,
        request: NexacroRequest,
        repo: SimulationRepository,
    ) -> tuple[NexacroResponse, str | None, str | None]:
        """Execute request against configured simulation strategy.

        Returns: (NexacroResponse, matched_scenario_id, matched_fixture_id)
        """
        api_id = api_def.id

        # 1. Evaluate configurable simulation scenarios first
        matched_scenario = self.scenario_registry.match(api_id, request)
        if matched_scenario:
            logger.info(f"Matched scenario '{matched_scenario.id}' for API {api_id}")
            return matched_scenario.response, matched_scenario.id, None

        # 2. Strategy evaluation
        exec_type = api_def.execution.type

        # Strategy A: Registered Business Handler
        if exec_type == "handler" and api_def.execution.handler:
            handler_func = get_handler(api_def.execution.handler)
            if handler_func:
                try:
                    handler_response = await handler_func(request, repo, api_def)
                    if handler_response is not None:
                        return handler_response, None, None
                except Exception as e:
                    logger.error(f"Handler execution error for {api_id}: {e}", exc_info=True)

        # Strategy B: Fixture lookup (explicit or fallback)
        fixture = self.fixture_registry.find_for_request(api_id, request)
        if fixture:
            logger.debug(f"Using fixture '{fixture.id}' for API {api_id}")
            return fixture.response, None, fixture.id

        # Strategy C: Schema-based default empty response
        default_datasets: dict[str, Dataset] = {}
        for ds_ref in api_def.response.datasets:
            schema = self.dataset_registry.get(ds_ref.schema_id)
            cols = schema.column_names if schema else []
            default_datasets[ds_ref.name] = Dataset.empty(cols)

        return NexacroResponse.success(datasets=default_datasets), None, None
