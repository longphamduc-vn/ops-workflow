#!/usr/bin/env python3
"""Extraction script to parse raw Nexacro API traces and generate:

1. API definitions (catalog/apis/*.yaml)
2. Dataset definitions (catalog/datasets/*.yaml)
3. Fixtures with real request/response records (catalog/fixtures/*.json)
4. Configurable simulation scenarios (catalog/scenarios/*.yaml)
5. Business seed database payload (catalog/seed_data.json)
"""

import json
import re
from collections import defaultdict
from pathlib import Path
from urllib.parse import urlparse

import yaml

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
TRACE_FILE = (
    ROOT_DIR
    / "nexacro_api_1_2_3_4_5_6_7_8_9_10_11_12_13_14_15_16_17_18_19_20_21_22_23_24_25_26_27_28_29_30_31_32_33_34_35_36_37_38_39_40_41_42_43_44_45_46_47_48_49_50_51_52_53_54_55_56_57_58_59_60_61_62_63_64_65_66_ (2).yaml"
)
TARGET_DIR = Path(__file__).resolve().parent.parent / "catalog"

ENDPOINT_MAP = {
    "/emsspareparts/sp101/sp110Nav/RetStockStatusList.lgdn": {
        "id": "spare_parts.stock_status.search",
        "name": "Search Stock Status",
        "domain": "spare_parts",
        "handler": "inventory.search_stock_status",
    },
    "/emsspareparts/sp101/sp120Nav/RetEstimateRequestList.lgdn": {
        "id": "spare_parts.estimate_request.list",
        "name": "Estimate Request List",
        "domain": "spare_parts",
        "handler": "inventory.estimate_request_list",
    },
    "/emsspareparts/sp102/sp135Nav/retrieveItemInfoDetail.lgdn": {
        "id": "spare_parts.item_detail.retrieve",
        "name": "Retrieve Item Info Detail",
        "domain": "spare_parts",
        "handler": "inventory.retrieve_item_detail",
    },
    "/emsspareparts/sp302/sp330Nav/TargetStockSearchList.lgdn": {
        "id": "stock_management.target_stock.search_330",
        "name": "Target Stock Search List (sp330)",
        "domain": "stock_management",
        "handler": "inventory.target_stock_search",
    },
    "/emsspareparts/sp302/sp335Nav/TargetStockSearchList.lgdn": {
        "id": "stock_management.target_stock.search_335",
        "name": "Target Stock Search List (sp335)",
        "domain": "stock_management",
        "handler": "inventory.target_stock_search",
    },
    "/emscom/popupNav/retrieveItemPoStatusList.lgdn": {
        "id": "purchasing.item_po_status.list",
        "name": "Retrieve Item PO Status List",
        "domain": "purchasing",
        "handler": "popup.retrieve_item_po_status",
    },
    "/emscom/popupNav/retrieveItem.lgdn": {
        "id": "purchasing.item.popup_retrieve",
        "name": "Popup Retrieve Item",
        "domain": "purchasing",
        "handler": "popup.retrieve_item",
    },
    "/emscom/woMasterNav/WoMasterRetInit.lgdn": {
        "id": "work_orders.master.ret_init",
        "name": "Work Order Master Init",
        "domain": "work_orders",
        "handler": "workorder.master_init",
    },
    "/emsworkorder/wo20/wo230Nav/WO230WoSaveInit.lgdn": {
        "id": "work_orders.wo230.save_init",
        "name": "Work Order Save Init",
        "domain": "work_orders",
        "handler": "workorder.save_init",
    },
    "/emscom/woSearchNav/retrieveWipEntity.lgdn": {
        "id": "work_orders.wip_entity.retrieve",
        "name": "Retrieve WIP Entity",
        "domain": "work_orders",
        "handler": "workorder.retrieve_wip_entity",
    },
    "/emsworkorder/wo50/wo580Nav/statusHistory.lgdn": {
        "id": "work_orders.status_history.retrieve",
        "name": "Retrieve Work Order Status History",
        "domain": "work_orders",
        "handler": "workorder.status_history",
    },
    "/emscom/codeNav/retComCodeList.lgdn": {
        "id": "common.code.list",
        "name": "Retrieve Common Code List",
        "domain": "common",
        "handler": "common.com_code_list",
    },
}


