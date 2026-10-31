"""Dataset definition registry."""

import logging
from pathlib import Path

import yaml

from ems_sim.models.definition import DatasetDefinition

logger = logging.getLogger(__name__)


class DatasetRegistry:
    """Stores and resolves dataset schemas."""

    def __init__(self) -> None:
        self._datasets: dict[str, DatasetDefinition] = {}

    def register(self, dataset: DatasetDefinition) -> None:
        self._datasets[dataset.id] = dataset

    def get(self, dataset_id: str) -> DatasetDefinition | None:
        return self._datasets.get(dataset_id)

    def list_all(self) -> list[DatasetDefinition]:
        return list(self._datasets.values())

    def load_from_directory(self, directory: Path) -> int:
        count = 0
        if not directory.exists():
            return count

        for file_path in directory.glob("*.yaml"):
            try:
                with open(file_path, encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                    if data and "id" in data:
                        ds_def = DatasetDefinition.model_validate(data)
                        self.register(ds_def)
                        count += 1
            except Exception as e:
                logger.error(f"Failed to load dataset from {file_path}: {e}")
        return count
