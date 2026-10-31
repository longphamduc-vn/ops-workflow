"""Runs API routes: monitoring status, steps, outputs, and cancellation."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Response, status

from opsflow.api.auth import AuthenticatedConsumer, require_scope
from opsflow.api.routes.workflows import get_repository
from opsflow.api.schemas import RunStatusResponse, StepRunResponse
from opsflow.store.repository import RunRepository

router = APIRouter(prefix="/api/v1/runs", tags=["Runs"])


@router.get("/{run_id}", response_model=RunStatusResponse, summary="Get run status")
async def get_run_status(
    run_id: str,
    _: Annotated[AuthenticatedConsumer, Depends(require_scope("runs:read"))],
    repo: Annotated[RunRepository, Depends(get_repository)],
) -> RunStatusResponse:
    """Retrieve run status, execution timestamps, and summary."""
    run = await repo.get_run(run_id)
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Run '{run_id}' not found",
        )

    return RunStatusResponse(
        run_id=run.id,
        workflow_name=run.workflow_name,
        status=run.status,
        inputs=run.inputs or {},
        outputs=run.outputs or {},
        error=run.error,
        created_at=run.created_at.isoformat(),
        started_at=run.started_at.isoformat() if run.started_at else None,
        completed_at=run.completed_at.isoformat() if run.completed_at else None,
    )


@router.get(
    "/{run_id}/steps",
    response_model=list[StepRunResponse],
    summary="Get per-step execution details",
)
async def get_run_steps(
    run_id: str,
    _: Annotated[AuthenticatedConsumer, Depends(require_scope("runs:read"))],
    repo: Annotated[RunRepository, Depends(get_repository)],
) -> list[StepRunResponse]:
    """Retrieve per-step execution status, latency, and error diagnostics."""
    run = await repo.get_run(run_id)
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Run '{run_id}' not found",
        )

    step_runs = await repo.get_step_runs(run_id)
    return [
        StepRunResponse(
            step_id=sr.step_id,
            status=sr.status,
            attempt=sr.attempt,
            latency_ms=sr.latency_ms,
            started_at=sr.started_at.isoformat() if sr.started_at else None,
            completed_at=sr.completed_at.isoformat() if sr.completed_at else None,
            error=sr.error,
        )
        for sr in step_runs
    ]


@router.get("/{run_id}/result", summary="Get final published run result")
async def get_run_result(
    run_id: str,
    _: Annotated[AuthenticatedConsumer, Depends(require_scope("runs:read"))],
    repo: Annotated[RunRepository, Depends(get_repository)],
) -> dict[str, Any]:
    """Retrieve final published outputs for a successful workflow run."""
    run = await repo.get_run(run_id)
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Run '{run_id}' not found",
        )

    if run.status != "success":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Run '{run_id}' has not succeeded (current status: {run.status})",
        )

    return run.outputs or {}


@router.get("/{run_id}/logs", summary="Get detailed execution log text for a run")
async def get_run_logs(
    run_id: str,
    _: Annotated[AuthenticatedConsumer, Depends(require_scope("runs:read"))],
) -> Response:
    """Retrieve detailed execution log text for a specific run."""
    from opsflow.core.logger import get_run_log_path

    log_path = get_run_log_path(run_id)
    if not log_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No execution log file found for run '{run_id}'. (Ensure dev mode or log_file is active)",
        )
    content = log_path.read_text(encoding="utf-8")
    return Response(content=content, media_type="text/plain; charset=utf-8")


@router.post("/{run_id}/cancel", summary="Cancel a running run")
async def cancel_run(
    run_id: str,
    _: Annotated[AuthenticatedConsumer, Depends(require_scope("runs:trigger"))],
    repo: Annotated[RunRepository, Depends(get_repository)],
) -> dict[str, str]:
    """Cancel an active or pending workflow run."""
    run = await repo.get_run(run_id)
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Run '{run_id}' not found",
        )

    if run.status in ("success", "failed", "cancelled"):
        return {"run_id": run_id, "status": run.status, "message": "Run already completed"}

    await repo.update_run_status(run_id, status="cancelled")
    return {"run_id": run_id, "status": "cancelled", "message": "Run cancelled successfully"}
