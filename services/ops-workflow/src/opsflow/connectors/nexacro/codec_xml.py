"""Nexacro Platform XML wire format codec (serializer and deserializer)."""

import xml.etree.ElementTree as ET
from typing import Any


def _strip_tag(tag: str) -> str:
    """Strip XML namespace prefix from element tag name."""
    if "}" in tag:
        return tag.split("}", 1)[1]
    return tag


def deserialize_xml(xml_content: str) -> tuple[dict[str, str], dict[str, list[dict[str, Any]]]]:
    """Parse Nexacro XML response into parameters and normalized datasets dictionary.

    Returns:
        parameters: dict[str, str] (e.g. {"ErrorCode": "0", "ErrorMsg": "SUCCESS"})
        datasets: dict[str, list[dict[str, Any]]] (e.g. {"dsList": [{"EQP_ID": "EQP001", ...}]})
    """
    parameters: dict[str, str] = {}
    datasets: dict[str, list[dict[str, Any]]] = {}

    if not xml_content or not xml_content.strip():
        return parameters, datasets

    try:
        root = ET.fromstring(xml_content.strip())
    except ET.ParseError as exc:
        raise ValueError(f"Invalid Nexacro XML payload: {exc}") from exc

    for child in root:
        tag_name = _strip_tag(child.tag)

        if tag_name == "Parameters":
            for param in child:
                param_id = param.attrib.get("id")
                if param_id:
                    parameters[param_id] = param.text.strip() if param.text else ""

        elif tag_name == "Dataset":
            ds_id = child.attrib.get("id", "dsDefault")
            rows: list[dict[str, Any]] = []

            rows_elem = None
            for elem in child:
                if _strip_tag(elem.tag) == "Rows":
                    rows_elem = elem
                    break

            if rows_elem is not None:
                for row in rows_elem:
                    if _strip_tag(row.tag) == "Row":
                        row_dict: dict[str, Any] = {}
                        for col in row:
                            col_id = col.attrib.get("id")
                            if col_id:
                                row_dict[col_id] = col.text.strip() if col.text is not None else ""
                        rows.append(row_dict)

            datasets[ds_id] = rows

    return parameters, datasets


def serialize_xml(
    parameters: dict[str, Any] | None = None,
    datasets: dict[str, list[dict[str, Any]]] | None = None,
) -> str:
    """Serialize parameters and datasets into Nexacro XML wire format payload."""
    root = ET.Element("Root", xmlns="http://www.nexacroplatform.com/platform/dataset")

    if parameters:
        params_elem = ET.SubElement(root, "Parameters")
        for k, v in parameters.items():
            param_elem = ET.SubElement(params_elem, "Parameter", id=str(k), type="string")
            param_elem.text = "" if v is None else str(v)

    if datasets:
        for ds_id, rows in datasets.items():
            ds_elem = ET.SubElement(root, "Dataset", id=str(ds_id))
            col_info_elem = ET.SubElement(ds_elem, "ColumnInfo")

            # Infer columns from first row if available
            cols: list[str] = []
            if rows and isinstance(rows[0], dict):
                cols = list(rows[0].keys())

            for col_id in cols:
                ET.SubElement(col_info_elem, "Column", id=col_id, type="STRING", size="256")

            rows_elem = ET.SubElement(ds_elem, "Rows")
            for r in rows:
                row_elem = ET.SubElement(rows_elem, "Row")
                for col_id in cols:
                    col_elem = ET.SubElement(row_elem, "Col", id=col_id)
                    val = r.get(col_id)
                    col_elem.text = "" if val is None else str(val)

    return '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding="unicode")
