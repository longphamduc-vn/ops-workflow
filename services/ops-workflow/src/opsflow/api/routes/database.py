"""Database Inspection API routes for ops-portal database viewer."""

import json
import sqlite3
from pathlib import Path
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query

from opsflow.api.auth import AuthenticatedConsumer, require_scope

router = APIRouter(prefix="/api/v1/database", tags=["Database"])


def _get_db_path(db_name: str) -> Path:
    """Resolve sqlite database file path."""
    project_root = Path(__file__).resolve().parents[6]
    if db_name == "opsflow":
        candidates = [
            project_root / "opsflow.db",
            Path("opsflow.db").resolve(),
            Path("services/ops-workflow/opsflow.db").resolve(),
        ]
    elif db_name == "ems_sim":
        candidates = [
            project_root / "ems_simulation.db",
            Path("ems_simulation.db").resolve(),
            Path("services/ems-simulation/ems_simulation.db").resolve(),
        ]
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported database '{db_name}'")

    for p in candidates:
        if p.exists():
            return p
    return candidates[0]


TABLE_DESCRIPTIONS = {
    ("opsflow", "runs"): "Workflow execution runs, execution timestamps, trigger parameters, and final output payloads",
    ("opsflow", "step_runs"): "Per-step execution records, status, retries, latency, input bindings, and output datasets",
    ("opsflow", "read_model_records"): "Materialized read model datasets and tables published by successful workflow runs",
    ("ems_sim", "items"): "Legacy EMS Spare Parts master catalog (Item code, description, maker, model, UOM)",
    ("ems_sim", "inventories"): "Stock inventory records, onhand quantities, safety target stocks, and unit prices",
    ("ems_sim", "work_orders"): "Maintenance & repair work orders, WIP entity names, and status codes",
    ("ems_sim", "work_order_histories"): "Work order status change events and operational history",
    ("ems_sim", "api_execution_logs"): "Simulated Nexacro wire request/response payloads recorded by ems-simulation",
    ("ems_sim", "organizations"): "Operating manufacturing plants and site organization IDs",
    ("ems_sim", "users"): "EMS platform operator users and departments",
    ("ems_sim", "purchase_requests"): "Purchase requisition records dispatched to ERP/Procurement",
}


@router.get("/tables", summary="List database tables and metadata across opsflow and ems-sim")
async def list_tables(
    _: Annotated[AuthenticatedConsumer, Depends(require_scope("runs:read"))],
) -> list[dict[str, Any]]:
    """Inspect and list all tables across opsflow and ems-simulation SQLite databases."""
    result = []

    for db_name in ["opsflow", "ems_sim"]:
        db_path = _get_db_path(db_name)
        if not db_path.exists():
            continue

        try:
            conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
            tables = [row["name"] for row in cursor.fetchall()]

            for table in tables:
                # Column info
                cursor.execute(f"PRAGMA table_info('{table}');")
                columns = [col["name"] for col in cursor.fetchall()]

                # Row count
                try:
                    cursor.execute(f"SELECT COUNT(*) AS cnt FROM '{table}';")
                    count_row = cursor.fetchone()
                    row_count = count_row["cnt"] if count_row else 0
                except Exception:
                    row_count = 0

                desc = TABLE_DESCRIPTIONS.get(
                    (db_name, table),
                    f"{'Opsflow' if db_name == 'opsflow' else 'EMS'} {table} table",
                )

                result.append(
                    {
                        "db": db_name,
                        "table": table,
                        "description": desc,
                        "row_count": row_count,
                        "columns": columns,
                    }
                )

            conn.close()
        except Exception:
            continue

    return result


@router.get("/query", summary="Query table data with pagination and search")
async def query_table(
    _: Annotated[AuthenticatedConsumer, Depends(require_scope("runs:read"))],
    db: str = Query("opsflow", description="Database name: opsflow or ems_sim"),
    table: str = Query(..., description="Table name to inspect"),
    limit: int = Query(50, ge=1, le=500, description="Items limit"),
    offset: int = Query(0, ge=0, description="Items offset"),
    search: str | None = Query(None, description="Search term filter"),
    order_by: str | None = Query(None, description="Column to sort by"),
    order_dir: str = Query("desc", description="Sort direction: asc or desc"),
) -> dict[str, Any]:
    """Query rows from a table with pagination, column search, and JSON parsing."""
    db_path = _get_db_path(db)
    if not db_path.exists():
        raise HTTPException(status_code=404, detail=f"Database '{db}' file not found")

    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Validate table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?;", (table,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail=f"Table '{table}' does not exist in database '{db}'")

    # Get column metadata
    cursor.execute(f"PRAGMA table_info('{table}');")
    cols_meta = cursor.fetchall()
    valid_cols = [c["name"] for c in cols_meta]

    # Build query
    where_clauses = []
    params: list[Any] = []

    if search and search.strip():
        term = f"%{search.strip()}%"
        sub = []
        for col in valid_cols:
            sub.append(f"CAST(\"{col}\" AS TEXT) LIKE ?")
            params.append(term)
        if sub:
            where_clauses.append(f"({' OR '.join(sub)})")

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

    # Count total
    count_sql = f"SELECT COUNT(*) AS total FROM \"{table}\" {where_sql};"
    cursor.execute(count_sql, params)
    total = cursor.fetchone()["total"]

    # Order by
    if order_by and order_by in valid_cols:
        direction = "DESC" if order_dir.lower() == "desc" else "ASC"
        order_sql = f"ORDER BY \"{order_by}\" {direction}"
    elif "created_at" in valid_cols:
        order_sql = "ORDER BY \"created_at\" DESC"
    elif "id" in valid_cols:
        order_sql = "ORDER BY \"id\" DESC"
    else:
        order_sql = ""

    # Query rows
    query_sql = f"SELECT * FROM \"{table}\" {where_sql} {order_sql} LIMIT ? OFFSET ?;"
    cursor.execute(query_sql, params + [limit, offset])
    rows = cursor.fetchall()

    items = []
    for r in rows:
        row_dict = {}
        for col in valid_cols:
            val = r[col]
            # Try parsing JSON string if applicable
            if isinstance(val, str) and (
                (val.startswith("{") and val.endswith("}")) or (val.startswith("[") and val.endswith("]"))
            ):
                try:
                    val = json.loads(val)
                except Exception:
                    pass
            row_dict[col] = val
        items.append(row_dict)

    conn.close()

    return {
        "db": db,
        "table": table,
        "columns": valid_cols,
        "rows": items,
        "total": total,
        "limit": limit,
        "offset": offset,
    }
