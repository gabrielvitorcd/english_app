#!/bin/sh
# A API aplica as migrations antes de subir. RUN_MIGRATIONS=0 pula essa etapa (ex.: um segundo processo
# com a mesma imagem).
set -e
if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
  alembic upgrade head
fi
exec "$@"
