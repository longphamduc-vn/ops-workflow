# AGENTS.md — Guide for AI agents building `ops-workflow`

> This document is for AI coding agents (Claude Code, Codex, Cursor, etc.) working in this repository.
> Read it fully before writing code. If it conflicts with a direct instruction from the user, follow the user and point out the conflict.

---

## 1. Context and goals

- The organization runs a legacy **EMS** whose UI is built on **Nexacro**. **We have no database access and cannot modify the EMS.**
- Looking up a single piece of information in the EMS requires many manual steps and data transformations.
- Goal: build a **parallel operations system** whose core is a **YAML-configured Workflow Engine**. The engine calls the EMS from the outside (replaying its HTTP requests), transforms the data, stores it in our own database, and raises alerts and reports.
- The engine must be **generic**: other systems (REST, SQL, files, SOAP, ...) are added later by writing a new connector, **without changing the core**.
- This is a **standalone, independently deployable service**. Other projects use it through a versioned API (see section 8), never by importing its internals or reading its database.

### Out of scope (do NOT build)

- Do not modify or write data back into the EMS. For now the EMS is **read-only**.
- Do not try to reach the EMS database.
- Do not build RPA / UI automation unless the user explicitly asks.
- Do not build a rich web UI in early milestones. CLI + REST API is enough.

---

## 2. Invariants (violating any of these is a bug)

1. **`core/` must not import anything specific to an external system** (Nexacro, CRM, ...). All system-specific code lives in `connectors/`.
2. **Every connector returns a normalized JSON result** with one shared shape (section 6.3). Steps never know where data came from.
3. **Never write secrets** (passwords, tokens, cookies) into YAML, code, logs, test fixtures, or error messages. Reference them only as `${secrets.NAME}`.
4. **Never use `eval`, `exec`, `pickle`, or `subprocess` on strings that come from YAML.** Expressions run in a sandbox (section 7).
5. **The EMS is read-only.** The Nexacro connector must enforce an `allowed_services` allow-list and reject any other service.
6. **Protect the legacy server:** always apply `max_concurrent` and `min_interval` per connector. No unbounded call loops.
7. **Validate before running.** An invalid workflow must be rejected at `validate` time, not fail midway through a run.
8. **Retried steps must be idempotent**, or be marked `idempotent: false` (in which case they are never auto-retried).
9. **Do not guess Nexacro wire formats.** SSV/XML/JSON codecs must be written against **real fixtures** supplied by the user (with sensitive data masked). If no fixtures exist, stop and ask.
10. **Other projects never touch our internal tables.** They integrate only through the public API, webhooks/events, or published read views (section 8).

---

## 3. Tech stack

| Concern | Choice |
|---|---|
| Language | Python ≥ 3.11 |
| Models / validation | Pydantic v2 + JSON Schema |
| HTTP client | `httpx` (async) |
| API | FastAPI (OpenAPI generated and committed) |
| Scheduling | APScheduler (or equivalent) for cron triggers |
| State storage | SQLAlchemy 2.x + Alembic; SQLite for dev, PostgreSQL for production |
| Data transformation | `jmespath` (default), `jq` optional |
| Condition expressions | Safe evaluator (e.g. `simpleeval` or CEL). **No `eval`.** |
| Tests | `pytest`, `pytest-asyncio`, `respx` (HTTP mocking) |
| Quality | `ruff`, `mypy --strict` for `core/` |

If you need a library outside this list, justify it in the change description and prefer popular, maintained libraries.

---

## 4. Project layout

