"""Nexacro Platform connector supporting XML wire format, session management, and in-body error detection."""

import asyncio
import os
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

        # SSL, redirect, and header options for connecting to real EMS environments
        verify_ssl = kwargs.get("verify_ssl", kwargs.get("verify", True))
        if os.getenv("OPSFLOW_INSECURE_SKIP_VERIFY", "").strip().lower() in ("1", "true", "yes"):
            verify_ssl = False

        follow_redirects = kwargs.get("follow_redirects", True)
        custom_headers = kwargs.get("headers") or {}

        req_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NexacroPlatform/17.0 (EMS Client)",
            "Accept": "*/*",
        }
        req_headers.update(custom_headers)

        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=self.timeout,
            verify=verify_ssl,
            follow_redirects=follow_redirects,
            headers=req_headers,
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
        from opsflow.core.logger import dev_log_wire_request, dev_log_wire_response

        in_datasets = params.get("in_datasets") or {}
        req_params = params.get("params") or {}

        payload = serialize_xml(parameters=req_params, datasets=in_datasets)
        url = (
            operation
            if operation.startswith("http")
            else f"{self.base_url}/{operation.lstrip('/')}"
        )

        headers = {"Content-Type": "text/xml; charset=UTF-8"}
        dev_log_wire_request(
            connector=self.name,
            method="POST",
            url=url,
            headers=headers,
            cookies=dict(self.client.cookies),
            body=payload,
        )

        start_t = time.monotonic()
        try:
            response = await self.client.post(
                url,
                content=payload,
                headers=headers,
            )
            self._last_call_time = time.monotonic()
            latency_ms = int((self._last_call_time - start_t) * 1000)

            dev_log_wire_response(
                connector=self.name,
                status_code=response.status_code,
                headers=dict(response.headers),
                body=response.text,
                latency_ms=latency_ms,
            )

            # Check transport/HTTP-level error
            if response.status_code >= 400:
                is_retryable = response.status_code in (408, 429, 500, 502, 503, 504)
                http_kind: ErrorKind = "network" if response.status_code >= 500 else "business"
                if response.status_code in (401, 403):
                    http_kind = "auth"
                preview = response.text[:300].replace("\n", " ")
                return Result(
                    ok=False,
                    error=ErrorInfo(
                        kind=http_kind,
                        code=str(response.status_code),
                        message=f"HTTP {response.status_code}: {preview}",
                        retryable=is_retryable,
                    ),
                    meta={"latency_ms": latency_ms, "status_code": response.status_code, "raw_response": response.text[:2000]},
                )

            # In-body error detection (Section 6.3)
            try:
                resp_params, datasets = deserialize_xml(response.text)
            except Exception as exc:
                preview = response.text[:500].replace("\n", " ")
                return Result(
                    ok=False,
                    error=ErrorInfo(
                        kind="validation",
                        code="INVALID_XML_RESPONSE",
                        message=f"Server returned non-XML response (HTTP {response.status_code}): {exc}. Response preview: {preview}",
                        retryable=False,
                    ),
                    meta={"latency_ms": latency_ms, "status_code": response.status_code, "raw_response": response.text[:2000]},
                )

            error_code = resp_params.get("ErrorCode") or resp_params.get("errorCode", "0")
            error_msg = resp_params.get("ErrorMsg") or resp_params.get("errorMsg", "OK")

            # Nexacro & EMS convention: "0" and "1" represent successful executions
            if str(error_code) not in ("0", "1"):
                # Determine if error is authentication/session related
                is_auth_error = (
                    str(error_code) in ("-9999", "-9000", "SESSION_TIMEOUT", "AUTH_FAIL")
                    or "session" in error_msg.lower()
                    or "login" in error_msg.lower()
                )
                err_kind: ErrorKind = "auth" if is_auth_error else "business"
                return Result(
                    ok=False,
                    error=ErrorInfo(
                        kind=err_kind,
                        code=str(error_code),
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
                    message=f"Nexacro call timed out connecting to {url}: {exc}",
                    retryable=True,
                ),
            )
        except httpx.ConnectError as exc:
            err_msg = str(exc)
            hint = ""
            if "CERTIFICATE_VERIFY_FAILED" in err_msg or "certificate verify failed" in err_msg.lower():
                hint = " [HINT: SSL certificate verification failed. If your real EMS uses an internal/self-signed cert, set 'verify_ssl: false' in the connector config or set OPSFLOW_INSECURE_SKIP_VERIFY=1]"
            return Result(
                ok=False,
                error=ErrorInfo(
                    kind="network",
                    code="CONNECT_ERROR",
                    message=f"Nexacro connection failed to {url}: {exc}{hint}",
                    retryable=True,
                ),
            )
        except httpx.RequestError as exc:
            return Result(
                ok=False,
                error=ErrorInfo(
                    kind="network",
                    code="NETWORK_ERROR",
                    message=f"Nexacro network communication error connecting to {url}: {exc}",
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
