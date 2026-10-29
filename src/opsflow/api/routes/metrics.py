"""Prometheus metrics exposition endpoint."""

from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

from opsflow.metrics import GLOBAL_METRICS

router = APIRouter(tags=["Metrics"])


@router.get(
    "/metrics",
    response_class=PlainTextResponse,
    summary="Prometheus metrics",
    description="Expose engine runtime metrics for Prometheus scraping.",
)
async def get_metrics() -> PlainTextResponse:
    """Return runtime metrics in Prometheus text format."""
    text_data = GLOBAL_METRICS.render_prometheus_text()
    return PlainTextResponse(
        content=text_data,
        media_type="text/plain; version=0.0.4; charset=utf-8",
    )
