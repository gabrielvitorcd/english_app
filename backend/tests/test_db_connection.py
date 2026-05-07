"""Testes de conexão e integração com o banco de dados."""
import pytest
from sqlalchemy import text
from app.infrastructure.db.connection import engine, get_db


class TestDatabaseConnection:
    """Testes para validar a conexão com o banco de dados."""

    def test_engine_created(self):
        """Valida que o engine SQLAlchemy foi criado corretamente."""
        assert engine is not None
        assert "postgresql+psycopg2" in str(engine.url)

    def test_can_connect_to_database(self):
        """Valida que consegue estabelecer conexão com o banco."""
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            assert result.scalar() == 1

    def test_database_has_tables(self):
        """Valida que as tabelas foram criadas via migrations."""
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT table_name FROM information_schema.tables
                    WHERE table_schema = 'public'
                """)
            )
            tables = [row[0] for row in result.fetchall()]
            assert "user" in tables

    def test_get_db_dependency(self):
        """Valida que o dependency get_db retorna sessão ativa."""
        db = next(get_db())
        try:
            result = db.execute(text("SELECT 1"))
            assert result.scalar() == 1
        finally:
            db.close()
