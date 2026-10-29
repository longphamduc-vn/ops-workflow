"""Opsflow Python SDK client for external service integration."""

from typing import Any

import httpx


class OpsflowClient:
    """Async client for interacting with the Opsflow REST API."""

    def __init__(
        self,
        base_url: str = "http://localhost:8000",
        api_key: str | None = None,
        timeout: float = 30.0,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout
        self._client: httpx.AsyncClient | None = None

    def _get_headers(self, idempotency_key: str | None = None) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        if idempotency_key:
            headers["Idempotency-Key"] = idempotency_key
        return headers

    async def __aenter__(self) -> "OpsflowClient":
        self._client = httpx.AsyncClient(base_url=self.base_url, timeout=self.timeout)
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        if self._client:
            await self._client.aclose()
            self._client = None

    def _ensure_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(base_url=self.base_url, timeout=self.timeout)
        return self._client

    async def close(self) -> None:
        """Close the underlying HTTP client session."""
        if self._client:
            await self._client.aclose()
            self._client = None

    async def trigger_run(
        self,
        workflow_name: str,
        inputs: dict[str, Any] | None = None,
        idempotency_key: str | None = None,
        wait: int | None = None,
    ) -> dict[str, Any]:
        """Trigger a workflow run, optionally waiting synchronously for completion."""
        client = self._ensure_client()
        params = {}
        if wait is not None:
            params["wait"] = str(wait)

        payload = {"inputs": inputs or {}}
        headers = self._get_headers(idempotency_key=idempotency_key)

        res = await client.post(
            f"/api/v1/workflows/{workflow_name}/runs",
            json=payload,
            params=params,
            headers=headers,
        )
        res.raise_for_status()
        return res.json()  # type: ignore[no-any-return]

    async def get_run(self, run_id: str) -> dict[str, Any]:
        """Fetch details and status of an active or completed run."""
        client = self._ensure_client()
        res = await client.get(f"/api/v1/runs/{run_id}", headers=self._get_headers())
        res.raise_for_status()
        return res.json()  # type: ignore[no-any-return]

    async def query_dataset(
        self,
        dataset_name: str,
        limit: int = 50,
        cursor: str | None = None,
    ) -> dict[str, Any]:
        """Query published dataset items with cursor-based pagination."""
        client = self._ensure_client()
        params: dict[str, str] = {"limit": str(limit)}
        if cursor:
            params["cursor"] = cursor

        res = await client.get(
            f"/api/v1/datasets/{dataset_name}",
            params=params,
            headers=self._get_headers(),
        )
        res.raise_for_status()
        return res.json()  # type: ignore[no-any-return]

    async def get_dataset_schema(self, dataset_name: str) -> dict[str, Any]:
        """Get the schema and column types for a published dataset."""
        client = self._ensure_client()
        res = await client.get(
            f"/api/v1/datasets/{dataset_name}/schema",
            headers=self._get_headers(),
        )
        res.raise_for_status()
        return res.json()  # type: ignore[no-any-return]

    async def register_webhook(
        self,
        target_url: str,
        secret: str,
        events: list[str] | None = None,
    ) -> dict[str, Any]:
        """Register an outbound webhook callback."""
        client = self._ensure_client()
        payload = {
            "target_url": target_url,
            "secret": secret,
            "events": events or ["*"],
        }
        res = await client.post(
            "/api/v1/webhooks/subscriptions",
            json=payload,
            headers=self._get_headers(),
        )
        res.raise_for_status()
        return res.json()  # type: ignore[no-any-return]
