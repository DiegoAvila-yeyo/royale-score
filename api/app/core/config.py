"""Application configuration via environment variables."""
import os
from functools import lru_cache
from typing import List


class Settings:
    app_name: str = "RoyaleScore"
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./royalescore.db")
    cors_origins: List[str] = [
        o.strip()
        for o in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000",
        ).split(",")
    ]
    sql_echo: bool = os.getenv("SQL_ECHO", "false").lower() == "true"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
