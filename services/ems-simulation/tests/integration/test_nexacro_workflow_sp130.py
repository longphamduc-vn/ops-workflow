"""Integration tests for sp130 PRV review and PO request workflow (Step 1, Step 2, Step 3)."""

import xml.etree.ElementTree as ET
import pytest
from httpx import AsyncClient

from ems_sim.parser.request_parser import NexacroParser


STEP1_XML = """<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://nexacroplatform.com">
    <Parameters>
        <Parameter id="_ems_userId">658359</Parameter>
        <Parameter id="_ems_organizationId">28753</Parameter>
        <Parameter id="_ems_language">EN</Parameter>
    </Parameters>
    <Dataset id="ds_search">
        <ColumnInfo>
            <Column id="organizationId" type="STRING" size="256" />
            <Column id="itemCond" type="STRING" size="256" />
            <Column id="optimizeFlag" type="STRING" size="256" />
            <Column id="optimizedApplyDate" type="STRING" size="256" />
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="organizationId">28753</Col>
                <Col id="itemCond">Y</Col>
                <Col id="optimizeFlag">Y</Col>
                <Col id="optimizedApplyDate">20210316</Col>
            </Row>
        </Rows>
    </Dataset>
    <Dataset id="ds_ItemInfo">
        <ColumnInfo>
            <Column id="item" type="STRING" size="256" />
        </ColumnInfo>
        <Rows>
            <Row><Col id="item">QCAD38190</Col></Row>
        </Rows>
    </Dataset>
</Root>"""

