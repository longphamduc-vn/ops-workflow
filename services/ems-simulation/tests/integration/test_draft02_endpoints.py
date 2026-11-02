"""Integration tests for endpoints added from draft/02.txt:
1. /emsspareparts/sp105/sp180Nav/EmergencyPoList.lgdn
2. /emsspareparts/sp40/sp401Nav/retPartsTransferReqList.lgdn
3. /emsspareparts/sp40/sp405Nav/retOtherSitePoRevReqList.lgdn
4. /emsspareparts/sp102/sp130Nav/retrieveItemBuyMainList.lgdn
"""

import pytest
from httpx import AsyncClient

from ems_sim.parser.request_parser import NexacroParser


EMERGENCY_PO_XML = """<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
    <Parameters>
        <Parameter id="_ems_userId" type="string">658359</Parameter>
        <Parameter id="_ems_organizationId" type="string">28753</Parameter>
        <Parameter id="_ems_language" type="string">EN</Parameter>
    </Parameters>
    <Dataset id="ds_search">
        <ColumnInfo>
            <Column id="organizationId" type="STRING" size="256"/>
            <Column id="userId" type="STRING" size="256"/>
            <Column id="requestMasterId" type="STRING" size="256"/>
            <Column id="requestFrmDate" type="STRING" size="256"/>
            <Column id="requestToDate" type="STRING" size="256"/>
            <Column id="actionTypeCode" type="STRING" size="256"/>
            <Column id="emergencyActionNo" type="STRING" size="256"/>
            <Column id="requestorId" type="STRING" size="256"/>
            <Column id="statusCode" type="STRING" size="256"/>
            <Column id="requestorName" type="STRING" size="256"/>
            <Column id="itemCategory" type="STRING" size="256"/>
            <Column id="prvNo" type="STRING" size="256"/>
            <Column id="workOrder" type="STRING" size="256"/>
            <Column id="issueWo" type="STRING" size="256"/>
            <Column id="item" type="STRING" size="256"/>
            <Column id="vendorId" type="STRING" size="256"/>
            <Column id="catelogGroupId" type="STRING" size="256"/>
            <Column id="inventoryItemId" type="STRING" size="256"/>
            <Column id="itemYn" type="STRING" size="256"/>
            <Column id="receiptYn" type="STRING" size="256"/>
            <Column id="poRequestMasterId" type="STRING" size="256"/>
            <Column id="reviewRequestNo" type="STRING" size="256"/>
            <Column id="requestDept" type="STRING" size="256"/>
            <Column id="requestDeptCode" type="STRING" size="256"/>
            <Column id="budgetDept" type="STRING" size="256"/>
            <Column id="budgetDeptCode" type="STRING" size="256"/>
            <Column id="wipEntityId" type="STRING" size="256"/>
            <Column id="emergencyNo" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="organizationId">28753</Col>
                <Col id="userId">658359</Col>
                <Col id="itemYn">N</Col>
                <Col id="budgetDept">PO Module Technology Team 2</Col>
                <Col id="budgetDeptCode">87321</Col>
            </Row>
        </Rows>
    </Dataset>
    <Dataset id="ds_ItemInfo">
        <ColumnInfo>
            <Column id="item" type="STRING" size="256"/>
            <Column id="itemDesc" type="STRING" size="256"/>
            <Column id="inventoryItemId" type="STRING" size="256"/>
            <Column id="remark" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows/>
    </Dataset>
    <Dataset id="ds_PoRvNo">
        <ColumnInfo>
            <Column id="reviewRequestNo" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows/>
    </Dataset>
</Root>
"""

