"""Unit tests for Nexacro protocol models."""

from ems_sim.models.protocol import Dataset, NexacroRequest, NexacroResponse


def test_dataset_to_dict_list():
    cols = ["item", "qty", "status"]
    rows = [["QDAB03583", 10, "Active"], ["QCAB10960", 5, "Disused"]]
    ds = Dataset(cols=cols, count=2, rows=rows)

    records = ds.to_dict_list()
    assert len(records) == 2
    assert records[0]["item"] == "QDAB03583"
    assert records[0]["qty"] == 10
    assert records[1]["status"] == "Disused"


def test_dataset_from_dict_list():
    cols = ["colA", "colB", "colC"]
    records = [{"colA": "valA1", "colB": "valB1", "colC": "valC1"}]
    ds = Dataset.from_dict_list(cols, records)

    assert ds.count == 1
    assert ds.cols == cols
    assert ds.rows == [["valA1", "valB1", "valC1"]]


def test_nexacro_request_helpers():
    req = NexacroRequest(
        params={"_ems_userId": "658359", "_ems_organizationId": "28753"},
        datasets={
            "ds_search": Dataset(
                cols=["item", "desc"],
                count=1,
                rows=[["TEST_ITEM", "Test Description"]],
            )
        },
    )

    assert req.get_param("_ems_userId") == "658359"
    assert req.get_param("unknown", "default_val") == "default_val"
    assert req.get_dataset("ds_search") is not None
    assert req.get_dataset("ds_unknown") is None

    first_row = req.get_first_row("ds_search")
    assert first_row["item"] == "TEST_ITEM"
    assert first_row["desc"] == "Test Description"


def test_nexacro_response_helpers():
    success_resp = NexacroResponse.success()
    assert success_resp.params["errorCode"] == "1"
    assert success_resp.params["errorMsg"] == ""

    err_resp = NexacroResponse.error("Database connection failed", error_code="-500")
    assert err_resp.params["errorCode"] == "-500"
    assert err_resp.params["errorMsg"] == "Database connection failed"
