"""Work order handlers."""

from ems_sim.database.repository import SimulationRepository
from ems_sim.models.definition import ApiDefinition
from ems_sim.models.protocol import Dataset, NexacroRequest, NexacroResponse


async def retrieve_wip_entity(
    request: NexacroRequest, repo: SimulationRepository, api_def: ApiDefinition
) -> NexacroResponse | None:
    """Retrieve WIP Entity by wipEntityId."""
    input_row = request.get_first_row("ds_input")
    wip_id = input_row.get("wipEntityId")
    if not wip_id:
        return None

    wo = await repo.get_work_order(str(wip_id))
    if not wo:
        return None

    cols = [
        "wipEntityName",
        "wipEntityId",
        "workOrderType",
        "workOrderTypeDesc",
        "userDefinedStatusId",
    ]
    records = [
        {
            "wipEntityName": wo.wip_entity_name,
            "wipEntityId": wo.wip_entity_id,
            "workOrderType": wo.work_order_type,
            "workOrderTypeDesc": wo.work_order_type_desc or "",
            "userDefinedStatusId": wo.status,
        }
    ]
    return NexacroResponse.success(datasets={"ds_output": Dataset.from_dict_list(cols, records)})


async def master_init(
    request: NexacroRequest, repo: SimulationRepository, api_def: ApiDefinition
) -> NexacroResponse | None:
    """Work Order Master Init (WoMasterRetInit). Fallback to rich fixture."""
    return None


async def save_init(
    request: NexacroRequest, repo: SimulationRepository, api_def: ApiDefinition
) -> NexacroResponse | None:
    """Work Order Save Init (WO230WoSaveInit). Fallback to rich fixture."""
    return None


async def status_history(
    request: NexacroRequest, repo: SimulationRepository, api_def: ApiDefinition
) -> NexacroResponse | None:
    """Work Order Status History. Fallback to fixture."""
    return None
