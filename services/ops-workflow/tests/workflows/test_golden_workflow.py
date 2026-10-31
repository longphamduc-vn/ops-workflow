"""End-to-end workflow execution test for equipment-status-lookup against mocked Nexacro HTTP."""

from pathlib import Path

import httpx
import pytest
import respx

from opsflow.connectors.nexacro.connector import NexacroConnector
from opsflow.core.parser import load_workflow_from_file
from opsflow.core.scheduler import WorkflowScheduler


WIP_ENTITY_XML = """<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
    <Parameters>
        <Parameter id="ErrorCode" type="string">1</Parameter>
        <Parameter id="ErrorMsg" type="string"></Parameter>
    </Parameters>
    <Dataset id="ds_output">
        <ColumnInfo>
            <Column id="wipEntityId" type="STRING" size="256"/>
            <Column id="wipEntityName" type="STRING" size="256"/>
            <Column id="assetNumber" type="STRING" size="256"/>
            <Column id="description" type="STRING" size="256"/>
            <Column id="statusType" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="wipEntityId">337389615</Col>
                <Col id="wipEntityName">WO-2026-001</Col>
                <Col id="assetNumber">ASSET-PUMP-01</Col>
                <Col id="description">Main Pump Overhaul</Col>
                <Col id="statusType">3</Col>
            </Row>
        </Rows>
    </Dataset>
</Root>"""

WO_MASTER_XML = """<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
    <Parameters>
        <Parameter id="ErrorCode" type="string">1</Parameter>
        <Parameter id="ErrorMsg" type="string"></Parameter>
    </Parameters>
    <Dataset id="ds_wo">
        <ColumnInfo>
            <Column id="wipEntityId" type="STRING" size="256"/>
            <Column id="wipEntityName" type="STRING" size="256"/>
            <Column id="organizationId" type="STRING" size="256"/>
            <Column id="assetNumber" type="STRING" size="256"/>
            <Column id="statusType" type="STRING" size="256"/>
            <Column id="description" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="wipEntityId">337389615</Col>
                <Col id="wipEntityName">WO-2026-001</Col>
                <Col id="organizationId">28753</Col>
                <Col id="assetNumber">ASSET-PUMP-01</Col>
                <Col id="statusType">3</Col>
                <Col id="description">Main Pump Overhaul</Col>
            </Row>
        </Rows>
    </Dataset>
    <Dataset id="ds_step">
        <ColumnInfo>
            <Column id="operationSeqNum" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows/>
    </Dataset>
    <Dataset id="ds_spAttachFile">
        <ColumnInfo>
            <Column id="fileId" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows/>
    </Dataset>
</Root>"""

STATUS_HISTORY_XML = """<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
    <Parameters>
        <Parameter id="ErrorCode" type="string">1</Parameter>
        <Parameter id="ErrorMsg" type="string"></Parameter>
    </Parameters>
    <Dataset id="ds_list">
        <ColumnInfo>
            <Column id="wipEntityId" type="STRING" size="256"/>
            <Column id="seq" type="INT" size="256"/>
            <Column id="statusType" type="STRING" size="256"/>
            <Column id="statusChangeDate" type="STRING" size="256"/>
            <Column id="changedBy" type="STRING" size="256"/>
            <Column id="remark" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="wipEntityId">337389615</Col>
                <Col id="seq">1</Col>
                <Col id="statusType">3</Col>
                <Col id="statusChangeDate">2026-10-28 08:00:00</Col>
                <Col id="changedBy">658359</Col>
                <Col id="remark">Inspection complete</Col>
            </Row>
        </Rows>
    </Dataset>
</Root>"""


@pytest.mark.asyncio
@respx.mock
async def test_golden_workflow_end_to_end_with_respx() -> None:
    base_url = "http://localhost:9000"

    # Mock Nexacro endpoints
    respx.post(f"{base_url}/emscom/woSearchNav/retrieveWipEntity.lgdn").respond(
        status_code=200,
        content=WIP_ENTITY_XML.encode("utf-8"),
        headers={"Content-Type": "application/xml; charset=UTF-8"},
    )
    respx.post(f"{base_url}/emscom/woMasterNav/WoMasterRetInit.lgdn").respond(
        status_code=200,
        content=WO_MASTER_XML.encode("utf-8"),
        headers={"Content-Type": "application/xml; charset=UTF-8"},
    )
    respx.post(f"{base_url}/emsworkorder/wo50/wo580Nav/statusHistory.lgdn").respond(
        status_code=200,
        content=STATUS_HISTORY_XML.encode("utf-8"),
        headers={"Content-Type": "application/xml; charset=UTF-8"},
    )

    # Load workflow definition
    golden_path = Path("workflows/equipment-status-lookup.yml")
    wf = load_workflow_from_file(golden_path)

    # Instantiate Nexacro connector
    ems_connector = NexacroConnector(
        name="ems",
        base_url=base_url,
        format="xml",
        allowed_services=[
            "/emscom/woSearchNav/retrieveWipEntity.lgdn",
            "/emscom/woMasterNav/WoMasterRetInit.lgdn",
            "/emsworkorder/wo50/wo580Nav/statusHistory.lgdn",
        ],
        limits={"max_concurrent": 3, "min_interval": "10ms"},
    )

    # Schedule and execute workflow
    scheduler = WorkflowScheduler(
        workflow=wf,
        connectors={"ems": ems_connector},
        max_concurrency=3,
    )

    run_id, status, ctx = await scheduler.run(
        inputs={
            "organization_id": "28753",
            "wip_entity_id": "337389615",
            "alert_channel": "#ops-alerts",
        }
    )

    # Verify assertions
    assert status == "success"

    # Verify WIP entity output
    wip_output = ctx.step_outputs.get("get_wip_entity")
    assert wip_output is not None
    assert len(wip_output.get("wip_records", [])) == 1
    assert wip_output["wip_records"][0]["wipEntityId"] == "337389615"

    # Verify WO master output
    wo_output = ctx.step_outputs.get("get_wo_master")
    assert wo_output is not None
    assert len(wo_output.get("wo_master", [])) == 1

    # Verify normalize step transformed records
    norm_output = ctx.step_outputs.get("normalize_equipment_status")
    assert norm_output is not None
    assert len(norm_output) == 1
    assert norm_output[0]["wip_entity_id"] == "337389615"
    assert norm_output[0]["equipment_id"] == "ASSET-PUMP-01"
    assert norm_output[0]["status"] == "3"

    # Verify db_upsert step
    assert ctx.step_statuses.get("save_equipment_status") == "success"

    # Verify alert step
    assert ctx.step_statuses.get("alert_status") == "success"

    await ems_connector.close()
