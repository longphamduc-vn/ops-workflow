"""End-to-end contract and execution test for procurement-rfq-stock-optimization workflow."""

from pathlib import Path

import pytest
import respx
from httpx import Response

from opsflow.connectors.nexacro.connector import NexacroConnector
from opsflow.core.parser import load_workflow_from_file
from opsflow.core.scheduler import WorkflowScheduler
from opsflow.core.validator import WorkflowValidator

TARGET_STOCK_XML = """<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
    <Parameters>
        <Parameter id="errorCode" type="string">1</Parameter>
        <Parameter id="errorMsg" type="string"/>
    </Parameters>
    <Dataset id="ds_StockInfomation">
        <ColumnInfo>
            <Column id="item" type="STRING" size="256"/>
            <Column id="itemDescription" type="STRING" size="256"/>
            <Column id="model" type="STRING" size="256"/>
            <Column id="maker" type="STRING" size="256"/>
            <Column id="uom" type="STRING" size="256"/>
            <Column id="itemCost" type="BIGDECIMAL" size="256"/>
            <Column id="sprRmi" type="BIGDECIMAL" size="256"/>
            <Column id="minOrderQty" type="INT" size="256"/>
            <Column id="onhandQty" type="INT" size="256"/>
            <Column id="purchaseRequisitionQty" type="INT" size="256"/>
            <Column id="targetQty" type="INT" size="256"/>
            <Column id="disuseFlag" type="STRING" size="256"/>
            <Column id="holdReasonContent" type="STRING" size="256"/>
            <Column id="managementContactName" type="STRING" size="256"/>
            <Column id="inventoryItemId" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="item">QDAB03583</Col>
                <Col id="itemDescription">Sensor Accessory ** CN-73-C2, PANASONIC CORPORATION, Feature: SQUARE</Col>
                <Col id="model">CN-73-C2</Col>
                <Col id="maker">PANASONIC CORPORATION</Col>
                <Col id="uom">EA</Col>
                <Col id="itemCost">6.39</Col>
                <Col id="sprRmi">0.00</Col>
                <Col id="minOrderQty">4</Col>
                <Col id="onhandQty">1</Col>
                <Col id="purchaseRequisitionQty">4</Col>
                <Col id="targetQty">1</Col>
                <Col id="disuseFlag">Y</Col>
                <Col id="holdReasonContent">Disuse/Scrap evaluation</Col>
                <Col id="managementContactName">Admin</Col>
                <Col id="inventoryItemId">356327</Col>
            </Row>
        </Rows>
    </Dataset>
</Root>"""

ITEM_POPUP_XML = """<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
    <Parameters>
        <Parameter id="errorCode" type="string">1</Parameter>
        <Parameter id="errorMsg" type="string"/>
    </Parameters>
    <Dataset id="ds_List">
        <ColumnInfo>
            <Column id="item" type="STRING" size="256"/>
            <Column id="buyItemType" type="STRING" size="256"/>
            <Column id="manager" type="STRING" size="256"/>
            <Column id="buyerName" type="STRING" size="256"/>
            <Column id="itemStatus" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="item">QDAB03583</Col>
                <Col id="buyItemType">SP</Col>
                <Col id="manager">Nguyen Thi Hong Ngoc</Col>
                <Col id="buyerName">Nguyen Thi Hong Ngoc</Col>
                <Col id="itemStatus">Active</Col>
            </Row>
        </Rows>
    </Dataset>
</Root>"""

PO_STATUS_XML = """<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
    <Parameters>
        <Parameter id="errorCode" type="string">1</Parameter>
        <Parameter id="errorMsg" type="string"/>
    </Parameters>
    <Dataset id="ds_Rtn">
        <ColumnInfo>
            <Column id="item" type="STRING" size="256"/>
            <Column id="stopPoFlag" type="STRING" size="256"/>
            <Column id="buyerId" type="STRING" size="256"/>
            <Column id="transferFlag" type="STRING" size="256"/>
            <Column id="transferQty" type="INT" size="256"/>
            <Column id="waitRepairFlag" type="STRING" size="256"/>
            <Column id="waitRepairQty" type="INT" size="256"/>
            <Column id="disuseInventoryFlag" type="STRING" size="256"/>
            <Column id="agingInterlockFlag" type="STRING" size="256"/>
            <Column id="poOptTargetFlag" type="STRING" size="256"/>
            <Column id="poWaitingQty" type="INT" size="256"/>
            <Column id="unitPriceStatusCode" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="item">QDAB03583</Col>
                <Col id="stopPoFlag">N</Col>
                <Col id="buyerId">1403074</Col>
                <Col id="transferFlag">Y</Col>
                <Col id="transferQty">1</Col>
                <Col id="waitRepairFlag">N</Col>
                <Col id="waitRepairQty">0</Col>
                <Col id="disuseInventoryFlag">Y</Col>
                <Col id="agingInterlockFlag">N</Col>
                <Col id="poOptTargetFlag">N</Col>
                <Col id="poWaitingQty">0</Col>
                <Col id="unitPriceStatusCode">UP004</Col>
            </Row>
        </Rows>
    </Dataset>
</Root>"""