PARTS_TRANSFER_REQ_XML = """<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
    <Parameters>
        <Parameter id="_ems_userId" type="string">658359</Parameter>
        <Parameter id="_ems_organizationId" type="string">28753</Parameter>
        <Parameter id="_ems_language" type="string">EN</Parameter>
    </Parameters>
    <Dataset id="ds_search">
        <ColumnInfo>
            <Column id="organizationId" type="STRING" size="256"/>
            <Column id="userId" type="STRING" size="256"/>
            <Column id="responsibilityId" type="STRING" size="256"/>
            <Column id="employeeNumber" type="STRING" size="256"/>
            <Column id="equipmentGroup" type="STRING" size="256"/>
            <Column id="partsCode" type="STRING" size="256"/>
            <Column id="partsName" type="STRING" size="256"/>
            <Column id="inspectItem" type="STRING" size="256"/>
            <Column id="measure" type="STRING" size="256"/>
            <Column id="employeeNo" type="STRING" size="256"/>
            <Column id="employeeName" type="STRING" size="256"/>
            <Column id="useYn" type="STRING" size="256"/>
            <Column id="checkBasisId" type="STRING" size="256"/>
            <Column id="sSchFromDate" type="STRING" size="256"/>
            <Column id="sSchToDate" type="STRING" size="256"/>
            <Column id="managementNo" type="STRING" size="256"/>
            <Column id="requestNo" type="STRING" size="256"/>
            <Column id="statusCode" type="STRING" size="256"/>
            <Column id="reqSite" type="STRING" size="256"/>
            <Column id="onHandSite" type="STRING" size="256"/>
            <Column id="departmentCode" type="STRING" size="256"/>
            <Column id="departmentName" type="STRING" size="256"/>
            <Column id="reqSiteMngName" type="STRING" size="256"/>
            <Column id="reqSiteMngId" type="STRING" size="256"/>
            <Column id="onHandSiteMngName" type="STRING" size="256"/>
            <Column id="onHandSiteMngId" type="STRING" size="256"/>
            <Column id="requestorName" type="STRING" size="256"/>
            <Column id="requestorId" type="STRING" size="256"/>
            <Column id="requestMasterId" type="STRING" size="256"/>
            <Column id="requestMasterSubId" type="STRING" size="256"/>
            <Column id="itemYn" type="STRING" size="256"/>
            <Column id="reviewRequestNo" type="STRING" size="256"/>
            <Column id="otherSitePoReqNo" type="STRING" size="256"/>
            <Column id="transReqTypeCode" type="STRING" size="256"/>
            <Column id="poNo" type="STRING" size="256"/>
            <Column id="invoiceNo" type="STRING" size="256"/>
            <Column id="blNo" type="STRING" size="256"/>
            <Column id="arNo" type="STRING" size="256"/>
            <Column id="apNo" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="organizationId">28753</Col>
                <Col id="userId">658359</Col>
                <Col id="responsibilityId">69972</Col>
                <Col id="employeeNumber">VH081996</Col>
                <Col id="reqSite">28753</Col>
                <Col id="requestorName">Pham Duc Long</Col>
                <Col id="requestorId">658359</Col>
                <Col id="itemYn">N</Col>
            </Row>
        </Rows>
    </Dataset>
    <Dataset id="ds_item">
        <ColumnInfo>
            <Column id="item" type="STRING" size="256"/>
            <Column id="itemDesc" type="STRING" size="256"/>
            <Column id="inventoryItemId" type="STRING" size="256"/>
            <Column id="remark" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows/>
    </Dataset>
</Root>
"""

