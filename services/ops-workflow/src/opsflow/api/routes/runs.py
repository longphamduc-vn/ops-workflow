"""Runs API routes: monitoring status, steps, outputs, and cancellation."""

import asyncio
import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import Annotated, Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Response, status

from opsflow.api.auth import AuthenticatedConsumer, require_scope
from opsflow.api.routes.workflows import WORKFLOW_REGISTRY, get_read_models, get_repository
from opsflow.api.schemas import (
    ReplayRunRequest,
    RunListResponse,
    RunStatusResponse,
    StartRunResponse,
    StepRunResponse,
)
from opsflow.core.scheduler import WorkflowScheduler
from opsflow.read_models.storage import ReadModelStorage
from opsflow.store.repository import RunRepository

router = APIRouter(prefix="/api/v1/runs", tags=["Runs"])


@router.get("", response_model=RunListResponse, summary="List runs with pagination and filters")
async def list_runs(
    _: Annotated[AuthenticatedConsumer, Depends(require_scope("runs:read"))],
    repo: Annotated[RunRepository, Depends(get_repository)],
    status: Annotated[str | None, Query(description="Filter by run status")] = None,
    workflow_name: Annotated[str | None, Query(description="Filter by workflow name")] = None,
    limit: Annotated[int, Query(ge=1, le=100, description="Items per page")] = 50,
    offset: Annotated[int, Query(ge=0, description="Offset index")] = 0,
) -> RunListResponse:
    """Retrieve paginated list of workflow runs with optional filters."""
    runs, total = await repo.list_runs(
        status=status,
        workflow_name=workflow_name,
        limit=limit,
        offset=offset,
    )
    items = [
        RunStatusResponse(
            run_id=r.id,
            workflow_name=r.workflow_name,
            status=r.status,
            inputs=r.inputs or {},
            outputs=r.outputs or {},
            error=r.error,
            created_at=r.created_at.isoformat(),
            started_at=r.started_at.isoformat() if r.started_at else None,
            completed_at=r.completed_at.isoformat() if r.completed_at else None,
        )
        for r in runs
    ]
    return RunListResponse(items=items, total=total, limit=limit, offset=offset)


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
            outputs=sr.outputs,
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
    import re
    from pathlib import Path
    from opsflow.core.logger import get_run_log_path

    log_path = get_run_log_path(run_id)
    if log_path.exists():
        content = log_path.read_text(encoding="utf-8")
        if content.strip():
            return Response(content=content, media_type="text/plain; charset=utf-8")

    # Fallback: Recover run log entries from global dev log files
    candidates = [
        Path("services/ops-workflow/logs/opsflow_dev.log"),
        Path("logs/opsflow_dev.log"),
        Path("../logs/opsflow_dev.log"),
        Path("services/ops-workflow/logs/opsflow.log"),
        Path("logs/opsflow.log"),
    ]
    for p in candidates:
        if not p.exists():
            continue
        try:
            lines = p.read_text(encoding="utf-8").splitlines()
            matched = []
            in_run_line = False
            for line in lines:
                if f"[run_id={run_id}]" in line:
                    matched.append(line)
                    in_run_line = True
                elif in_run_line and not re.match(r"^\[\d{4}-\d{2}-\d{2}", line):
                    matched.append(line)
                else:
                    in_run_line = False
            if matched:
                recovered_content = "\n".join(matched)
                try:
                    log_path.parent.mkdir(parents=True, exist_ok=True)
                    log_path.write_text(recovered_content, encoding="utf-8")
                except Exception:
                    pass
                return Response(content=recovered_content, media_type="text/plain; charset=utf-8")
        except Exception:
            continue

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"No execution log file found for run '{run_id}'. (Ensure dev mode or log_file is active)",
    )


@router.delete("/{run_id}/logs", summary="Delete execution log file for a run")
async def delete_run_logs(
    run_id: str,
    _: Annotated[AuthenticatedConsumer, Depends(require_scope("runs:trigger"))],
) -> dict[str, Any]:
    """Delete or clear the execution log file for a specific run."""
    from opsflow.core.logger import get_run_log_path

    log_path = get_run_log_path(run_id)
    if log_path.exists():
        log_path.unlink()
        return {
            "run_id": run_id,
            "status": "cleared",
            "message": f"Log file for run '{run_id}' has been cleared",
        }
    return {
        "run_id": run_id,
        "status": "not_found",
        "message": f"No log file found for run '{run_id}'",
    }


