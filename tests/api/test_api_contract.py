"""API contract and integration tests for Milestone M5."""

from pathlib import Path

import httpx
import pytest
from httpx import ASGITransport

from opsflow.api.main import create_app
from opsflow.api.routes import workflows
from opsflow.core.parser import load_workflow_from_file
from opsflow.read_models.storage import ReadModelStorage
from opsflow.store.repository import RunRepository


@pytest.fixture
async def api_client(tmp_path: Path) -> httpx.AsyncClient:
    """Fixture providing initialized test client with temporary SQLite storage."""
    db_path = tmp_path / "api_test.db"
    repo = RunRepository(f"sqlite+aiosqlite:///{db_path}")
    await repo.init_db()

    read_models = ReadModelStorage(repo)
    await read_models.init_tables()

    workflows.APP_REPO = repo
    workflows.APP_READ_MODELS = read_models
    workflows.IDEMPOTENCY_CACHE.clear()

    # Pre-register test workflow
    golden_path = Path("workflows/equipment-status-lookup.yml")
    if golden_path.exists():
        wf = load_workflow_from_file(golden_path)
        workflows.WORKFLOW_REGISTRY[wf.name] = wf

    app = create_app()

    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client

    await repo.engine.dispose()


@pytest.mark.asyncio
async def test_health_and_readiness_unauthenticated(api_client: httpx.AsyncClient) -> None:
    res_health = await api_client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json() == {"status": "ok"}

    res_ready = await api_client.get("/ready")
    assert res_ready.status_code == 200
    assert res_ready.json() == {"status": "ready"}


@pytest.mark.asyncio
async def test_authentication_required(api_client: httpx.AsyncClient) -> None:
    # Missing API key -> 401 Unauthorized
    res = await api_client.get("/api/v1/workflows")
    assert res.status_code == 401
    assert res.headers.get("content-type") == "application/problem+json"
    body = res.json()
    assert body["code"] == "UNAUTHORIZED"
    assert "Missing API Key" in body["detail"]

    # Invalid API key -> 401 Unauthorized
    res_bad = await api_client.get("/api/v1/workflows", headers={"X-API-Key": "invalid_key"})
    assert res_bad.status_code == 401


@pytest.mark.asyncio
async def test_list_and_get_workflows(api_client: httpx.AsyncClient) -> None:
    headers = {"X-API-Key": "test_api_key"}

    # List workflows
    res = await api_client.get("/api/v1/workflows", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert data[0]["name"] == "equipment-status-lookup"
    assert "site_code" in data[0]["inputs"]

    # Get single workflow metadata
    res_meta = await api_client.get("/api/v1/workflows/equipment-status-lookup", headers=headers)
    assert res_meta.status_code == 200
    meta = res_meta.json()
    assert meta["name"] == "equipment-status-lookup"
    assert meta["publish_dataset"] == "equipment_status"

    # Non-existent workflow -> 404
    res_404 = await api_client.get("/api/v1/workflows/unknown_wf", headers=headers)
    assert res_404.status_code == 404
    assert res_404.headers.get("content-type") == "application/problem+json"


@pytest.mark.asyncio
async def test_start_run_and_idempotency_key(api_client: httpx.AsyncClient) -> None:
    headers = {
        "X-API-Key": "test_api_key",
        "Idempotency-Key": "client-uuid-12345",
    }
    payload = {"inputs": {"site_code": "SITE_HN"}}

    # First call: triggers run
    res1 = await api_client.post(
        "/api/v1/workflows/equipment-status-lookup/runs",
        headers=headers,
        json=payload,
    )
    assert res1.status_code == 202
    data1 = res1.json()
    assert "run_id" in data1
    run_id_first = data1["run_id"]

    # Second call with same Idempotency-Key: must return the exact same run_id!
    res2 = await api_client.post(
        "/api/v1/workflows/equipment-status-lookup/runs",
        headers=headers,
        json=payload,
    )
    assert res2.status_code == 202
    data2 = res2.json()
    assert data2["run_id"] == run_id_first, "Idempotency key did not return original run!"


@pytest.mark.asyncio
async def test_poll_run_and_query_published_dataset(api_client: httpx.AsyncClient) -> None:
    headers = {"X-API-Key": "test_api_key"}

    # Seed read model records to test query
    assert workflows.APP_READ_MODELS is not None
    await workflows.APP_READ_MODELS.save_published_dataset(
        dataset="equipment_status",
        source_run_id="run_seeded",
        records=[
            {"equipment_id": "EQP01", "name": "Motor", "status": "running"},
            {"equipment_id": "EQP02", "name": "Pump", "status": "fault"},
        ],
    )

    # Query dataset
    res_ds = await api_client.get("/api/v1/datasets/equipment_status?limit=10", headers=headers)
    assert res_ds.status_code == 200
    ds_data = res_ds.json()
    assert ds_data["dataset"] == "equipment_status"
    assert ds_data["count"] == 2
    assert ds_data["items"][0]["equipment_id"] == "EQP01"

    # Query schema
    res_schema = await api_client.get("/api/v1/datasets/equipment_status/schema", headers=headers)
    assert res_schema.status_code == 200
    schema_data = res_schema.json()
    assert "equipment_id" in schema_data["columns"]


@pytest.mark.asyncio
async def test_webhook_subscription_registration(api_client: httpx.AsyncClient) -> None:
    headers = {"X-API-Key": "test_api_key"}
    sub_payload = {
        "target_url": "https://consumer.app/webhook",
        "event_types": ["equipment.status.updated"],
        "secret": "webhook_secret_key",
    }
    res = await api_client.post(
        "/api/v1/webhooks/subscriptions",
        headers=headers,
        json=sub_payload,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["target_url"] == "https://consumer.app/webhook"
    assert "sub_" in data["id"]
