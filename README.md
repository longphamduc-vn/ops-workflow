# ops-workflow (`opsflow`)

Generic YAML-configured workflow engine for operational automations, legacy enterprise integration, and resilient task orchestration.

Built according to the roadmap and specifications in [`AGENTS.md`](AGENTS.md).

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