"""Inventory and spare parts business simulation handlers."""

import json
import time

from ems_sim.database.repository import SimulationRepository
from ems_sim.models.definition import ApiDefinition
from ems_sim.models.entities import PurchaseRequest
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


async def save_130_prv_data(
    request: NexacroRequest, repo: SimulationRepository, api_def: ApiDefinition
) -> NexacroResponse | None:
    """Save PRV review data (sp102/sp130Nav/save130PrvData.lgdn)."""
    ds_param = request.get_dataset("ds_param")
    if ds_param and ds_param.rows:
        rows = ds_param.to_dict_list()
        for r in rows:
            prv_no = r.get("prvNo") or f"PRV-{int(time.time())}"
            item_id = r.get("item")
            inv_item_id = r.get("inventoryItemId")
            org_id = r.get("organizationId") or request.get_param("_ems_organizationId", "28753")
            try:
                qty = float(r.get("requestQty") or 1.0)
            except (ValueError, TypeError):
                qty = 1.0
            try:
                price = float(r.get("unitPrice") or 0.0)
            except (ValueError, TypeError):
                price = 0.0
            try:
                req_amt = float(r.get("reqAmount") or (qty * price))
            except (ValueError, TypeError):
                req_amt = qty * price
            req_name = r.get("requestorName") or request.get_param("_ems_userId", "")

            prv_entity = PurchaseRequest(
                prv_no=prv_no,
                item_id=item_id,
                inventory_item_id=inv_item_id,
                organization_id=org_id,
                request_qty=qty,
                unit_price=price,
                req_amount=req_amt,
                requestor_id=r.get("requestorId") or request.get_param("_ems_userId"),
                requestor_name=req_name,
                prv_status=r.get("prvStatus", "Confirm PO Review"),
                confirm_flag=r.get("confirmFlag", "Y"),
                data_payload=json.dumps(r, ensure_ascii=False),
            )
            await repo.save_purchase_request(prv_entity)

    # Standard Nexacro response parameters
    return NexacroResponse(
        params={
            "ErrorCode": "0",
            "errorCode": "1",
            "ErrorMsg": "",
            "errorMsg": "",
        },
        datasets={},
    )


