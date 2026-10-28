"""Generic HTTP connector using httpx."""

import asyncio
import time
from typing import Any, Literal

import httpx

from opsflow.connectors.base import Connector
from opsflow.connectors.registry import register_connector
from opsflow.core.models import ErrorInfo, Result

ErrorKind = Literal["timeout", "network", "auth", "business", "validation", "internal"]


@register_connector("http")
class HttpConnector(Connector):
    """Async HTTP connector supporting rate-limiting and normalized results."""

    def __init__(
        self,
        name: str,
        base_url: str = "",
        auth: dict[str, Any] | None = None,
        limits: dict[str, Any] | None = None,
        timeout: float = 30.0,
        **kwargs: Any,
    ) -> None:
        self.name = name
        self.base_url = base_url.rstrip("/")
        self.auth_config = auth or {}
        self.limits = limits or {}
        self.timeout = timeout

        self.min_interval_sec = 0.0
        min_int_val = self.limits.get("min_interval")
        if isinstance(min_int_val, str) and min_int_val.endswith("ms"):
            self.min_interval_sec = float(min_int_val[:-2]) / 1000.0

        max_concurrent = int(self.limits.get("max_concurrent", 10))
        self._semaphore = asyncio.Semaphore(max_concurrent)
        self._last_call_time = 0.0

        headers = {"User-Agent": "opsflow/0.1.0"}
        if self.auth_config.get("type") == "bearer":
            token = self.auth_config.get("token")
            if token:
                headers["Authorization"] = f"Bearer {token}"

        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers=headers,
            timeout=self.timeout,
        )

    async def authenticate(self) -> None:
        # Generic HTTP connector handles token headers directly
        pass

    async def call(self, operation: str, params: dict[str, Any]) -> Result:
        async with self._semaphore:
            # Enforce min_interval rate limit
            now = time.monotonic()
            elapsed = now - self._last_call_time
            if elapsed < self.min_interval_sec:
                await asyncio.sleep(self.min_interval_sec - elapsed)

            method = params.get("method", "POST" if params.get("json") or params.get("in_datasets") else "GET").upper()
            url = operation if operation.startswith("http") else f"{self.base_url}/{operation.lstrip('/')}"
            json_body = params.get("json") or params.get("in_datasets")
            query_params = params.get("query_params")

            start_t = time.monotonic()
            try:
                response = await self.client.request(
                    method=method,
                    url=url,
                    json=json_body,
                    params=query_params,
                )
                self._last_call_time = time.monotonic()
                latency_ms = int((self._last_call_time - start_t) * 1000)

                # Check HTTP error status
                if response.status_code >= 400:
                    is_retryable = response.status_code in (408, 429, 500, 502, 503, 504)
                    kind: ErrorKind = "network" if response.status_code >= 500 else "business"
                    if response.status_code in (401, 403):
                        kind = "auth"
                    return Result(
                        ok=False,
                        error=ErrorInfo(
                            kind=kind,
                            code=str(response.status_code),
                            message=f"HTTP {response.status_code}: {response.text[:200]}",
                            retryable=is_retryable,
                        ),
                        meta={"latency_ms": latency_ms, "status_code": response.status_code},
                    )

                # Parse JSON or text
                try:
                    data = response.json()
                except Exception:
                    data = {"text": response.text}

                return Result(
                    ok=True,
                    data=data,
                    meta={"latency_ms": latency_ms, "status_code": response.status_code},
                )

            except httpx.TimeoutException as exc:
                return Result(
                    ok=False,
                    error=ErrorInfo(
                        kind="timeout",
                        code="TIMEOUT",
                        message=f"HTTP request timed out: {exc}",
                        retryable=True,
                    ),
                )
            except httpx.RequestError as exc:
                return Result(
                    ok=False,
                    error=ErrorInfo(
                        kind="network",
                        code="NETWORK_ERROR",
                        message=f"HTTP network error: {exc}",
                        retryable=True,
                    ),
                )

    async def health_check(self) -> bool:
        try:
            res = await self.client.get("/health")
            return res.status_code < 400
        except Exception:
            return False

    async def close(self) -> None:
        await self.client.aclose()
