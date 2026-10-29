"""Unit tests for Opsflow Python SDK client."""

import pytest
import respx

from opsflow.sdk.client import OpsflowClient


@pytest.mark.asyncio
@respx.mock
async def test_sdk_trigger_run() -> None:
    respx.post("http://localhost:8000/api/v1/workflows/test-wf/runs").respond(
        status_code=202,
        json={"run_id": "run_sdk_123", "status": "running"},
    )

    async with OpsflowClient(base_url="http://localhost:8000", api_key="secret_key") as client:
        res = await client.trigger_run("test-wf", inputs={"order_id": 99})
        assert res["run_id"] == "run_sdk_123"
        assert res["status"] == "running"


@pytest.mark.asyncio
@respx.mock
async def test_sdk_get_run_and_query_dataset() -> None:
    respx.get("http://localhost:8000/api/v1/runs/run_sdk_123").respond(
        status_code=200,
        json={"run_id": "run_sdk_123", "status": "success", "outputs": {"result": True}},
    )
    respx.get("http://localhost:8000/api/v1/datasets/inventory").respond(
        status_code=200,
        json={"dataset": "inventory", "count": 1, "items": [{"item_id": "ITM01"}]},
    )

    client = OpsflowClient(base_url="http://localhost:8000")
    try:
        run_data = await client.get_run("run_sdk_123")
        assert run_data["status"] == "success"

        ds_data = await client.query_dataset("inventory", limit=5)
        assert ds_data["dataset"] == "inventory"
        assert len(ds_data["items"]) == 1
    finally:
        await client.close()
