"""API Key authentication and scope-based authorization for consumers."""

from collections.abc import Callable
from typing import Annotated, Any

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader, HTTPAuthorizationCredentials, HTTPBearer

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
bearer_security = HTTPBearer(auto_error=False)

_API_KEYS: dict[str, dict[str, Any]] = {
    "test_api_key": {
        "consumer_id": "test_client",
        "scopes": {"runs:trigger", "runs:read", "datasets:read", "workflows:read"},
    },
    "admin_key": {
        "consumer_id": "admin",
        "scopes": {"admin", "runs:trigger", "runs:read", "datasets:read", "workflows:read"},
    },
}


def register_api_key(api_key: str, consumer_id: str, scopes: set[str]) -> None:
    """Register or update an active API key with designated scopes."""
    _API_KEYS[api_key] = {"consumer_id": consumer_id, "scopes": scopes}


class AuthenticatedConsumer:
    """Represents the validated API consumer and their granted scopes."""

    def __init__(self, consumer_id: str, scopes: set[str]) -> None:
        self.consumer_id = consumer_id
        self.scopes = scopes

    def has_scope(self, scope: str) -> bool:
        return "admin" in self.scopes or scope in self.scopes


async def get_current_consumer(
    api_key_hdr: Annotated[str | None, Security(api_key_header)] = None,
    bearer_creds: Annotated[HTTPAuthorizationCredentials | None, Security(bearer_security)] = None,
) -> AuthenticatedConsumer:
    """Extract and validate consumer credentials from X-API-Key or Bearer token."""
    key = api_key_hdr or (bearer_creds.credentials if bearer_creds else None)

    if not key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API Key. Provide 'X-API-Key' header or Bearer token.",
            headers={"WWW-Authenticate": "ApiKey"},
        )

    consumer_info = _API_KEYS.get(key)
    if not consumer_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API Key.",
            headers={"WWW-Authenticate": "ApiKey"},
        )

    return AuthenticatedConsumer(
        consumer_id=consumer_info["consumer_id"],
        scopes=consumer_info["scopes"],
    )


def require_scope(required_scope: str) -> Callable[..., Any]:
    """Dependency factory checking that consumer has the required permission scope."""
    async def _scope_checker(
        consumer: Annotated[AuthenticatedConsumer, Depends(get_current_consumer)],
    ) -> AuthenticatedConsumer:
        if not consumer.has_scope(required_scope):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Consumer lacks required scope '{required_scope}'",
            )
        return consumer

    return _scope_checker