```
ops-workflow/
├── pyproject.toml
├── AGENTS.md                      # this file
├── .env.example                   # sample env vars; NEVER commit a real .env
├── Dockerfile
├── config/
│   ├── engine.yml                 # DB, logging, worker count, API auth
│   └── connectors/                # shared connections (ems.yml, crm.yml)
├── workflows/                     # business workflows (*.yml)
├── schemas/
│   └── workflow.schema.json
├── openapi/
│   └── openapi.yaml               # committed public API contract
├── src/opsflow/
│   ├── cli.py                     # validate | run | list | replay
│   ├── api/                       # FastAPI: runs, workflows, data, webhooks
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── auth.py                # API keys / OAuth2 client credentials
│   │   └── schemas.py             # public request/response models (versioned)
│   ├── core/                      # CORE — no external-system dependencies
│   │   ├── parser.py
│   │   ├── validator.py
│   │   ├── dag.py
│   │   ├── scheduler.py
│   │   ├── executor.py
│   │   ├── context.py
│   │   ├── expression.py
│   │   └── errors.py
│   ├── steps/                     # base, call, transform, foreach, join,
│   │                              # db_upsert, notify, approval
│   ├── connectors/
│   │   ├── base.py
│   │   ├── registry.py
│   │   ├── http.py
│   │   ├── sql.py
│   │   └── nexacro/
│   │       ├── connector.py
│   │       ├── session.py
│   │       ├── codec_ssv.py
│   │       ├── codec_xml.py
│   │       └── codec_json.py
│   ├── triggers/                  # cron, webhook, manual, event
│   ├── publishers/                # outbound webhooks, message-queue publishing
│   ├── store/                     # models.py, repository.py (internal tables)
│   ├── read_models/               # published views/tables for consumers
│   └── secrets/provider.py        # env | encrypted file | Vault
├── clients/
│   └── python/                    # optional thin SDK generated from OpenAPI
└── tests/
    ├── unit/
    ├── contract/fixtures/         # real (masked) EMS requests/responses
    ├── api/                       # public API contract tests
    └── workflows/                 # run workflows against fake connectors
```

Dependency direction (one way only): `api, cli, triggers → core → (steps, connectors via interfaces)`. `core` knows only the `Step` and `Connector` **interfaces**, never concrete classes.

---

## 5. Workflow YAML specification

### 5.1. Top-level fields

| Field | Required | Meaning |
|---|---|---|
| `version` | Yes | Version of the file **schema** (currently `"1.0"`), not of the workflow |
| `name` | Yes | Unique identifier, `[a-z0-9-]+` |
| `description` | No | Human-readable description |
| `connectors` | No | Declares or references external connections |
| `trigger` | Yes | What starts a run |
| `inputs` | No | Run parameters |
| `env` | No | Non-secret variables |
| `defaults` | No | Defaults for every step (`timeout`, `retry`) |
| `steps` | Yes | List of steps (≥ 1) |
| `on_error` | No | Policy when a step fails |
| `publish` | No | What to expose to consumers on completion (see 5.9) |

### 5.2. `connectors`

```yaml
connectors:
  ems:
    type: nexacro              # matches a registered plugin
    base_url: https://ems.company.local
    format: ssv                # ssv | xml | json (Nexacro only)
    allowed_services:          # allow-list (read-only access)
      - /eqp/selectEqpList.do
      - /eqp/selectEqpDetail.do
    auth:
      type: form_login         # form_login | bearer | basic | api_key
      login_url: /login.do
      username: ${secrets.EMS_USER}
      password: ${secrets.EMS_PASS}
      session_ttl: 20m
    limits:
      max_concurrent: 3
      min_interval: 200ms
```

### 5.3. `trigger`

| Field | Meaning |
|---|---|
| `type` | `manual` \| `cron` \| `webhook` \| `event` |
| `cron` | Cron expression (when `type: cron`) |
| `timezone` | Defaults to `Asia/Ho_Chi_Minh` |
| `path` | Webhook path (when `type: webhook`) |

### 5.4. `inputs`

```yaml
inputs:
  site_code: { type: string, required: true, description: "Site code" }
```
`type` ∈ `string | number | boolean | list | object`. Optional `default`.

### 5.5. `defaults` and `retry`

```yaml
defaults:
  timeout: 30s
  retry:
    max_attempts: 3            # including the first attempt
    backoff: exponential       # fixed | exponential
    delay: 2s
    on: [timeout, network]     # retry infrastructure errors only, NOT business errors
```
Duration units: `ms`, `s`, `m`, `h`.

### 5.6. Common step fields (`steps[]`)

| Field | Required | Meaning |
|---|---|---|
| `id` | Yes | Unique within the workflow, `[a-z][a-z0-9_]*` |
| `type` | Yes | `call` \| `transform` \| `foreach` \| `join` \| `db_upsert` \| `notify` \| `approval` |
| `needs` | No | Step ids that must finish first. Empty = runs immediately. Independent steps run in parallel |
| `if` | No | Condition on **data**. False → `skipped` |
| `run_if` | No | Condition on the **status** of steps in `needs` |
| `with` | Usually | Step-type-specific parameters |
| `outputs` | No | Select/name the step's outputs |
| `timeout`, `retry` | No | Override `defaults` |
| `continue_on_error` | No | `true`: a failure does not fail the workflow |
| `idempotent` | No | Default `true`; `false` disables auto-retry |

