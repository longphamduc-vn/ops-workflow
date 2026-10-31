"""Request structure validation against API catalog definitions and schemas."""

import logging
from typing import Any

from ems_sim.models.definition import ApiDefinition
from ems_sim.models.protocol import NexacroRequest
from ems_sim.registry.dataset_registry import DatasetRegistry

logger = logging.getLogger(__name__)


class RequestValidator:
    """Validates incoming NexacroRequest objects against API definition contracts."""

    @staticmethod
    def validate(
        api_def: ApiDefinition,
        request: NexacroRequest,
        dataset_registry: DatasetRegistry | None = None,
    ) -> str | None:
        """Validate request parameters and datasets against API definition.

        Returns:
            Error message string if validation fails, or None if valid.
        """
        req_config = api_def.request

        # 1. Validate required datasets
        if req_config.datasets:
            expected_names = [d.name for d in req_config.datasets]
            for ds_ref in req_config.datasets:
                expected_ds_name = ds_ref.name
                if expected_ds_name not in request.datasets:
                    return (
                        f"Missing required dataset '{expected_ds_name}' for endpoint '{api_def.endpoint.path}'. "
                        f"Expected datasets: {expected_names}"
                    )

                ds = request.datasets[expected_ds_name]

                # Check that dataset has columns defined
                if not ds.cols and (not ds.rows or not isinstance(ds.rows[0], dict)):
                    return (
                        f"Invalid dataset structure: Dataset '{expected_ds_name}' has no column definitions in ColumnInfo."
                    )

                # Validate dataset schema if available in registry
                if dataset_registry:
                    schema = dataset_registry.get(ds_ref.schema_id)
                    if schema and schema.columns:
                        expected_cols = set(schema.column_names)
                        actual_cols = set(ds.cols)
                        # Ensure dataset is not completely mismatched
                        if not expected_cols.intersection(actual_cols):
                            return (
                                f"Invalid dataset schema for '{expected_ds_name}': "
                                f"none of the provided columns {list(ds.cols)} match expected schema '{schema.id}'."
                            )

        # 2. Validate context parameters if defined
        if req_config.params:
            context_keys = {"_ems_userId", "_ems_organizationId"}
            expected_context_keys = context_keys.intersection(set(req_config.params))
            if expected_context_keys:
                provided_context = [k for k in expected_context_keys if request.get_param(k)]
                if not provided_context:
                    return (
                        f"Missing required context parameters for endpoint '{api_def.endpoint.path}'. "
                        f"At least one of {list(expected_context_keys)} must be provided in Parameters."
                    )

        return None
