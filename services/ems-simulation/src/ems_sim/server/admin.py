"""Admin and management REST API endpoints."""

from typing import Any

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

admin_router = APIRouter(prefix="/admin", tags=["Management"])


class ScenarioToggleRequest(BaseModel):
    scenario_id: str
    enabled: bool


@admin_router.get("/endpoints")
async def list_endpoints(request: Request) -> dict[str, Any]:
    """List all registered API endpoints in the simulator."""
    api_registry = request.app.state.api_registry
    apis = api_registry.list_all()
    return {
        "count": len(apis),
        "endpoints": [
            {
                "id": a.id,
                "name": a.name,
                "domain": a.domain,
                "method": a.endpoint.method,
                "path": a.endpoint.path,
                "enabled": a.enabled,
                "execution_type": a.execution.type,
                "handler": a.execution.handler,
            }
            for a in apis
        ],
    }


@admin_router.get("/endpoints/{api_id}")
async def get_endpoint_detail(api_id: str, request: Request) -> dict[str, Any]:
    """Get full details and schema of a specific registered API."""
    api_registry = request.app.state.api_registry
    api_def = api_registry.get_by_id(api_id)
    if not api_def:
        raise HTTPException(status_code=404, detail=f"API '{api_id}' not found")
    return api_def.model_dump()


@admin_router.get("/datasets")
async def list_datasets(request: Request) -> dict[str, Any]:
    """List all reusable dataset schemas."""
    dataset_registry = request.app.state.dataset_registry
    datasets = dataset_registry.list_all()
    return {
        "count": len(datasets),
        "datasets": [d.model_dump() for d in datasets],
    }


@admin_router.get("/scenarios")
async def list_scenarios(request: Request) -> dict[str, Any]:
    """List all configured simulation scenarios."""
    scenario_registry = request.app.state.scenario_registry
    scenarios = scenario_registry.list_all()
    return {
        "count": len(scenarios),
        "scenarios": [s.model_dump() for s in scenarios],
    }


@admin_router.post("/scenarios/toggle")
async def toggle_scenario(payload: ScenarioToggleRequest, request: Request) -> dict[str, Any]:
    """Enable or disable a simulation scenario."""
    scenario_registry = request.app.state.scenario_registry
    for sc in scenario_registry.list_all():
        if sc.id == payload.scenario_id:
            sc.enabled = payload.enabled
            return {"status": "success", "scenario_id": sc.id, "enabled": sc.enabled}
    raise HTTPException(status_code=404, detail=f"Scenario '{payload.scenario_id}' not found")


@admin_router.get("/logs")
async def get_execution_logs(request: Request, limit: int = 50) -> dict[str, Any]:
    """Retrieve recent API execution logs for compatibility testing and debugging."""
    execution_logger = request.app.state.execution_logger
    logs = execution_logger.get_recent_logs(limit=limit)
    return {
        "count": len(logs),
        "logs": logs,
    }
