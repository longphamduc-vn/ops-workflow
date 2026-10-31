"""Pytest fixtures for ems-sim tests."""

from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from ems_sim.server.app import create_app


@pytest_asyncio.fixture
async def app_instance():
    """Create a fresh app instance for testing."""
    app = create_app()
    # Trigger lifespan startup
    async with app.router.lifespan_context(app):
        yield app


@pytest_asyncio.fixture
async def client(app_instance) -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP test client."""
    transport = ASGITransport(app=app_instance)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac
