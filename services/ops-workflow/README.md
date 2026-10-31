# ops-workflow (`opsflow`) — Component 1: Core Workflow & Integration Engine

> **Management System Component 1**: The resilient backbone, workflow orchestration engine, and external integration layer of the overall Operations Management System.

Built according to the roadmap, invariants, and specifications in [`AGENTS.md`](AGENTS.md).

---

## 🏛️ System Architecture & Component 1 Role

Within the broader Operations Management System, **`ops-workflow` (Component 1)** acts as the central integration engine and ETL/automation pipeline:

```mermaid
graph TD
    subgraph Consumers["Downstream Management System Components"]
        C2["Component 2: Operations Web Portal & Dashboard"]
        C3["Component 3: Incident Management & Alerting"]
        C4["Component 4: Analytics & BI Reporting"]
    end

    subgraph Component1["Component 1: ops-workflow (This Service)"]
        API["Public REST API v1 (/api/v1)<br/>• OpenAPI 3.1 Contract<br/>• Idempotency-Key Support"]
        WH["Outbound Webhooks / Events<br/>• HMAC-SHA256 Signed<br/>• Exponential Backoff & DLQ"]
        RM["Published Read Models / Datasets<br/>• Cursor Pagination<br/>• Filter & Sort"]
        ENG["DAG Engine & Scheduler<br/>• YAML Workflow Definitions<br/>• Parallel Async Execution<br/>• State Machine & Crash-Resume"]
        SEC["Security & Secrets<br/>• SimpleEval Sandbox<br/>• Auto-masking Secrets"]
        CONN["Connector Registry<br/>• Rate Limits & Concurrency Guards<br/>• Read-only Service Whitelisting"]
    end

    subgraph External["External & Legacy Systems"]
        EMS["Legacy EMS (Nexacro XML/SSV)<br/>• Read-Only<br/>• Session Auto-Relogin"]
        EXT_API["REST / HTTP Services"]
        EXT_DB["SQL Databases"]
    end

    C2 -->|"REST API / Python SDK"| API
    C3 <--|"Signed Webhooks"| WH
    C4 -->|"Query Read Models"| RM

    API --> ENG
    ENG --> RM
    ENG --> WH
    ENG --> SEC
    ENG --> CONN

    CONN -->|"Protected Calls"| EMS
    CONN --> EXT_API
    CONN --> EXT_DB
```

### Component Roles & Boundaries

| Component | Scope & Responsibilities | Integration with Component 1 |
|---|---|---|
| **Component 1: `ops-workflow`** *(This Repository)* | • Core YAML workflow execution & DAG scheduling<br/>• External connector gateway (Legacy Nexacro EMS, HTTP, SQL)<br/>• Data normalization & snapshot read-model storage<br/>• Outbound signed webhook events & Prometheus observability | **Host service**: Exposes `/api/v1`, OpenAPI contract, and webhooks. |
| **Component 2: Operations Web Portal** | • Visual monitoring dashboard for operations personnel<br/>• Manual trigger dispatch & workflow inspection<br/>• Interactive approval requests | Consumes **Component 1 REST API** & **Python SDK** via authenticated API keys. |
| **Component 3: Incident Management** | • Automated ticket creation and SLA tracking<br/>• Escalation workflows and on-call paging | Subscribes to **Component 1 Webhook Events** (e.g., `equipment.status.updated`). |
| **Component 4: Analytics & Reporting** | • Historical metrics, trends, and BI dashboards<br/>• Compliance and reliability reports | Queries **Component 1 Datasets** (`/api/v1/datasets/*`) or read views. |

---

## 🚀 Key Features & Architectural Invariants

1. **Isolation Invariant**: The `core/` package never imports concrete connectors (Nexacro, HTTP, SQL). Connectors are plugged in dynamically via registries.
2. **Normalized Results**: All connectors return a standardized `Result(ok: bool, data: Any, error: ErrorInfo | None)`.
3. **Secret Masking & Zero Secrets in YAML**: YAML definitions only reference `${secrets.*}`. Secrets are resolved at runtime and auto-masked from all logs, context traces, and error outputs.
4. **Sandboxed Expressions**: Live expressions (`${steps.x...}`, `${inputs...}`) are evaluated using a restricted sandboxed evaluator (`simpleeval`) without arbitrary code execution.
5. **Read-only Legacy Safeguard**: Nexacro/EMS access enforces strict `allowed_services` whitelisting and concurrency/interval rate limits.
6. **Parallel DAG Scheduling & Crash-Resume**: Independent steps run concurrently via `asyncio`. State changes are committed before step execution, enabling zero-loss crash-resume and replay.
7. **Production Observability**: Native Prometheus-compatible exposition endpoint (`/metrics`) tracking run counts, durations, step statuses, connector latency, and session re-logins.

---

## 📋 Milestone Completion Status

