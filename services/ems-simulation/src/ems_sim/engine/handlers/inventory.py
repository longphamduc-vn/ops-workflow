"""Inventory and spare parts business simulation handlers."""

from ems_sim.database.repository import SimulationRepository
from ems_sim.models.definition import ApiDefinition
from ems_sim.models.protocol import Dataset, NexacroRequest, NexacroResponse


async def search_stock_status(
    request: NexacroRequest, repo: SimulationRepository, api_def: ApiDefinition
) -> NexacroResponse | None:
    """Simulate spare parts stock status search (RetStockStatusList)."""
    search_row = request.get_first_row("ds_search")
    org_id = search_row.get("organizationId") or request.get_param("_ems_organizationId", "28753")
    item_desc = search_row.get("itemDesc")

    # Check ds_ItemInfo for explicit items
    ds_item_info = request.get_dataset("ds_ItemInfo")
    items_to_find = []
    if ds_item_info and ds_item_info.rows:
        for r in ds_item_info.to_dict_list():
            if r.get("item"):
                items_to_find.append(r["item"])

    # Query database
    db_items = []
    if items_to_find:
        for it_no in items_to_find:
            it = await repo.get_item(it_no)
            if it:
                db_items.append(it)
    else:
        db_items = await repo.search_items(organization_id=org_id, item_desc=item_desc)

    if not db_items:
        # Fallback to fixture
        return None

    cols = [
        "itemName",
        "organizationId",
        "inventoryItemId",
        "itemDescription",
        "itemStatus",
        "uomCode",
        "maker",
        "catalogGroupName",
        "itemSpec",
        "model",
        "supplierId",
        "commonFlag",
        "periodicFlag",
        "itemCond",
        "onhandQuantity",
        "availableQuantity",
    ]

    records = []
    for it in db_items:
        inv = await repo.get_inventory(it.id, org_id)
        records.append(
            {
                "itemName": it.id,
                "organizationId": org_id,
                "inventoryItemId": it.inventory_item_id or "",
                "itemDescription": it.description or "",
                "itemStatus": it.status or "Active",
                "uomCode": it.uom or "EA",
                "maker": it.maker or "",
                "model": it.model or "",
                "catalogGroupName": "",
                "itemSpec": "",
                "supplierId": "",
                "commonFlag": "N",
                "periodicFlag": "N",
                "itemCond": "GOOD",
                "onhandQuantity": str(inv.onhand_qty if inv else 10.0),
                "availableQuantity": str(inv.available_qty if inv else 10.0),
            }
        )

    ds_result = Dataset.from_dict_list(cols, records)
    return NexacroResponse.success(datasets={"ds_result": ds_result})


async def retrieve_item_detail(
    request: NexacroRequest, repo: SimulationRepository, api_def: ApiDefinition
) -> NexacroResponse | None:
    """Retrieve item detail, inventory balances, and consumption summary (3 datasets)."""
    input_row = request.get_first_row("ds_Input")
    org_id = input_row.get("organizationId") or request.get_param("_ems_organizationId", "28753")
    inv_item_id = input_row.get("inventoryItemId")

    # If inventoryItemId provided, find matching item
    items = await repo.search_items(organization_id=org_id)
    target_item = None
    for it in items:
        if it.inventory_item_id == str(inv_item_id):
            target_item = it
            break
    if not target_item and items:
        target_item = items[0]

    if not target_item:
        return None

    # Construct the 3 response datasets observed in production traces: ds_Item, ds_Inv, ds_Summary
    item_cols = ["item", "description", "uomCode", "maker", "catalogGroup", "model", "status"]
    item_records = [
        {
            "item": target_item.id,
            "description": target_item.description or "",
            "uomCode": target_item.uom or "EA",
            "maker": target_item.maker or "",
            "catalogGroup": "",
            "model": target_item.model or "",
            "status": target_item.status or "Active",
        }
    ]

    inv_cols = ["buyItemType", "priceRegStatus", "reviewQty", "targetQty", "logicQty", "onhandQty"]
    inv_records = [
        {
            "buyItemType": "N001",
            "priceRegStatus": "Registered",
            "reviewQty": "0",
            "targetQty": "5",
            "logicQty": "2",
            "onhandQty": "10",
        }
    ]

    summary_cols = [
        "monthAvgUsage2y",
        "monthAvgUsage1y",
        "monthAvgUsage3m",
        "lastMonthIssueQty",
        "thisMonthIssueQty",
    ]
    summary_records = [
        {
            "monthAvgUsage2y": "0.5",
            "monthAvgUsage1y": "1.0",
            "monthAvgUsage3m": "0.33",
            "lastMonthIssueQty": "1",
            "thisMonthIssueQty": "0",
        }
    ]

    return NexacroResponse.success(
        datasets={
            "ds_Item": Dataset.from_dict_list(item_cols, item_records),
            "ds_Inv": Dataset.from_dict_list(inv_cols, inv_records),
            "ds_Summary": Dataset.from_dict_list(summary_cols, summary_records),
        }
    )


async def target_stock_search(
    request: NexacroRequest, repo: SimulationRepository, api_def: ApiDefinition
) -> NexacroResponse | None:
    """Target stock search (sp330 / sp335). Fallback to rich fixture if needed."""
    return None


async def estimate_request_list(
    request: NexacroRequest, repo: SimulationRepository, api_def: ApiDefinition
) -> NexacroResponse | None:
    """Estimate request list. Fallback to fixture if needed."""
    return None