STEP2_XML = """<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
    <Parameters>
        <Parameter id="_ems_userId">658359</Parameter>
        <Parameter id="_ems_organizationId">28753</Parameter>
        <Parameter id="_ems_language">EN</Parameter>
    </Parameters>
    <Dataset id="ds_search">
        <ColumnInfo>
            <Column id="itemTypeCode" type="STRING" size="256" />
            <Column id="prvStatusCode" type="STRING" size="256" />
            <Column id="prvNo" type="STRING" size="256" />
            <Column id="overShortageQty" type="STRING" size="256" />
            <Column id="unitPriceStatusCode" type="STRING" size="256" />
            <Column id="itemStatus" type="STRING" size="256" />
            <Column id="confirmFlag" type="STRING" size="256" />
            <Column id="reviewerId" type="STRING" size="256" />
            <Column id="instanceId" type="STRING" size="256" />
            <Column id="requestorId" type="STRING" size="256" />
            <Column id="requestorDeptCode" type="STRING" size="256" />
            <Column id="requestFrmDate" type="STRING" size="256" />
            <Column id="requestToDate" type="STRING" size="256" />
            <Column id="inventoryItemId" type="STRING" size="256" />
            <Column id="organizationItemId" type="STRING" size="256" />
            <Column id="organizationId" type="STRING" size="256" />
            <Column id="txnGroupId" type="STRING" size="256" />
            <Column id="itemYn" type="STRING" size="256" />
            <Column id="reviewerName" type="STRING" size="256" />
            <Column id="requestorName" type="STRING" size="256" />
            <Column id="emNoDesc" type="STRING" size="256" />
            <Column id="budgetDeptCode" type="STRING" size="256" />
            <Column id="budgetDept" type="STRING" size="256" />
            <Column id="emNo" type="STRING" size="256" />
            <Column id="requestDept" type="STRING" size="256" />
            <Column id="requestDeptCode" type="STRING" size="256" />
            <Column id="chkInclude" type="STRING" size="256" />
            <Column id="userId" type="STRING" size="256" />
            <Column id="poRequestMasterId" type="STRING" size="256" />
            <Column id="rfqRequestMasterId" type="STRING" size="256" />
            <Column id="tPrvNo" type="STRING" size="256" />
            <Column id="vendorName" type="STRING" size="256" />
            <Column id="vendorId" type="STRING" size="256" />
            <Column id="workOrder" type="STRING" size="256" />
            <Column id="prvTypeCode" type="STRING" size="256" />
            <Column id="excelExportFlag" type="STRING" size="256" />
            <Column id="publicFlag" type="STRING" size="256" />
            <Column id="periodicFlag" type="STRING" size="256" />
            <Column id="dateType" type="STRING" size="256" />
            <Column id="requisitionLineId" type="STRING" size="256" />
            <Column id="authWipEntityId" type="STRING" size="256" />
            <Column id="cancelPrvNo" type="STRING" size="256" />
            <Column id="type" type="STRING" size="256" />
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="requestFrmDate">20260921</Col>
                <Col id="requestToDate">20260921</Col>
                <Col id="organizationId">28753</Col>
                <Col id="itemYn">N</Col>
                <Col id="userId">658359</Col>
                <Col id="dateType">REQUEST</Col>
                <Col id="type">REV_CONFIRM_Q</Col>
            </Row>
        </Rows>
    </Dataset>
    <Dataset id="ds_param">
        <ColumnInfo>
            <Column id="checked" type="STRING" size="256" />
            <Column id="prvNo" type="STRING" size="256" />
            <Column id="confirmFlag" type="STRING" size="256" />
            <Column id="prvStatus" type="STRING" size="256" />
            <Column id="itemType" type="STRING" size="256" />
            <Column id="item" type="STRING" size="256" />
            <Column id="itemDesc" type="STRING" size="256" />
            <Column id="itemStatus" type="STRING" size="256" />
            <Column id="requestQty" type="BIGDECIMAL" size="256" />
            <Column id="overShortageQty" type="BIGDECIMAL" size="256" />
            <Column id="unitPrice" type="BIGDECIMAL" size="256" />
            <Column id="reqAmount" type="BIGDECIMAL" size="256" />
            <Column id="requestorName" type="STRING" size="256" />
            <Column id="requestorDept" type="STRING" size="256" />
            <Column id="requestDate" type="STRING" size="256" />
            <Column id="reviewerName" type="STRING" size="256" />
            <Column id="emNo" type="STRING" size="256" />
            <Column id="emNoDesc" type="STRING" size="256" />
            <Column id="budgetDeptCode" type="STRING" size="256" />
            <Column id="requestComment" type="STRING" size="256" />
            <Column id="reviewComment" type="STRING" size="256" />
            <Column id="emNoBudget" type="STRING" size="256" />
            <Column id="scheduledUseDate" type="STRING" size="256" />
            <Column id="orderTypeDesc" type="STRING" size="256" />
            <Column id="owningDept" type="STRING" size="256" />
            <Column id="bufferZone" type="STRING" size="256" />
            <Column id="wacCode" type="STRING" size="256" />
            <Column id="wacDesc" type="STRING" size="256" />
            <Column id="vendorName" type="STRING" size="256" />
            <Column id="realLeadTime" type="BIGDECIMAL" size="256" />
            <Column id="makerOnHand" type="STRING" size="256" />
            <Column id="supplierStatus" type="STRING" size="256" />
            <Column id="deliveryConfirmDate" type="STRING" size="256" />
            <Column id="unitPriceStatus" type="STRING" size="256" />
            <Column id="poRequestNo" type="STRING" size="256" />
            <Column id="approvalInfo" type="STRING" size="256" />
            <Column id="workOrder" type="STRING" size="256" />
            <Column id="woDesc" type="STRING" size="256" />
            <Column id="poNo" type="STRING" size="256" />
            <Column id="poDate" type="STRING" size="256" />
            <Column id="poQty" type="BIGDECIMAL" size="256" />
            <Column id="poPrice" type="BIGDECIMAL" size="256" />
            <Column id="poAmount" type="BIGDECIMAL" size="256" />
            <Column id="receivingQty" type="BIGDECIMAL" size="256" />
            <Column id="receivingDate" type="STRING" size="256" />
            <Column id="poCancelFlag" type="STRING" size="256" />
            <Column id="confirmDate" type="STRING" size="256" />
            <Column id="confirmName" type="STRING" size="256" />
            <Column id="commonStopFlag" type="STRING" size="256" />
            <Column id="prvStatusCode" type="STRING" size="256" />
            <Column id="itemTypeCode" type="STRING" size="256" />
            <Column id="unitPiceStatusCode" type="STRING" size="256" />
            <Column id="reqEstimateFlag" type="STRING" size="256" />
            <Column id="prvComleteBtnFlag" type="STRING" size="256" />
            <Column id="poRequestBtnFlag" type="STRING" size="256" />
            <Column id="poChageBtnFlag" type="STRING" size="256" />
            <Column id="prvSaveBtnFlag" type="STRING" size="256" />
            <Column id="reviewerId" type="STRING" size="256" />
            <Column id="instanceId" type="STRING" size="256" />
            <Column id="requestorId" type="STRING" size="256" />
            <Column id="requestorDeptCode" type="STRING" size="256" />
            <Column id="inventoryItemId" type="STRING" size="256" />
            <Column id="organizationId" type="STRING" size="256" />
            <Column id="wipEntityId" type="STRING" size="256" />
            <Column id="requisitionLineId" type="STRING" size="256" />
            <Column id="txnGroupId" type="STRING" size="256" />
            <Column id="lineLocationId" type="STRING" size="256" />
            <Column id="poRequestM asterId" type="STRING" size="256" />
            <Column id="orderType" type="STRING" size="256" />
            <Column id="vendorId" type="STRING" size="256" />
            <Column id="approverId" type="STRING" size="256" />
            <Column id="attachment" type="STRING" size="256" />
            <Column id="sscsAttachment" type="STRING" size="256" />
            <Column id="budgetDept" type="STRING" size="256" />
            <Column id="poRequestMasterId" type="STRING" size="256" />
            <Column id="owningDepartmentId" type="STRING" size="256" />
            <Column id="owningDeptCode" type="STRING" size="256" />
            <Column id="rfqRequestMasterId" type="STRING" size="256" />
            <Column id="fileCnt" type="BIGDECIMAL" size="256" />
            <Column id="prvNoFlag" type="STRING" size="256" />
            <Column id="sscsFileCnt" type="BIGDECIMAL" size="256" />
            <Column id="reviewItemQty" type="BIGDECIMAL" size="256" />
            <Column id="delayReasonName" type="STRING" size="256" />
            <Column id="reqPoChgFlag" type="STRING" size="256" />
            <Column id="overShortagePrvQty" type="STRING" size="256" />
            <Column id="publicFlag" type="STRING" size="256" />
            <Column id="periodicFlag" type="STRING" size="256" />
            <Column id="addPoReason" type="STRING" size="256" />
            <Column id="equipmentGroup" type="STRING" size="256" />
            <Column id="updateEnable" type="STRING" size="256" />
            <Column id="useDate" type="STRING" size="256" />
            <Column id="reasonDesc" type="STRING" size="256" />
            <Column id="reviewerFlag" type="STRING" size="256" />
            <Column id="waitRepairQty" type="STRING" size="256" />
            <Column id="partsUseTypeCode" type="STRING" size="256" />
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="checked">1</Col>
                <Col id="prvNo">Q2405-2244838</Col>
                <Col id="confirmFlag">Y</Col>
                <Col id="prvStatus">Confirm PO Review</Col>
                <Col id="itemType">Invidual Management</Col>
                <Col id="item">QCAD38190</Col>
                <Col id="itemDesc">Pneumatic Cylinder ** MXQ16-100B, SMC CORPORATION</Col>
                <Col id="requestQty">3</Col>
                <Col id="unitPrice">597</Col>
                <Col id="reqAmount">1791</Col>
                <Col id="requestorName">Pham Duc Long</Col>
                <Col id="inventoryItemId">10001</Col>
                <Col id="organizationId">28753</Col>
            </Row>
        </Rows>
    </Dataset>
    <Dataset id="ds_FileMain"><ColumnInfo /><Rows /></Dataset>
    <Dataset id="ds_FileSscs"><ColumnInfo /><Rows /></Dataset>
</Root>"""

