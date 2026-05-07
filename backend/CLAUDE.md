# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FastAPI backend with PostgreSQL database, SQLAlchemy ORM, and Alembic migrations.

## Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   └── infrastructure/db/   # Database layer
│       ├── connection.py    # SQLAlchemy engine, session factory, get_db dependency
│       └── models.py        # SQLAlchemy models (Base declarative)
└── alembic/                 # Database migrations
```

**Database Connection** (`app/infrastructure/db/connection.py:12`):

- Connection string built from env vars: `DB_USER`, `DB_PASSWORD`, `DB_HOST` (default: `db`), `DB_PORT` (default: `5432`), `DB_NAME`
- Uses PostgreSQL with psycopg2 driver

**Models** (`app/infrastructure/db/models.py`):

- `Base` from `connection.py` is the declarative base
- Models inherit from `Base` via intermediate class (e.g., `Table_Base`)

**Migrations**:

- Alembic configured in `alembic.ini`
- `alembic/env.py` imports from `app.infrastructure.db` for `Base` and `SQLALCHEMY_DATABASE_URL`
- Migration files in `alembic/versions/`

## Commands

**Run server:**

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Database migrations:**

```bash
# Create new migration (autogenerate from models)
alembic revision --autogenerate -m "description"

# Apply all pending migrations
alembic upgrade head

# Downgrade one version
alembic downgrade -1

# View current migration status
alembic current
```

**Tests:**

```bash
pytest           # Run all tests
pytest -v        # Verbose output
pytest -x        # Stop on first failure
```

## Environment Variables

Required for database connection:

- `DB_USER` - PostgreSQL username
- `DB_PASSWORD` - PostgreSQL password
- `DB_NAME` - Database name
- `DB_HOST` - Host (default: `db`)
- `DB_PORT` - Port (default: `5432`)

### `suggestion-commit`

Sempre que este comando for invocado:

1. Execute `git diff --cached --name-status` para pegar apenas os arquivos em stage.
2. Para cada arquivo:
   - Status `A` → leia o arquivo e descreva o que ele faz
   - Status `M` → execute `git diff --cached <arquivo>` e descreva apenas as alterações
3. Gere uma mensagem de commit por arquivo no formato:

<tipo>(backend - <componente>): <descrição curta em português>

- <detalhe 1 do que foi implementado/alterado>
- <detalhe 2>
- <detalhe 3>

4. Responda **ÚNICA E EXCLUSIVAMENTE** com as mensagens, separadas por linha em branco.
5. **Proibido** incluir `git commit -m`, aspas, explicações ou qualquer outro texto.
