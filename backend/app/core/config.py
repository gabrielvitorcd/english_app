"""Configuração lida do ambiente (.env em desenvolvimento)."""

from functools import lru_cache
from typing import Annotated, Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    ENV: Literal["dev", "test", "prod"] = "dev"
    LOG_LEVEL: str = "INFO"

    # Padrão: o Postgres de desenvolvimento do compose.dev.yml (porta 5433).
    DATABASE_URL: str = "postgresql+psycopg://learn:learn@127.0.0.1:5433/learnwatching"

    # Origens do app, separadas por vírgula. Padrão: o Vite em desenvolvimento.
    CORS_ORIGINS: Annotated[list[str], NoDecode] = ["http://localhost:5200"]
    # Endereço público da API (ex.: https://api.exemplo.com.br).
    PUBLIC_API_URL: str = "http://localhost:8000"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str) and not value.strip().startswith("["):
            return [o.strip() for o in value.split(",") if o.strip()]
        return value

    @property
    def is_prod(self) -> bool:
        return self.ENV == "prod"


@lru_cache
def get_settings() -> Settings:
    return Settings()  # valores vêm do ambiente