`run_if` values:

| Value | Runs when |
|---|---|
| `all_success` (default) | All steps in `needs` succeeded |
| `all_success_or_skipped` | Succeeded or were skipped |
| `failure` | At least one step in `needs` failed |
| `always` | Always |

### 5.7. `with` by step type

| Step | Main fields |
|---|---|
| `call` | `connector`, `operation`, `params`; Nexacro also `in_datasets`, `out_datasets` |
| `transform` | `engine` (`jmespath`\|`jq`\|`python_safe`), `input`, `expression`, `mappings` |
| `foreach` | `items`, `concurrency`, `step` (child step using `${item}`), `on_item_error` (`fail`\|`skip`) |
| `join` | `left`, `right`, `on`, `how` (`inner`\|`left`\|`outer`) |
| `db_upsert` | `table`, `key`, `rows` |
| `notify` | `channel`, `message` |
| `approval` | `assignees`, `timeout`, `on_timeout` (`reject`\|`approve`) |

### 5.8. `on_error.strategy`

`stop` (halt everything) \| `continue` (keep running branches that do not depend on the failed step) \| `rollback` (run `compensate` steps; only meaningful if defined).

### 5.9. `publish` (exposing results to other projects)

```yaml
publish:
  dataset: equipment_status          # name of the read model consumers can query
  source: "${steps.normalize.outputs}"
  event: equipment.status.updated    # emitted on success (webhook / queue)
  event_if: "any(steps.normalize.outputs, status == 'fault')"
```
- `dataset` maps to a read model (table or view) owned by this service and exposed via the API.
- `event` is delivered to subscribers (section 8.4).

### 5.10. Expressions `${...}`

| Expression | Source |
|---|---|
| `${inputs.x}` | Run input |
| `${env.X}` | Workflow `env` variable |
| `${secrets.X}` | Secret store (always masked in logs) |
| `${steps.<id>.outputs...}` | Output of another step |
| `${item}`, `${item.field}` | Current element inside `foreach` |
| `${run.id}`, `${run.started_at}` | Current run metadata |

### 5.11. Golden example (use as a reference test)

```yaml
version: "1.0"
name: equipment-status-lookup
description: Look up equipment status from the EMS and aggregate it

connectors:
  ems:
    type: nexacro
    base_url: https://ems.company.local
    format: ssv
    allowed_services: [/eqp/selectEqpList.do, /eqp/selectEqpDetail.do]
    auth:
      type: form_login
      login_url: /login.do
      username: ${secrets.EMS_USER}
      password: ${secrets.EMS_PASS}
      session_ttl: 20m
    limits: { max_concurrent: 3, min_interval: 200ms }

trigger: { type: cron, cron: "*/15 * * * *", timezone: Asia/Ho_Chi_Minh }

inputs:
  site_code: { type: string, required: true }

defaults:
  timeout: 30s
  retry: { max_attempts: 3, backoff: exponential, delay: 2s, on: [timeout, network] }

steps:
  - id: list_equipment
    type: call
    with:
      connector: ems
      operation: /eqp/selectEqpList.do
      in_datasets:
        dsCond: [{ SITE_CD: "${inputs.site_code}", USE_YN: "Y" }]
      out_datasets: [dsList]
    outputs:
      items: "$.dsList"

  - id: get_detail
    type: foreach
    needs: [list_equipment]
    with:
      items: "${steps.list_equipment.outputs.items}"
      concurrency: 3
      on_item_error: skip
      step:
        type: call
        with:
          connector: ems
          operation: /eqp/selectEqpDetail.do
          in_datasets:
            dsCond: [{ EQP_ID: "${item.EQP_ID}" }]
          out_datasets: [dsDetail]

  - id: normalize
    type: transform
    needs: [get_detail]
    with:
      engine: jmespath
      input: "${steps.get_detail.outputs}"
      expression: |
        [].{equipment_id: dsDetail[0].EQP_ID, name: dsDetail[0].EQP_NM,
            status: dsDetail[0].STATUS_CD, updated_at: dsDetail[0].UPD_DT}
      mappings:
        status: { "01": running, "02": stopped, "99": fault }

  - id: save
    type: db_upsert
    needs: [normalize]
    with:
      table: equipment_status
      key: [equipment_id]
      rows: "${steps.normalize.outputs}"

  - id: alert_fault
    type: notify
    needs: [normalize]
    if: "any(steps.normalize.outputs, status == 'fault')"
    with:
      channel: "#ops-alerts"
      message: "Faulty equipment detected at ${inputs.site_code}"

on_error: { strategy: continue }

publish:
  dataset: equipment_status
  source: "${steps.normalize.outputs}"
  event: equipment.status.updated
```

