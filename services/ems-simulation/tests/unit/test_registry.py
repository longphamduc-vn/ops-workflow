"""Unit tests for registry resolution."""

from ems_sim.config import settings
from ems_sim.models.definition import (
    ApiDefinition,
    EndpointConfig,
    ExecutionConfig,
    RequestConfig,
    ResponseConfig,
)
from ems_sim.registry.api_registry import ApiRegistry
from ems_sim.registry.dataset_registry import DatasetRegistry
from ems_sim.registry.fixture_registry import FixtureRegistry
from ems_sim.registry.scenario_registry import ScenarioRegistry


def test_api_registry_resolution():
    registry = ApiRegistry()
    api_def = ApiDefinition(
        id="test.api",
        name="Test API",
        endpoint=EndpointConfig(method="POST", path="/ems/test/api.lgdn"),
        request=RequestConfig(),
        execution=ExecutionConfig(type="fixture"),
        response=ResponseConfig(),
    )
    registry.register(api_def)

    # Test exact match
    resolved = registry.resolve("POST", "/ems/test/api.lgdn")
    assert resolved is not None
    assert resolved.id == "test.api"

    # Test case insensitivity for method
    resolved_lower = registry.resolve("post", "/ems/test/api.lgdn")
    assert resolved_lower is not None

    # Test non-matching
    assert registry.resolve("GET", "/ems/test/api.lgdn") is None
    assert registry.resolve("POST", "/unknown/path") is None


def test_catalogs_loading():
    api_reg = ApiRegistry()
    ds_reg = DatasetRegistry()
    fix_reg = FixtureRegistry()
    sc_reg = ScenarioRegistry()

    assert api_reg.load_from_directory(settings.catalog_dir / "apis") == 12
    assert ds_reg.load_from_directory(settings.catalog_dir / "datasets") >= 12
    assert fix_reg.load_from_directory(settings.catalog_dir / "fixtures") == 12
    assert sc_reg.load_from_directory(settings.catalog_dir / "scenarios") == 12
