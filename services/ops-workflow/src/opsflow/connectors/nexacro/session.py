"""Nexacro session management and cookie persistence."""

from __future__ import annotations

import time
from typing import Any

import httpx

from opsflow.connectors.nexacro.codec_xml import deserialize_xml, serialize_xml
from opsflow.core.errors import OpsflowError


def _safe_cookies_dict(cookies: Any) -> dict[str, str]:
    """Safely extract cookies to a dict without raising CookieConflict on duplicate cookie names."""
    if not cookies:
        return {}
    res: dict[str, str] = {}
    jar = getattr(cookies, "jar", None)
    if jar is not None:
        for c in jar:
            res[c.name] = c.value
    elif isinstance(cookies, dict):
        return dict(cookies)
    return res


def _get_cookie_val(cookies: Any, name: str) -> str | None:
    """Safely get cookie value by name without raising CookieConflict."""
    if not cookies:
        return None
    jar = getattr(cookies, "jar", None)
    if jar is not None:
        for c in jar:
            if c.name == name:
                return c.value
    return None


def parse_ttl_seconds(ttl: str | int | float | None) -> float:
    """Parse session TTL duration string like '20m', '1h', '600s' into seconds."""
    if ttl is None:
        return 1200.0  # default 20 minutes
    if isinstance(ttl, (int, float)):
        return float(ttl)

    s = ttl.strip().lower()
    if s.endswith("m"):
        return float(s[:-1]) * 60.0
    elif s.endswith("h"):
        return float(s[:-1]) * 3600.0
    elif s.endswith("s"):
        return float(s[:-1])
    return 1200.0


class NexacroSession:
    """Manages authentication, session lifecycle, and automatic re-login on expiration."""

    def __init__(
        self,
        client: httpx.AsyncClient,
        login_url: str = "/login.do",
        username: str = "",
        password: str = "",
        session_ttl: str = "20m",
        format_type: str = "xml",
    ) -> None:
        self.client = client
        self.login_url = login_url
        self.username = username
        self.password = password
        self.ttl_seconds = parse_ttl_seconds(session_ttl)
        self.format_type = format_type

        self.authenticated_at: float | None = None
        self.session_id: str | None = None
        self.cookies: httpx.Cookies = httpx.Cookies()

    def is_expired(self) -> bool:
        """Check whether the active session has exceeded its configured TTL."""
        if self.authenticated_at is None:
            return True
        return (time.monotonic() - self.authenticated_at) > self.ttl_seconds

    def invalidate(self) -> None:
        """Mark active session as expired/invalid."""
        self.authenticated_at = None
        self.session_id = None
        self.cookies.clear()

    async def authenticate(self) -> None:
        """Authenticate against EMS login service and establish session."""
        from opsflow.core.logger import _write_file_log, dev_log_wire_request, dev_log_wire_response

        login_payload = serialize_xml(
            parameters={
                "USER_ID": self.username,
                "USER_PW": self.password,
            }
        )

        full_login_url = (
            self.login_url
            if self.login_url.startswith("http")
            else f"{str(self.client.base_url).rstrip('/')}/{self.login_url.lstrip('/')}"
        )
        headers = {"Content-Type": "text/xml; charset=UTF-8"}

        dev_log_wire_request(
            connector="ems_auth",
            method="POST",
            url=full_login_url,
            headers=headers,
            cookies=_safe_cookies_dict(self.client.cookies),
            body=login_payload,
        )

        start_t = time.monotonic()
        try:
            response = await self.client.post(
                self.login_url,
                content=login_payload,
                headers=headers,
            )
        except Exception as exc:
            _write_file_log(
                "ERROR",
                "AUTH: FAILED",
                f"Connection error during login to {full_login_url}: {exc}",
            )
            raise OpsflowError(f"Nexacro login connection failure to {full_login_url}: {exc}") from exc

        latency_ms = int((time.monotonic() - start_t) * 1000)
        dev_log_wire_response(
            connector="ems_auth",
            status_code=response.status_code,
            headers=dict(response.headers),
            body=response.text,
            latency_ms=latency_ms,
        )

        if response.status_code >= 400:
            preview = response.text[:300].replace("\n", " ")
            raise OpsflowError(
                f"Nexacro authentication HTTP failure: {response.status_code} on {full_login_url}. Server returned: {preview}"
            )

        # Parse response body safely
        try:
            params, _ = deserialize_xml(response.text)
        except Exception as exc:
            preview = response.text[:300].replace("\n", " ")
            raise OpsflowError(
                f"Nexacro login service returned non-XML response (HTTP {response.status_code}) on {full_login_url}: {exc}. Preview: {preview}"
            ) from exc

        error_code = str(params.get("ErrorCode", "0"))
        if error_code not in ("0", "1"):
            err_msg = params.get("ErrorMsg", "Login failed")
            raise OpsflowError(
                f"Nexacro login rejected on {full_login_url} with ErrorCode '{error_code}': {err_msg}"
            )

        self.session_id = params.get("SESSION_ID") or _get_cookie_val(response.cookies, "JSESSIONID")
        self.cookies.update(response.cookies)
        self.authenticated_at = time.monotonic()