---

## 6. Required interfaces

### 6.1. Connector

```python
class Connector(Protocol):
    name: str

    async def authenticate(self) -> None: ...
    async def call(self, operation: str, params: dict) -> Result: ...
    async def health_check(self) -> bool: ...
    async def close(self) -> None: ...
```

### 6.2. Step

```python
class Step(Protocol):
    type: ClassVar[str]

    async def execute(self, config: dict, ctx: Context) -> Result: ...
```

Steps and connectors register through `registry` (decorator or entry point). Adding a new type must **not** require editing `core/`.

### 6.3. Standard result shape

```python
@dataclass
class Result:
    ok: bool
    data: Any = None  # JSON-serializable
    error: ErrorInfo | None = None
    meta: dict = field(default_factory=dict)  # latency_ms, attempts, ...


@dataclass
class ErrorInfo:
    kind: Literal["timeout", "network", "auth", "business", "validation", "internal"]
    code: str | None  # original external error code (e.g. Nexacro ErrorCode)
    message: str  # secrets already masked
    retryable: bool
```

**Nexacro note:** the server often returns HTTP 200 with `ErrorCode`/`ErrorMsg` inside the body. The connector **must** inspect the body and convert such cases to `Result(ok=False, ...)`; do not rely on the HTTP status alone.

---

## 7. Expressions and security

- `${...}` may only access the namespaces in 5.10. No arbitrary function calls, no `__dunder__` attribute access, no imports.
- `if` conditions run in a safe evaluator with an allow-listed function set (`any`, `all`, `len`, `contains`, comparisons, boolean logic).
- Secrets come from `secrets/provider.py` and are **automatically masked** in all logs, errors, and persisted outputs.
- Use structured JSON logs including `run_id`, `step_id`, `attempt`. Do not log full response bodies that may contain sensitive data; provide an opt-in masked debug mode.
- The public API requires authentication (section 8.2). Never expose the engine's admin or secret-management endpoints publicly.

---

## 8. Integration with other projects (standalone service)

`ops-workflow` is a **separate service with its own repository, database, deployment, and release cycle**. Other projects (dashboards, ticketing, reporting tools, new apps) are *consumers*. They integrate through exactly four channels, listed from most to least preferred.

### 8.1. Integration channels

| Channel | Use when the consumer... | Notes |
|---|---|---|
| **REST API** (OpenAPI) | triggers runs, reads run status, queries published datasets | Default for everything |
| **Outbound webhooks / events** | needs to react when something happens | Push model; avoids polling |
| **Read views** (optional) | needs bulk SQL access for BI/reporting | Read-only DB role limited to `read_models` schema |
| **Thin SDK / CLI** | is written in Python or wants convenience | Generated from OpenAPI; contains no business logic |

**Forbidden:** importing `opsflow` as a library inside another service to run workflows in-process; reading or writing internal tables (`runs`, `step_runs`, ...); calling the legacy EMS directly in parallel with this service (it would bypass rate limits and session handling).

### 8.2. Authentication and authorization

- Each consumer gets its own **API key or OAuth2 client credentials** with scoped permissions (e.g. `runs:trigger`, `runs:read`, `datasets:read`, `workflows:read`).
- Keys are stored hashed; rotation and revocation must be supported.
- Every request is attributed to a consumer in the audit log.
- Rate-limit per consumer.

### 8.3. Public REST API (v1)

All paths are prefixed with `/api/v1`. Breaking changes require `/api/v2`; additive changes are allowed within v1.

| Method & path | Purpose |
|---|---|
| `GET /workflows` | List workflows and their input schemas |
| `GET /workflows/{name}` | Workflow metadata (not secrets) |
| `POST /workflows/{name}/runs` | Start a run. Body: `{inputs, idempotency_key?}`. Returns **202** + `run_id` |
| `GET /runs/{run_id}` | Run status, timestamps, summary |
| `GET /runs/{run_id}/steps` | Per-step status and masked logs |
| `GET /runs/{run_id}/result` | Final outputs (only fields declared in `publish`) |
| `POST /runs/{run_id}/cancel` | Cancel a running run |
| `GET /datasets/{dataset}` | Query a published dataset (filter, sort, **cursor pagination**) |
| `GET /datasets/{dataset}/schema` | Column names and types |
| `POST /webhooks/subscriptions` | Register a webhook subscription |
| `GET /health`, `GET /ready` | Liveness / readiness (unauthenticated) |

