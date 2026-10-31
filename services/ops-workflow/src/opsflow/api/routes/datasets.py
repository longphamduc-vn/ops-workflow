"""Datasets API routes: querying published read models."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query

from opsflow.api.auth import AuthenticatedConsumer, require_scope
from opsflow.api.routes.workflows import get_read_models
from opsflow.api.schemas import DatasetQueryResponse
from opsflow.read_models.storage import ReadModelStorage

router = APIRouter(prefix="/api/v1/datasets", tags=["Datasets"])


@router.get("/{dataset}", response_model=DatasetQueryResponse, summary="Query a published dataset")
async def query_dataset(
    dataset: str,
    _: Annotated[AuthenticatedConsumer, Depends(require_scope("datasets:read"))],
    storage: Annotated[ReadModelStorage, Depends(get_read_models)],
    limit: Annotated[int, Query(ge=1, le=1000, description="Page size limit")] = 50,
    cursor: Annotated[str | None, Query(description="Pagination cursor")] = None,
) -> DatasetQueryResponse:
    """Query a stable published read model dataset with cursor pagination."""
    items, next_cursor, count = await storage.query_dataset(
        dataset=dataset,
        limit=limit,
        cursor=cursor,
    )
    return DatasetQueryResponse(
        dataset=dataset,
        items=items,
        next_cursor=next_cursor,
        count=count,
    )


@router.get("/{dataset}/schema", summary="Get published dataset schema")
async def get_dataset_schema(
    dataset: str,
    _: Annotated[AuthenticatedConsumer, Depends(require_scope("datasets:read"))],
    storage: Annotated[ReadModelStorage, Depends(get_read_models)],
) -> dict[str, Any]:
    """Retrieve column names and data types for a published dataset."""
    schema = await storage.get_dataset_schema(dataset)
    return {"dataset": dataset, "columns": schema}
