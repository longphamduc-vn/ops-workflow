"""Secret management and automatic masking for opsflow."""

import os
from abc import ABC, abstractmethod
from collections.abc import Sequence

from opsflow.core.errors import SecretNotFoundError


class SecretProvider(ABC):
    """Abstract base class for secret resolution."""

    @abstractmethod
    def get_secret(self, key: str) -> str:
        """Retrieve the secret value for the given key name.

        Raises SecretNotFoundError if the secret is not found.
        """

    @abstractmethod
    def get_known_secret_values(self) -> set[str]:
        """Return the set of known secret values for masking purposes."""


class EnvSecretProvider(SecretProvider):
    """Retrieves secrets from environment variables."""

    def __init__(self, prefix: str = "") -> None:
        self.prefix = prefix
        self._cached_values: set[str] = set()

    def get_secret(self, key: str) -> str:
        env_key = f"{self.prefix}{key}"
        val = os.getenv(env_key)
        if val is None:
            raise SecretNotFoundError(f"Secret '{key}' not found in environment (checked {env_key})")
        if val:
            self._cached_values.add(val)
        return val

    def get_known_secret_values(self) -> set[str]:
        return self._cached_values


_default_provider: SecretProvider = EnvSecretProvider()


def get_secret_provider() -> SecretProvider:
    """Return the global secret provider instance."""
    return _default_provider


def set_secret_provider(provider: SecretProvider) -> None:
    """Set the global secret provider instance."""
    global _default_provider
    _default_provider = provider


def mask_secrets(text: str, secret_values: Sequence[str]) -> str:
    """Mask known secret values in a string to prevent secret leakage in logs or outputs."""
    if not text or not secret_values:
        return text

    masked = text
    for sec in sorted(secret_values, key=len, reverse=True):
        if sec and len(sec) >= 3:
            masked = masked.replace(sec, "******")
    return masked
