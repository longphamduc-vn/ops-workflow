"""Workflows API routes: discovery and triggering runs."""

import asyncio
import uuid
from typing import Annotated, Any

from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Query, status

from opsflow.api.auth import AuthenticatedConsumer, require_scope
from opsflow.api.schemas import (
    InputParamSchema,
    StartRunRequest,
    StartRunResponse,
    WorkflowDetail,
    WorkflowSummary,
)
from opsflow.core.models import WorkflowDefinition
from opsflow.core.scheduler import WorkflowScheduler
from opsflow.read_models.storage import ReadModelStorage
from opsflow.store.repository import RunRepository

router = APIRouter(prefix="/api/v1/workflows", tags=["Workflows"])

# Global registries initialized at app startup
WORKFLOW_REGISTRY: dict[str, WorkflowDefinition] = {}
IDEMPOTENCY_CACHE: dict[str, str] = {}
APP_REPO: RunRepository | None = None
APP_READ_MODELS: ReadModelStorage | None = None


def get_repository() -> RunRepository:
    if APP_REPO is None:
        raise RuntimeError("Repository not initialized")
    return APP_REPO


def get_read_models() -> ReadModelStorage:
    if APP_READ_MODELS is None:
        raise RuntimeError("ReadModelStorage not initialized")
    return APP_READ_MODELS


@router.get("", response_model=list[WorkflowSummary], summary="List workflows")
async def list_workflows(
    _consumer: Annotated[AuthenticatedConsumer, Depends(require_scope("workflows:read"))],
) -> list[WorkflowSummary]:
    """List all registered workflows and their input schemas."""
    summaries = []
    for wf in WORKFLOW_REGISTRY.values():
        inputs_schema = {
            k: InputParamSchema(
                type=v.type,
                required=v.required,
                default=v.default,
                description=v.description,
            )
            for k, v in wf.inputs.items()
        }
        summaries.append(
            WorkflowSummary(
                name=wf.name,
                version=wf.version,
                description=wf.description,
                trigger_type=wf.trigger.type,
                inputs=inputs_schema,
            )
        )
    return summaries


@router.get("/{name}", response_model=WorkflowDetail, summary="Get workflow metadata")
async def get_workflow(
    name: str,
    _consumer: Annotated[AuthenticatedConsumer, Depends(require_scope("workflows:read"))],
) -> WorkflowDetail:
    """Retrieve detailed metadata for a specific workflow (excluding secrets)."""
    wf = WORKFLOW_REGISTRY.get(name)
    if not wf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow '{name}' not found",
        )

    inputs_schema = {
        k: InputParamSchema(
            type=v.type,
            required=v.required,
            default=v.default,
            description=v.description,
        )
        for k, v in wf.inputs.items()
    }

    return WorkflowDetail(
        name=wf.name,
        version=wf.version,
        description=wf.description,
        trigger=wf.trigger.model_dump(),
        inputs=inputs_schema,
        env=wf.env,
        steps_count=len(wf.steps),
        publish_dataset=wf.publish.dataset if wf.publish else None,
    )


async def _execute_and_publish(
    wf: WorkflowDefinition,
    repo: RunRepository,
    read_models: ReadModelStorage,
    run_id: str,
    inputs: dict[str, Any],
) -> None:
    """Background task to run workflow and publish dataset upon success."""
    scheduler = WorkflowScheduler(wf, repository=repo)
    run_id, final_status, ctx = await scheduler.run(inputs=inputs, run_id=run_id)

    if final_status == "success" and wf.publish:
        published_data = ctx.step_outputs.get("normalize") or ctx.interpolate(wf.publish.source)
        if published_data:
            await read_models.save_published_dataset(
                dataset=wf.publish.dataset,
                source_run_id=run_id,
                records=published_data,
            )


@router.post(
    "/{name}/runs",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=StartRunResponse,
    summary="Start a workflow run",
)
async def start_workflow_run(
    name: str,
    payload: StartRunRequest,
    background_tasks: BackgroundTasks,
    _consumer: Annotated[AuthenticatedConsumer, Depends(require_scope("runs:trigger"))],
    repo: Annotated[RunRepository, Depends(get_repository)],
    read_models: Annotated[ReadModelStorage, Depends(get_read_models)],
    idempotency_key_header: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
    wait: Annotated[int | None, Query(description="Wait up to seconds for completion")] = None,
) -> StartRunResponse:
    """Trigger a new asynchronous workflow run with idempotency protection."""
    wf = WORKFLOW_REGISTRY.get(name)
    if not wf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow '{name}' not found",
        )

    # 1. Check idempotency
    effective_idem_key = idempotency_key_header or payload.idempotency_key
    if effective_idem_key:
        cache_key = f"{name}:{effective_idem_key}"
        if cache_key in IDEMPOTENCY_CACHE:
            existing_run_id = IDEMPOTENCY_CACHE[cache_key]
            existing_run = await repo.get_run(existing_run_id)
            if existing_run:
                return StartRunResponse(
                    run_id=existing_run.id,
                    workflow_name=existing_run.workflow_name,
                    status=existing_run.status,
                    created_at=existing_run.created_at.isoformat(),
                )

    run_id = f"run_{uuid.uuid4().hex[:16]}"
    if effective_idem_key:
        IDEMPOTENCY_CACHE[f"{name}:{effective_idem_key}"] = run_id

    # Create run record
    record = await repo.create_run(run_id, wf.name, payload.inputs)

    # If ?wait=<seconds> is specified
    if wait and wait > 0:
        scheduler = WorkflowScheduler(wf, repository=repo)
        try:
            completed_run_id, final_status, ctx = await asyncio.wait_for(
                scheduler.run(inputs=payload.inputs, run_id=run_id),
                timeout=float(wait),
            )
            if final_status == "success" and wf.publish:
                pub_data = ctx.step_outputs.get("normalize") or ctx.interpolate(wf.publish.source)
                if pub_data:
                    await read_models.save_published_dataset(wf.publish.dataset, run_id, pub_data)
            return StartRunResponse(
                run_id=completed_run_id,
                workflow_name=wf.name,
                status=final_status,
                created_at=record.created_at.isoformat(),
            )
        except TimeoutError:
            pass  # Fallback to returning accepted run while continuing in background

    # Launch execution asynchronously
    background_tasks.add_task(_execute_and_publish, wf, repo, read_models, run_id, payload.inputs)

    return StartRunResponse(
        run_id=run_id,
        workflow_name=wf.name,
        status="pending",
        created_at=record.created_at.isoformat(),
    )
