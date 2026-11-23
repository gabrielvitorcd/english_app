#!/usr/bin/env bash
# Ambiente de TESTE no PC: sobe o sistema com o código da branch atual, para conferir uma mudança antes de
# juntar e publicar. Banco próprio (projeto compose "learnwatching-teste", separado de tudo).
#
#   make teste          monta o app, a imagem do servidor e sobe → https://app.localhost:8443 (API em
#                       https://localhost:8443); depois fica observando app/: cada arquivo salvo monta o
#                       app de novo (Ctrl+C para de observar, o ambiente continua no ar). Mudanças no
#                       backend pedem rodar o make teste de novo.
#   make teste-parar    desliga (os dados de teste ficam guardados) e para o observador do app, se estiver
#                       rodando em outro terminal
#
# Portas 8080/8443, para rodar junto com o teste do core-studio (80/443).
# Os vídeos locais (app/public/videos/, cerca de 4 GB) nunca vão para o app-dist: o app é montado sem
# copiar public/ e os arquivos de public/ vão por rsync, sem videos/.
#
# Configuração em backend/.env.teste (fora do git), por exemplo:
#   ENV=prod
#   LOG_LEVEL=INFO
#   POSTGRES_USER=learn
#   POSTGRES_PASSWORD=teste-local
#   POSTGRES_DB=learnwatching
#   CORS_ORIGINS=https://app.localhost:8443
#   PUBLIC_API_URL=https://localhost:8443
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
B="$ROOT/backend"
API_URL=https://localhost:8443
APP_URL=https://app.localhost:8443
PROJETO=learnwatching-teste
VENDOR=app/src/vendor/ffmpeg

log() { echo "[teste $(date +%H:%M:%S)] $*"; }

# Numa worktree (Orca, git worktree) o .env.teste e o bundle do ffmpeg.wasm não vêm junto: ficam fora do
# git. O .env.teste é ligado ao da pasta principal (sem copiar a senha; o compose lê o arquivo de
# backend/, então precisa estar ali). O bundle é copiado.
MAIN=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
if [ ! -e "$B/.env.teste" ] && [ "$MAIN" != "$ROOT" ] && [ -f "$MAIN/backend/.env.teste" ]; then
  ln -s "$MAIN/backend/.env.teste" "$B/.env.teste"
  log "worktree: usando o backend/.env.teste da pasta principal ($MAIN)"
fi
dc() {
  docker compose -p "$PROJETO" --project-directory "$B" --env-file "$B/.env.teste" \
    -f "$B/compose.yml" -f "$B/compose.teste.yml" "$@"
}

if [ "${1:-}" = "--parar" ]; then
  # O observador do app (vite build --watch) leva no comando o caminho do app-dist desta pasta.
  if pkill -f -- "--learnwatching-teste-watch=$B/app-dist" 2>/dev/null; then
    log "observador do app parado"
  fi
  if [ -f "$B/.env.teste" ] && docker info >/dev/null 2>&1; then
    dc stop
  fi
  log "ambiente de teste desligado (os dados continuam guardados; apagar tudo: $0 --apagar)"
  exit 0
fi

[ -f "$B/.env.teste" ] || { log "falta backend/.env.teste (veja o exemplo no topo de backend/deploy/teste.sh)"; exit 1; }
if ! docker info >/dev/null 2>&1; then
  log "sem acesso ao Docker nesta sessão. Saia e entre de novo no sistema (logout/login) uma vez,"
  log "ou rode antes, neste terminal:  newgrp docker"
  exit 1
fi

if [ "${1:-}" = "--apagar" ]; then
  pkill -f -- "--learnwatching-teste-watch=$B/app-dist" 2>/dev/null || true
  dc down -v --remove-orphans
  log "ambiente de teste apagado (containers e volumes do projeto $PROJETO)"
  exit 0
fi

if [ ! -s "$ROOT/$VENDOR/ffmpeg.wasm" ] && [ "$MAIN" != "$ROOT" ] && [ -s "$MAIN/$VENDOR/ffmpeg.wasm" ]; then
  mkdir -p "$ROOT/$VENDOR"
  cp "$MAIN/$VENDOR/ffmpeg.js" "$MAIN/$VENDOR/ffmpeg.wasm" "$ROOT/$VENDOR/"
  log "worktree: bundle do ffmpeg.wasm copiado da pasta principal"
fi
for f in ffmpeg.js ffmpeg.wasm; do
  [ -s "$ROOT/$VENDOR/$f" ] || { log "falta $VENDOR/$f (o bundle não está no git). Compile com: make wasm"; exit 1; }
done

log "branch: $(git branch --show-current) — $(git log -1 --format='%h %s')"
[ -z "$(git status --porcelain)" ] || log "(com alterações ainda não salvas em commit: elas também entram no teste)"

# Um observador de um make teste anterior escreveria no app-dist junto com este.
pkill -f -- "--learnwatching-teste-watch=$B/app-dist" 2>/dev/null || true

# Monta o app com a API do Vite, igual ao `vite build` do npm run build, mas sem copiar public/ para a
# saída (copyPublicDir: false): é assim que app/public/videos/ fica de fora. $1 = pasta de saída;
# WATCH=1 fica observando. O último argumento só marca o processo para o teste-parar achar.
vite_build() {
  (cd "$ROOT/app" && VITE_API_URL=$API_URL OUT="$1" WATCH="${WATCH:-}" exec node --input-type=module -e '
    import { build } from "vite";
    await build({
      logLevel: process.env.WATCH ? "info" : "warn",
      build: {
        outDir: process.env.OUT,
        emptyOutDir: !process.env.WATCH,
        copyPublicDir: false,
        watch: process.env.WATCH ? {} : null,
      },
    });
  ' -- "--learnwatching-teste-watch=$B/app-dist")
}

log "montando o app (endereço $API_URL)"
(cd "$ROOT/app" && npm ci --no-audit --no-fund --loglevel=error >/dev/null)
STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT
vite_build "$STAGE"
rsync -a --exclude 'videos/' "$ROOT/app/public/" "$STAGE/"
# O Caddy do teste monta app-dist como pasta: atualizar o conteúdo, nunca apagar e recriar a pasta.
mkdir -p "$B/app-dist"
rsync -a --checksum --delete "$STAGE/" "$B/app-dist/"
if [ -e "$B/app-dist/videos" ]; then log "app-dist com videos/: parei (não devia acontecer)"; exit 1; fi

log "montando a imagem do servidor e subindo (projeto $PROJETO)"
# A API entra na rede externa "borda" (na VPS, a do Caddy compartilhado); no PC ela é criada aqui uma vez.
docker network inspect borda >/dev/null 2>&1 || docker network create borda >/dev/null
dc up -d --build --remove-orphans 2>&1 | grep -E "Error|error|Built|Started|Running|Healthy" || true

for _ in $(seq 1 36); do
  if curl -fsSk "$API_URL/health" >/dev/null 2>&1; then
    log "pronto: $APP_URL  (API $API_URL)"
    log "observando app/: ao salvar um arquivo, o app é montado de novo (recarregue a página)."
    log "Ctrl+C para de observar (o ambiente continua no ar). Desligar: make teste-parar"
    rm -rf "$STAGE"
    trap - EXIT
    # Grava direto em app-dist sem esvaziar a pasta (o Caddy do teste a monta; arquivos velhos saem no
    # próximo make teste). Sem copiar public/: os vídeos continuam fora.
    WATCH=1 vite_build "$B/app-dist"
    exit 0
  fi
  sleep 5
done
log "a API de teste não respondeu em 3 minutos. Veja: docker compose -p $PROJETO logs api"
exit 1
