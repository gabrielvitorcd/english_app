from typing import Any

from sqlalchemy import select, text

from app.core.db import get_sessionmaker
from app.modules.users.infrastructure.orm import UserRow


async def test_health_igual_ao_de_antes(client: Any) -> None:
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/json"
    assert r.text == '"ESTAMOS ONLINE!"'
    assert r.headers["x-request-id"]


async def test_ready_testa_o_banco(client: Any) -> None:
    r = await client.get("/ready")
    assert r.status_code == 200
    assert r.json() == {"status": "ready"}


async def test_cors_do_app_em_dev(client: Any) -> None:
    origem = "http://localhost:5200"
    r = await client.options(
        "/api/subtitles/list", headers={"Origin": origem, "Access-Control-Request-Method": "GET"}
    )
    assert r.status_code == 200
    assert r.headers["access-control-allow-origin"] == origem
    assert r.headers["access-control-allow-credentials"] == "true"
    assert r.headers["access-control-allow-methods"] == "GET, POST"
    r = await client.options(
        "/api/subtitles/list", headers={"Origin": "http://outro.com", "Access-Control-Request-Method": "GET"}
    )
    assert r.status_code == 400


# ---------------------------------------------------------------- banco (substitui o test_db_connection.py)


async def test_migrations_no_head() -> None:
    async with get_sessionmaker()() as s:
        assert (await s.execute(text("SELECT version_num FROM alembic_version"))).scalar_one() == "0002"


async def test_tabela_user_grava_e_le() -> None:
    async with get_sessionmaker()() as s, s.begin():
        s.add(UserRow(nome="Gabi", email="gabi@exemplo.com"))
    async with get_sessionmaker()() as s:
        rows = (await s.scalars(select(UserRow))).all()
    assert [(r.id, r.nome, r.email) for r in rows] == [(1, "Gabi", "gabi@exemplo.com")]


async def test_nomes_do_indice_e_da_chave_primaria() -> None:
    async with get_sessionmaker()() as s:
        indexes = (
            await s.scalars(text("SELECT indexname FROM pg_indexes WHERE tablename = 'user' ORDER BY 1"))
        ).all()
    assert indexes == ["ix_user_id", "pk_user"]
