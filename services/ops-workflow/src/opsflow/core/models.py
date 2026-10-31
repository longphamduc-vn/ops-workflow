"""Core data models and workflow definition representations."""

from dataclasses import dataclass, field
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

ErrorKind = Literal["timeout", "network", "auth", "business", "validation", "internal"]


def _default_retry_on() -> list[ErrorKind]:
    return ["timeout", "network"]


@dataclass
class ErrorInfo:
    """Standardized error details for failed connector or step operations."""

    kind: ErrorKind
    code: str | None
    message: str
    retryable: bool


@dataclass
class Result:
    """Standard normalized result shape for connectors and step executions."""

    ok: bool
    data: Any = None
    error: ErrorInfo | None = None
    meta: dict[str, Any] = field(default_factory=dict)


class RetryConfig(BaseModel):
    """Configuration for automatic step retry policies."""

    model_config = ConfigDict(extra="forbid")

    max_attempts: int = 3
    backoff: Literal["fixed", "exponential"] = "exponential"
    delay: str = "2s"
    on: list[ErrorKind] = Field(default_factory=_default_retry_on)


class StepDefaults(BaseModel):
    """Workflow-level defaults for step execution."""

    model_config = ConfigDict(extra="forbid")

    timeout: str = "30s"
    retry: RetryConfig | None = None


class ConnectorLimits(BaseModel):
    """Rate-limiting and concurrency controls for an external connector."""

    model_config = ConfigDict(extra="allow")

    max_concurrent: int = 1
    min_interval: str = "0ms"


class ConnectorConfig(BaseModel):
    """Configuration for an external connection declared in a workflow."""

    model_config = ConfigDict(extra="allow")

    type: str
    base_url: str | None = None
    format: Literal["ssv", "xml", "json"] | None = None
    allowed_services: list[str] = Field(default_factory=list)
    auth: dict[str, Any] = Field(default_factory=dict)
    limits: ConnectorLimits = Field(default_factory=ConnectorLimits)


class TriggerConfig(BaseModel):
    """Configuration for what initiates a workflow run."""

    model_config = ConfigDict(extra="allow")

    type: Literal["manual", "cron", "webhook", "event"]
    cron: str | None = None
    timezone: str = "Asia/Ho_Chi_Minh"
    path: str | None = None


class InputParam(BaseModel):
    """Definition of an input parameter accepted by the workflow."""

    model_config = ConfigDict(extra="allow")

    type: Literal["string", "number", "boolean", "list", "object"]
    required: bool = False
    default: Any = None
    description: str | None = None


class StepConfig(BaseModel):
    """Configuration for an individual workflow step."""

    model_config = ConfigDict(extra="allow", populate_by_name=True)

    id: str
    type: Literal["call", "transform", "foreach", "join", "db_upsert", "notify", "approval"]
    needs: list[str] = Field(default_factory=list)
    if_cond: str | None = Field(default=None, alias="if")
    run_if: Literal["all_success", "all_success_or_skipped", "failure", "always"] = "all_success"
    with_params: dict[str, Any] = Field(default_factory=dict, alias="with")
    outputs: dict[str, Any] = Field(default_factory=dict)
    timeout: str | None = None
    retry: RetryConfig | None = None
    continue_on_error: bool = False
    idempotent: bool = True


class PublishConfig(BaseModel):
    """Configuration for exposing workflow results to external consumers."""

    model_config = ConfigDict(extra="forbid")

    dataset: str
    source: str
    event: str | None = None
    event_if: str | None = None


class OnErrorConfig(BaseModel):
    """Workflow-level error handling strategy."""

    model_config = ConfigDict(extra="forbid")

    strategy: Literal["stop", "continue", "rollback"] = "stop"


class WorkflowDefinition(BaseModel):
    """Parsed and validated workflow specification."""

    model_config = ConfigDict(extra="forbid")

    version: str
    name: str
    description: str | None = None
    connectors: dict[str, ConnectorConfig] = Field(default_factory=dict)
    trigger: TriggerConfig
    inputs: dict[str, InputParam] = Field(default_factory=dict)
    env: dict[str, str] = Field(default_factory=dict)
    defaults: StepDefaults = Field(default_factory=StepDefaults)
    steps: list[StepConfig] = Field(default_factory=list)
    on_error: OnErrorConfig = Field(default_factory=OnErrorConfig)
    publish: PublishConfig | None = None
