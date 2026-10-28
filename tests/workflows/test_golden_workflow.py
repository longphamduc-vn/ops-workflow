"""End-to-end workflow execution test for the Golden Example against mocked HTTP."""

import json
from pathlib import Path

import httpx
import pytest
import respx

from opsflow.connectors.http import HttpConnector
from opsflow.core.parser import load_workflow_from_file
from opsflow.core.scheduler import WorkflowScheduler


@pytest.mark.asyncio
@respx.mock
async def test_golden_workflow_end_to_end_with_respx() -> None:
    # 1. Mock external HTTP responses
    base_url = "https://ems.company.local"

    # Mock list endpoint
    respx.post(f"{base_url}/eqp/selectEqpList.do").respond(
        status_code=200,
        json={
            "dsList": [
                {"EQP_ID": "EQP001"},
                {"EQP_ID": "EQP002"},
            ]
        },
    )

    # Dynamic mock for detail endpoint
    def detail_side_effect(request: httpx.Request) -> httpx.Response:
        try:
            body = json.loads(request.content)
            eqp_id = body.get("dsCond", [{}])[0].get("EQP_ID")
        except Exception:
            eqp_id = None

        if eqp_id == "EQP001":
            return httpx.Response(
                200,
                json={
                    "dsDetail": [
                        {
                            "EQP_ID": "EQP001",
                            "EQP_NM": "Main Pump",
                            "STATUS_CD": "01",
                            "UPD_DT": "2026-10-28 08:00:00",
                        }
                    ]
                },
            )
        elif eqp_id == "EQP002":
            return httpx.Response(
                200,
                json={
                    "dsDetail": [
                        {
                            "EQP_ID": "EQP002",
                            "EQP_NM": "Cooling Fan",
                            "STATUS_CD": "99",
                            "UPD_DT": "2026-10-28 08:05:00",
                        }
                    ]
                },
            )
        return httpx.Response(404, json={"error": f"Unknown eqp_id: {eqp_id}"})

    respx.post(f"{base_url}/eqp/selectEqpDetail.do").mock(side_effect=detail_side_effect)

    # 2. Load golden workflow definition
    golden_path = Path("workflows/equipment-status-lookup.yml")
    wf = load_workflow_from_file(golden_path)

    # 3. Instantiate HTTP connector matching the ems connector declaration
    ems_connector = HttpConnector(
        name="ems",
        base_url=base_url,
        limits={"max_concurrent": 3, "min_interval": "10ms"},
    )

    # 4. Schedule and execute workflow
    scheduler = WorkflowScheduler(
        workflow=wf,
        connectors={"ems": ems_connector},
        max_concurrency=3,
    )

    run_id, status, ctx = await scheduler.run(inputs={"site_code": "SITE_HANOI"})

    # 5. Verify assertions
    assert status == "success"

    # Verify list step outputs
    list_step_output = ctx.step_outputs.get("list_equipment")
    assert list_step_output is not None
    assert len(list_step_output.get("items", [])) == 2

    # Verify foreach step outputs
    detail_output = ctx.step_outputs.get("get_detail")
    assert detail_output is not None
    assert len(detail_output) == 2

    # Verify normalize step transformed codes to human readable statuses
    norm_output = ctx.step_outputs.get("normalize")
    assert norm_output is not None
    assert len(norm_output) == 2
    assert norm_output[0]["equipment_id"] == "EQP001"
    assert norm_output[0]["status"] == "running"
    assert norm_output[1]["equipment_id"] == "EQP002"
    assert norm_output[1]["status"] == "fault"

    # Verify db_upsert step
    assert ctx.step_statuses.get("save") == "success"

    # Verify alert_fault notify step was executed (because status == 'fault' is present)
    assert ctx.step_statuses.get("alert_fault") == "success"

    await ems_connector.close()
