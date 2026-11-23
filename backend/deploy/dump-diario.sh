#!/usr/bin/env bash
# Dump diário do banco do LearnWatching, dentro da própria VPS, com retenção por dias. Não há worker de
# jobs neste projeto, então quem agenda é o cron do host. NÃO é instalado pelo deploy: instale à mão, uma
# vez, no crontab do usuário core (crontab -e):
#
#   30 3 * * *  /opt/learnwatching/deploy/dump-diario.sh >> /opt/learnwatching/backups/dump-diario.log 2>&1
#
# Grava em /opt/learnwatching/backups/diario/learnwatching-AAAAMMDD-HHMM.dump (pg_dump -Fc) e apaga os
# mais velhos que DUMP_DIAS dias (padrão 14). Restaurar: veja "Backups" no backend/README.md.
# Os dumps ficam no mesmo disco da VPS: a cópia para fora é o backup.sh (restic).
set -euo pipefail
cd "$(dirname "$0")/.."   # /opt/learnwatching (compose.yml e .env)
DIAS=${DUMP_DIAS:-14}
PASTA=backups/diario
mkdir -p "$PASTA"
f="$PASTA/learnwatching-$(date +%Y%m%d-%H%M).dump"

# Num temporário primeiro: um dump que falhou no meio nunca fica com cara de dump bom.
# shellcheck disable=SC2016  # $POSTGRES_USER e $POSTGRES_DB são do container do banco
docker compose exec -T db sh -c 'pg_dump -Fc -U "$POSTGRES_USER" "$POSTGRES_DB"' > "$f.parcial"
mv "$f.parcial" "$f"
find "$PASTA" -maxdepth 1 -name 'learnwatching-*.dump' -mtime +"$DIAS" -delete
echo "$(date '+%F %T') dump ok: $f ($(du -h "$f" | cut -f1))"
