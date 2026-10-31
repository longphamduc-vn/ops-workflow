"""Integration tests verifying full XML wire format support for requests and responses."""

import xml.etree.ElementTree as ET

import pytest
from httpx import AsyncClient


def _strip_tag(tag: str) -> str:
    if "}" in tag:
        return tag.split("}", 1)[1]
    return tag


@pytest.mark.asyncio
async def test_xml_request_and_response_stock_status(client: AsyncClient):
    """Verify endpoint receives XML payload and responds with valid Nexacro XML structure."""
    xml_request = """<?xml version="1.0" encoding="UTF-8"?>
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
                <Col id="item">QCAB10960</Col>
            </Row>
        </Rows>
    </Dataset>
</Root>"""

    response = await client.post(
        "/emsspareparts/sp101/sp110Nav/RetStockStatusList.lgdn",
        content=xml_request,
        headers={"Content-Type": "application/xml", "Accept": "application/xml"},
    )
    assert response.status_code == 200
    assert "application/xml" in response.headers["content-type"]

    # Parse and validate response XML
    root = ET.fromstring(response.text)
    assert _strip_tag(root.tag) == "Root"

    # Verify Parameters
    params_elem = root.find("{http://www.nexacroplatform.com/platform/dataset}Parameters")
    if params_elem is None:
        params_elem = root.find("Parameters")
    assert params_elem is not None

    param_map = {p.attrib["id"]: (p.text or "") for p in params_elem}
    assert param_map.get("errorCode") == "1"
    assert param_map.get("errorMsg") == ""

    # Verify ds_result Dataset
    datasets = root.findall("{http://www.nexacroplatform.com/platform/dataset}Dataset")
    if not datasets:
        datasets = root.findall("Dataset")
    assert len(datasets) >= 1
    assert datasets[0].attrib["id"] == "ds_result"


@pytest.mark.asyncio
async def test_xml_multi_dataset_response(client: AsyncClient):
    """Verify retrieveItemInfoDetail returns multiple datasets in XML format."""
    xml_request = """<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
    <Parameters>
        <Parameter id="_ems_userId" type="string">658359</Parameter>
        <Parameter id="_ems_organizationId" type="string">28753</Parameter>
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

    root = ET.fromstring(response.text)
    datasets = root.findall("{http://www.nexacroplatform.com/platform/dataset}Dataset")
    if not datasets:
        datasets = root.findall("Dataset")

    ds_ids = {d.attrib["id"] for d in datasets}
    assert "ds_Item" in ds_ids
    assert "ds_Inv" in ds_ids
    assert "ds_Summary" in ds_ids


@pytest.mark.asyncio
async def test_xml_scenario_empty_result(client: AsyncClient):
    """Verify trigger scenario via XML returns empty dataset in XML format."""
    xml_request = """<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="http://www.nexacroplatform.com/platform/dataset">
    <Parameters>
        <Parameter id="_ems_userId" type="string">658359</Parameter>
        <Parameter id="_scenario" type="string">empty</Parameter>
    </Parameters>
</Root>"""

    response = await client.post(
        "/emsspareparts/sp101/sp110Nav/RetStockStatusList.lgdn",
        content=xml_request,
        headers={"Content-Type": "application/xml"},
    )
    assert response.status_code == 200
    assert "application/xml" in response.headers["content-type"]

    root = ET.fromstring(response.text)
    datasets = root.findall("{http://www.nexacroplatform.com/platform/dataset}Dataset")
    if not datasets:
        datasets = root.findall("Dataset")
    assert len(datasets) >= 1

    rows_elem = datasets[0].find("{http://www.nexacroplatform.com/platform/dataset}Rows")
    if rows_elem is None:
        rows_elem = datasets[0].find("Rows")
    assert len(rows_elem) == 0


@pytest.mark.asyncio
async def test_xml_unregistered_endpoint_404(client: AsyncClient):
    """Verify unregistered endpoint returns XML error response."""
    response = await client.post(
        "/unknown/service.lgdn",
        content="<Root/>",
        headers={"Content-Type": "application/xml"},
    )
    assert response.status_code == 404
    assert "application/xml" in response.headers["content-type"]

    root = ET.fromstring(response.text)
    params_elem = root.find("{http://www.nexacroplatform.com/platform/dataset}Parameters")
    if params_elem is None:
        params_elem = root.find("Parameters")
    assert params_elem is not None
    param_map = {p.attrib["id"]: p.text for p in params_elem}
    assert param_map.get("errorCode") == "-404"