@router.delete("", summary="Delete all workflow runs and their execution logs")
async def delete_all_runs(
    _: Annotated[AuthenticatedConsumer, Depends(require_scope("runs:trigger"))],
    repo: Annotated[RunRepository, Depends(get_repository)],
) -> dict[str, Any]:
    """Permanently delete all workflow runs, step runs, and associated execution log files."""
    deleted_count = await repo.delete_all_runs()

    # Clean up all log files in candidate log directories
    log_dirs = [Path("logs/runs"), Path("services/ops-workflow/logs/runs")]
    deleted_logs_count = 0
    for d in log_dirs:
        if d.exists() and d.is_dir():
            for f in d.glob("run_*.log"):
                try:
                    f.unlink()
                    deleted_logs_count += 1
                except Exception:
                    pass

    return {
        "status": "cleared",
        "deleted_count": deleted_count,
        "deleted_logs_count": deleted_logs_count,
        "message": f"Successfully purged {deleted_count} execution runs and {deleted_logs_count} log files",
    }


@router.delete("/{run_id}", summary="Delete a single workflow run")
async def delete_run(
    run_id: str,
    _: Annotated[AuthenticatedConsumer, Depends(require_scope("runs:trigger"))],
    repo: Annotated[RunRepository, Depends(get_repository)],
) -> dict[str, Any]:
    """Delete a specific run, its step runs, and its log file."""
    deleted = await repo.delete_run(run_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Run '{run_id}' not found",
        )

    # Clean up log file if exists
    from opsflow.core.logger import get_run_log_path

    log_path = get_run_log_path(run_id)
    if log_path.exists():
        try:
            log_path.unlink()
        except Exception:
            pass

    return {
        "run_id": run_id,
        "status": "deleted",
        "message": f"Run '{run_id}' has been permanently deleted",
    }


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


@router.post(
    "/{run_id}/replay",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=StartRunResponse,
    summary="Replay or resume a workflow run",
)
async def replay_run(
    run_id: str,
    payload: ReplayRunRequest,
    background_tasks: BackgroundTasks,
    _: Annotated[AuthenticatedConsumer, Depends(require_scope("runs:trigger"))],
    repo: Annotated[RunRepository, Depends(get_repository)],
    read_models: Annotated[ReadModelStorage, Depends(get_read_models)],
    wait: Annotated[int | None, Query(description="Wait up to seconds for completion")] = None,
) -> StartRunResponse:
    """Replay a workflow run, optionally resuming from existing successful steps."""
    existing_run = await repo.get_run(run_id)
    if not existing_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Run '{run_id}' not found",
        )

    wf_name = existing_run.workflow_name
    wf = WORKFLOW_REGISTRY.get(wf_name)
    if not wf:
        from opsflow.core.parser import load_workflow_from_file

        candidate_paths = [
            Path("workflows") / f"{wf_name}.yml",
            Path("services/ops-workflow/workflows") / f"{wf_name}.yml",
            Path(f"{wf_name}.yml"),
        ]
        wf_path = next((p for p in candidate_paths if p.exists()), None)
        if wf_path and wf_path.exists():
            try:
                wf = load_workflow_from_file(wf_path)
                WORKFLOW_REGISTRY[wf.name] = wf
            except Exception as exc:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to load workflow definition from {wf_path}: {exc}",
                )

    if not wf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow definition '{wf_name}' not found in registry or workflows directory",
        )

    target_run_id = f"run_{uuid.uuid4().hex[:16]}" if payload.new_run else run_id
    effective_inputs = dict(existing_run.inputs or {})
    if payload.inputs:
        effective_inputs.update(payload.inputs)

    if payload.new_run:
        await repo.create_run(target_run_id, wf_name, effective_inputs)
    else:
        await repo.update_run_status(target_run_id, "pending")

    async def _execute_replay() -> None:
        scheduler = WorkflowScheduler(wf, repository=repo)
        active_id, final_status, ctx = await scheduler.run(
            run_id=target_run_id,
            inputs=effective_inputs,
            resume_from_existing=payload.resume_from_failed,
        )
        if final_status == "success" and wf.publish:
            published_data = ctx.step_outputs.get("normalize") or ctx.interpolate(wf.publish.source)
            if published_data:
                await read_models.save_published_dataset(
                    dataset=wf.publish.dataset,
                    source_run_id=active_id,
                    records=published_data,
                )

    if wait and wait > 0:
        await asyncio.wait_for(_execute_replay(), timeout=float(wait))
        updated = await repo.get_run(target_run_id)
        current_status = updated.status if updated else "pending"
    else:
        background_tasks.add_task(_execute_replay)
        current_status = "pending"

    return StartRunResponse(
        run_id=target_run_id,
        workflow_name=wf.name,
        status=current_status,
        created_at=datetime.now(UTC).isoformat(),
    )
