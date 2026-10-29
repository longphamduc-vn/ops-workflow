"""Outbound webhook publisher: HMAC-SHA256 signature, retry backoff, and dead-letter queue."""

import asyncio
import hashlib
import hmac
import json
from datetime import UTC, datetime
from typing import Any

import httpx


class OutboundWebhookPublisher:
    """Dispatches event envelopes to subscribers with signature verification and dead-letter handling."""

    def __init__(self, timeout: float = 10.0) -> None:
        self.timeout = timeout
        self.dead_letter_queue: list[dict[str, Any]] = []

    def sign_payload(self, secret: str, payload_bytes: bytes) -> str:
        """Calculate HMAC-SHA256 signature for webhook payload."""
        return hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()

    async def deliver(
        self,
        event: dict[str, Any],
        subscription: dict[str, Any],
        max_attempts: int = 5,
        base_delay_sec: float = 0.05,
    ) -> bool:
        """Deliver event payload with signature and exponential retry.

        If all attempts fail, stores in dead_letter_queue and returns False.
        """
        target_url = subscription["target_url"]
        secret = subscription.get("secret", "default_secret")

        payload_json = json.dumps(event, default=str)
        payload_bytes = payload_json.encode("utf-8")
        signature = self.sign_payload(secret, payload_bytes)

        headers = {
            "Content-Type": "application/json",
            "X-Signature": signature,
            "X-Event-Id": event.get("id", ""),
            "X-Event-Type": event.get("type", ""),
            "User-Agent": "opsflow-webhook-dispatcher/0.1.0",
        }

        attempt = 0
        last_error = ""

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            while attempt < max_attempts:
                attempt += 1
                try:
                    response = await client.post(target_url, content=payload_bytes, headers=headers)
                    if response.status_code < 300:
                        return True
                    last_error = f"HTTP {response.status_code}: {response.text[:100]}"
                except Exception as exc:
                    last_error = str(exc)

                if attempt < max_attempts:
                    await asyncio.sleep(base_delay_sec * (2 ** (attempt - 1)))

        # All attempts exhausted: append to Dead-Letter Queue
        dlq_entry = {
            "event": event,
            "subscription_id": subscription.get("id"),
            "target_url": target_url,
            "attempts": attempt,
            "last_error": last_error,
            "failed_at": datetime.now(UTC).isoformat(),
        }
        self.dead_letter_queue.append(dlq_entry)
        subscription["degraded"] = True
        return False