STEP3_XML = """<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
    <Parameters>
        <Parameter id="_ems_userId">658359</Parameter>
        <Parameter id="_ems_organizationId">28753</Parameter>
        <Parameter id="_ems_language">EN</Parameter>
    </Parameters>
    <Dataset id="ds_search">
        <ColumnInfo>
            <Column id="requestFrmDate" type="STRING" size="256" />
            <Column id="requestToDate" type="STRING" size="256" />
            <Column id="organizationId" type="STRING" size="256" />
            <Column id="userId" type="STRING" size="256" />
            <Column id="type" type="STRING" size="256" />
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="requestFrmDate">20260921</Col>
                <Col id="requestToDate">20260921</Col>
                <Col id="organizationId">28753</Col>
                <Col id="userId">658359</Col>
                <Col id="type">REV_CONFIRM_Q</Col>
            </Row>
        </Rows>
    </Dataset>
    <Dataset id="ds_param">
        <ColumnInfo>
            <Column id="item" type="STRING" size="256" />
            <Column id="itemDesc" type="STRING" size="256" />
            <Column id="inventoryItemId" type="STRING" size="256" />
            <Column id="requestQty" type="BIGDECIMAL" size="256" />
            <Column id="unitPrice" type="BIGDECIMAL" size="256" />
            <Column id="reqAmount" type="BIGDECIMAL" size="256" />
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="item">QCAD38190</Col>
                <Col id="itemDesc">Pneumatic Cylinder ** MXQ16-100B, SMC CORPORATION</Col>
                <Col id="inventoryItemId">10001</Col>
                <Col id="requestQty">3</Col>
                <Col id="unitPrice">3150</Col>
                <Col id="reqAmount">9450</Col>
            </Row>
        </Rows>
    </Dataset>
</Root>"""