async def retrieve_po_request(
    request: NexacroRequest, repo: SimulationRepository, api_def: ApiDefinition
) -> NexacroResponse | None:
    """Retrieve PO request (sp102/sp130Nav/retrievePoRequest.lgdn)."""
    ds_param = request.get_dataset("ds_param")
    ds_search = request.get_dataset("ds_search")

    input_row = {}
    if ds_param and ds_param.rows:
        input_row = ds_param.to_dict_list()[0]
    elif ds_search and ds_search.rows:
        input_row = ds_search.to_dict_list()[0]

    item_id = input_row.get("item")
    inv_item_id = input_row.get("inventoryItemId")
    prv_no = input_row.get("prvNo")
    org_id = input_row.get("organizationId") or request.get_param("_ems_organizationId", "28753")

    # Check database for saved purchase request or target item
    saved_req = None
    if prv_no:
        saved_req = await repo.get_purchase_request(prv_no)
    if not saved_req and (item_id or inv_item_id):
        saved_list = await repo.find_purchase_requests(
            item_id=item_id, inventory_item_id=inv_item_id, organization_id=org_id
        )
        if saved_list:
            saved_req = saved_list[0]

    # Item details from DB if available
    db_item = None
    if item_id:
        db_item = await repo.get_item(item_id)
    elif inv_item_id:
        items = await repo.search_items(organization_id=org_id)
        for it in items:
            if it.inventory_item_id == str(inv_item_id):
                db_item = it
                break

    # Standard 96 columns for ds_param
    cols = [
        "checked", "prvNo", "confirmFlag", "prvStatus", "itemType", "item", "itemDesc",
        "itemStatus", "requestQty", "overShortageQty", "unitPrice", "reqAmount", "requestorName",
        "requestorDept", "requestDate", "reviewerName", "emNo", "emNoDesc", "budgetDeptCode",
        "requestComment", "reviewComment", "emNoBudget", "scheduledUseDate", "orderTypeDesc",
        "owningDept", "bufferZone", "wacCode", "wacDesc", "vendorName", "realLeadTime",
        "makerOnHand", "supplierStatus", "deliveryConfirmDate", "unitPriceStatus", "poRequestNo",
        "approvalInfo", "workOrder", "woDesc", "poNo", "poDate", "poQty", "poPrice",
        "poAmount", "receivingQty", "receivingDate", "poCancelFlag", "confirmDate", "confirmName",
        "commonStopFlag", "prvStatusCode", "itemTypeCode", "unitPiceStatusCode", "reqEstimateFlag",
        "prvComleteBtnFlag", "poRequestBtnFlag", "poChageBtnFlag", "prvSaveBtnFlag", "reviewerId",
        "instanceId", "requestorId", "requestorDeptCode", "inventoryItemId", "organizationId",
        "wipEntityId", "requisitionLineId", "txnGroupId", "lineLocationId", "poRequestM asterId",
        "orderType", "vendorId", "approverId", "attachment", "sscsAttachment", "budgetDept",
        "poRequestMasterId", "owningDepartmentId", "owningDeptCode", "rfqRequestMasterId",
        "fileCnt", "prvNoFlag", "sscsFileCnt", "reviewItemQty", "delayReasonName", "reqPoChgFlag",
        "overShortagePrvQty", "publicFlag", "periodicFlag", "addPoReason", "equipmentGroup",
        "updateEnable", "useDate", "reasonDesc", "reviewerFlag", "waitRepairQty", "partsUseTypeCode"
    ]

    # Synthesize response record based on input + DB state
    resolved_item = item_id or (db_item.id if db_item else (saved_req.item_id if saved_req else "QCAD38190"))
    resolved_desc = (
        (db_item.description if db_item and db_item.description else None)
        or input_row.get("itemDesc")
        or "Pneumatic Cylinder ** MXQ16-100B, SMC CORPORATION, Inner Diameter:16㎜"
    )
    resolved_inv_id = (
        inv_item_id
        or (db_item.inventory_item_id if db_item and db_item.inventory_item_id else None)
        or (saved_req.inventory_item_id if saved_req else "10001")
    )
    try:
        resolved_qty = float(input_row.get("requestQty") or (saved_req.request_qty if saved_req else 3))
    except (ValueError, TypeError):
        resolved_qty = 3.0
    try:
        resolved_price = float(input_row.get("unitPrice") or (saved_req.unit_price if saved_req else 3150))
    except (ValueError, TypeError):
        resolved_price = 3150.0
    try:
        resolved_amt = float(input_row.get("reqAmount") or (resolved_qty * resolved_price))
    except (ValueError, TypeError):
        resolved_amt = resolved_qty * resolved_price

    row_data = {
        "checked": "1",
        "prvNo": prv_no or (saved_req.prv_no if saved_req else "Q2405-2244838"),
        "confirmFlag": input_row.get("confirmFlag", "Y"),
        "prvStatus": "Confirm PO Review",
        "itemType": "Invidual Management",
        "item": resolved_item,
        "itemDesc": resolved_desc,
        "itemStatus": "",
        "requestQty": str(int(resolved_qty) if resolved_qty.is_integer() else resolved_qty),
        "overShortageQty": "",
        "unitPrice": str(int(resolved_price) if resolved_price.is_integer() else resolved_price),
        "reqAmount": str(int(resolved_amt) if resolved_amt.is_integer() else resolved_amt),
        "requestorName": input_row.get("requestorName", "Pham Duc Long"),
        "requestorDept": input_row.get("requestorDept", "NY SW PO M Technology DB/BD Unit B1"),
        "requestDate": input_row.get("requestDate", "20240529134226000"),
        "reviewerName": input_row.get("reviewerName", "Pham Duc Long"),
        "emNo": input_row.get("emNo", "HWBMTL22BP0102"),
        "emNoDesc": input_row.get("emNoDesc", ""),
        "budgetDeptCode": input_row.get("budgetDeptCode", ""),
        "requestComment": input_row.get("requestComment", ""),
        "reviewComment": input_row.get("reviewComment", ""),
        "emNoBudget": input_row.get("emNoBudget", "NY PO M Technology CP/SG Part 1"),
        "scheduledUseDate": input_row.get("scheduledUseDate", "20240603000000000"),
        "orderTypeDesc": input_row.get("orderTypeDesc", "즉사용(Ready-to-use)"),
        "owningDept": input_row.get("owningDept", "NY PO M Technology CP Unit 2"),
        "realLeadTime": "",
        "makerOnHand": "",
        "supplierStatus": "",
        "deliveryConfirmDate": "",
        "unitPriceStatus": "Price Registration",
        "poRequestNo": "",
        "approvalInfo": "",
        "workOrder": input_row.get("workOrder", ""),
        "woDesc": input_row.get("woDesc", ""),
        "poNo": "",
        "poDate": "",
        "poQty": "",
        "poPrice": "",
        "poAmount": "",
        "receivingQty": "",
        "receivingDate": "",
        "poCancelFlag": "",
        "confirmDate": input_row.get("confirmDate", "20260921000000000"),
        "confirmName": "",
        "commonStopFlag": "",
        "prvStatusCode": input_row.get("prvStatusCode", "QP007"),
        "itemTypeCode": input_row.get("itemTypeCode", "N001"),
        "unitPiceStatusCode": "",
        "reqEstimateFlag": "",
        "prvComleteBtnFlag": "",
        "poRequestBtnFlag": "",
        "poChageBtnFlag": "",
        "prvSaveBtnFlag": "",
        "reviewerId": input_row.get("reviewerId", "658359"),
        "instanceId": input_row.get("instanceId", "5771628"),
        "requestorId": input_row.get("requestorId", "658359"),
        "requestorDeptCode": input_row.get("requestorDeptCode", "87301"),
        "inventoryItemId": str(resolved_inv_id),
        "organizationId": org_id,
        "wipEntityId": "",
        "requisitionLineId": "",
        "txnGroupId": input_row.get("txnGroupId", "325911141"),
        "lineLocationId": "",
        "poRequestM asterId": "",
        "orderType": input_row.get("orderType", "T001"),
        "vendorId": input_row.get("vendorId", "2475273"),
        "approverId": input_row.get("approverId", "658359"),
        "attachment": "",
        "sscsAttachment": "",
        "budgetDept": input_row.get("budgetDept", "NY PO M Technology CP/SG Part 1"),
        "poRequestMasterId": "",
        "owningDepartmentId": input_row.get("owningDepartmentId", "977596"),
        "owningDeptCode": "",
        "rfqRequestMasterId": "",
        "fileCnt": "",
        "prvNoFlag": "N",
        "sscsFileCnt": "",
        "reviewItemQty": str(int(resolved_qty) if resolved_qty.is_integer() else resolved_qty),
        "delayReasonName": "",
        "reqPoChgFlag": "",
        "overShortagePrvQty": "",
        "publicFlag": input_row.get("publicFlag", "N"),
        "periodicFlag": input_row.get("periodicFlag", "N"),
        "addPoReason": input_row.get("addPoReason", "3ea NG"),
        "equipmentGroup": input_row.get("equipmentGroup", "MTL"),
        "updateEnable": input_row.get("updateEnable", "N"),
        "useDate": input_row.get("useDate", "20241011"),
        "reasonDesc": input_row.get("reasonDesc", "R001"),
        "reviewerFlag": "N",
        "waitRepairQty": "0",
        "partsUseTypeCode": "N001",
    }

    ds_out = Dataset.from_dict_list(cols, [row_data])
    return NexacroResponse(
        params={
            "ErrorCode": "0",
            "errorCode": "1",
            "ErrorMsg": "",
            "errorMsg": "",
        },
        datasets={"ds_param": ds_out},
    )

