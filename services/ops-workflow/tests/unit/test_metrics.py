"""Unit tests for Prometheus metrics collection and exposition."""

import httpx
import pytest

from opsflow.api.main import app
from opsflow.metrics import MetricsCollector


def test_metrics_collector_counters_and_summaries() -> None:
    collector = MetricsCollector()
    collector.record_run("sample-wf", "success", duration_sec=1.25)
    collector.record_step("sample-wf", "step_01", "success", duration_sec=0.15)
    collector.record_step("sample-wf", "step_02", "failed", duration_sec=0.05, error_kind="timeout")
    collector.record_connector_call("http", "200", latency_sec=0.12)
    collector.record_session_relogin("nexacro")

    rendered = collector.render_prometheus_text()

    assert "# HELP opsflow_runs_total" in rendered
    assert "# TYPE opsflow_runs_total counter" in rendered
    assert 'opsflow_runs_total{status="success",workflow="sample-wf"} 1.0' in rendered
    assert 'opsflow_run_duration_seconds_sum{workflow="sample-wf"} 1.25' in rendered
    assert 'opsflow_session_relogins_total{connector="nexacro"} 1.0' in rendered
    assert (
        'opsflow_failures_total{kind="timeout",step_id="step_02",workflow="sample-wf"} 1.0'
        in rendered
    )


@pytest.mark.asyncio
async def test_metrics_api_endpoint() -> None:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/metrics")
        assert res.status_code == 200
        assert "text/plain" in res.headers["content-type"]
        assert "opsflow_runs_total" in res.text
