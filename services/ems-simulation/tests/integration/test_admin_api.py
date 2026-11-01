"""Integration tests for Admin and Management endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_admin_list_endpoints(client: AsyncClient):
    response = await client.get("/admin/endpoints")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 14
    assert len(data["endpoints"]) >= 14


@pytest.mark.asyncio
async def test_admin_endpoint_detail(client: AsyncClient):
    response = await client.get("/admin/endpoints/spare_parts.stock_status.search")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "spare_parts.stock_status.search"
    assert data["domain"] == "spare_parts"


@pytest.mark.asyncio
async def test_admin_list_datasets(client: AsyncClient):
    response = await client.get("/admin/datasets")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 12


@pytest.mark.asyncio
async def test_admin_logs_recorded(client: AsyncClient):
    # Make a call to generate a log entry using a data retrieval endpoint
    await client.post(
        "/emsspareparts/sp101/sp110Nav/RetStockStatusList.lgdn",
        content="<Root/>",
        headers={"Content-Type": "application/xml"},
    )

    response = await client.get("/admin/logs")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 1
    assert data["logs"][0]["path"] == "/emsspareparts/sp101/sp110Nav/RetStockStatusList.lgdn"
