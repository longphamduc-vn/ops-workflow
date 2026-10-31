"""Unit tests for NexacroParser and NexacroResponseBuilder."""

import json

from ems_sim.builder.response_builder import NexacroResponseBuilder
from ems_sim.models.protocol import Dataset, NexacroResponse
from ems_sim.parser.request_parser import NexacroParser


def test_parser_with_standard_json():
    raw_payload = json.dumps(
        {
            "params": {
                "_ems_userId": "658359",
                "_ems_organizationId": "28753",
                "_ems_language": "EN",
            },
            "datasets": {
                "ds_search": {
                    "cols": ["organizationId", "item"],
                    "count": 1,
                    "rows": [["28753", "QDAB03583"]],
                }
            },
        }
    )

    req = NexacroParser.parse_json(raw_payload)
    assert req.params["_ems_userId"] == "658359"
    assert "ds_search" in req.datasets
    assert req.datasets["ds_search"].count == 1
    assert req.datasets["ds_search"].rows[0] == ["28753", "QDAB03583"]


def test_parser_with_empty_and_corrupt_data():
    empty_req = NexacroParser.parse_json("")
    assert empty_req.params == {}
    assert empty_req.datasets == {}

    req_with_empty_ds = NexacroParser.parse_dict({"params": {}, "datasets": {}})
    assert req_with_empty_ds.datasets == {}


def test_response_builder_preserves_column_order():
    cols = ["colZ", "colA", "colM", "colB"]
    rows = [["z1", "a1", "m1", "b1"]]
    resp = NexacroResponse.success(datasets={"ds_result": Dataset(cols=cols, count=1, rows=rows)})

    wire = NexacroResponseBuilder.build(resp)
    assert wire["params"]["errorCode"] == "1"
    assert wire["datasets"]["ds_result"]["cols"] == cols
    assert wire["datasets"]["ds_result"]["rows"][0] == ["z1", "a1", "m1", "b1"]


def test_response_builder_from_records():
    cols = ["itemId", "itemName", "qty"]
    records = [{"itemId": "1", "itemName": "Motor", "qty": 10}]
    resp = NexacroResponseBuilder.build_from_records("ds_list", records, cols=cols)

    wire = NexacroResponseBuilder.build(resp)
    assert wire["datasets"]["ds_list"]["cols"] == cols
    assert wire["datasets"]["ds_list"]["rows"] == [["1", "Motor", 10]]
