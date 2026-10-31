# AGENTS.md — Guide for AI agents building `ops-platform`

> This document is for AI coding agents working in the `ops-platform` monorepo.
> Read it fully before writing code. If it conflicts with a direct instruction from the user, follow the user and point out the conflict.

---

## 1. Monorepo Architecture & Ecosystem

`ops-platform` is the unified Operations Management System monorepo containing multiple independently deployable components:

- **Component 1 (`services/ops-workflow/`)**: Core Workflow & Integration Engine (`opsflow`). Serves as the operational backbone, executing YAML DAG workflows, integrating legacy EMS systems (Nexacro XML/SSV), transforming data, managing read-model datasets, and emitting signed webhooks. Detailed instructions in [`services/ops-workflow/AGENTS.md`](services/ops-workflow/AGENTS.md).
- **Component 2 (`services/ops-portal/`)**: Operations Web Portal / Dashboard. Provides operator controls, pipeline visualizations, and manual approval dispatch.
- **Component 3 (`services/ops-incident/`)**: Incident Management & Ticketing. Subscribes to signed webhook events from Component 1 to manage SLA, alerts, and triage.
- **Component 4 (`services/ops-analytics/`)**: Analytics & BI Reporting. Reads published read-model datasets and views for business reporting.

---

## 2. Monorepo Invariants & Rules

1. **Service Independence**: Each service under `services/*` must maintain its own dependency manifest (e.g., `pyproject.toml`, `package.json`), Dockerfile, and isolated release lifecycle.
2. **Strict Component Boundaries**:
   - Other services **never** import `opsflow` internals as an in-process library.
   - Other services **never** query internal workflow engine tables (`runs`, `step_runs`, etc.) directly.
   - Integration with Component 1 must occur strictly through its versioned public interfaces:
     - Public REST API v1 (`/api/v1/*` documented in `openapi/openapi.yaml`)
     - Signed Webhook Events (HMAC-SHA256)
     - Published Read-Model Datasets (`/api/v1/datasets/*`)
     - Official Python SDK Client (`opsflow.sdk`)
3. **No Legacy EMS Direct Access**: Never attempt to access the legacy EMS database or write EMS integration logic outside of Component 1's connector registry.
4. **Secret Management**: Never commit secrets, passwords, or tokens. Use `${secrets.NAME}` references or environment variable interpolation.

---

## 3. Directory Structure

```
ops-platform/
├── README.md                      # Platform overview
├── AGENTS.md                      # Monorepo architecture rules (this file)
├── docker-compose.yml             # Orchestration for platform services
├── .github/                       # CI/CD workflows
└── services/
    ├── ops-workflow/              # Component 1: Core Workflow & Integration Engine
    ├── ops-portal/                # Component 2: Operations Web Portal (Planned)
    ├── ops-incident/              # Component 3: Incident Management (Planned)
    └── ops-analytics/             # Component 4: Analytics & BI Reporting (Planned)
```