def clean_yaml_text(raw_text: str) -> str:
    """Replace non-breaking spaces and clean unusual whitespace."""
    text = raw_text.replace("\u00a0", " ")
    return text


def parse_trace_blocks(text: str):
    """Split and parse raw trace into list of API call dicts."""
    blocks = re.split(r"\n\s*-\s*index:\s*", text)
    calls = []
    for b in blocks[1:]:
        url_m = re.search(r"url:\s*\"?([^\n\"]+)\"?", b)
        if not url_m:
            continue
        url = url_m.group(1).strip()
        path = urlparse(url).path
        method_m = re.search(r"method:\s*(\w+)", b)
        method = method_m.group(1).strip() if method_m else "POST"
        status_m = re.search(r"status:\s*(\d+)", b)
        status = int(status_m.group(1).strip()) if status_m else 200

        # Split request and response
        parts = re.split(r"\n\s*response:", b, maxsplit=1)
        req_part = parts[0]
        res_part = parts[1] if len(parts) > 1 else ""

        # Request params
        req_params = {}
        rp_block = re.search(r"params:(.*?)(?=datasets:|$)", req_part, re.DOTALL)
        if rp_block:
            for line in rp_block.group(1).splitlines():
                pm = re.match(r"^\s*([a-zA-Z0-9_]+):\s*\"?(.*?)\"?\s*$", line)
                if pm:
                    req_params[pm.group(1)] = pm.group(2)

        # Request datasets
        req_datasets = {}
        # Parse datasets with regex
        ds_matches = list(
            re.finditer(
                r"^\s*([a-zA-Z0-9_]+):\s*\n\s*cols:\s*\[(.*?)\]\s*\n\s*count:\s*(\d+)\s*\n\s*rows:\s*(.*?)(?=\n\s*(?:[a-zA-Z0-9_]+:|$))",
                req_part,
                re.DOTALL | re.MULTILINE,
            )
        )
        for dsm in ds_matches:
            ds_name = dsm.group(1)
            cols = [c.strip().strip('"').strip("'") for c in dsm.group(2).split(",") if c.strip()]
            cnt = int(dsm.group(3))
            rows_raw = dsm.group(4)
            rows = []
            for r_line in rows_raw.splitlines():
                rm = re.search(r"-\s*\[(.*)\]", r_line)
                if rm:
                    # Parse list items
                    row_items = [
                        val.strip().strip('"').strip("'") for val in rm.group(1).split(",")
                    ]
                    rows.append(row_items)
            req_datasets[ds_name] = {"cols": cols, "count": cnt, "rows": rows}

        # Response params
        res_params = {}
        resp_block = re.search(r"params:(.*?)(?=datasets:|$)", res_part, re.DOTALL)
        if resp_block:
            for line in resp_block.group(1).splitlines():
                pm = re.match(r"^\s*([a-zA-Z0-9_]+):\s*\"?(.*?)\"?\s*$", line)
                if pm:
                    res_params[pm.group(1)] = pm.group(2)
        if "errorCode" not in res_params:
            res_params["errorCode"] = "1"
        if "errorMsg" not in res_params:
            res_params["errorMsg"] = ""

        # Response datasets
        res_datasets = {}
        res_ds_matches = list(
            re.finditer(
                r"^\s*([a-zA-Z0-9_]+):\s*\n\s*cols:\s*\[(.*?)\]\s*\n\s*count:\s*(\d+)\s*\n\s*rows:\s*(.*?)(?=\n\s*(?:[a-zA-Z0-9_]+:|$))",
                res_part,
                re.DOTALL | re.MULTILINE,
            )
        )
        for dsm in res_ds_matches:
            ds_name = dsm.group(1)
            cols = [c.strip().strip('"').strip("'") for c in dsm.group(2).split(",") if c.strip()]
            cnt = int(dsm.group(3))
            rows_raw = dsm.group(4)
            rows = []
            for r_line in rows_raw.splitlines():
                rm = re.search(r"-\s*\[(.*)\]", r_line)
                if rm:
                    row_items = [
                        val.strip().strip('"').strip("'") for val in rm.group(1).split(",")
                    ]
                    rows.append(row_items)
            res_datasets[ds_name] = {"cols": cols, "count": cnt, "rows": rows}

        calls.append(
            {
                "url": url,
                "path": path,
                "method": method,
                "status": status,
                "request": {"params": req_params, "datasets": req_datasets},
                "response": {"params": res_params, "datasets": res_datasets},
            }
        )
    return calls


