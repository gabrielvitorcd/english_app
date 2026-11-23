#!/usr/bin/env bash
# Publica a main na VPS (produção). Roda no PC, depois do merge da develop na main:
#
#   make deploy              publica o que está na main do GitHub (origin/main)
#   make deploy-voltar       volta a VPS para a versão anterior
#
# Não depende do GitHub Actions: monta o app aqui, manda a versão para a VPS pela chave SSH e a imagem do
# servidor é montada lá (com cache, só refaz o que mudou). Na VPS, deploy.sh faz backup do banco, sobe,
# instala o site na borda e espera a API ficar saudável; se não ficar, volta sozinho para a anterior.
# Os testes rodam antes de cada push (gancho .githooks/pre-push), então a main já chega testada.
#
# O bundle do ffmpeg.wasm (app/src/vendor/ffmpeg/) não está no git (compilar exige o emsdk): ele vem da
# sua pasta de trabalho, e o sha256 dos dois arquivos aparece no log. Se faltar: make wasm.
#
# Endereço da API: ainda não há domínio. Até haver, rode com API_URL=https://api.<domínio> make deploy;
# quando o domínio existir, troque o padrão abaixo pelo endereço real (como no core-studio).
# shellcheck disable=SC2029  # $BASE e $SHA são expandidos aqui no PC de propósito
set -euo pipefail

VPS="${VPS:-core@66.94.103.108}"
API_URL="${API_URL:-}"
BASE=/opt/learnwatching

log() { echo "[publicar $(date +%H:%M:%S)] $*"; }

if [ "${1:-}" = "--voltar" ]; then
  ssh "$VPS" "bash $BASE/deploy/deploy.sh --voltar"
  exit $?
fi

if [ -z "$API_URL" ] || [[ $API_URL == *exemplo.com.br* ]]; then
  log "o domínio do LearnWatching ainda não está definido: não publico."
  log "Rode com o endereço público da API (o mesmo PUBLIC_API_URL do $BASE/.env na VPS), por exemplo:"
  log "  API_URL=https://api.meudominio.com.br make deploy"
  log "e confira no .env da VPS LEARN_DOMAIN, LEARN_APP_DOMAIN, PUBLIC_API_URL e CORS_ORIGINS."
  exit 1
fi
if ! [[ $API_URL =~ ^https://[A-Za-z0-9.-]+\.[A-Za-z]+$ ]]; then
  log "API_URL inválido: '$API_URL' (use https://api.<domínio>, sem barra no fim)"
  exit 1
fi

ROOT=$(git rev-parse --show-toplevel)
cd "$ROOT"

VENDOR=app/src/vendor/ffmpeg
for f in ffmpeg.js ffmpeg.wasm; do
  if [ ! -s "$ROOT/$VENDOR/$f" ]; then
    log "falta $VENDOR/$f nesta pasta (o bundle do ffmpeg.wasm não está no git)."
    log "Compile com: make wasm   (precisa do emsdk; veja docs/transcoding/02-build.md)"
    exit 1
  fi
done

git fetch -q origin main
SHA=$(git rev-parse origin/main)
log "main no GitHub: ${SHA:0:12} — $(git log -1 --format=%s origin/main)"

ATUAL=$(ssh "$VPS" "cat $BASE/.deploy/atual 2>/dev/null || true")
if [ "$ATUAL" = "$SHA" ] && [ "${1:-}" != "--de-novo" ]; then
  log "essa versão já está no ar (use --de-novo para publicar de novo)"
  exit 0
fi

TMP=$(mktemp -d)
# shellcheck disable=SC2329  # chamada pelo trap
cleanup() { git worktree remove --force "$TMP/src" >/dev/null 2>&1 || true; rm -rf "$TMP"; }
trap cleanup EXIT

# Uma cópia limpa da main (não leva nada que esteja só no seu PC, como app/public/videos/), mais o bundle
# do ffmpeg.wasm, que só existe na sua pasta.
git worktree add -q --detach "$TMP/src" "$SHA"
mkdir -p "$TMP/src/$VENDOR"
cp "$ROOT/$VENDOR/ffmpeg.js" "$ROOT/$VENDOR/ffmpeg.wasm" "$TMP/src/$VENDOR/"
(cd "$TMP/src/$VENDOR" && sha256sum ffmpeg.js ffmpeg.wasm) | while read -r soma arq; do
  log "bundle do ffmpeg: $arq sha256 $soma"
done

log "montando o app de produção ($API_URL)"
(cd "$TMP/src/app" && npm ci --no-audit --no-fund --loglevel=error && VITE_API_URL="$API_URL" npm run build >/dev/null)
if [ -e "$TMP/src/app/dist/videos" ]; then
  log "o build trouxe app/public/videos/: os vídeos locais nunca vão para a produção. Parei."
  exit 1
fi

log "empacotando a versão"
mkdir -p "$TMP/rel"
cp "$TMP/src/backend/compose.yml" "$TMP/rel/"
cp -r "$TMP/src/backend/deploy" "$TMP/rel/deploy"
cp -r "$TMP/src/app/dist" "$TMP/rel/app"
git archive "$SHA" backend | tar -x -C "$TMP/rel"   # código do servidor, para montar a imagem na VPS
tar czf "$TMP/$SHA.tgz" -C "$TMP/rel" .
log "enviando ($(du -h "$TMP/$SHA.tgz" | cut -f1))"
ssh "$VPS" "test -d $BASE" || { log "$BASE não existe na VPS: rode antes o borda/instalar.sh do core-studio (ele cria a pasta)"; exit 1; }
ssh "$VPS" "mkdir -p $BASE/releases"
scp -q "$TMP/$SHA.tgz" "$VPS:$BASE/releases/$SHA.tgz"

log "montando a imagem do servidor na VPS e subindo"
ssh "$VPS" "set -e
  cd $BASE/releases && rm -rf $SHA && mkdir $SHA && tar xzf $SHA.tgz -C $SHA && rm $SHA.tgz
  docker build -q -t learnwatching-api:$SHA $SHA/backend >/dev/null
  rm -rf $SHA/backend
  bash $BASE/releases/$SHA/deploy/deploy.sh $SHA"

log "conferindo pela internet"
for _ in $(seq 1 12); do
  if curl -fsS "$API_URL/health" >/dev/null 2>&1; then
    log "no ar: ${SHA:0:12} — $API_URL"
    exit 0
  fi
  sleep 5
done
log "a API não respondeu pela internet (a VPS subiu; confira DNS e certificado)"
exit 1
