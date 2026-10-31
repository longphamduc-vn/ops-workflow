"""API, Dataset, Scenario, and Fixture configuration definitions."""

from typing import Any, Literal

from pydantic import BaseModel, Field

from ems_sim.models.protocol import NexacroResponse


class EndpointConfig(BaseModel):
    """HTTP Endpoint configuration."""

    method: str = "POST"
    path: str


class DatasetReference(BaseModel):
    """Reference to a dataset schema."""

    name: str
    schema_id: str = Field(alias="schema")


class RequestConfig(BaseModel):
    """Request contract definition."""

    params: list[str] = Field(default_factory=list)
    datasets: list[DatasetReference] = Field(default_factory=list)


class ExecutionConfig(BaseModel):
    """Simulation execution strategy."""

    type: Literal["fixture", "query", "handler", "scenario", "composite"] = "handler"
    handler: str | None = None
    query: str | None = None
    fixture_id: str | None = None
    parameters: dict[str, Any] = Field(default_factory=dict)


class ResponseConfig(BaseModel):
    """Response contract definition."""

    params: list[str] = Field(default_factory=lambda: ["errorCode", "errorMsg"])
    datasets: list[DatasetReference] = Field(default_factory=list)


class ApiDefinition(BaseModel):
    """Complete registered API Definition."""

    id: str
    name: str
    domain: str = "common"
    version: str = "1.0.0"
    enabled: bool = True
    endpoint: EndpointConfig
    request: RequestConfig
    execution: ExecutionConfig
    response: ResponseConfig


class ColumnDefinition(BaseModel):
    """Dataset column metadata."""

    name: str
    type: str = "string"
    nullable: bool = True
    description: str | None = None


class DatasetDefinition(BaseModel):
    """Reusable Dataset schema definition."""

    id: str
    name: str
    version: str = "1.0.0"
    columns: list[ColumnDefinition] = Field(default_factory=list)

    @property
    def column_names(self) -> list[str]:
        return [col.name for col in self.columns]


class ScenarioDefinition(BaseModel):
    """Configurable simulation scenario under specific request conditions."""

    id: str
    api_id: str
    enabled: bool = True
    priority: int = 100
    match: dict[str, Any] = Field(default_factory=dict)
    response: NexacroResponse


class FixtureDefinition(BaseModel):
    """Predefined request-response fixture."""

    id: str
    api_id: str
    match: dict[str, Any] = Field(default_factory=dict)
    response: NexacroResponse