def parse_client_response_xml(xml_response_text: str) -> tuple[str, list[dict]]:
    """NexacroService parser logic from draft/01.txt."""
    root = ET.fromstring(xml_response_text)
    ns = {"ns": "http://www.nexacroplatform.com/platform/dataset"}
    error_msg = ""

    err_param = root.find(".//ns:Parameter[@id='errorMsg']", ns)
    if err_param is not None and err_param.text is not None:
        text_val = str(err_param.text).strip()
        if text_val:
            error_msg = text_val

    if not error_msg:
        all_parameters = root.findall(".//{*}Parameter")
        for param in all_parameters:
            p_id = str(param.get("id")).strip()
            if p_id in ["errorMsg", "ErrorMsg"] and param.text is not None:
                text_val = str(param.text).strip()
                if text_val:
                    error_msg = text_val
                    break

    rows_data = []
    dataset_result = root.find(".//ns:Dataset[@id='ds_result']", ns)
    if dataset_result is None:
        dataset_result = root.find(".//ns:Dataset[@id='ds_param']", ns)
    if dataset_result is not None:
        dataset_rows = dataset_result.find("ns:Rows", ns)
        if dataset_rows is not None:
            for row in dataset_rows.findall("ns:Row", ns):
                row_dict = {}
                for col in row.findall("ns:Col", ns):
                    col_id = col.get("id")
                    col_value = col.text if col.text is not None else ""
                    row_dict[col_id] = col_value
                rows_data.append(row_dict)

    return error_msg, rows_data


