#!/usr/bin/env bash
#
# Passo 2c — link final: gera ffmpeg.js + ffmpeg.wasm consumiveis pelo browser.
#
# O `make` do FFmpeg produz um bundle voltado a Node. Aqui refazemos o link com
# as flags que o browser precisa: MODULARIZE (import via ES module), MEMFS
# (arquivos in-memory), crescimento de heap e pthreads.
#
# Requer: ./scripts/build-x264.sh e ./scripts/build-ffmpeg.sh executados antes.
#
# Uso: ./scripts/link-ffmpeg-wasm.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FF_DIR="$ROOT/ffmpeg-wasm"
PREFIX="$ROOT/build/wasm"
# Fica em src/vendor/, nao em public/: o Vite recusa importar modulos de public/
# (regra intencional — public/ e copia-literal-sem-transforms). Do src/vendor/
# o consumidor usa `import url from './ffmpeg.js?url'`, o Vite trata como asset
# opaco (nao bundleia, so hasheia e serve).
OUT_DIR="$ROOT/frontend/src/vendor/ffmpeg"

source "$ROOT/emsdk/emsdk_env.sh" >/dev/null 2>&1

if [ ! -f "$PREFIX/lib/libavcodec.a" ]; then
  echo "ERRO: libavcodec.a nao encontrada. Rode ./scripts/build-ffmpeg.sh primeiro." >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
cd "$FF_DIR"

# Objetos do CLI, menos ffplay/ffprobe (desabilitados no configure).
# Precisa varrer os SUBDIRETORIOS tambem: fftools/graph, fftools/textformat e
# fftools/resources contem print_filtergraph* e suas dependencias, referenciados
# por ffmpeg.o e ffmpeg_filter.o.
CLI_OBJS=$(find fftools -name "*.o" | grep -vE "ffplay|ffprobe" | sort)

# PROXY_TO_PTHREAD    : main() roda num pthread proprio, nao na thread do outer
#                       worker. Sem isso, WORKERFS + pthreads deadlocka:
#                       pthreads pedem bytes via postMessage → outer worker esta
#                       bloqueado em callMain sincrono → ninguem responde →
#                       Atomics.wait espera pra sempre.
# INVOKE_RUN=1        : main() e chamado automaticamente pelo emscripten no
#                       fim da inicializacao. IMPORTANTE: PROXY_TO_PTHREAD so
#                       tem efeito na invocacao automatica de main; se o JS
#                       chamasse callMain manualmente (INVOKE_RUN=0), main
#                       rodaria no thread do outer worker e bloquearia tudo.
#                       Consequencia: os argumentos do ffmpeg sao passados
#                       via Module.arguments, nao via callMain.
# EXIT_RUNTIME=1      : com PROXY_TO_PTHREAD, main saindo dispara onExit no JS.
#                       Trocado de 0 pra 1 — o modulo e recriado por request.
# PTHREAD_POOL_SIZE=8 : main() ocupa 1 slot; scheduler do ffmpeg CLI abre
#                       demux/decode/filter/encode/mux (~6-7). Pool 8 evita
#                       spawn on-demand (mais rapido no cold start).
# ALLOW_MEMORY_GROWTH : video de filme facilmente passa do heap inicial
# MAXIMUM_MEMORY=4GB  : teto do wasm32
# FORCE_FILESYSTEM    : garante o MEMFS para escrever/ler os arquivos
emcc \
  -O3 \
  -pthread \
  -I"$PREFIX/include" \
  $CLI_OBJS \
  -L"$PREFIX/lib" \
  -lavcodec -lavformat -lavfilter -lavdevice -lswscale -lswresample -lavutil -lx264 \
  -lm \
  -o "$OUT_DIR/ffmpeg.js" \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s EXPORT_NAME=createFFmpeg \
  -s ENVIRONMENT=web,worker,node \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s MAXIMUM_MEMORY=4294967296 \
  -s INITIAL_MEMORY=134217728 \
  -s PROXY_TO_PTHREAD=1 \
  -s PTHREAD_POOL_SIZE=8 \
  -s FORCE_FILESYSTEM=1 \
  -lnodefs.js -lworkerfs.js \
  -s EXIT_RUNTIME=1 \
  -s INVOKE_RUN=1 \
  -s ASSERTIONS=0 \
  -s STACK_SIZE=5242880 \
  -s EXPORTED_FUNCTIONS='["_main","_malloc","_free"]' \
  -s EXPORTED_RUNTIME_METHODS='["FS","callMain","cwrap","ccall"]'

echo ""
echo "=== artefatos gerados em $OUT_DIR ==="
ls -la "$OUT_DIR"
