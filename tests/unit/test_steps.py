"""Unit tests for standard workflow step implementations."""

import pytest

from opsflow.core.context import Context
from opsflow.core.models import Result
from opsflow.steps.call import CallStep
from opsflow.steps.db_upsert import DbUpsertStep, NotifyStep
from opsflow.steps.join import JoinStep
from opsflow.steps.transform import TransformStep


class MockConnector:
    def __init__(self) -> None:
        self.last_op = ""
        self.last_params: dict = {}

    async def call(self, operation: str, params: dict) -> Result:
        self.last_op = operation
        self.last_params = params
        return Result(ok=True, data={"echo": operation, "received": params})


@pytest.mark.asyncio
async def test_call_step() -> None:
    mock_conn = MockConnector()
    ctx = Context(run_id="run_call", connectors={"test_conn": mock_conn})

    step = CallStep()
    config = {
        "connector": "test_conn",
        "operation": "/api/getData",
        "params": {"site": "SITE_A"},
    }

    res = await step.execute(config, ctx)
    assert res.ok is True
    assert mock_conn.last_op == "/api/getData"
    assert mock_conn.last_params["site"] == "SITE_A"


@pytest.mark.asyncio
async def test_transform_step_jmespath_and_mappings() -> None:
    step = TransformStep()
    ctx = Context(run_id="run_trans")

    input_data = [
        {"dsDetail": [{"EQP_ID": "E1", "STATUS_CD": "01"}]},
        {"dsDetail": [{"EQP_ID": "E2", "STATUS_CD": "99"}]},
    ]

    config = {
        "engine": "jmespath",
        "input": input_data,
        "expression": "[].{id: dsDetail[0].EQP_ID, status: dsDetail[0].STATUS_CD}",
        "mappings": {
            "status": {"01": "running", "99": "fault"},
        },
    }

    res = await step.execute(config, ctx)
    assert res.ok is True
    assert res.data == [
        {"id": "E1", "status": "running"},
        {"id": "E2", "status": "fault"},
    ]


@pytest.mark.asyncio
async def test_join_step() -> None:
    step = JoinStep()
    ctx = Context(run_id="run_join")

    left = [{"id": 1, "name": "Pump"}, {"id": 2, "name": "Valve"}]
    right = [{"id": 1, "status": "OK"}, {"id": 3, "status": "Warn"}]

    # Inner join
    res_inner = await step.execute({"left": left, "right": right, "on": "id", "how": "inner"}, ctx)
    assert res_inner.ok is True
    assert res_inner.data == [{"id": 1, "name": "Pump", "status": "OK"}]

    # Left join
    res_left = await step.execute({"left": left, "right": right, "on": "id", "how": "left"}, ctx)
    assert res_left.ok is True
    assert len(res_left.data) == 2


@pytest.mark.asyncio
async def test_db_upsert_and_notify_steps() -> None:
    ctx = Context(run_id="run_steps")

    upsert_step = DbUpsertStep()
    upsert_res = await upsert_step.execute(
        {"table": "equipment", "key": ["id"], "rows": [{"id": "E1"}]},
        ctx,
    )
    assert upsert_res.ok is True
    assert upsert_res.data["upserted"] == 1

    notify_step = NotifyStep()
    notify_res = await notify_step.execute(
        {"channel": "#ops", "message": "Fault alert!"},
        ctx,
    )
    assert notify_res.ok is True
    assert notify_res.data["delivered"] is True
