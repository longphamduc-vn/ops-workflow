"""Simulation database repository handling data persistence and queries."""

from typing import Any

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from ems_sim.models.entities import (
    ApiExecutionLog,
    CommonCode,
    GridFormat,
    Inventory,
    Item,
    Organization,
    PurchaseRequest,
    User,
    WorkOrder,
    WorkOrderHistory,
)


class SimulationRepository:
    """Repository for querying business entities and storing execution audit logs."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # Organizations & Users
    async def get_organization(self, org_id: str) -> Organization | None:
        result = await self.session.execute(select(Organization).where(Organization.id == org_id))
        return result.scalar_one_or_none()

    async def get_user(self, user_id: str) -> User | None:
        result = await self.session.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    # Items & Inventory
    async def get_item(self, item_id: str) -> Item | None:
        result = await self.session.execute(select(Item).where(Item.id == item_id))
        return result.scalar_one_or_none()

    async def search_items(
        self,
        organization_id: str | None = None,
        item_id: str | None = None,
        item_desc: str | None = None,
        maker: str | None = None,
        limit: int = 50,
    ) -> list[Item]:
        query = select(Item)
        if organization_id:
            query = query.where(Item.organization_id == organization_id)
        if item_id:
            query = query.where(Item.id.ilike(f"%{item_id}%"))
        if item_desc:
            query = query.where(Item.description.ilike(f"%{item_desc}%"))
        if maker:
            query = query.where(Item.maker.ilike(f"%{maker}%"))
        query = query.limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_inventory(self, item_id: str, organization_id: str) -> Inventory | None:
        query = select(Inventory).where(
            Inventory.item_id == item_id, Inventory.organization_id == organization_id
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    # Work Orders
    async def get_work_order(self, wip_entity_id: str) -> WorkOrder | None:
        result = await self.session.execute(
            select(WorkOrder).where(WorkOrder.wip_entity_id == wip_entity_id)
        )
        return result.scalar_one_or_none()

    async def get_work_order_history(self, wip_entity_id: str) -> list[WorkOrderHistory]:
        query = (
            select(WorkOrderHistory)
            .where(WorkOrderHistory.wip_entity_id == wip_entity_id)
            .order_by(desc(WorkOrderHistory.created_at))
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    # Common Codes & Grid Formats
    async def get_common_codes(self, group_name: str) -> list[CommonCode]:
        query = select(CommonCode).where(CommonCode.group_name == group_name)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_grid_format(
        self, program_id: str, screen_grid_name: str, user_id: str
    ) -> GridFormat | None:
        query = select(GridFormat).where(
            GridFormat.program_id == program_id,
            GridFormat.screen_grid_name == screen_grid_name,
            GridFormat.user_id == user_id,
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    # Purchase Requests
    async def get_purchase_request(self, prv_no: str) -> PurchaseRequest | None:
        result = await self.session.execute(
            select(PurchaseRequest).where(PurchaseRequest.prv_no == prv_no)
        )
        return result.scalar_one_or_none()

    async def find_purchase_requests(
        self,
        item_id: str | None = None,
        inventory_item_id: str | None = None,
        organization_id: str | None = None,
        limit: int = 10,
    ) -> list[PurchaseRequest]:
        query = select(PurchaseRequest)
        if organization_id:
            query = query.where(PurchaseRequest.organization_id == organization_id)
        if item_id:
            query = query.where(PurchaseRequest.item_id == item_id)
        if inventory_item_id:
            query = query.where(PurchaseRequest.inventory_item_id == inventory_item_id)
        query = query.order_by(desc(PurchaseRequest.created_at)).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def save_purchase_request(self, req: PurchaseRequest) -> None:
        existing = await self.get_purchase_request(req.prv_no)
        if existing:
            existing.item_id = req.item_id
            existing.inventory_item_id = req.inventory_item_id
            existing.organization_id = req.organization_id
            existing.request_qty = req.request_qty
            existing.unit_price = req.unit_price
            existing.req_amount = req.req_amount
            existing.requestor_id = req.requestor_id
            existing.requestor_name = req.requestor_name
            existing.prv_status = req.prv_status
            existing.confirm_flag = req.confirm_flag
            existing.data_payload = req.data_payload
        else:
            self.session.add(req)
        await self.session.commit()


    # Execution Logs
    async def log_execution(self, log_entry: ApiExecutionLog) -> None:
        self.session.add(log_entry)
        await self.session.commit()

    async def get_recent_logs(self, limit: int = 50) -> list[ApiExecutionLog]:
        query = (
            select(ApiExecutionLog).order_by(desc(ApiExecutionLog.request_timestamp)).limit(limit)
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    # Seeding
    async def seed_data(self, seed: dict[str, Any]) -> None:
        # Organizations
        for org in seed.get("organizations", []):
            existing = await self.get_organization(org["id"])
            if not existing:
                self.session.add(
                    Organization(
                        id=org["id"],
                        code=org.get("code", "A13"),
                        name=org.get("name", ""),
                        description=org.get("description", ""),
                    )
                )

        # Users
        for u in seed.get("users", []):
            existing_user = await self.get_user(u["id"])
            if not existing_user:
                self.session.add(
                    User(
                        id=u["id"],
                        username=u.get("username", "user"),
                        name=u.get("name", "Name"),
                        language=u.get("language", "EN"),
                        organization_id=u.get("organizationId", "28753"),
                    )
                )

        # Items & default Inventory
        for it in seed.get("items", []):
            existing_it = await self.get_item(it["item"])
            if not existing_it:
                self.session.add(
                    Item(
                        id=it["item"],
                        inventory_item_id=it.get("inventoryItemId"),
                        organization_id=it.get("organizationId", "28753"),
                        description=it.get("itemDescription"),
                        maker=it.get("maker"),
                        model=it.get("model"),
                        uom=it.get("uom", "EA"),
                        status=it.get("status", "Active"),
                    )
                )
                self.session.add(
                    Inventory(
                        item_id=it["item"],
                        organization_id=it.get("organizationId", "28753"),
                        onhand_qty=10.0,
                        available_qty=10.0,
                        target_qty=5.0,
                        safety_qty=2.0,
                    )
                )

        # WIP Entities
        for w in seed.get("wip_entities", []):
            existing_wip = await self.get_work_order(w["wipEntityId"])
            if not existing_wip:
                self.session.add(
                    WorkOrder(
                        wip_entity_id=w["wipEntityId"],
                        wip_entity_name=w.get("wipEntityName", f"WO-{w['wipEntityId']}"),
                        organization_id=w.get("organizationId", "28753"),
                        work_order_type=w.get("workOrderType", "BM"),
                        work_order_type_desc=w.get("workOrderTypeDesc", "Breakdown Maintenance"),
                        status=w.get("status", "Released"),
                    )
                )

        await self.session.commit()