@pytest.mark.asyncio
async def test_step1_stock_status_search(client: AsyncClient):
    """Step 1: RetStockStatusList.lgdn returns inventory item info."""
    headers = {"Content-Type": "application/xml; charset=UTF-8"}
    resp = await client.post(
        "/emsspareparts/sp101/sp110Nav/RetStockStatusList.lgdn",
        content=STEP1_XML.encode("utf-8"),
        headers=headers,
    )
    assert resp.status_code == 200
    err_msg, rows = parse_client_response_xml(resp.text)
    assert err_msg == ""
    assert len(rows) >= 1
    found_item = rows[0]
    assert found_item["itemName"] == "QCAD38190"
    assert found_item["inventoryItemId"] == "10001"
    assert "Pneumatic Cylinder" in found_item["itemDescription"]


@pytest.mark.asyncio
async def test_step2_save_130_prv_data(client: AsyncClient):
    """Step 2: save130PrvData.lgdn accepts PRV review data and returns success."""
    headers = {"Content-Type": "application/xml; charset=UTF-8"}
    resp = await client.post(
        "/emsspareparts/sp102/sp130Nav/save130PrvData.lgdn",
        content=STEP2_XML.encode("utf-8"),
        headers=headers,
    )
    assert resp.status_code == 200
    err_msg, _ = parse_client_response_xml(resp.text)
    assert err_msg == ""


@pytest.mark.asyncio
async def test_step3_retrieve_po_request(client: AsyncClient):
    """Step 3: retrievePoRequest.lgdn returns detailed ds_param record."""
    headers = {"Content-Type": "application/xml; charset=UTF-8"}
    resp = await client.post(
        "/emsspareparts/sp102/sp130Nav/retrievePoRequest.lgdn",
        content=STEP3_XML.encode("utf-8"),
        headers=headers,
    )
    assert resp.status_code == 200
    err_msg, rows = parse_client_response_xml(resp.text)
    assert err_msg == ""
    assert len(rows) >= 1
    param_row = rows[0]
    assert param_row["item"] == "QCAD38190"
    assert param_row["inventoryItemId"] == "10001"
    assert param_row["requestQty"] == "3"
    assert param_row["unitPriceStatus"] == "Price Registration"


@pytest.mark.asyncio
async def test_sp130_scenarios(client: AsyncClient):
    """Test scenario matching for save130PrvData and retrievePoRequest."""
    headers = {"Content-Type": "application/json", "Accept": "application/json"}

    # Error scenario on save
    err_payload = {
        "params": {
            "_ems_userId": "658359",
            "_scenario": "error",
        },
        "datasets": {
            "ds_search": {"cols": ["organizationId"], "rows": [["28753"]]},
            "ds_param": {"cols": ["item"], "rows": [["QCAD38190"]]},
            "ds_FileMain": {"cols": [], "rows": []},
            "ds_FileSscs": {"cols": [], "rows": []},
        },
    }
    resp = await client.post(
        "/emsspareparts/sp102/sp130Nav/save130PrvData.lgdn",
        json=err_payload,
        headers=headers,
    )
    assert resp.status_code == 200
    parsed = NexacroParser.parse_payload(resp.text)
    assert parsed.params.get("ErrorCode") == "-1"
    assert "Simulated PRV save failure" in parsed.params.get("ErrorMsg", "")

    # Empty scenario on retrieve
    empty_payload = {
        "params": {
            "_ems_userId": "658359",
            "_scenario": "empty",
        },
        "datasets": {
            "ds_search": {"cols": ["organizationId"], "rows": [["28753"]]},
            "ds_param": {"cols": ["item"], "rows": [["QCAD38190"]]},
        },
    }
    resp2 = await client.post(
        "/emsspareparts/sp102/sp130Nav/retrievePoRequest.lgdn",
        json=empty_payload,
        headers=headers,
    )
    assert resp2.status_code == 200
    parsed2 = NexacroParser.parse_payload(resp2.text)
    assert "ds_param" in parsed2.datasets
    assert parsed2.datasets["ds_param"].count == 0
