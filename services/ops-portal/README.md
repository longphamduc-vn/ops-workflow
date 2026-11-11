# ops-portal — Component 2: Operations Web Portal & Debug Console

> **Operations Management System (Component 2)**: The dedicated observability, inspection, and debug console for `ops-workflow` (Component 1).

---

## 🏛️ Architecture & Role

Within the monorepo, `services/ops-portal` serves as the centralized operations interface for DevOps, integration engineers, and system administrators:

- **Real-time DAG Execution Flow**: Visual topological step diagram with dynamic status colors, latency, and attempt counters.
- **⚡ Wire Telemetry Debugger**: Inspects raw HTTP requests and responses, with syntax highlighting and automatic diagnostics for legacy Nexacro XML payloads and EMS session errors.
- **Console Log Streamer**: Integrated per-run execution log terminal with log-level filtering (INFO, WARN, ERROR, DEBUG), regex search, and auto-scroll.
- **Crash-Resume & Replay**: Re-runs interrupted or failed workflows via `POST /api/v1/runs/{id}/replay` without restarting completed upstream steps.
- **Dynamic Workflow Trigger Studio**: Dynamic schema form generation from workflow YAML `inputs` specifications with Idempotency-Key support.
- **Connectors & Legacy EMS Monitor**: Real-time session status, countdown TTL, rate limit tokens, and whitelisted services explorer.

---

## 💻 Getting Started (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The portal will launch at `http://localhost:5174` (with automated proxy to `ops-workflow` at `http://localhost:8000`).

### 3. Production Build
```bash
npm run build
npm run preview
```