OTHER_SITE_PO_REV_REQ_XML = """<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
    <Parameters>
        <Parameter id="_ems_userId" type="string">658359</Parameter>
        <Parameter id="_ems_organizationId" type="string">28753</Parameter>
        <Parameter id="_ems_language" type="string">EN</Parameter>
    </Parameters>
    <Dataset id="ds_search">
        <ColumnInfo>
            <Column id="organizationId" type="STRING" size="256"/>
            <Column id="userId" type="STRING" size="256"/>
            <Column id="responsibilityId" type="STRING" size="256"/>
            <Column id="employeeNumber" type="STRING" size="256"/>
            <Column id="employeeNo" type="STRING" size="256"/>
            <Column id="employeeName" type="STRING" size="256"/>
            <Column id="reqFromDate" type="STRING" size="256"/>
            <Column id="reqToDate" type="STRING" size="256"/>
            <Column id="reviewRequestNo" type="STRING" size="256"/>
            <Column id="otherSitePoReqNo" type="STRING" size="256"/>
            <Column id="poStatusCode" type="STRING" size="256"/>
            <Column id="reqSite" type="STRING" size="256"/>
            <Column id="poSite" type="STRING" size="256"/>
            <Column id="reqDepartmentCode" type="STRING" size="256"/>
            <Column id="reqDepartmentName" type="STRING" size="256"/>
            <Column id="reqSiteMngName" type="STRING" size="256"/>
            <Column id="reqSiteMngId" type="STRING" size="256"/>
            <Column id="poSiteMngName" type="STRING" size="256"/>
            <Column id="poSiteMngId" type="STRING" size="256"/>
            <Column id="requestorName" type="STRING" size="256"/>
            <Column id="requestorId" type="STRING" size="256"/>
            <Column id="requestMasterId" type="STRING" size="256"/>
            <Column id="requestMasterSubId" type="STRING" size="256"/>
            <Column id="itemYn" type="STRING" size="256"/>
            <Column id="reqStatusCode" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="organizationId">28753</Col>
                <Col id="userId">658359</Col>
                <Col id="responsibilityId">69972</Col>
                <Col id="employeeNumber">VH081996</Col>
                <Col id="reqSite">28753</Col>
                <Col id="requestorName">Pham Duc Long</Col>
                <Col id="requestorId">658359</Col>
                <Col id="itemYn">N</Col>
            </Row>
        </Rows>
    </Dataset>
    <Dataset id="ds_item">
        <ColumnInfo>
            <Column id="item" type="STRING" size="256"/>
            <Column id="itemDesc" type="STRING" size="256"/>
            <Column id="inventoryItemId" type="STRING" size="256"/>
            <Column id="remark" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows/>
    </Dataset>
</Root>
"""

BUY_MAIN_LIST_XML = """<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
    <Parameters>
        <Parameter id="_ems_userId" type="string">658359</Parameter>
        <Parameter id="_ems_organizationId" type="string">28753</Parameter>
        <Parameter id="_ems_language" type="string">EN</Parameter>
    </Parameters>
    <Dataset id="ds_search">
        <ColumnInfo>
            <Column id="itemTypeCode" type="STRING" size="256"/>
            <Column id="prvStatusCode" type="STRING" size="256"/>
            <Column id="prvNo" type="STRING" size="256"/>
            <Column id="overShortageQty" type="STRING" size="256"/>
            <Column id="unitPriceStatusCode" type="STRING" size="256"/>
            <Column id="itemStatus" type="STRING" size="256"/>
            <Column id="confirmFlag" type="STRING" size="256"/>
            <Column id="reviewerId" type="STRING" size="256"/>
            <Column id="instanceId" type="STRING" size="256"/>
            <Column id="requestorId" type="STRING" size="256"/>
            <Column id="requestorDeptCode" type="STRING" size="256"/>
            <Column id="requestFrmDate" type="STRING" size="256"/>
            <Column id="requestToDate" type="STRING" size="256"/>
            <Column id="inventoryItemId" type="STRING" size="256"/>
            <Column id="organizationItemId" type="STRING" size="256"/>
            <Column id="organizationId" type="STRING" size="256"/>
            <Column id="txnGroupId" type="STRING" size="256"/>
            <Column id="itemYn" type="STRING" size="256"/>
            <Column id="reviewerName" type="STRING" size="256"/>
            <Column id="requestorName" type="STRING" size="256"/>
            <Column id="emNoDesc" type="STRING" size="256"/>
            <Column id="budgetDeptCode" type="STRING" size="256"/>
            <Column id="budgetDept" type="STRING" size="256"/>
            <Column id="emNo" type="STRING" size="256"/>
            <Column id="requestDept" type="STRING" size="256"/>
            <Column id="requestDeptCode" type="STRING" size="256"/>
            <Column id="chkInclude" type="STRING" size="256"/>
            <Column id="userId" type="STRING" size="256"/>
            <Column id="poRequestMasterId" type="STRING" size="256"/>
            <Column id="rfqRequestMasterId" type="STRING" size="256"/>
            <Column id="tPrvNo" type="STRING" size="256"/>
            <Column id="vendorName" type="STRING" size="256"/>
            <Column id="vendorId" type="STRING" size="256"/>
            <Column id="workOrder" type="STRING" size="256"/>
            <Column id="prvTypeCode" type="STRING" size="256"/>
            <Column id="excelExportFlag" type="STRING" size="256"/>
            <Column id="publicFlag" type="STRING" size="256"/>
            <Column id="periodicFlag" type="STRING" size="256"/>
            <Column id="dateType" type="STRING" size="256"/>
            <Column id="requisitionLineId" type="STRING" size="256"/>
            <Column id="authWipEntityId" type="STRING" size="256"/>
            <Column id="cancelPrvNo" type="STRING" size="256"/>
            <Column id="type" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="requestFrmDate">20261001</Col>
                <Col id="requestToDate">20261102</Col>
                <Col id="organizationId">28753</Col>
                <Col id="itemYn">N</Col>
                <Col id="userId">658359</Col>
                <Col id="dateType">REQUEST</Col>
                <Col id="type">REV_CONFIRM_Q</Col>
            </Row>
        </Rows>
    </Dataset>
    <Dataset id="ds_ItemInfo">
        <ColumnInfo>
            <Column id="item" type="STRING" size="256"/>
            <Column id="itemDesc" type="STRING" size="256"/>
            <Column id="inventoryItemId" type="STRING" size="256"/>
            <Column id="remark" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows/>
    </Dataset>
    <Dataset id="ds_PoRvNo">
        <ColumnInfo>
            <Column id="reviewRequestNo" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row><Col id="reviewRequestNo">Q2610-3100832</Col></Row>
        </Rows>
    </Dataset>
</Root>
"""