ITEM_DETAIL_XML = """<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
    <Parameters>
        <Parameter id="errorCode" type="string">1</Parameter>
        <Parameter id="errorMsg" type="string"/>
    </Parameters>
    <Dataset id="ds_Item">
        <ColumnInfo>
            <Column id="item" type="STRING" size="256"/>
            <Column id="fdmUrl" type="STRING" size="256"/>
            <Column id="allocatedQuantity" type="INT" size="256"/>
            <Column id="availableQuantity" type="INT" size="256"/>
            <Column id="itemStatus" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="item">QDAB03583</Col>
                <Col id="fdmUrl">http://fdm.lgdisplay.com:8008/Windchill/extcore/jsp/lgdfdm/drawing/qcodeDrawing.jsp?oid=VR:wt.part.WTPart:4682638</Col>
                <Col id="allocatedQuantity">0</Col>
                <Col id="availableQuantity">0</Col>
                <Col id="itemStatus">Active</Col>
            </Row>
        </Rows>
    </Dataset>
    <Dataset id="ds_Inv">
        <ColumnInfo>
            <Column id="targetQty" type="INT" size="256"/>
            <Column id="requestQty" type="INT" size="256"/>
            <Column id="poWaitingQty" type="INT" size="256"/>
            <Column id="notReceivingQty" type="INT" size="256"/>
            <Column id="onhandQty" type="INT" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="targetQty">1</Col>
                <Col id="requestQty">4</Col>
                <Col id="poWaitingQty">0</Col>
                <Col id="notReceivingQty">0</Col>
                <Col id="onhandQty">1</Col>
            </Row>
        </Rows>
    </Dataset>
    <Dataset id="ds_Summary">
        <ColumnInfo>
            <Column id="monthAvgUsage1y" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="monthAvgUsage1y">0.25</Col>
            </Row>
        </Rows>
    </Dataset>
</Root>"""


@pytest.mark.asyncio
@respx.mock
async def test_procurement_rfq_stock_optimization_workflow() -> None:
    base_url = "http://localhost:9000"

    # Mock all 4 Nexacro endpoints
    respx.post(f"{base_url}/emsspareparts/sp302/sp330Nav/TargetStockSearchList.lgdn").respond(
        status_code=200,
        content=TARGET_STOCK_XML.encode("utf-8"),
        headers={"Content-Type": "application/xml; charset=UTF-8"},
    )
    respx.post(f"{base_url}/emscom/popupNav/retrieveItem.lgdn").respond(
        status_code=200,
        content=ITEM_POPUP_XML.encode("utf-8"),
        headers={"Content-Type": "application/xml; charset=UTF-8"},
    )
    respx.post(f"{base_url}/emscom/popupNav/retrieveItemPoStatusList.lgdn").respond(
        status_code=200,
        content=PO_STATUS_XML.encode("utf-8"),
        headers={"Content-Type": "application/xml; charset=UTF-8"},
    )
    respx.post(f"{base_url}/emsspareparts/sp102/sp135Nav/retrieveItemInfoDetail.lgdn").respond(
        status_code=200,
        content=ITEM_DETAIL_XML.encode("utf-8"),
        headers={"Content-Type": "application/xml; charset=UTF-8"},
    )

    # 1. Load and validate workflow definition
    wf_path = Path("workflows/procurement-rfq-stock-optimization.yml")
    wf = load_workflow_from_file(wf_path)
    errors = WorkflowValidator(wf).validate()
    assert errors == [], f"Validation errors: {errors}"

    # 2. Instantiate Nexacro connector
    ems_connector = NexacroConnector(
        name="ems",
        base_url=base_url,
        format="xml",
        allowed_services=[
            "/emsspareparts/sp302/sp330Nav/TargetStockSearchList.lgdn",
            "/emsspareparts/sp302/sp335Nav/TargetStockSearchList.lgdn",
            "/emscom/popupNav/retrieveItem.lgdn",
            "/emscom/popupNav/retrieveItemPoStatusList.lgdn",
            "/emsspareparts/sp102/sp135Nav/retrieveItemInfoDetail.lgdn",
        ],
        limits={"max_concurrent": 3, "min_interval": "10ms"},
    )

    # 3. Schedule and execute workflow
    scheduler = WorkflowScheduler(
        workflow=wf,
        connectors={"ems": ems_connector},
        max_concurrency=3,
    )

    run_id, status, ctx = await scheduler.run(
        inputs={
            "organization_id": "28753",
            "item_code": "QDAB03583",
            "alert_channel": "#procurement-alerts",
        }
    )

    # 4. Assert workflow succeeded
    assert status == "success", f"Workflow execution failed: {ctx.step_outputs}"

    # 5. Verify the business rules output according to Dd.yaml specification
    evaluated_records = ctx.step_outputs.get("evaluate_procurement_rules")
    assert evaluated_records is not None
    assert len(evaluated_records) == 1

    record = evaluated_records[0]
    assert record["item_code"] == "QDAB03583"
    assert record["model"] == "CN-73-C2"
    assert record["vendor_name"] == "PANASONIC CORPORATION"
    assert record["buy_item_type"] == "SP"
    assert record["uom"] == "EA"
    assert float(record["unit_price_sp"]) == 6.39
    assert int(record["target_qty"]) == 1
    assert int(record["onhand_qty"]) == 1
    assert int(record["request_qty"]) == 4
    assert int(record["po_stand_by"]) == 0
    assert int(record["po_remained_qty"]) == 0
    assert int(record["transfer_qty"]) == 1
    assert record["interlock_purchase_blocked"] == "N"
    assert record["interlock_transfer_required"] == "Y"
    assert record["interlock_disuse_scrap"] == "Y"
    assert record["interlock_repair_priority"] == "N"
    assert record["interlock_aging_warning"] == "N"
    assert record["buyer_id"] == "1403074"
    assert "Windchill" in record["fdm_url"]
