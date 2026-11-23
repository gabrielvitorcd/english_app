#!/usr/bin/env bash
# Backup externo do LearnWatching: pg_dump → restic num storage S3-compatível (B2/R2), no modelo do
# core-studio. Só o banco: o LearnWatching não guarda arquivos no servidor.
# NÃO é instalado pelo deploy. Para ligar, uma vez na VPS:
#   1. /etc/learnwatching-backup.env (chmod 600, dono core) com RESTIC_REPOSITORY, RESTIC_PASSWORD,
#      AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY. Use um repositório (ou prefixo) próprio, separado do
#      core-studio: o "forget" daqui só olha a tag learnwatching, mas assim um projeto nunca mexe no outro;
#   2. restic init (uma vez, com as variáveis acima carregadas);
#   3. no crontab do usuário core (crontab -e):
#      45 3 * * *  /opt/learnwatching/deploy/backup.sh >> /opt/learnwatching/backups/backup.log 2>&1
# Retenção: 7 diários, 4 semanais e 6 mensais. Restaurar: veja "Backups" no backend/README.md.
set -euo pipefail
cd "$(dirname "$0")/.."   # /opt/learnwatching (compose.yml e .env)
# shellcheck disable=SC1091
source /etc/learnwatching-backup.env
export RESTIC_REPOSITORY RESTIC_PASSWORD AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY
STAMP=$(date +%Y%m%d-%H%M)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# shellcheck disable=SC2016  # $POSTGRES_USER e $POSTGRES_DB são do container do banco
docker compose exec -T db sh -c 'pg_dump -Fc -U "$POSTGRES_USER" "$POSTGRES_DB"' > "$TMP/learnwatching.dump"
# Caminho fixo (--stdin-filename) e agrupamento por tag: o temporário muda a cada noite, e com o
# agrupamento padrão (host + caminhos) cada snapshot ficaria num grupo só dele e nunca seria apagado.
restic backup --tag learnwatching --tag db --stdin --stdin-filename learnwatching.dump < "$TMP/learnwatching.dump"
restic forget --prune --tag learnwatching --group-by host,tags --keep-daily 7 --keep-weekly 4 --keep-monthly 6
echo "backup ok $STAMP"
