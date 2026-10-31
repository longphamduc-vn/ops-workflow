"""Execution audit logger for traceability and compatibility testing."""

import json
import logging
import uuid
from collections import deque
from datetime import datetime
from typing import Any

from ems_sim.config import settings
from ems_sim.database.repository import SimulationRepository
from ems_sim.models.entities import ApiExecutionLog

logger = logging.getLogger(__name__)


class ExecutionLogger:
    """Records every request, execution timing, scenario match, and response."""

    def __init__(self, max_memory_records: int = 200) -> None:
        self._memory_logs: deque[dict[str, Any]] = deque(maxlen=max_memory_records)

    async def log(
        self,
        api_id: str | None,
        method: str,
        path: str,
        status_code: int,
        duration_ms: float,
        request_time: datetime,
        response_time: datetime,
        execution_result: str,
        repo: SimulationRepository | None = None,
        error_message: str | None = None,
        scenario_id: str | None = None,
        fixture_id: str | None = None,
        request_payload: dict[str, Any] | None = None,
        response_payload: dict[str, Any] | None = None,
    ) -> str:
        exec_id = str(uuid.uuid4())
        req_str = (
            json.dumps(request_payload, ensure_ascii=False)
            if (settings.record_payloads and request_payload)
            else None
        )
        res_str = (
            json.dumps(response_payload, ensure_ascii=False)
            if (settings.record_payloads and response_payload)
            else None
        )

        record = {
            "id": exec_id,
            "api_id": api_id,
            "method": method,
            "path": path,
            "status_code": status_code,
            "duration_ms": round(duration_ms, 2),
            "request_timestamp": request_time.isoformat(),
            "response_timestamp": response_time.isoformat(),
            "execution_result": execution_result,
            "error_message": error_message,
            "scenario_id": scenario_id,
            "fixture_id": fixture_id,
            "request_payload": req_str,
            "response_payload": res_str,
        }
        self._memory_logs.appendleft(record)

        # Persist to database if repository provided
        if repo:
            try:
                db_entry = ApiExecutionLog(
                    id=exec_id,
                    api_id=api_id,
                    method=method,
                    path=path,
                    status_code=status_code,
                    duration_ms=duration_ms,
                    request_timestamp=request_time,
                    response_timestamp=response_time,
                    execution_result=execution_result,
                    error_message=error_message,
                    scenario_id=scenario_id,
                    fixture_id=fixture_id,
                    request_payload=req_str,
                    response_payload=res_str,
                )
                await repo.log_execution(db_entry)
            except Exception as e:
                logger.warning(f"Failed to persist execution log to database: {e}")

        return exec_id

    def get_recent_logs(self, limit: int = 50) -> list[dict[str, Any]]:
        return list(self._memory_logs)[:limit]
