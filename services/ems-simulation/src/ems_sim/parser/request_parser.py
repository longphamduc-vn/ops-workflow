"""Nexacro Request Parser supporting both XML and JSON wire formats."""

import json
import logging
import xml.etree.ElementTree as ET
from typing import Any

from ems_sim.models.protocol import Dataset, NexacroRequest

logger = logging.getLogger(__name__)


def _strip_tag(tag: str) -> str:
    """Strip XML namespace prefix from element tag name."""
    if "}" in tag:
        return tag.split("}", 1)[1]
    return tag


class NexacroParser:
    """Parses incoming HTTP request payloads (XML or JSON) into standardized NexacroRequest objects."""

    @staticmethod
    def parse_xml(xml_content: str | bytes) -> NexacroRequest:
        """Parse Nexacro XML wire format payload."""
        if not xml_content:
            return NexacroRequest()

        if isinstance(xml_content, bytes):
            text = xml_content.decode("utf-8", errors="replace")
        else:
            text = xml_content

        text = text.strip()
        if not text:
            return NexacroRequest()

        try:
            root = ET.fromstring(text)
        except ET.ParseError as exc:
            raise ValueError(f"Invalid Nexacro XML payload: {exc}") from exc

        params: dict[str, Any] = {}
        datasets: dict[str, Dataset] = {}

        for child in root:
            tag_name = _strip_tag(child.tag)

            if tag_name == "Parameters":
                for param in child:
                    param_id = param.attrib.get("id")
                    if param_id:
                        params[param_id] = param.text.strip() if param.text is not None else ""

            elif tag_name == "Dataset":
                ds_id = child.attrib.get("id", "dsDefault")
                cols: list[str] = []
                rows: list[list[Any]] = []

                # Find ColumnInfo
                for elem in child:
                    if _strip_tag(elem.tag) == "ColumnInfo":
                        for col_elem in elem:
                            col_id = col_elem.attrib.get("id")
                            if col_id:
                                cols.append(col_id)
                        break

                # Find Rows
                rows_elem = None
                for elem in child:
                    if _strip_tag(elem.tag) == "Rows":
                        rows_elem = elem
                        break

                if rows_elem is not None:
                    for row_elem in rows_elem:
                        if _strip_tag(row_elem.tag) == "Row":
                            col_map: dict[str, Any] = {}
                            for col in row_elem:
                                col_id = col.attrib.get("id")
                                if col_id:
                                    col_map[col_id] = (
                                        col.text.strip() if col.text is not None else ""
                                    )
                                    if col_id not in cols:
                                        cols.append(col_id)

                            # Build ordered row list based on cols
                            row_vals = [col_map.get(c, "") for c in cols]
                            rows.append(row_vals)

                datasets[ds_id] = Dataset(cols=cols, count=len(rows), rows=rows)

        return NexacroRequest(params=params, datasets=datasets)

    @staticmethod
    def parse_dict(payload: dict[str, Any]) -> NexacroRequest:
        """Parse Python dict payload into NexacroRequest."""
        params = payload.get("params", {})
        if not isinstance(params, dict):
            params = {}

        raw_datasets = payload.get("datasets", {})
        parsed_datasets: dict[str, Dataset] = {}

        if isinstance(raw_datasets, dict):
            for ds_name, ds_content in raw_datasets.items():
                if isinstance(ds_content, dict):
                    cols = [str(c) for c in ds_content.get("cols", [])]
                    rows = ds_content.get("rows", [])
                    if not isinstance(rows, list):
                        rows = []
                    # Normalize rows into lists
                    normalized_rows = []
                    for r in rows:
                        if isinstance(r, list):
                            normalized_rows.append(r)
                        elif isinstance(r, dict):
                            normalized_rows.append([r.get(c, "") for c in cols])
                    parsed_datasets[ds_name] = Dataset(
                        cols=cols,
                        count=len(normalized_rows),
                        rows=normalized_rows,
                    )

        return NexacroRequest(params=params, datasets=parsed_datasets)

    @classmethod
    def parse_json(cls, raw_json: str | bytes) -> NexacroRequest:
        """Parse JSON string or bytes into NexacroRequest."""
        if not raw_json:
            return NexacroRequest()
        try:
            data = json.loads(raw_json)
            if isinstance(data, dict):
                return cls.parse_dict(data)
            return NexacroRequest()
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON payload: {exc}") from exc

    @classmethod
    def parse_payload(cls, raw_body: bytes | str, content_type: str = "") -> NexacroRequest:
        """Detect whether payload is XML or JSON and parse accordingly."""
        if not raw_body:
            return NexacroRequest()

        if isinstance(raw_body, bytes):
            text = raw_body.decode("utf-8", errors="replace").strip()
        else:
            text = raw_body.strip()

        # Check content type or payload opening signature
        is_xml = (
            "xml" in content_type.lower() or text.startswith("<?xml") or text.startswith("<Root")
        )

        if is_xml:
            return cls.parse_xml(text)
        return cls.parse_json(text)
