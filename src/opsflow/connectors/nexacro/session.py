"""Nexacro session management and cookie persistence."""

import time

import httpx

from opsflow.connectors.nexacro.codec_xml import deserialize_xml, serialize_xml
from opsflow.core.errors import OpsflowError


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
        login_payload = serialize_xml(
            parameters={
                "USER_ID": self.username,
                "USER_PW": self.password,
            }
        )

        response = await self.client.post(
            self.login_url,
            content=login_payload,
            headers={"Content-Type": "text/xml; charset=UTF-8"},
        )

        if response.status_code >= 400:
            raise OpsflowError(
                f"Nexacro authentication HTTP failure: {response.status_code} ({response.text[:100]})"
            )

        # Parse response body
        params, _ = deserialize_xml(response.text)
        error_code = params.get("ErrorCode", "0")
        if error_code != "0":
            err_msg = params.get("ErrorMsg", "Login failed")
            raise OpsflowError(f"Nexacro login rejected with ErrorCode {error_code}: {err_msg}")

        self.session_id = params.get("SESSION_ID") or response.cookies.get("JSESSIONID")
        self.cookies.update(response.cookies)
        self.authenticated_at = time.monotonic()
