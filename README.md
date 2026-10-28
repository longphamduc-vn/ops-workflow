# ops-workflow (`opsflow`)

Generic YAML-configured workflow engine for operational automations and legacy system integration.

## Architecture & Guarantees
- **Invariants**: Core has no knowledge of external systems (Nexacro, CRM).
- **Normalized Result Shape**: All connectors return `Result(ok=..., data=..., error=...)`.
- **Safe Evaluation**: Sandboxed expression evaluation, no `eval`.
- **Read-only legacy access**: Explicit `allowed_services` whitelisting and concurrency limits.

## Getting Started

### Local Setup (Virtual Environment)
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

### Running Tests and Linting
```bash
ruff check .
mypy
pytest
```

### Docker
```bash
docker build -t opsflow:latest .
docker run --rm -p 8000:8000 opsflow:latest
```
