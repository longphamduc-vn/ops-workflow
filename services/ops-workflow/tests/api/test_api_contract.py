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
    eqp_wf = next((w for w in data if w["name"] == "equipment-status-lookup"), None)
    assert eqp_wf is not None
    assert "organization_id" in eqp_wf["inputs"]

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


@pytest.mark.asyncio
async def test_list_runs_pagination_and_filters(api_client: httpx.AsyncClient) -> None:
    headers = {"X-API-Key": "test_api_key"}
    assert workflows.APP_REPO is not None

    # Seed test runs
    await workflows.APP_REPO.create_run("run_test_01", "equipment-status-lookup", {"eq": "1"})
    await workflows.APP_REPO.update_run_status("run_test_01", "success")

    await workflows.APP_REPO.create_run("run_test_02", "equipment-status-lookup", {"eq": "2"})
    await workflows.APP_REPO.update_run_status("run_test_02", "failed")

    await workflows.APP_REPO.create_run("run_test_03", "other-workflow", {"eq": "3"})
    await workflows.APP_REPO.update_run_status("run_test_03", "success")

    # 1. Query all
    res = await api_client.get("/api/v1/runs", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 3
    assert len(data["items"]) >= 3

    # 2. Filter by status
    res_failed = await api_client.get("/api/v1/runs?status=failed", headers=headers)
    assert res_failed.status_code == 200
    data_failed = res_failed.json()
    assert data_failed["total"] >= 1
    assert all(r["status"] == "failed" for r in data_failed["items"])

    # 3. Filter by workflow_name
    res_wf = await api_client.get(
        "/api/v1/runs?workflow_name=equipment-status-lookup", headers=headers
    )
    assert res_wf.status_code == 200
    data_wf = res_wf.json()
    assert all(r["workflow_name"] == "equipment-status-lookup" for r in data_wf["items"])


@pytest.mark.asyncio
async def test_replay_run_endpoint(api_client: httpx.AsyncClient) -> None:
    headers = {"X-API-Key": "test_api_key"}
    assert workflows.APP_REPO is not None

    # Seed a run
    seed_id = "run_to_replay_01"
    await workflows.APP_REPO.create_run(seed_id, "equipment-status-lookup", {"wip_entity_id": "999"})
    await workflows.APP_REPO.update_run_status(seed_id, "failed")

    # Trigger replay
    res = await api_client.post(
        f"/api/v1/runs/{seed_id}/replay",
        headers=headers,
        json={"resume_from_failed": True, "new_run": False},
    )
    assert res.status_code == 202
    data = res.json()
    assert data["run_id"] == seed_id
    assert data["workflow_name"] == "equipment-status-lookup"


@pytest.mark.asyncio
async def test_delete_run_logs_endpoint(api_client: httpx.AsyncClient) -> None:
    headers = {"X-API-Key": "test_api_key"}
    from opsflow.core.logger import get_run_log_path

    run_id = "run_log_delete_test"
    log_file = get_run_log_path(run_id)
    log_file.parent.mkdir(parents=True, exist_ok=True)
    log_file.write_text("Test log line to delete\n", encoding="utf-8")
    assert log_file.exists()

    # Delete log via API
    res = await api_client.delete(f"/api/v1/runs/{run_id}/logs", headers=headers)
    assert res.status_code == 200
    assert res.json()["status"] == "cleared"
    assert not log_file.exists()


@pytest.mark.asyncio
async def test_delete_run_and_delete_all_runs_endpoints(api_client: httpx.AsyncClient) -> None:
    headers = {"X-API-Key": "test_api_key"}

    # 1. Trigger a run
    res = await api_client.post(
        "/api/v1/workflows/equipment-status-lookup/runs",
        headers=headers,
        json={"inputs": {"wip_entity_id": "999"}},
    )
    assert res.status_code == 202
    run_id = res.json()["run_id"]

    # 2. Delete single run
    del_res = await api_client.delete(f"/api/v1/runs/{run_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"

    # Verify run is gone
    get_res = await api_client.get(f"/api/v1/runs/{run_id}", headers=headers)
    assert get_res.status_code == 404

    # 3. Trigger another run and test delete all runs
    res2 = await api_client.post(
        "/api/v1/workflows/equipment-status-lookup/runs",
        headers=headers,
        json={"inputs": {"wip_entity_id": "888"}},
    )
    assert res2.status_code == 202

    del_all_res = await api_client.delete("/api/v1/runs", headers=headers)
    assert del_all_res.status_code == 200
    assert del_all_res.json()["status"] == "cleared"
    assert del_all_res.json()["deleted_count"] >= 1
