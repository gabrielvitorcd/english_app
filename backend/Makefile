.PHONY: dev test lint fmt typecheck migrate makemigration up down logs openapi check

dev:            ## API local com recarga
	uv run uvicorn app.main:app --reload --port 8000

test:           ## testes (Postgres via testcontainers ou TEST_DATABASE_URL)
	uv run pytest

lint:
	uv run ruff check . && uv run ruff format --check . && uv run lint-imports

fmt:
	uv run ruff format . && uv run ruff check --fix .

typecheck:
	uv run mypy app

check: lint typecheck test

migrate:
	uv run alembic upgrade head

makemigration:  ## make makemigration m="descrição"
	uv run alembic revision --autogenerate -m "$(m)"

openapi:        ## atualiza docs/openapi.json
	@# Grava num temporário para não deixar o openapi.json vazio se falhar.
	uv run python -c "import json; from app.main import app; print(json.dumps(app.openapi(), ensure_ascii=False, indent=2))" > ../docs/openapi.json.tmp
	mv ../docs/openapi.json.tmp ../docs/openapi.json

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f --tail=200