| Milestone | Scope | Status | Acceptance Verification |
|---|---|:---:|---|
| **M0** | Skeleton, tooling, CI, Dockerfile | ✅ Done | `pytest`, `ruff`, `mypy` green; Docker image builds |
| **M1** | Parser, Validator (10 semantic rules), DAG, JSON Schema, CLI validate | ✅ Done | 10 validator rules verified with field paths & suggested fixes |
| **M2** | Context, sandboxed expressions, executor, parallel scheduler, SQLite repository | ✅ Done | Topological scheduling, retry backoff with jitter, crash-resume |
| **M3** | Standard steps (`call`, `transform`, `foreach`, `join`, `db_upsert`), HTTP connector | ✅ Done | Golden workflow runs end-to-end against mock HTTP |
| **M4** | **Nexacro XML Connector**: XML codec, session TTL, `allowed_services`, in-body errors | ✅ Done | Contract tests on real XML fixtures (`pytest -m contract`), auto re-login |
| **M5** | Public REST API v1, API-key auth, read models, `Idempotency-Key`, OpenAPI spec | ✅ Done | Trigger runs, poll status, cursor-paginated datasets, RFC 7807 problem details |
| **M6** | Cron triggers, outbound webhooks (HMAC-SHA256 `X-Signature`), Dead-Letter Queue | ✅ Done | APScheduler cron jobs, signed webhooks with retry backoff & DLQ |
| **M7** | `approval` step, Prometheus `/metrics`, CLI `run`/`replay`, Python SDK | ✅ Done | Full CLI suite, Python SDK client, metrics registry & tests |

---

## 💻 Getting Started

### Local Setup (Virtual Environment)
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

### Running Checks & Tests
```bash
# Lint and format
ruff check .
ruff format .

# Type checking
mypy

# Run full test suite
pytest

# Run only Nexacro EMS contract tests
pytest -m contract
```

### Docker
```bash
# Build production image
docker build -t opsflow:latest .

# Run API server container
docker run --rm -p 8000:8000 opsflow:latest
```

---

## 🛠️ CLI Usage (`opsflow`)

The `opsflow` CLI provides full control over validation, execution, and replay:

```bash
# Validate workflow YAML against schema and 10 semantic rules
opsflow validate workflows/equipment_status_lookup.yml

# List available workflows in a directory
opsflow list --dir workflows/

# Execute a workflow run locally
opsflow run workflows/equipment_status_lookup.yml --inputs '{"equipment_id": "EQP-01"}'

# Replay an interrupted or failed run from database
opsflow replay run_01H12345 --db sqlite+aiosqlite:///opsflow.db

# Launch the REST API server
opsflow api --host 0.0.0.0 --port 8000
```

---

## 🌐 Public REST API v1

Opsflow exposes a clean REST API v1 for consumers (OpenAPI specification committed at [`openapi/openapi.yaml`](openapi/openapi.yaml)):

- `GET /health` - Health check and uptime.
- `GET /metrics` - Prometheus metrics exposition.
- `GET /api/v1/workflows` - List registered workflows.
- `POST /api/v1/workflows/{name}/runs` - Trigger a workflow run (supports `Idempotency-Key` and synchronous wait via `?wait=<seconds>`).
- `GET /api/v1/runs/{id}` - Inspect run status, step progress, and outputs.
- `GET /api/v1/datasets/{name}` - Query published read-model datasets with cursor pagination (`?limit=50&cursor=...`).
- `GET /api/v1/datasets/{name}/schema` - Inferred dataset column types.
- `POST /api/v1/webhooks/subscriptions` - Register consumer webhook endpoints.

---

## 📦 Python SDK Client

External Python services can interact directly with the Opsflow API using the async SDK:

```python
import asyncio
from opsflow.sdk import OpsflowClient

async def main():
    async with OpsflowClient(base_url="http://localhost:8000", api_key="secret_token") as client:
        # Trigger workflow with idempotency protection
        run = await client.trigger_run(
            workflow_name="equipment-status-lookup",
            inputs={"equipment_id": "EQP-01"},
            idempotency_key="request-uuid-001",
            wait=10,
        )
        print(f"Run finished: {run['status']}")

        # Query published datasets
        dataset = await client.query_dataset("equipment_status", limit=10)
        for item in dataset["items"]:
            print(f"Equipment: {item['equipment_id']} -> {item['status']}")

asyncio.run(main())
```

---

## 📊 Prometheus Metrics

The `/metrics` endpoint exposes metrics ready for Prometheus scraping:
- `opsflow_runs_total{status="...", workflow="..."}`
- `opsflow_run_duration_seconds_sum / count`
- `opsflow_step_executions_total{status="...", step_id="...", workflow="..."}`
- `opsflow_failures_total{kind="...", step_id="...", workflow="..."}`
- `opsflow_connector_requests_total{connector="...", status="..."}`
- `opsflow_connector_latency_seconds_sum / count`
- `opsflow_session_relogins_total{connector="..."}`