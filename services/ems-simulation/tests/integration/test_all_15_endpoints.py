"""Integration test executing all 12 registered Nexacro EMS data retrieval endpoints using XML wire format."""

import pytest
from httpx import AsyncClient

from ems_sim.parser.request_parser import NexacroParser

ALL_DATA_ENDPOINTS = [
    # Spare parts & inventory
    "/emsspareparts/sp101/sp110Nav/RetStockStatusList.lgdn",
    "/emsspareparts/sp101/sp120Nav/RetEstimateRequestList.lgdn",
    "/emsspareparts/sp102/sp135Nav/retrieveItemInfoDetail.lgdn",
    # Stock management
    "/emsspareparts/sp302/sp330Nav/TargetStockSearchList.lgdn",
    "/emsspareparts/sp302/sp335Nav/TargetStockSearchList.lgdn",
    # Purchasing & popups
    "/emscom/popupNav/retrieveItemPoStatusList.lgdn",
    "/emscom/popupNav/retrieveItem.lgdn",
    # Work orders
    "/emscom/woMasterNav/WoMasterRetInit.lgdn",
    "/emsworkorder/wo20/wo230Nav/WO230WoSaveInit.lgdn",
    "/emscom/woSearchNav/retrieveWipEntity.lgdn",
    "/emsworkorder/wo50/wo580Nav/statusHistory.lgdn",
    # Common data
    "/emscom/codeNav/retComCodeList.lgdn",
]

SAMPLE_XML_PAYLOAD = """<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
    <Parameters>
        <Parameter id="_ems_userId" type="string">658359</Parameter>
        <Parameter id="_ems_organizationId" type="string">28753</Parameter>
        <Parameter id="_ems_language" type="string">EN</Parameter>
    </Parameters>
    <Dataset id="ds_search">
        <ColumnInfo>
            <Column id="organizationId" type="STRING" size="256"/>
            <Column id="item" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="organizationId">28753</Col>
                <Col id="item">QDAB03583</Col>
            </Row>
        </Rows>
    </Dataset>
    <Dataset id="ds_info">
        <ColumnInfo>
            <Column id="wipEntityId" type="STRING" size="256"/>
            <Column id="organizationId" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="wipEntityId">337389615</Col>
                <Col id="organizationId">28753</Col>
            </Row>
        </Rows>
    </Dataset>
    <Dataset id="ds_input">
        <ColumnInfo>
            <Column id="wipEntityId" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="wipEntityId">337389615</Col>
            </Row>
        </Rows>
    </Dataset>
</Root>"""


@pytest.mark.asyncio
@pytest.mark.parametrize("path", ALL_DATA_ENDPOINTS)
async def test_endpoint_returns_valid_nexacro_response(client: AsyncClient, path: str):
    """Verify that every single data retrieval endpoint responds with HTTP 200 and standard Nexacro XML structure."""
    response = await client.post(
        path,
        content=SAMPLE_XML_PAYLOAD,
        headers={"Content-Type": "application/xml", "Accept": "application/xml"},
    )
    assert response.status_code == 200, (
        f"Endpoint {path} returned status {response.status_code}: {response.text}"
    )
    assert "application/xml" in response.headers["content-type"]

    parsed = NexacroParser.parse_xml(response.text)
    assert "errorCode" in parsed.params, f"Response missing 'errorCode' on {path}"
    assert parsed.params.get("errorCode") == "1", (
        f"Expected errorCode='1' on {path}, got {parsed.params}"
    )
    assert "errorMsg" in parsed.params, f"Expected 'errorMsg' param on {path}"


@pytest.mark.asyncio
async def test_unregistered_endpoint_returns_404(client: AsyncClient):
    """Verify that unregistered endpoints return controlled 404 response in XML."""
    response = await client.post(
        "/unknown/unregistered/api.lgdn",
        content="<Root/>",
        headers={"Content-Type": "application/xml"},
    )
    assert response.status_code == 404
    parsed = NexacroParser.parse_xml(response.text)
    assert parsed.params.get("errorCode") == "-404"
