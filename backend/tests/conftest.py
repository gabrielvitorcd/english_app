"""Postgres real para os testes.

Usa TEST_DATABASE_URL se existir (ex.: o Postgres do compose.dev.yml); senão sobe um postgres:17 com
testcontainers. As migrations rodam uma vez, num processo separado. Cada teste fora de `tests/unit` começa
com o banco limpo (TRUNCATE), como no core-studio.
"""

import os
import subprocess
import sys
from collections.abc import AsyncIterator, Iterator
from pathlib import Path
from typing import Any

import pytest

from app.modules.subtitles.domain.models import VideoInfo

_container: Any = None


def pytest_configure(config: pytest.Config) -> None:
    global _container
    url = os.environ.get("TEST_DATABASE_URL")
    if not url:
        from testcontainers.postgres import PostgresContainer

        _container = PostgresContainer("postgres:17-alpine", driver="psycopg")
        _container.start()
        url = _container.get_connection_url()
    os.environ.update(
        DATABASE_URL=url,
        ENV="test",
        LOG_LEVEL="WARNING",
        PUBLIC_API_URL="http://test",
        CORS_ORIGINS="http://localhost:5200",
    )
    # Migrations num processo separado: o env.py do Alembic usa asyncio.run().
    root = Path(__file__).resolve().parent.parent
    import psycopg

    with psycopg.connect(url.replace("postgresql+psycopg://", "postgresql://"), autocommit=True) as conn:
        conn.execute("DROP SCHEMA public CASCADE")
        conn.execute("CREATE SCHEMA public")
    subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"], cwd=root, check=True, capture_output=True
    )


def pytest_unconfigure(config: pytest.Config) -> None:
    if _container is not None:
        _container.stop()


@pytest.fixture(autouse=True)
async def clean_db(request: pytest.FixtureRequest) -> AsyncIterator[None]:
    if "unit" in request.node.nodeid.split("/"):
        yield
        return
    from sqlalchemy import text

    from app.core.db import get_engine

    async with get_engine().begin() as conn:
        tables = (
            await conn.execute(
                text(
                    "SELECT tablename FROM pg_tables WHERE schemaname='public' "
                    "AND tablename NOT IN ('alembic_version')"
                )
            )
        ).scalars()
        names = ", ".join(f'"{t}"' for t in tables)
        if names:
            await conn.execute(text(f"TRUNCATE {names} RESTART IDENTITY CASCADE"))
    yield


class FakeSubtitleSource:
    """Adaptador falso da porta SubtitleSource: devolve `info` sem sair para a internet."""

    def __init__(self) -> None:
        self.info: VideoInfo = {}
        self.error: Exception | None = None
        self.texts: dict[str, str] = {}
        self.calls: list[tuple[str, ...]] = []

    def list_info(self, video_id: str) -> VideoInfo:
        self.calls.append(("list_info", video_id))
        if self.error is not None:
            raise self.error
        return self.info

    def download_info(self, video_id: str, language_code: str) -> VideoInfo:
        self.calls.append(("download_info", video_id, language_code))
        if self.error is not None:
            raise self.error
        return self.info

    def fetch_text(self, url: str) -> str:
        self.calls.append(("fetch_text", url))
        return self.texts[url]


@pytest.fixture
def source() -> Iterator[FakeSubtitleSource]:
    yield FakeSubtitleSource()


@pytest.fixture
async def client(source: FakeSubtitleSource) -> AsyncIterator[Any]:
    import httpx

    from app.main import create_app
    from app.modules.subtitles.api.routes import subtitle_source

    app = create_app()
    app.dependency_overrides[subtitle_source] = lambda: source
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
