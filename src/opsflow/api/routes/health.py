"""Health and readiness probes."""

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Liveness probe")
async def health_check() -> dict[str, str]:
    """Check service liveness (unauthenticated)."""
    return {"status": "ok"}


@router.get("/ready", summary="Readiness probe")
async def readiness_check() -> dict[str, str]:
    """Check service readiness (unauthenticated)."""
    return {"status": "ready"}
