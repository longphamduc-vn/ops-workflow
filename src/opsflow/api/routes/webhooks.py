"""Webhooks subscription API routes."""

import uuid
from datetime import UTC, datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, status

from opsflow.api.auth import AuthenticatedConsumer, require_scope
from opsflow.api.schemas import WebhookSubscriptionRequest, WebhookSubscriptionResponse

router = APIRouter(prefix="/api/v1/webhooks", tags=["Webhooks"])

# In-memory subscription list for demo/dispatch
WEBHOOK_SUBSCRIPTIONS: list[dict[str, Any]] = []


@router.post(
    "/subscriptions",
    status_code=status.HTTP_201_CREATED,
    response_model=WebhookSubscriptionResponse,
    summary="Register a webhook subscription",
)
async def create_webhook_subscription(
    payload: WebhookSubscriptionRequest,
    consumer: Annotated[AuthenticatedConsumer, Depends(require_scope("workflows:read"))],
) -> WebhookSubscriptionResponse:
    """Register a consumer endpoint to receive signed event notifications."""
    sub_id = f"sub_{uuid.uuid4().hex[:16]}"
    record = {
        "id": sub_id,
        "consumer_id": consumer.consumer_id,
        "target_url": payload.target_url,
        "event_types": payload.event_types,
        "secret": payload.secret or uuid.uuid4().hex,
        "created_at": datetime.now(UTC).isoformat(),
    }
    WEBHOOK_SUBSCRIPTIONS.append(record)

    return WebhookSubscriptionResponse(
        id=str(record["id"]),
        target_url=str(record["target_url"]),
        event_types=list(payload.event_types),
        created_at=str(record["created_at"]),
    )
