"""Unit tests for scenario matching and prioritization."""

from ems_sim.models.definition import ScenarioDefinition
from ems_sim.models.protocol import Dataset, NexacroRequest, NexacroResponse
from ems_sim.registry.scenario_registry import ScenarioRegistry


def test_scenario_matching_by_param():
    registry = ScenarioRegistry()
    scenario = ScenarioDefinition(
        id="test.empty",
        api_id="spare_parts.stock_status.search",
        priority=10,
        match={"params": {"_scenario": "empty"}},
        response=NexacroResponse.success(datasets={"ds_result": Dataset.empty([])}),
    )
    registry.register(scenario)

    req_matching = NexacroRequest(params={"_scenario": "empty", "_ems_userId": "123"})
    req_non_matching = NexacroRequest(params={"_ems_userId": "123"})

    matched = registry.match("spare_parts.stock_status.search", req_matching)
    assert matched is not None
    assert matched.id == "test.empty"

    unmatched = registry.match("spare_parts.stock_status.search", req_non_matching)
    assert unmatched is None


def test_scenario_matching_by_dataset_value():
    registry = ScenarioRegistry()
    scenario = ScenarioDefinition(
        id="test.item_not_found",
        api_id="spare_parts.stock_status.search",
        priority=5,
        match={"datasets": {"ds_search": {"itemDesc": "UNKNOWN_PART"}}},
        response=NexacroResponse.error("Item not found", error_code="-100"),
    )
    registry.register(scenario)

    req = NexacroRequest(
        params={},
        datasets={
            "ds_search": Dataset(
                cols=["itemDesc"],
                count=1,
                rows=[["UNKNOWN_PART"]],
            )
        },
    )

    matched = registry.match("spare_parts.stock_status.search", req)
    assert matched is not None
    assert matched.id == "test.item_not_found"
    assert matched.response.params["errorCode"] == "-100"
