"""Contract tests for Nexacro Platform connector using real XML fixtures."""

from pathlib import Path

import httpx
import pytest
import respx

from opsflow.connectors.nexacro.codec_xml import deserialize_xml, serialize_xml
from opsflow.connectors.nexacro.connector import NexacroConnector

FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.mark.contract
def test_nexacro_xml_codec_deserialization() -> None:
    list_fixture = (FIXTURES_DIR / "nexacro_list_response.xml").read_text(encoding="utf-8")
    params, datasets = deserialize_xml(list_fixture)

    assert params.get("ErrorCode") == "0"
    assert params.get("ErrorMsg") == "SUCCESS"
    assert "dsList" in datasets
    rows = datasets["dsList"]
    assert len(rows) == 2
    assert rows[0]["EQP_ID"] == "EQP001"
    assert rows[1]["EQP_ID"] == "EQP002"


@pytest.mark.contract
def test_nexacro_xml_codec_serialization() -> None:
    xml_str = serialize_xml(
        parameters={"SITE_CD": "SITE_TEST"},
        datasets={"dsCond": [{"SITE_CD": "SITE_TEST", "USE_YN": "Y"}]},
    )
    assert 'xmlns="http://www.nexacroplatform.com/platform/dataset"' in xml_str
    assert '<Parameter id="SITE_CD" type="string">SITE_TEST</Parameter>' in xml_str
    assert '<Col id="SITE_CD">SITE_TEST</Col>' in xml_str

    # Roundtrip test
    params, datasets = deserialize_xml(xml_str)
    assert params.get("SITE_CD") == "SITE_TEST"
    assert datasets["dsCond"][0]["USE_YN"] == "Y"


@pytest.mark.contract
@pytest.mark.asyncio
@respx.mock
async def test_nexacro_connector_login_and_query() -> None:
    base_url = "https://ems.company.local"
    login_xml = (FIXTURES_DIR / "nexacro_login_response.xml").read_text(encoding="utf-8")
    list_xml = (FIXTURES_DIR / "nexacro_list_response.xml").read_text(encoding="utf-8")

    # Mock login endpoint
    respx.post(f"{base_url}/login.do").respond(
        status_code=200,
        text=login_xml,
        headers={"Set-Cookie": "JSESSIONID=SESS_12345; Path=/; HttpOnly"},
    )

    # Mock query endpoint
    respx.post(f"{base_url}/eqp/selectEqpList.do").respond(
        status_code=200,
        text=list_xml,
    )

    connector = NexacroConnector(
        name="ems",
        base_url=base_url,
        format="xml",
        allowed_services=["/eqp/selectEqpList.do"],
        auth={
            "login_url": "/login.do",
            "username": "ops_user",
            "password": "secret_password",
            "session_ttl": "20m",
        },
    )

    result = await connector.call(
        "/eqp/selectEqpList.do",
        params={"in_datasets": {"dsCond": [{"SITE_CD": "SITE_HANOI"}]}},
    )

    assert result.ok is True
    assert "dsList" in result.data
    assert len(result.data["dsList"]) == 2
    assert connector.session.session_id == "SESS_ABC123XYZ"

    await connector.close()


@pytest.mark.contract
@pytest.mark.asyncio
@respx.mock
async def test_nexacro_in_body_error_detection() -> None:
    base_url = "https://ems.company.local"
    login_xml = (FIXTURES_DIR / "nexacro_login_response.xml").read_text(encoding="utf-8")
    error_xml = (FIXTURES_DIR / "nexacro_error_response.xml").read_text(encoding="utf-8")

    respx.post(f"{base_url}/login.do").respond(status_code=200, text=login_xml)
    # EMS returns HTTP 200 with ErrorCode = -100 in body
    respx.post(f"{base_url}/eqp/selectEqpList.do").respond(status_code=200, text=error_xml)

    connector = NexacroConnector(
        name="ems",
        base_url=base_url,
        allowed_services=["/eqp/selectEqpList.do"],
        auth={"username": "ops_user", "password": "pwd"},
    )

    result = await connector.call("/eqp/selectEqpList.do", params={})

    assert result.ok is False
    assert result.error is not None
    assert result.error.kind == "business"
    assert result.error.code == "-100"
    assert "Database connection failure" in result.error.message

    await connector.close()


@pytest.mark.contract
@pytest.mark.asyncio
@respx.mock
async def test_nexacro_auto_relogin_on_session_expiry() -> None:
    base_url = "https://ems.company.local"
    login_xml = (FIXTURES_DIR / "nexacro_login_response.xml").read_text(encoding="utf-8")
    expired_xml = (FIXTURES_DIR / "nexacro_session_expired_response.xml").read_text(encoding="utf-8")
    list_xml = (FIXTURES_DIR / "nexacro_list_response.xml").read_text(encoding="utf-8")

    # Login route
    respx.post(f"{base_url}/login.do").respond(status_code=200, text=login_xml)

    # First query call returns session expired (-9999), second query call returns success
    query_route = respx.post(f"{base_url}/eqp/selectEqpList.do")
    query_route.side_effect = [
        httpx.Response(200, text=expired_xml),
        httpx.Response(200, text=list_xml),
    ]

    connector = NexacroConnector(
        name="ems",
        base_url=base_url,
        allowed_services=["/eqp/selectEqpList.do"],
        auth={"username": "ops_user", "password": "pwd"},
    )

    # First call will auto re-login once and succeed on retry
    result = await connector.call("/eqp/selectEqpList.do", params={})

    assert result.ok is True
    assert "dsList" in result.data
    assert len(result.data["dsList"]) == 2

    await connector.close()


@pytest.mark.contract
@pytest.mark.asyncio
async def test_nexacro_enforces_allowed_services_whitelist() -> None:
    connector = NexacroConnector(
        name="ems",
        base_url="https://ems.company.local",
        allowed_services=["/eqp/selectEqpList.do"],
    )

    # Calling unlisted service (e.g. dangerous delete) must be rejected immediately
    result = await connector.call("/eqp/deleteEqp.do", params={})

    assert result.ok is False
    assert result.error is not None
    assert result.error.kind == "validation"
    assert result.error.code == "FORBIDDEN_OPERATION"
    assert "not in allowed_services" in result.error.message

    await connector.close()
