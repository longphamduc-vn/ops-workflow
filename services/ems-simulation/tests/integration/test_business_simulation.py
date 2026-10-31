"""Integration tests for business logic simulation and scenario execution using XML."""

import pytest
from httpx import AsyncClient

from ems_sim.parser.request_parser import NexacroParser


@pytest.mark.asyncio
async def test_item_detail_multi_dataset_response(client: AsyncClient):
    """Verify retrieveItemInfoDetail returns all 3 distinct datasets in XML format: ds_Item, ds_Inv, ds_Summary."""
    xml_request = """<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
    <Parameters>
        <Parameter id="_ems_userId" type="string">658359</Parameter>
        <Parameter id="_ems_organizationId" type="string">28753</Parameter>
        <Parameter id="_ems_language" type="string">EN</Parameter>
    </Parameters>
    <Dataset id="ds_Input">
        <ColumnInfo>
            <Column id="organizationId" type="STRING" size="256"/>
            <Column id="inventoryItemId" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="organizationId">28753</Col>
                <Col id="inventoryItemId">356327</Col>
            </Row>
        </Rows>
    </Dataset>
</Root>"""

    response = await client.post(
        "/emsspareparts/sp102/sp135Nav/retrieveItemInfoDetail.lgdn",
        content=xml_request,
        headers={"Content-Type": "application/xml"},
    )
    assert response.status_code == 200
    assert "application/xml" in response.headers["content-type"]

    parsed = NexacroParser.parse_xml(response.text)
    datasets = parsed.datasets
    assert "ds_Item" in datasets
    assert "ds_Inv" in datasets
    assert "ds_Summary" in datasets
    assert datasets["ds_Item"].count >= 1
    assert datasets["ds_Inv"].count >= 1
    assert datasets["ds_Summary"].count >= 1


@pytest.mark.asyncio
async def test_scenario_execution_empty_result(client: AsyncClient):
    """Verify configured simulation scenario produces empty results when triggered via XML."""
    xml_request = """<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
    <Parameters>
        <Parameter id="_ems_userId" type="string">658359</Parameter>
        <Parameter id="_ems_organizationId" type="string">28753</Parameter>
        <Parameter id="_scenario" type="string">empty</Parameter>
    </Parameters>
    <Dataset id="ds_search">
        <ColumnInfo>
            <Column id="organizationId" type="STRING" size="256"/>
        </ColumnInfo>
        <Rows>
            <Row>
                <Col id="organizationId">28753</Col>
            </Row>
        </Rows>
    </Dataset>
</Root>"""

    response = await client.post(
        "/emsspareparts/sp101/sp110Nav/RetStockStatusList.lgdn",
        content=xml_request,
        headers={"Content-Type": "application/xml"},
    )
    assert response.status_code == 200
    assert "application/xml" in response.headers["content-type"]

    parsed = NexacroParser.parse_xml(response.text)
    assert parsed.datasets["ds_result"].count == 0
    assert len(parsed.datasets["ds_result"].rows) == 0
