"""Configuration module for the EMS Simulation Platform."""

from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Platform runtime settings."""

    model_config = SettingsConfigDict(env_prefix="EMS_SIM_", env_file=".env", extra="ignore")

    app_name: str = "EMS API Simulation Platform"
    environment: str = "development"
    debug: bool = True

    host: str = "0.0.0.0"
    port: int = 9000  # Default port matching observed EMS backend port

    database_url: str = "sqlite+aiosqlite:///ems_simulation.db"
    echo_sql: bool = False

    catalog_dir: Path = Field(
        default_factory=lambda: Path(__file__).resolve().parent.parent.parent / "catalog"
    )

    log_level: str = "INFO"
    record_payloads: bool = True
    strict_request_validation: bool = True


settings = Settings()
