"""FastAPI application initialization with RFC 7807 error handling."""

import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from opsflow.api.routes import datasets, health, metrics, runs, webhooks, workflows
from opsflow.core.errors import OpsflowError
from opsflow.core.parser import load_workflow_from_file
from opsflow.read_models.storage import ReadModelStorage
from opsflow.store.repository import RunRepository


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup and shutdown lifecycle."""
    # 1. Initialize Database
    db_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///opsflow.db")
    repo = RunRepository(db_url)
    await repo.init_db()

    read_models = ReadModelStorage(repo)
    await read_models.init_tables()

    workflows.APP_REPO = repo
    workflows.APP_READ_MODELS = read_models

    # 2. Discover and register workflows from workflows/ directory
    wf_dir = Path(os.getenv("WORKFLOWS_DIR", "workflows"))
    if wf_dir.exists():
        for yml_file in wf_dir.glob("*.yml"):
            try:
                wf = load_workflow_from_file(yml_file)
                workflows.WORKFLOW_REGISTRY[wf.name] = wf
            except Exception as exc:
                print(f"[WARN] Failed to load workflow from {yml_file}: {exc}")

    yield

    # Shutdown
    await repo.engine.dispose()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="Opsflow Workflow Engine API",
        version="1.0.0",
        description="Public REST API for triggering operational automations, monitoring runs, and querying published datasets.",
        openapi_url="/api/v1/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # RFC 7807 Error handlers
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        code_map = {
            400: "BAD_REQUEST",
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            409: "CONFLICT",
            422: "UNPROCESSABLE_ENTITY",
        }
        err_code = code_map.get(exc.status_code, "ERROR")
        return JSONResponse(
            status_code=exc.status_code,
            media_type="application/problem+json",
            content={
                "type": f"https://opsflow.dev/errors/{err_code.lower()}",
                "title": exc.detail if isinstance(exc.detail, str) else "Error",
                "status": exc.status_code,
                "detail": str(exc.detail),
                "code": err_code,
                "instance": str(request.url),
            },
        )

    @app.exception_handler(OpsflowError)
    async def opsflow_error_handler(request: Request, exc: OpsflowError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            media_type="application/problem+json",
            content={
                "type": "https://opsflow.dev/errors/engine-error",
                "title": "Workflow Engine Error",
                "status": 400,
                "detail": exc.message,
                "code": exc.__class__.__name__,
                "instance": str(request.url),
            },
        )

    # Register routers
    app.include_router(health.router)
    app.include_router(workflows.router)
    app.include_router(runs.router)
    app.include_router(datasets.router)
    app.include_router(webhooks.router)
    app.include_router(metrics.router)

    return app


app = create_app()
