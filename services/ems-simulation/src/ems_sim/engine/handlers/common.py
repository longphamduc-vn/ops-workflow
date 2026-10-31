"""Common data handlers."""

from ems_sim.database.repository import SimulationRepository
from ems_sim.models.definition import ApiDefinition
from ems_sim.models.protocol import NexacroRequest, NexacroResponse


async def com_code_list(
    request: NexacroRequest, repo: SimulationRepository, api_def: ApiDefinition
) -> NexacroResponse:
    """Common codes dropdown retrieval handler."""
    return NexacroResponse.success()