@pytest.mark.asyncio
async def test_emergency_po_list_endpoint(client: AsyncClient):
    """Test /emsspareparts/sp105/sp180Nav/EmergencyPoList.lgdn wire call."""
    resp = await client.post(
        "/emsspareparts/sp105/sp180Nav/EmergencyPoList.lgdn",
        content=EMERGENCY_PO_XML.encode("utf-8"),
        headers={"Content-Type": "application/xml; charset=utf-8"},
    )
    assert resp.status_code == 200
    assert "xml" in resp.headers["content-type"]

    parsed = NexacroParser.parse_xml(resp.text)
    assert parsed.get_param("errorCode") == "1"
    assert "ds_result" in parsed.datasets

    ds_result = parsed.datasets["ds_result"]
    assert ds_result.count >= 1
    first_row = ds_result.to_dict_list()[0]
    assert first_row["emrgPoType"] == "EMERGENCY PO"
    assert first_row["item"] == "QDAD12236"
    assert first_row["poRequestNo"] == "WOP-18090530"


@pytest.mark.asyncio
async def test_parts_transfer_req_list_endpoint(client: AsyncClient):
    """Test /emsspareparts/sp40/sp401Nav/retPartsTransferReqList.lgdn wire call."""
    resp = await client.post(
        "/emsspareparts/sp40/sp401Nav/retPartsTransferReqList.lgdn",
        content=PARTS_TRANSFER_REQ_XML.encode("utf-8"),
        headers={"Content-Type": "application/xml; charset=utf-8"},
    )
    assert resp.status_code == 200
    assert "xml" in resp.headers["content-type"]

    parsed = NexacroParser.parse_xml(resp.text)
    assert parsed.get_param("errorCode") == "1"
    assert "ds_list" in parsed.datasets

    ds_list = parsed.datasets["ds_list"]
    assert ds_list.count == 4
    items = [r["item"] for r in ds_list.to_dict_list()]
    assert "QDAB03583" in items
    assert "QDAC01233" in items

    target_row = next(r for r in ds_list.to_dict_list() if r["item"] == "QDAB03583")
    assert target_row["inventoryItemId"] == "356327"
    assert target_row["requestQty"] == "4"


