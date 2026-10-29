"""Read models storage: exposes stable queryable datasets for consumers."""

import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import JSON, DateTime, String, select
from sqlalchemy.orm import Mapped, mapped_column

from opsflow.store.models import Base
from opsflow.store.repository import RunRepository


class PublishedRecordModel(Base):
    """Database table for published dataset rows exposed to consumers."""

    __tablename__ = "read_model_records"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    dataset: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    source_run_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    data: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    synced_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )


class ReadModelStorage:
    """Manages publishing, querying, and schema inspection for consumer read models."""

    def __init__(self, repository: RunRepository) -> None:
        self.repository = repository
        self.session_factory = repository.session_factory

    async def init_tables(self) -> None:
        """Ensure read model tables are created."""
        async with self.repository.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def save_published_dataset(
        self,
        dataset: str,
        source_run_id: str,
        records: list[dict[str, Any]] | dict[str, Any],
    ) -> int:
        """Persist normalized published dataset records."""
        if isinstance(records, dict):
            row_list = [records]
        elif isinstance(records, list):
            row_list = records
        else:
            row_list = [{"value": records}]

        now = datetime.now(UTC)
        count = 0
        async with self.session_factory() as session:
            for row in row_list:
                rec_id = f"rec_{uuid.uuid4().hex[:16]}"
                db_record = PublishedRecordModel(
                    id=rec_id,
                    dataset=dataset,
                    source_run_id=source_run_id,
                    data=row,
                    synced_at=now,
                )
                session.add(db_record)
                count += 1
            await session.commit()
        return count

    async def query_dataset(
        self,
        dataset: str,
        limit: int = 50,
        cursor: str | None = None,
    ) -> tuple[list[dict[str, Any]], str | None, int]:
        """Query published dataset records with cursor-based pagination.

        Returns (items, next_cursor, total_returned).
        """
        limit = max(1, min(limit, 1000))
        async with self.session_factory() as session:
            stmt = select(PublishedRecordModel).where(PublishedRecordModel.dataset == dataset)
            if cursor:
                stmt = stmt.where(PublishedRecordModel.id > cursor)

            stmt = stmt.order_by(PublishedRecordModel.id.asc()).limit(limit + 1)
            result = await session.execute(stmt)
            rows = list(result.scalars().all())

            has_more = len(rows) > limit
            items_to_return = rows[:limit]
            next_cursor = items_to_return[-1].id if has_more and items_to_return else None

            formatted_items = []
            for r in items_to_return:
                item_data = dict(r.data)
                item_data["_id"] = r.id
                item_data["_source_run_id"] = r.source_run_id
                item_data["_synced_at"] = r.synced_at.isoformat()
                formatted_items.append(item_data)

            return formatted_items, next_cursor, len(formatted_items)

    async def get_dataset_schema(self, dataset: str) -> dict[str, str]:
        """Inspect and return inferred column names and types for a published dataset."""
        async with self.session_factory() as session:
            stmt = (
                select(PublishedRecordModel)
                .where(PublishedRecordModel.dataset == dataset)
                .order_by(PublishedRecordModel.synced_at.desc())
                .limit(5)
            )
            result = await session.execute(stmt)
            sample_records = result.scalars().all()

        if not sample_records:
            return {"status": "empty_dataset"}

        inferred: dict[str, str] = {
            "_id": "string",
            "_source_run_id": "string",
            "_synced_at": "datetime",
        }
        for rec in sample_records:
            for k, v in rec.data.items():
                if k not in inferred:
                    if isinstance(v, bool):
                        inferred[k] = "boolean"
                    elif isinstance(v, int):
                        inferred[k] = "integer"
                    elif isinstance(v, float):
                        inferred[k] = "number"
                    elif isinstance(v, (list, tuple)):
                        inferred[k] = "array"
                    elif isinstance(v, dict):
                        inferred[k] = "object"
                    else:
                        inferred[k] = "string"

        return inferred
