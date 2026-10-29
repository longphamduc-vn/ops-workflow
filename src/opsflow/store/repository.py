"""Asynchronous repository for runs and step runs."""

import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker, create_async_engine

from opsflow.store.models import Base, RunRecord, StepRunRecord


class RunRepository:
    """Handles CRUD operations for workflow run persistence."""

    def __init__(self, engine_or_url: AsyncEngine | str) -> None:
        if isinstance(engine_or_url, str):
            self.engine = create_async_engine(engine_or_url, echo=False)
        else:
            self.engine = engine_or_url
        self.session_factory = async_sessionmaker(self.engine, expire_on_commit=False)

    async def init_db(self) -> None:
        """Create database tables if they do not exist."""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def create_run(
        self,
        run_id: str,
        workflow_name: str,
        inputs: dict[str, Any] | None = None,
    ) -> RunRecord:
        async with self.session_factory() as session:
            record = RunRecord(
                id=run_id,
                workflow_name=workflow_name,
                status="pending",
                inputs=inputs or {},
                outputs={},
                created_at=datetime.now(UTC),
            )
            session.add(record)
            await session.commit()
            return record

    async def update_run_status(
        self,
        run_id: str,
        status: str,
        outputs: dict[str, Any] | None = None,
        error: dict[str, Any] | None = None,
    ) -> None:
        async with self.session_factory() as session:
            record = await session.get(RunRecord, run_id)
            if record:
                record.status = status
                if status == "running" and not record.started_at:
                    record.started_at = datetime.now(UTC)
                if status in ("success", "failed", "cancelled"):
                    record.completed_at = datetime.now(UTC)
                if outputs is not None:
                    record.outputs = outputs
                if error is not None:
                    record.error = error
                await session.commit()

    async def get_run(self, run_id: str) -> RunRecord | None:
        async with self.session_factory() as session:
            return await session.get(RunRecord, run_id)

    async def create_or_update_step_run(
        self,
        run_id: str,
        step_id: str,
        status: str,
        attempt: int = 1,
        latency_ms: int = 0,
        outputs: Any = None,
        error: dict[str, Any] | None = None,
    ) -> StepRunRecord:
        async with self.session_factory() as session:
            stmt = select(StepRunRecord).where(
                StepRunRecord.run_id == run_id, StepRunRecord.step_id == step_id
            )
            result = await session.execute(stmt)
            record = result.scalars().first()

            now = datetime.now(UTC)
            if not record:
                record_id = f"steprun_{uuid.uuid4().hex[:12]}"
                record = StepRunRecord(
                    id=record_id,
                    run_id=run_id,
                    step_id=step_id,
                    status=status,
                    attempt=attempt,
                    latency_ms=latency_ms,
                    outputs={"data": outputs} if outputs is not None else None,
                    error=error,
                    started_at=now,
                )
                session.add(record)
            else:
                record.status = status
                record.attempt = attempt
                record.latency_ms = latency_ms
                if outputs is not None:
                    record.outputs = {"data": outputs}
                if error is not None:
                    record.error = error
                if status in ("success", "failed", "skipped"):
                    record.completed_at = now

            await session.commit()
            return record

    async def get_step_runs(self, run_id: str) -> list[StepRunRecord]:
        async with self.session_factory() as session:
            stmt = select(StepRunRecord).where(StepRunRecord.run_id == run_id)
            result = await session.execute(stmt)
            return list(result.scalars().all())