Conventions:
- **Asynchronous by default:** running a workflow returns 202 immediately; the consumer polls `GET /runs/{id}` or subscribes to events. Optionally support `?wait=<seconds>` for short workflows.
- **Idempotency:** `Idempotency-Key` header (or `idempotency_key` field) on `POST .../runs`. A repeated key returns the original run instead of starting a new one.
- **Errors:** RFC 7807 `application/problem+json` with a stable `code` field.
- **Pagination:** cursor-based, `limit` ≤ 1000.
- **Versioning and contract:** `openapi/openapi.yaml` is committed and checked in CI; contract tests in `tests/api/` fail on unintended breaking changes.
- **Correlation:** accept and propagate `X-Request-Id`.

### 8.4. Events and webhooks

- Event types follow `<domain>.<entity>.<action>` (e.g. `equipment.status.updated`, `run.failed`).
- Envelope:

```json
{
  "id": "evt_01H...",
  "type": "equipment.status.updated",
  "occurred_at": "2026-10-28T08:00:00Z",
  "run_id": "run_01H...",
  "workflow": "equipment-status-lookup",
  "data": { }
}
```

- Delivery is **at-least-once**; consumers must deduplicate by `id`.
- Sign each webhook (`X-Signature: HMAC-SHA256(secret, body)`) so consumers can verify authenticity.
- Retry with exponential backoff; after repeated failures, mark the subscription degraded and keep events in a dead-letter list.
- Optional: publish the same events to a message broker (Kafka/RabbitMQ/Redis Streams) via `publishers/`; the API/webhook contract stays the source of truth.

### 8.5. Read models (published data)

- Workflows write into **internal tables**; `publish.dataset` exposes a **stable read model** (table or view in a separate `read_models` schema). Consumers depend on the read model's schema, not on internal tables, so internals can change freely.
- Read model schema changes follow the same versioning rule as the API: additive changes are fine, breaking changes require a new dataset version (`equipment_status_v2`).
- Each row should carry `source_run_id` and `synced_at` so consumers can judge data freshness. The data is a **mirror of the EMS at sync time**, not real-time truth; document this in the API.

### 8.6. Deployment expectations

- Ship as a container (`Dockerfile`), configured only through environment variables and `config/`.
- Separate processes/roles from one image: `api`, `worker` (executes runs), `scheduler` (cron). They may run as one process in development.
- Own database; run migrations with Alembic at deploy time.
- Expose Prometheus-style metrics (run counts, durations, failures, EMS latency, session re-logins).

---

## 9. Engine behavior

### 9.1. State machine

```
Run:   pending → running → success | failed | cancelled
Step:  pending → running → success | failed | skipped
```

- Persist every state change **before** continuing so a crashed run can resume.
- `replay`: re-run an old run with the same inputs; optionally restart from the failed step.

### 9.2. Scheduling

1. Build the DAG from `needs` and sort topologically.
2. A step is queued once all its dependencies finish; independent steps run in parallel (bounded by worker count and connector `limits`).
3. For each step: evaluate `run_if` → `if` → execute with `timeout` + `retry` → record `outputs`.
4. Apply `on_error` (and `continue_on_error`) when a step fails.
5. On run success, evaluate `publish` and emit events.

### 9.3. Retry

- Retry only when `ErrorInfo.retryable` is true **and** `kind` is in `retry.on`.
- `exponential` backoff: `delay * 2^(n-1)` with ±10% jitter and a cap (e.g. 60s).
- `auth` errors: the connector re-authenticates **once** automatically before the error counts as a failure.

---

## 10. Validator rules (all must be implemented)

1. Step `id`s are unique.
2. Every `needs` entry refers to an existing `id`.
3. No dependency cycles (report the cycle path).
4. Every referenced `connector:` is declared.
5. `${steps.x...}` references only steps in the current step's `needs` chain (direct or transitive).
6. No hard-coded secrets (only `${secrets.*}`); scan fields like `password`, `token`, `api_key`.
7. Nexacro: every `operation` must be in `allowed_services`.
8. `foreach`: `concurrency` ≥ 1 and not above the connector's `max_concurrent`.
9. `publish.dataset` names are unique across all workflows (or explicitly shared) and valid identifiers.
10. Error messages include the **field path** (e.g. `steps[2].with.items`) and a suggested fix.

