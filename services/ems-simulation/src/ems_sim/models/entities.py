"""SQLAlchemy models for business simulation entities and execution logs."""

from datetime import UTC, datetime

from sqlalchemy import (
    DateTime,
    Float,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def utc_now() -> datetime:
    return datetime.now(UTC)


class Base(DeclarativeBase):
    """Base declarative class."""


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    username: Mapped[str] = mapped_column(String(100), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="EN")
    organization_id: Mapped[str] = mapped_column(String(50), nullable=False)


class Item(Base):
    __tablename__ = "items"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # Item number e.g. QDAB03583
    inventory_item_id: Mapped[str] = mapped_column(String(50), nullable=True, index=True)
    organization_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    maker: Mapped[str | None] = mapped_column(String(200), nullable=True)
    model: Mapped[str | None] = mapped_column(String(200), nullable=True)
    uom: Mapped[str] = mapped_column(String(20), default="EA")
    status: Mapped[str] = mapped_column(String(50), default="Active")
    item_type: Mapped[str | None] = mapped_column(String(50), nullable=True)


class Inventory(Base):
    __tablename__ = "inventories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    item_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    organization_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    onhand_qty: Mapped[float] = mapped_column(Float, default=0.0)
    available_qty: Mapped[float] = mapped_column(Float, default=0.0)
    target_qty: Mapped[float] = mapped_column(Float, default=0.0)
    safety_qty: Mapped[float] = mapped_column(Float, default=0.0)


class WorkOrder(Base):
    __tablename__ = "work_orders"

    wip_entity_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    wip_entity_name: Mapped[str] = mapped_column(String(100), nullable=False)
    organization_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    work_order_type: Mapped[str] = mapped_column(String(50), default="BM")
    work_order_type_desc: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Released")
    created_by: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)


class WorkOrderHistory(Base):
    __tablename__ = "work_order_histories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    wip_entity_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    history_id: Mapped[str] = mapped_column(String(50), nullable=False)
    comment_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)


class CommonCode(Base):
    __tablename__ = "common_codes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    group_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    parent_code: Mapped[str | None] = mapped_column(String(100), nullable=True)


class GridFormat(Base):
    __tablename__ = "grid_formats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    program_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    screen_grid_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(50), nullable=False)
    format_data: Mapped[str | None] = mapped_column(Text, nullable=True)


class ApiExecutionLog(Base):
    __tablename__ = "api_execution_logs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    api_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    method: Mapped[str] = mapped_column(String(10), nullable=False)
    path: Mapped[str] = mapped_column(String(300), nullable=False, index=True)
    status_code: Mapped[int] = mapped_column(Integer, default=200)
    duration_ms: Mapped[float] = mapped_column(Float, default=0.0)
    request_timestamp: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    response_timestamp: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    execution_result: Mapped[str] = mapped_column(String(50), default="SUCCESS")
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    scenario_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    fixture_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    request_payload: Mapped[str | None] = mapped_column(Text, nullable=True)
    response_payload: Mapped[str | None] = mapped_column(Text, nullable=True)


class PurchaseRequest(Base):
    __tablename__ = "purchase_requests"

    prv_no: Mapped[str] = mapped_column(String(50), primary_key=True)
    item_id: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    inventory_item_id: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    organization_id: Mapped[str] = mapped_column(String(50), nullable=False, default="28753")
    request_qty: Mapped[float] = mapped_column(Float, default=1.0)
    unit_price: Mapped[float] = mapped_column(Float, default=0.0)
    req_amount: Mapped[float] = mapped_column(Float, default=0.0)
    requestor_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    requestor_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    prv_status: Mapped[str] = mapped_column(String(50), default="Confirm PO Review")
    confirm_flag: Mapped[str] = mapped_column(String(10), default="Y")
    data_payload: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

