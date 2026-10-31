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


@router.get(
    "/subscriptions",
    response_model=list[WebhookSubscriptionResponse],
    summary="List active webhook subscriptions",
)
async def list_webhook_subscriptions(
    _: Annotated[AuthenticatedConsumer, Depends(require_scope("workflows:read"))],
) -> list[WebhookSubscriptionResponse]:
    """List all registered webhook subscriptions."""
    return [
        WebhookSubscriptionResponse(
            id=str(r["id"]),
            target_url=str(r["target_url"]),
            event_types=list(r["event_types"]),
            created_at=str(r["created_at"]),
        )
        for r in WEBHOOK_SUBSCRIPTIONS
    ]


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
