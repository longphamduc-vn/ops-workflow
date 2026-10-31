# ops-incident — Component 3: Incident Management & Ticketing

> **Component 3**: Incident response, automated ticketing, and alert escalation service for `ops-platform`.

## Responsibilities
- Automated triage and fault classification upon equipment or workflow failures.
- Incident lifecycle management, SLA tracking, and ticket generation.
- On-call notification and paging dispatch.

## Integration with Component 1
- Subscribes to HMAC-SHA256 signed webhook events from Component 1 (`ops-workflow`).
- Verifies incoming payloads with `X-Signature` headers.
- Queries workflow execution summaries via `/api/v1/runs/{id}` when investigating incident root causes.
