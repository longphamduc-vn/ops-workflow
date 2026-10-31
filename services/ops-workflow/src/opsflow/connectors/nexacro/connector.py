"""Nexacro Platform connector supporting XML wire format, session management, and in-body error detection."""

import asyncio
import time
from typing import Any, Literal

import httpx

from opsflow.connectors.base import Connector
from opsflow.connectors.nexacro.codec_xml import deserialize_xml, serialize_xml
from opsflow.connectors.nexacro.session import NexacroSession
from opsflow.connectors.registry import register_connector
from opsflow.core.models import ErrorInfo, Result

ErrorKind = Literal["timeout", "network", "auth", "business", "validation", "internal"]


@register_connector("nexacro")
class NexacroConnector(Connector):
    """Connector for legacy Nexacro EMS applications with read-only security invariants."""

    def __init__(
        self,
        name: str,
        base_url: str = "",
        format: str = "xml",
        allowed_services: list[str] | None = None,
        auth: dict[str, Any] | None = None,
        limits: dict[str, Any] | None = None,
        timeout: float = 30.0,
        **kwargs: Any,
    ) -> None:
        self.name = name
        self.base_url = base_url.rstrip("/")
        self.format = format.lower()
        self.allowed_services = set(allowed_services or [])
        self.auth_config = auth or {}
        self.limits = limits or {}
        self.timeout = timeout

        # Concurrency & rate limiting
        max_concurrent = int(self.limits.get("max_concurrent", 3))
        self._semaphore = asyncio.Semaphore(max_concurrent)

        min_interval_val = self.limits.get("min_interval", "0ms")
        self.min_interval_sec = 0.0
        if isinstance(min_interval_val, str) and min_interval_val.endswith("ms"):
            self.min_interval_sec = float(min_interval_val[:-2]) / 1000.0

        self._last_call_time = 0.0

        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=self.timeout,
        )

        self.session = NexacroSession(
            client=self.client,
            login_url=self.auth_config.get("login_url", "/login.do"),
            username=self.auth_config.get("username", ""),
            password=self.auth_config.get("password", ""),
            session_ttl=self.auth_config.get("session_ttl", "20m"),
            format_type=self.format,
        )

    async def authenticate(self) -> None:
        """Explicitly authenticate the connector session."""
        await self.session.authenticate()
        self.client.cookies.update(self.session.cookies)

    async def call(self, operation: str, params: dict[str, Any]) -> Result:
        """Invoke an operation on the Nexacro server enforcing allow-list, rate limits, and in-body error checks."""
        # Invariant 5: allowed_services allow-list enforcement
        if operation not in self.allowed_services:
            return Result(
                ok=False,
                error=ErrorInfo(
                    kind="validation",
                    code="FORBIDDEN_OPERATION",
                    message=f"Operation '{operation}' rejected: not in allowed_services for connector '{self.name}'.",
                    retryable=False,
                ),
            )

        async with self._semaphore:
            # Automatic authentication on first call or TTL expiration
            if self.auth_config and self.session.is_expired():
                try:
                    await self.session.authenticate()
                    self.client.cookies.update(self.session.cookies)
                except Exception as exc:
                    return Result(
                        ok=False,
                        error=ErrorInfo(
                            kind="auth",
                            code="LOGIN_FAILED",
                            message=f"Session authentication failed: {exc}",
                            retryable=True,
                        ),
                    )

            # Enforce min_interval rate limit
            now = time.monotonic()
            elapsed = now - self._last_call_time
            if elapsed < self.min_interval_sec:
                await asyncio.sleep(self.min_interval_sec - elapsed)

            # Execute HTTP request with auto re-login attempt on auth error
            result = await self._send_request(operation, params)

            # Auto re-login once if in-body auth or session error is returned
            if not result.ok and result.error and result.error.kind == "auth":
                try:
                    self.session.invalidate()
                    await self.session.authenticate()
                    self.client.cookies.update(self.session.cookies)
                    result = await self._send_request(operation, params)
                except Exception:
                    pass

            return result

    async def _send_request(self, operation: str, params: dict[str, Any]) -> Result:
        """Send wire request and parse in-body Nexacro response."""
        in_datasets = params.get("in_datasets") or {}
        req_params = params.get("params") or {}

        payload = serialize_xml(parameters=req_params, datasets=in_datasets)
        url = (
            operation
            if operation.startswith("http")
            else f"{self.base_url}/{operation.lstrip('/')}"
        )

        start_t = time.monotonic()
        try:
            response = await self.client.post(
                url,
                content=payload,
                headers={"Content-Type": "text/xml; charset=UTF-8"},
            )
            self._last_call_time = time.monotonic()
            latency_ms = int((self._last_call_time - start_t) * 1000)

            # Check transport/HTTP-level error
            if response.status_code >= 400:
                is_retryable = response.status_code in (408, 429, 500, 502, 503, 504)
                http_kind: ErrorKind = "network" if response.status_code >= 500 else "business"
                if response.status_code in (401, 403):
                    http_kind = "auth"
                return Result(
                    ok=False,
                    error=ErrorInfo(
                        kind=http_kind,
                        code=str(response.status_code),
                        message=f"HTTP {response.status_code}: {response.text[:200]}",
                        retryable=is_retryable,
                    ),
                    meta={"latency_ms": latency_ms, "status_code": response.status_code},
                )

            # In-body error detection (Section 6.3)
            resp_params, datasets = deserialize_xml(response.text)
            error_code = resp_params.get("ErrorCode") or resp_params.get("errorCode", "0")
            error_msg = resp_params.get("ErrorMsg") or resp_params.get("errorMsg", "OK")

            # Nexacro & EMS convention: "0" and "1" represent successful executions
            if str(error_code) not in ("0", "1"):
                # Determine if error is authentication/session related
                is_auth_error = (
                    error_code in ("-9999", "-9000", "SESSION_TIMEOUT", "AUTH_FAIL")
                    or "session" in error_msg.lower()
                    or "login" in error_msg.lower()
                )
                err_kind: ErrorKind = "auth" if is_auth_error else "business"
                return Result(
                    ok=False,
                    error=ErrorInfo(
                        kind=err_kind,
                        code=error_code,
                        message=error_msg,
                        retryable=is_auth_error,
                    ),
                    meta={"parameters": resp_params, "latency_ms": latency_ms},
                )

            # Successful response
            return Result(
                ok=True,
                data=datasets,
                meta={"parameters": resp_params, "latency_ms": latency_ms},
            )

        except httpx.TimeoutException as exc:
            return Result(
                ok=False,
                error=ErrorInfo(
                    kind="timeout",
                    code="TIMEOUT",
                    message=f"Nexacro call timed out: {exc}",
                    retryable=True,
                ),
            )
        except httpx.RequestError as exc:
            return Result(
                ok=False,
                error=ErrorInfo(
                    kind="network",
                    code="NETWORK_ERROR",
                    message=f"Nexacro network communication error: {exc}",
                    retryable=True,
                ),
            )

    async def health_check(self) -> bool:
        try:
            return not self.session.is_expired()
        except Exception:
            return False

    async def close(self) -> None:
        await self.client.aclose()
