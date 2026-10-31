"""Domain business handlers registry."""

from collections.abc import Callable, Coroutine
from typing import Any

from ems_sim.database.repository import SimulationRepository
from ems_sim.engine.handlers import common, inventory, popup, workorder
from ems_sim.models.definition import ApiDefinition
from ems_sim.models.protocol import NexacroRequest, NexacroResponse

HandlerFunc = Callable[
    [NexacroRequest, SimulationRepository, ApiDefinition],
    Coroutine[Any, Any, NexacroResponse | None],
]

HANDLER_REGISTRY: dict[str, HandlerFunc] = {
    # Common codes
    "common.com_code_list": common.com_code_list,
    # Inventory & Spare parts
    "inventory.search_stock_status": inventory.search_stock_status,
    "inventory.retrieve_item_detail": inventory.retrieve_item_detail,
    "inventory.target_stock_search": inventory.target_stock_search,
    "inventory.estimate_request_list": inventory.estimate_request_list,
    # Popup
    "popup.retrieve_item": popup.retrieve_item,
    "popup.retrieve_item_po_status": popup.retrieve_item_po_status,
    # Work Order
    "workorder.retrieve_wip_entity": workorder.retrieve_wip_entity,
    "workorder.master_init": workorder.master_init,
    "workorder.save_init": workorder.save_init,
    "workorder.status_history": workorder.status_history,
}


def get_handler(name: str | None) -> HandlerFunc | None:
    if not name:
        return None
    return HANDLER_REGISTRY.get(name)
