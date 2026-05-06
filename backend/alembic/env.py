import os
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool, create_engine
from alembic import context

from app.database import Base, SQLALCHEMY_DATABASE_URL
from app.infrastructure.db.models import Table_Base

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Modo Offline: Gera scripts SQL sem se conectar ao banco."""

    url = os.getenv("DATABASE_URL") or config.get_main_option("sqlalchemy.url")


    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Modo Online: Conecta ao banco e aplica as mudanças."""

    connectable = create_engine(
        SQLALCHEMY_DATABASE_URL,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