def main():
    print(f"Reading traces from {TRACE_FILE}...")
    with open(TRACE_FILE, encoding="utf-8") as f:
        raw_text = f.read()

    cleaned_text = clean_yaml_text(raw_text)
    calls = parse_trace_blocks(cleaned_text)
    print(f"Parsed {len(calls)} API call records.")

    # Group calls by path
    calls_by_path = defaultdict(list)
    for c in calls:
        calls_by_path[c["path"]].append(c)

    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    apis_dir = TARGET_DIR / "apis"
    datasets_dir = TARGET_DIR / "datasets"
    fixtures_dir = TARGET_DIR / "fixtures"
    scenarios_dir = TARGET_DIR / "scenarios"
    for d in [apis_dir, datasets_dir, fixtures_dir, scenarios_dir]:
        d.mkdir(parents=True, exist_ok=True)

    dataset_schemas = {}
    seed_items = {}
    seed_wip = {}
    seed_common_codes = defaultdict(list)

    # Process each registered endpoint
    for path, meta in ENDPOINT_MAP.items():
        api_id = meta["id"]
        name = meta["name"]
        domain = meta["domain"]
        handler_name = meta["handler"]
        records = calls_by_path.get(path, [])
        if not records:
            print(f"Warning: No records found for endpoint {path}")
            continue

        sample_record = records[0]

        # Datasets schema collection
        req_ds_meta = []
        for ds_name, ds_data in sample_record["request"]["datasets"].items():
            schema_id = f"{domain}.{ds_name}.schema"
            req_ds_meta.append({"name": ds_name, "schema": schema_id})
            if schema_id not in dataset_schemas:
                dataset_schemas[schema_id] = {
                    "id": schema_id,
                    "name": f"{ds_name} Dataset Schema",
                    "version": "1.0.0",
                    "columns": [{"name": c, "type": "string"} for c in ds_data["cols"]],
                }

        res_ds_meta = []
        for ds_name, ds_data in sample_record["response"]["datasets"].items():
            schema_id = f"{domain}.{ds_name}.schema"
            res_ds_meta.append({"name": ds_name, "schema": schema_id})
            if schema_id not in dataset_schemas:
                dataset_schemas[schema_id] = {
                    "id": schema_id,
                    "name": f"{ds_name} Dataset Schema",
                    "version": "1.0.0",
                    "columns": [{"name": c, "type": "string"} for c in ds_data["cols"]],
                }

        # Build API definition
        api_def = {
            "id": api_id,
            "name": name,
            "domain": domain,
            "version": "1.0.0",
            "enabled": True,
            "endpoint": {
                "method": sample_record["method"],
                "path": path,
            },
            "request": {
                "params": list(sample_record["request"]["params"].keys()),
                "datasets": req_ds_meta,
            },
            "execution": {
                "type": "handler",
                "handler": handler_name,
                "fixture_id": f"fixture.{api_id}",
            },
            "response": {
                "params": list(sample_record["response"]["params"].keys()),
                "datasets": res_ds_meta,
            },
        }

        with open(apis_dir / f"{api_id}.yaml", "w", encoding="utf-8") as f:
            yaml.dump(api_def, f, sort_keys=False)

        # Build Fixture (storing all observed rows or best representative response)
        best_record = records[0]
        # Choose record with largest row count for rich fixtures
        for rec in records:
            total_rows = sum(len(d["rows"]) for d in rec["response"]["datasets"].values())
            best_total = sum(len(d["rows"]) for d in best_record["response"]["datasets"].values())
            if total_rows > best_total:
                best_record = rec

        fixture_data = {
            "id": f"fixture.{api_id}",
            "api_id": api_id,
            "match": {
                "params": best_record["request"]["params"],
            },
            "response": {
                "params": best_record["response"]["params"],
                "datasets": best_record["response"]["datasets"],
            },
        }
        with open(fixtures_dir / f"{api_id}.json", "w", encoding="utf-8") as f:
            json.dump(fixture_data, f, indent=2, ensure_ascii=False)

        # Build Standard Scenarios (e.g. empty results or not found)
        empty_datasets = {}
        for ds_name, ds_info in best_record["response"]["datasets"].items():
            empty_datasets[ds_name] = {
                "cols": ds_info["cols"],
                "count": 0,
                "rows": [],
            }

        empty_scenario = {
            "id": f"{api_id}.empty",
            "api_id": api_id,
            "enabled": True,
            "priority": 10,
            "match": {
                "params": {"_scenario": "empty"},
            },
            "response": {
                "params": {"errorCode": "1", "errorMsg": "No records found"},
                "datasets": empty_datasets,
            },
        }
        with open(scenarios_dir / f"{api_id}.empty.yaml", "w", encoding="utf-8") as f:
            yaml.dump(empty_scenario, f, sort_keys=False)

        # Collect seed entities from responses
        for rec in records:
            for ds_name, ds_info in rec["response"]["datasets"].items():
                cols = ds_info["cols"]
                for row in ds_info["rows"]:
                    row_dict = dict(zip(cols, row, strict=False))
                    # Seed Items
                    item_no = row_dict.get("item") or row_dict.get("itemName")
                    if item_no and item_no not in seed_items:
                        seed_items[item_no] = {
                            "item": item_no,
                            "itemDescription": row_dict.get("itemDescription")
                            or row_dict.get("description", ""),
                            "maker": row_dict.get("maker", ""),
                            "model": row_dict.get("model", ""),
                            "inventoryItemId": row_dict.get("inventoryItemId", ""),
                            "organizationId": row_dict.get("organizationId", "28753"),
                            "uom": row_dict.get("uom") or row_dict.get("uomCode", "EA"),
                            "status": row_dict.get("itemStatus")
                            or row_dict.get("inventoryItemStatusCode", "Active"),
                        }
                    # Seed WIP Entities
                    wip_id = row_dict.get("wipEntityId")
                    if wip_id and wip_id not in seed_wip:
                        seed_wip[wip_id] = {
                            "wipEntityId": wip_id,
                            "wipEntityName": row_dict.get("wipEntityName", f"WO-{wip_id}"),
                            "workOrderType": row_dict.get("workOrderType", "BM"),
                            "workOrderTypeDesc": row_dict.get(
                                "workOrderTypeDesc", "Breakdown Maintenance"
                            ),
                            "organizationId": row_dict.get("organizationId", "28753"),
                            "status": row_dict.get("userDefinedStatusId", "Released"),
                        }
                    # Seed Common codes
                    com_code = row_dict.get("comCode")
                    if com_code:
                        seed_common_codes[ds_name].append(
                            {
                                "code": com_code,
                                "desc": row_dict.get("comCodeDesc", ""),
                                "parent": row_dict.get("parentComCode", ""),
                            }
                        )

    # Save all dataset schemas
    for schema_id, schema_data in dataset_schemas.items():
        with open(datasets_dir / f"{schema_id}.yaml", "w", encoding="utf-8") as f:
            yaml.dump(schema_data, f, sort_keys=False)

    # Save seed database payload
    seed_payload = {
        "organizations": [
            {
                "id": "28753",
                "code": "A13",
                "name": "Display Module Plant 1",
                "description": "Main EMS Organization",
            }
        ],
        "users": [
            {
                "id": "658359",
                "username": "ops_user",
                "name": "Pham Duc Long",
                "language": "EN",
                "organizationId": "28753",
            }
        ],
        "items": list(seed_items.values()),
        "wip_entities": list(seed_wip.values()),
        "common_codes": dict(seed_common_codes),
    }

    with open(TARGET_DIR / "seed_data.json", "w", encoding="utf-8") as f:
        json.dump(seed_payload, f, indent=2, ensure_ascii=False)

    print(f"Generated {len(ENDPOINT_MAP)} API definitions in {apis_dir}")
    print(f"Generated {len(dataset_schemas)} dataset schemas in {datasets_dir}")
    print(f"Generated {len(ENDPOINT_MAP)} fixtures in {fixtures_dir}")
    print(f"Generated {len(ENDPOINT_MAP)} scenarios in {scenarios_dir}")
    print(
        f"Generated seed database with {len(seed_items)} items, {len(seed_wip)} WIP entities in {TARGET_DIR / 'seed_data.json'}"
    )


if __name__ == "__main__":
    main()
