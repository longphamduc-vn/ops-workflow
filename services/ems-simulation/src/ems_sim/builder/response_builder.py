"""Nexacro Response Builder supporting both XML and JSON wire formats."""

import xml.etree.ElementTree as ET
from typing import Any

from ems_sim.models.definition import DatasetDefinition
from ems_sim.models.protocol import Dataset, NexacroResponse


class NexacroResponseBuilder:
    """Builds standard Nexacro protocol response wire payloads (XML or JSON), strictly preserving column order and dataset structure."""

    @staticmethod
    def build_dict(response: NexacroResponse) -> dict[str, Any]:
        """Convert NexacroResponse into wire-format dict."""
        datasets_dict: dict[str, Any] = {}
        for ds_name, ds in response.datasets.items():
            datasets_dict[ds_name] = {
                "cols": ds.cols,
                "count": ds.count if ds.count is not None else len(ds.rows),
                "rows": ds.rows,
            }

        return {
            "params": response.params,
            "datasets": datasets_dict,
        }

    # Backward compatibility alias
    build = build_dict

    @staticmethod
    def serialize_xml(response: NexacroResponse) -> str:
        """Serialize NexacroResponse into official Nexacro XML wire format."""
        root = ET.Element("Root", xmlns="http://www.nexacroplatform.com/platform/dataset")

        # 1. Parameters element
        if response.params:
            params_elem = ET.SubElement(root, "Parameters")
            for k, v in response.params.items():
                param_elem = ET.SubElement(params_elem, "Parameter", id=str(k), type="string")
                param_elem.text = "" if v is None else str(v)

        # 2. Datasets elements
        for ds_id, ds in response.datasets.items():
            ds_elem = ET.SubElement(root, "Dataset", id=str(ds_id))

            # ColumnInfo element with ordered columns
            col_info_elem = ET.SubElement(ds_elem, "ColumnInfo")
            for col_id in ds.cols:
                ET.SubElement(col_info_elem, "Column", id=str(col_id), type="STRING", size="256")

            # Rows element
            rows_elem = ET.SubElement(ds_elem, "Rows")
            for row_vals in ds.rows:
                row_elem = ET.SubElement(rows_elem, "Row")
                for i, col_id in enumerate(ds.cols):
                    col_elem = ET.SubElement(row_elem, "Col", id=str(col_id))
                    val = row_vals[i] if i < len(row_vals) else ""
                    col_elem.text = "" if val is None else str(val)

        return '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding="unicode")

    @staticmethod
    def build_from_records(
        dataset_name: str,
        records: list[dict[str, Any]],
        cols: list[str] | None = None,
        schema: DatasetDefinition | None = None,
        extra_params: dict[str, Any] | None = None,
    ) -> NexacroResponse:
        """Helper to build a NexacroResponse from Python dict records and schema/cols."""
        if schema:
            ordered_cols = schema.column_names
        elif cols:
            ordered_cols = cols
        elif records:
            ordered_cols = list(records[0].keys())
        else:
            ordered_cols = []

        ds = Dataset.from_dict_list(cols=ordered_cols, records=records)
        return NexacroResponse.success(datasets={dataset_name: ds}, extra_params=extra_params)