@pytest.mark.asyncio
async def test_other_site_po_rev_req_list_endpoint(client: AsyncClient):
    """Test /emsspareparts/sp40/sp405Nav/retOtherSitePoRevReqList.lgdn wire call."""
    resp = await client.post(
        "/emsspareparts/sp40/sp405Nav/retOtherSitePoRevReqList.lgdn",
        content=OTHER_SITE_PO_REV_REQ_XML.encode("utf-8"),
        headers={"Content-Type": "application/xml; charset=utf-8"},
    )
    assert resp.status_code == 200
    assert "xml" in resp.headers["content-type"]

    parsed = NexacroParser.parse_xml(resp.text)
    assert parsed.get_param("errorCode") == "1"
    assert "ds_list" in parsed.datasets

    ds_list = parsed.datasets["ds_list"]
    assert ds_list.count == 5
    items = [r["item"] for r in ds_list.to_dict_list()]
    assert "QDAB35621" in items
    assert "QCAC30474" in items


@pytest.mark.asyncio
async def test_retrieve_item_buy_main_list_endpoint(client: AsyncClient):
    """Test /emsspareparts/sp102/sp130Nav/retrieveItemBuyMainList.lgdn wire call."""
    resp = await client.post(
        "/emsspareparts/sp102/sp130Nav/retrieveItemBuyMainList.lgdn",
        content=BUY_MAIN_LIST_XML.encode("utf-8"),
        headers={"Content-Type": "application/xml; charset=utf-8"},
    )
    assert resp.status_code == 200
    assert "xml" in resp.headers["content-type"]

    parsed = NexacroParser.parse_xml(resp.text)
    assert parsed.get_param("errorCode") == "1"
    assert "ds_list" in parsed.datasets

    ds_list = parsed.datasets["ds_list"]
    assert ds_list.count == 4
    items = [r["item"] for r in ds_list.to_dict_list()]
    assert "QCAC60402" in items
    assert "QDAA02724" in items


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "path,xml_payload,target_ds",
    [
        (
            "/emsspareparts/sp105/sp180Nav/EmergencyPoList.lgdn",
            EMERGENCY_PO_XML,
            "ds_result",
        ),
        (
            "/emsspareparts/sp40/sp401Nav/retPartsTransferReqList.lgdn",
            PARTS_TRANSFER_REQ_XML,
            "ds_list",
        ),
        (
            "/emsspareparts/sp40/sp405Nav/retOtherSitePoRevReqList.lgdn",
            OTHER_SITE_PO_REV_REQ_XML,
            "ds_list",
        ),
        (
            "/emsspareparts/sp102/sp130Nav/retrieveItemBuyMainList.lgdn",
            BUY_MAIN_LIST_XML,
            "ds_list",
        ),
    ],
)
async def test_scenario_empty_behavior(
    client: AsyncClient, path: str, xml_payload: str, target_ds: str
):
    """Test that setting _scenario='empty' returns an empty dataset for all 4 endpoints."""
    # Inject _scenario="empty"
    scenario_xml = xml_payload.replace(
        '<Parameter id="_ems_language" type="string">EN</Parameter>',
        '<Parameter id="_ems_language" type="string">EN</Parameter>\n'
        '        <Parameter id="_scenario" type="string">empty</Parameter>',
    )
    resp = await client.post(
        path,
        content=scenario_xml.encode("utf-8"),
        headers={"Content-Type": "application/xml; charset=utf-8"},
    )
    assert resp.status_code == 200
    parsed = NexacroParser.parse_xml(resp.text)
    assert parsed.get_param("errorCode") == "1"
    assert target_ds in parsed.datasets
    assert parsed.datasets[target_ds].count == 0
    assert len(parsed.datasets[target_ds].rows) == 0