---

## 11. Roadmap and acceptance criteria

Work **sequentially**. Do not start a milestone until the previous one has green tests. After each milestone, summarize what was done and what remains open.

| M | Scope | Acceptance |
|---|---|---|
| **M0** | Project skeleton, `pyproject.toml`, lint/type/test tooling, basic CI, Dockerfile | `pytest`, `ruff`, `mypy` pass; image builds |
| **M1** | `parser`, `validator`, `dag`, JSON Schema, `cli validate` | Tests for every rule in section 10; golden example valid; invalid files rejected with field paths |
| **M2** | `context`, `expression`, `executor` (retry/timeout/if/run_if), parallel `scheduler`, store | Workflows against fake connectors run in correct topological order; retry/skip/failure behave correctly; crash-resume simulated |
| **M3** | Steps `call`, `transform`, `foreach`, `join`, `db_upsert`; `http` connector | Golden workflow runs end-to-end against mocked HTTP (`respx`) |
| **M4** | **Nexacro connector**: session, codecs from real fixtures, rate limiting, in-body error detection | Contract tests on real fixtures; auto re-login on expiry; rejects services outside `allowed_services` |
| **M5** | Public API v1 (section 8.3), API-key auth, `publish` + read models, committed OpenAPI, API contract tests | Consumer can trigger a run, poll it, and read a dataset using only the API; idempotency-key behavior tested |
| **M6** | Cron/webhook/manual triggers, outbound webhooks (signed, retried), `notify` step | Scheduled runs fire; webhook delivery is at-least-once and signed; dead-letter handling tested |
| **M7** | `approval`, metrics, `replay`, optional Python SDK, docs | As requested by the user |

> **M4 is blocked until real fixtures exist.** If missing, stop and ask the user for:
> the wire format (SSV/XML/JSON), one masked request and response sample, the login procedure, and the Nexacro version.

---

## 12. Coding conventions

- Full type hints; `core/` passes `mypy --strict`.
- I/O functions are `async`; never block the event loop.
- Every module has a short docstring stating its responsibility. No comments that merely restate the code.
- Use dedicated exception classes from `core/errors.py`; never `except Exception: pass`.
- No hard-coded URLs, service names, or business status codes in `core/`.
- Small, well-described commits. Never commit `.env`, fixtures containing real data, or logs containing secrets.
- Public API models live in `api/schemas.py` and are **separate from internal DB models**, so internals can change without breaking consumers.

## 13. Testing conventions

- **Unit:** pure logic (DAG, validator, expressions, retry).
- **Workflow tests:** run YAML workflows against fake connectors; assert order, statuses, outputs.
- **Contract tests (EMS):** use real fixtures to detect when the EMS response structure changes. Runnable separately (`pytest -m contract`).
- **API contract tests:** verify responses against `openapi/openapi.yaml` and fail on breaking changes.
- Every bug fix ships with a regression test.
- Tests must never call the real network or the real EMS.

---

## 14. When to stop and ask the user

- Real Nexacro fixtures/format are missing (milestone M4).
- A call is needed to an EMS service not in `allowed_services`, or one that looks like it **writes/updates/deletes** data.
- A request would violate section 2 (e.g. embedding secrets in YAML, using `eval`, letting a consumer read internal tables).
- A large new dependency or an architecture change is needed.
- Unclear target database (SQLite/PostgreSQL), notification channel (mail/Slack/Zalo), secret management, or consumer auth method (API key vs OAuth2).
- Unsure whether a change breaks existing workflow YAML or the public API/read-model contract.

## 15. Definition of done (every change)

- [ ] Code runs, relevant tests pass, `ruff` and `mypy` pass.
- [ ] Section 2 invariants respected; `core/` imports no concrete connector.
- [ ] No secrets leaked in code, logs, or fixtures.
- [ ] Tests cover new behavior, including errors and edge cases.
- [ ] Public API changes are reflected in `openapi/openapi.yaml` and are backward compatible within the same version.
- [ ] Docs or example YAML updated if the spec changed.
- [ ] Short summary: what was done, assumptions made, what remains.
