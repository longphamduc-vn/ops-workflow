"""Nexacro protocol models representing datasets, requests, and responses."""

from typing import Any

from pydantic import BaseModel, Field


class Dataset(BaseModel):
    """Nexacro Dataset structure preserving strict column order and row arrays."""

    cols: list[str] = Field(default_factory=list, description="Ordered column names")
    count: int = Field(default=0, description="Total number of rows in the dataset")
    rows: list[list[Any]] = Field(default_factory=list, description="Ordered row values")

    def to_dict_list(self) -> list[dict[str, Any]]:
        """Convert row arrays to list of key-value dictionaries."""
        records: list[dict[str, Any]] = []
        for row in self.rows:
            # Map up to the number of columns available
            row_dict = {}
            for i, col in enumerate(self.cols):
                val = row[i] if i < len(row) else ""
                row_dict[col] = val
            records.append(row_dict)
        return records

    @classmethod
    def from_dict_list(cls, cols: list[str], records: list[dict[str, Any]]) -> "Dataset":
        """Construct Dataset from ordered columns and dict records."""
        rows: list[list[Any]] = []
        for rec in records:
            row = [rec.get(col, "") for col in cols]
            rows.append(row)
        return cls(cols=cols, count=len(rows), rows=rows)

    @classmethod
    def empty(cls, cols: list[str]) -> "Dataset":
        """Construct empty dataset with predefined columns."""
        return cls(cols=cols, count=0, rows=[])


class NexacroRequest(BaseModel):
    """Parsed Nexacro Request model."""

    params: dict[str, Any] = Field(default_factory=dict, description="Request level parameters")
    datasets: dict[str, Dataset] = Field(default_factory=dict, description="Named input datasets")

    def get_param(self, name: str, default: Any = None) -> Any:
        return self.params.get(name, default)

    def get_dataset(self, name: str) -> Dataset | None:
        return self.datasets.get(name)

    def get_first_row(self, dataset_name: str) -> dict[str, Any]:
        """Convenience helper to get the first row of a dataset as a dict."""
        ds = self.get_dataset(dataset_name)
        if not ds or not ds.rows:
            return {}
        return ds.to_dict_list()[0]


class NexacroResponse(BaseModel):
    """Standard Nexacro Response model."""

    params: dict[str, Any] = Field(
        default_factory=lambda: {"errorCode": "1", "errorMsg": ""},
        description="Response parameters (errorCode, errorMsg, etc.)",
    )
    datasets: dict[str, Dataset] = Field(default_factory=dict, description="Named output datasets")

    @classmethod
    def success(
        cls, datasets: dict[str, Dataset] | None = None, extra_params: dict[str, Any] | None = None
    ) -> "NexacroResponse":
        """Create a successful Nexacro response with errorCode='1' and errorMsg=''."""
        params = {"errorCode": "1", "errorMsg": ""}
        if extra_params:
            params.update(extra_params)
        return cls(params=params, datasets=datasets or {})

    @classmethod
    def error(
        cls, error_msg: str, error_code: str = "-1", datasets: dict[str, Dataset] | None = None
    ) -> "NexacroResponse":
        """Create an error Nexacro response."""
        return cls(
            params={"errorCode": error_code, "errorMsg": error_msg},
            datasets=datasets or {},
        )
