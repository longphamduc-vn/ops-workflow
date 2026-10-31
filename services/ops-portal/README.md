# ops-portal — Component 2: Operations Web Portal

> **Component 2**: Web-based operator portal and management dashboard for the Operations Management System (`ops-platform`).

## Responsibilities
- Real-time visualization of workflow runs and DAG pipelines.
- Manual workflow trigger interface with input validation.
- Interactive operator approval console for paused workflows.
- Operational health and latency monitoring dashboards.

## Integration with Component 1
- Uses the Component 1 Public REST API (`http://ops-workflow:8000/api/v1`) or the Python/JS SDK.
- Authenticates using scoped API keys or OAuth2 client credentials.
