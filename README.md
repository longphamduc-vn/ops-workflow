# ops-platform — Operations Management Platform Monorepo

> **Operations Management System (`ops-platform`)**: A comprehensive enterprise platform orchestrating operations automation, legacy enterprise integration, incident management, and operational analytics.

---

## 🏛️ Platform Architecture & Services

The platform is organized as a unified monorepo containing multiple independently deployable components:

```mermaid
graph TD
    subgraph OperationsPlatform["ops-platform (Monorepo)"]
        subgraph Services["Services Directory"]
            C1["services/ops-workflow<br/><b>Component 1: Core Workflow & Integration Engine</b><br/>• DAG execution engine<br/>• Legacy Nexacro EMS & REST/SQL connectors<br/>• Read models & ETL datasets<br/>• REST API v1 & Signed Webhooks"]
            C2["services/ops-portal<br/><b>Component 2: Operations Web Portal</b><br/>• Operator dashboard & inspection UI<br/>• Manual trigger dispatch<br/>• Interactive approvals"]
            C3["services/ops-incident<br/><b>Component 3: Incident Management</b><br/>• Automated ticketing & SLA tracking<br/>• Fault escalation & on-call paging"]
            C4["services/ops-analytics<br/><b>Component 4: Analytics & BI</b><br/>• Historical BI reports & compliance<br/>• Operational trend analysis"]
        end
    end

    subgraph External["External Systems"]
        EMS["Legacy EMS (Nexacro XML/SSV)"]
        HTTP_APIS["Third-party Services & APIs"]
        DB_SYSTEMS["Enterprise Databases"]
    end

    C2 -->|"REST API / Python SDK"| C1
    C3 <--|"Signed Webhook Events"| C1
    C4 -->|"Query Read Models"| C1

    C1 -->|"Protected Connectors"| EMS
    C1 -->|"HTTP Connector"| HTTP_APIS
    C1 -->|"SQL Connector"| DB_SYSTEMS
```

---

## 📂 Repository Layout

```
ops-platform/
├── README.md                      # Platform overview (this file)
├── AGENTS.md                      # AI agent guide for the monorepo
├── docker-compose.yml             # Local orchestration for platform services
├── .github/
│   └── workflows/
│       └── ci.yml                 # Automated CI pipelines
└── services/
    ├── ops-workflow/              # [Component 1] Core Workflow & Integration Engine
    │   ├── Dockerfile
    │   ├── pyproject.toml
    │   ├── README.md
    │   ├── AGENTS.md
    │   ├── config/
    │   ├── openapi/
    │   ├── src/opsflow/
    │   ├── tests/
    │   └── workflows/
    ├── ops-portal/                # [Component 2] Operations Web Portal (Planned)
    │   └── README.md
    ├── ops-incident/              # [Component 3] Incident Management (Planned)
    │   └── README.md
    └── ops-analytics/             # [Component 4] Analytics & Reporting (Planned)
        └── README.md
```

---

## 🚀 Component Summary

| Directory | Component | Technology | Status | Role |
|---|---|---|:---:|---|
| [`services/ops-workflow/`](services/ops-workflow/) | **Component 1**: Core Workflow Engine | Python ≥ 3.11, FastAPI, SQLAlchemy, APScheduler | ✅ Active | Core automation backbone, EMS connector, data pipeline & API |
| [`services/ops-portal/`](services/ops-portal/) | **Component 2**: Web Portal & Dashboard | Next.js / React / TypeScript | 📋 Planned | Operator UI, workflow monitoring, approval controls |
| [`services/ops-incident/`](services/ops-incident/) | **Component 3**: Incident Management | Event-driven service | 📋 Planned | Webhook subscriber, ticket triage, alert notifications |
| [`services/ops-analytics/`](services/ops-analytics/) | **Component 4**: Analytics & Reporting | BI / Data analysis views | 📋 Planned | Operational metrics, compliance reporting |

---

## 💻 Getting Started with Docker Compose

Spin up the platform locally with docker compose:

```bash
# Build and start all active platform services
docker compose up -d

# Check logs
docker compose logs -f ops-workflow

# Access Component 1 API
curl http://localhost:8000/health
```

For individual service documentation, tests, and CLI instructions, see [`services/ops-workflow/README.md`](services/ops-workflow/README.md).
