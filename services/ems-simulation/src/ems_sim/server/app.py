"""FastAPI Application factory and lifecycle setup."""

import json
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from ems_sim.config import settings
from ems_sim.database.connection import close_db, get_session_factory, init_db
from ems_sim.database.repository import SimulationRepository
from ems_sim.engine.simulation_engine import SimulationEngine
from ems_sim.logger.execution_logger import ExecutionLogger
from ems_sim.registry.api_registry import ApiRegistry
from ems_sim.registry.dataset_registry import DatasetRegistry
from ems_sim.registry.fixture_registry import FixtureRegistry
from ems_sim.registry.scenario_registry import ScenarioRegistry
from ems_sim.server.admin import admin_router
from ems_sim.server.router import nexacro_router

logging.basicConfig(
    level=settings.log_level, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    logger.info("Initializing EMS Simulation Platform...")

    # 1. Initialize Registries
    api_registry = ApiRegistry()
    dataset_registry = DatasetRegistry()
    fixture_registry = FixtureRegistry()
    scenario_registry = ScenarioRegistry()

    catalog_dir = settings.catalog_dir
    n_apis = api_registry.load_from_directory(catalog_dir / "apis")
    n_datasets = dataset_registry.load_from_directory(catalog_dir / "datasets")
    n_fixtures = fixture_registry.load_from_directory(catalog_dir / "fixtures")
    n_scenarios = scenario_registry.load_from_directory(catalog_dir / "scenarios")

    logger.info(
        f"Loaded catalog: {n_apis} APIs, {n_datasets} Datasets, {n_fixtures} Fixtures, {n_scenarios} Scenarios"
    )

    # 2. Initialize Engine & Logger
    simulation_engine = SimulationEngine(
        dataset_registry=dataset_registry,
        fixture_registry=fixture_registry,
        scenario_registry=scenario_registry,
    )
    execution_logger = ExecutionLogger()

    # 3. Initialize Database and seed data
    await init_db()
    session_factory = get_session_factory()

    seed_file = catalog_dir / "seed_data.json"
    if seed_file.exists():
        try:
            with open(seed_file, encoding="utf-8") as f:
                seed_data = json.load(f)
            async with session_factory() as session:
                repo = SimulationRepository(session)
                await repo.seed_data(seed_data)
            logger.info("Database initialized and seeded successfully.")
        except Exception as e:
            logger.warning(f"Database seed notice: {e}")

    # Attach to app state
    app.state.api_registry = api_registry
    app.state.dataset_registry = dataset_registry
    app.state.fixture_registry = fixture_registry
    app.state.scenario_registry = scenario_registry
    app.state.simulation_engine = simulation_engine
    app.state.execution_logger = execution_logger
    app.state.session_factory = session_factory

    yield

    logger.info("Shutting down EMS Simulation Platform...")
    await close_db()


def create_app() -> FastAPI:
    """Create and configure FastAPI instance."""
    app = FastAPI(
        title="Nexacro EMS API Simulation Platform",
        description="Configuration-Driven API Simulation Platform for Nexacro-based EMS APIs",
        version="0.1.0",
        docs_url=None,
        lifespan=lifespan,
    )

    static_dir = Path(__file__).parent / "static"
    if static_dir.exists():
        app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

        @app.get("/docs", include_in_schema=False)
        async def custom_swagger_ui_html() -> HTMLResponse:
            return get_swagger_ui_html(
                openapi_url=app.openapi_url or "/openapi.json",
                title=f"{app.title} - Swagger UI",
                swagger_js_url="/static/swagger-ui-bundle.js",
                swagger_css_url="/static/swagger-ui.css",
            )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health check
    @app.get("/health", tags=["Health"])
    async def health_check():
        return {
            "status": "healthy",
            "service": "ems-simulation",
            "version": "0.1.0",
        }

    # Mount management routes
    app.include_router(admin_router)

    # Mount universal Nexacro dispatcher last
    app.include_router(nexacro_router)

    return app


app = create_app()
