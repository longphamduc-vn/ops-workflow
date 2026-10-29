"""Unit tests for Milestone M6: Triggers, Signed Outbound Webhooks, and Dead-Letter Queue."""

import hashlib
import hmac
import json

import httpx
import pytest
import respx

from opsflow.core.models import StepConfig, TriggerConfig, WorkflowDefinition
from opsflow.publishers.webhooks import OutboundWebhookPublisher
from opsflow.triggers.cron import CronTriggerManager


@pytest.mark.asyncio
@respx.mock
async def test_outbound_webhook_delivery_signed_success() -> None:
    target_url = "https://external.app/webhook"
    secret = "my_shared_secret"

    received_headers: dict[str, str] = {}

    def mock_webhook_receiver(request: httpx.Request) -> httpx.Response:
        nonlocal received_headers
        received_headers = dict(request.headers)
        return httpx.Response(200, json={"received": True})

    respx.post(target_url).mock(side_effect=mock_webhook_receiver)

    publisher = OutboundWebhookPublisher()
    event = {
        "id": "evt_01H12345",
        "type": "equipment.status.updated",
        "workflow": "equipment-status-lookup",
        "data": {"status": "fault"},
    }
    subscription = {
        "id": "sub_01",
        "target_url": target_url,
        "secret": secret,
    }

    success = await publisher.deliver(event, subscription, max_attempts=2)
    assert success is True
    assert len(publisher.dead_letter_queue) == 0

    # Verify signature
    assert "x-signature" in received_headers
    payload_bytes = json.dumps(event, default=str).encode("utf-8")
    expected_sig = hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()
    assert received_headers["x-signature"] == expected_sig


@pytest.mark.asyncio
@respx.mock
async def test_outbound_webhook_retries_and_dead_letter_queue() -> None:
    target_url = "https://unreliable.app/webhook"
    respx.post(target_url).respond(status_code=500, text="Internal Server Error")

    publisher = OutboundWebhookPublisher()
    event = {
        "id": "evt_failed",
        "type": "run.failed",
        "data": {"error": "Timeout"},
    }
    subscription = {
        "id": "sub_fail",
        "target_url": target_url,
        "secret": "test_secret",
    }

    # Should retry up to 3 attempts, then add to Dead-Letter Queue
    success = await publisher.deliver(event, subscription, max_attempts=3, base_delay_sec=0.01)

    assert success is False
    assert subscription.get("degraded") is True
    assert len(publisher.dead_letter_queue) == 1

    dlq_item = publisher.dead_letter_queue[0]
    assert dlq_item["subscription_id"] == "sub_fail"
    assert dlq_item["attempts"] == 3
    assert "500" in dlq_item["last_error"]
    assert dlq_item["event"]["id"] == "evt_failed"


def test_cron_trigger_manager_scheduling() -> None:
    manager = CronTriggerManager()

    cron_wf = WorkflowDefinition(
        version="1.0",
        name="cron-wf",
        trigger=TriggerConfig(type="cron", cron="*/15 * * * *", timezone="Asia/Ho_Chi_Minh"),
        steps=[StepConfig(id="s1", type="call")],
    )

    scheduled = manager.schedule_workflow(cron_wf, run_callback=lambda wf: None)
    assert scheduled is True
    assert "cron_cron-wf" in manager.get_scheduled_job_ids()

    # Manual workflow should not be scheduled
    manual_wf = WorkflowDefinition(
        version="1.0",
        name="manual-wf",
        trigger=TriggerConfig(type="manual"),
        steps=[StepConfig(id="s1", type="call")],
    )
    assert manager.schedule_workflow(manual_wf, run_callback=lambda wf: None) is False
