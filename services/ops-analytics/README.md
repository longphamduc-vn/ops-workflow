# ops-analytics — Component 4: Analytics & BI Reporting

> **Component 4**: Historical business intelligence, reliability metrics, and operational analytics for `ops-platform`.

## Responsibilities
- Aggregate long-term operational health and equipment status trends.
- Executive reporting and compliance audit logs.
- Predictive performance and anomaly detection.

## Integration with Component 1
- Queries published read-model datasets via Component 1's cursor-paginated REST endpoints (`/api/v1/datasets/*`).
- Accesses read-only database views on the `read_models` schema where bulk analytical extraction is required.
