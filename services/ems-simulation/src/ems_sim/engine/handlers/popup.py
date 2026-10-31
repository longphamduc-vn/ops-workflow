"""Popup search handlers for items and purchase status."""

from ems_sim.database.repository import SimulationRepository
from ems_sim.models.definition import ApiDefinition
from ems_sim.models.protocol import Dataset, NexacroRequest, NexacroResponse


async def retrieve_item(
    request: NexacroRequest, repo: SimulationRepository, api_def: ApiDefinition
) -> NexacroResponse | None:
    """Simulate popup item lookup (retrieveItem.lgdn)."""
    search_row = request.get_first_row("ds_Search")
    item_pattern = search_row.get("item")
    item_desc = search_row.get("itemDescription")
    org_id = request.get_param("_ems_organizationId", "28753")

    items = await repo.search_items(
        organization_id=org_id, item_id=item_pattern, item_desc=item_desc
    )
    if not items:
        return None

    cols = ["uniqueNo", "itemType", "item", "itemDescription", "primaryUomCode", "maker", "model"]
    records = []
    for i, it in enumerate(items):
        records.append(
            {
                "uniqueNo": str(i + 1),
                "itemType": it.item_type or "SPARE",
                "item": it.id,
                "itemDescription": it.description or "",
                "primaryUomCode": it.uom or "EA",
                "maker": it.maker or "",
                "model": it.model or "",
            }
        )

    ds_list = Dataset.from_dict_list(cols, records)
    return NexacroResponse.success(datasets={"ds_List": ds_list, "ds_Search": Dataset.empty([])})


async def retrieve_item_po_status(
    request: NexacroRequest, repo: SimulationRepository, api_def: ApiDefinition
) -> NexacroResponse | None:
    """Simulate PO status check for items."""
    return None
