"""Public API Pydantic schemas for request and response models.

Kept separate from internal database models per Section 12 of AGENTS.md.
"""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ProblemDetails(BaseModel):
    """RFC 7807 compliant problem details error representation."""

    model_config = ConfigDict(extra="allow")

    type: str = "about:blank"
    title: str
    status: int
    detail: str
    code: str
    instance: str | None = None
    errors: list[dict[str, Any]] | None = None


class InputParamSchema(BaseModel):
    """Schema describing an accepted workflow input parameter."""

    type: str
    required: bool = False
    default: Any = None
    description: str | None = None


class WorkflowSummary(BaseModel):
    """Summary of a registered workflow."""

    name: str
    version: str
    description: str | None = None
    trigger_type: str
    inputs: dict[str, InputParamSchema] = Field(default_factory=dict)


class WorkflowDetail(BaseModel):
    """Detailed metadata for a specific workflow."""

    name: str
    version: str
    description: str | None = None
    trigger: dict[str, Any]
    inputs: dict[str, InputParamSchema] = Field(default_factory=dict)
    env: dict[str, str] = Field(default_factory=dict)
    steps_count: int
    publish_dataset: str | None = None


class StartRunRequest(BaseModel):
    """Payload to trigger a new workflow run."""

    inputs: dict[str, Any] = Field(default_factory=dict)
    idempotency_key: str | None = None


class StartRunResponse(BaseModel):
    """Response returned upon accepting a workflow run (HTTP 202)."""

    run_id: str
    workflow_name: str
    status: str
    created_at: str


class RunStatusResponse(BaseModel):
    """Execution status and metadata for a run."""

    run_id: str
    workflow_name: str
    status: str
    inputs: dict[str, Any] = Field(default_factory=dict)
    outputs: dict[str, Any] = Field(default_factory=dict)
    error: dict[str, Any] | None = None
    created_at: str
    started_at: str | None = None
    completed_at: str | None = None


class StepRunResponse(BaseModel):
    """Execution status and logs for a single workflow step."""

    step_id: str
    status: str
    attempt: int
    latency_ms: int
    started_at: str | None = None
    completed_at: str | None = None
    error: dict[str, Any] | None = None


class DatasetQueryResponse(BaseModel):
    """Paginated result set for a published dataset query."""

    dataset: str
    items: list[dict[str, Any]]
    next_cursor: str | None = None
    count: int


class WebhookSubscriptionRequest(BaseModel):
    """Request to register an outbound webhook consumer."""

    target_url: str
    event_types: list[str] = Field(default_factory=lambda: ["*"])
    secret: str | None = None


class WebhookSubscriptionResponse(BaseModel):
    """Registration confirmation for an outbound webhook."""

    id: str
    target_url: str
    event_types: list[str]
    created_at: str
