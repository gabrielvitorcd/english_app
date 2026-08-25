#!/usr/bin/env bash
#
# Passo 2a — cross-compila libx264 para WebAssembly com Emscripten.
#
# libx264 nao vem no source do FFmpeg: precisa ser compilada ANTES, e instalada
# num prefix que o configure do FFmpeg encontre via pkg-config. Ver docs/transcoding/01-escopo.md §7.
#
# Uso: ./scripts/build-x264.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
X264_DIR="$ROOT/libx264"
PREFIX="$ROOT/build/wasm"          # onde os .a e .pc ficam instalados

source "$ROOT/emsdk/emsdk_env.sh" >/dev/null 2>&1

cd "$X264_DIR"

# Build limpo: configure do x264 nao lida bem com reconfiguracao.
[ -f config.mak ] && make distclean >/dev/null 2>&1 || true

# --host=i686-gnu     : finge um alvo 32-bit generico (wasm32 nao e reconhecido)
# --disable-asm       : nao existe assembly x86 em wasm
# --disable-cli       : queremos so a libx264.a, nao o binario x264
# --enable-static     : linkagem estatica no ffmpeg.wasm
# --enable-pic        : exigido ao linkar com pthreads no emscripten
# --disable-opencl    : sem GPU no browser via wasm
# --bit-depth=8       : 8-bit e o suficiente para video de estudo; reduz o binario
# --chroma-format=420 : formato universal em video de consumo; reduz o binario
#
# THREADS: habilitadas (default do x264). O CLI do FFmpeg 8 usa pthreads
# incondicionalmente em fftools/ffmpeg_sched.c, entao o build inteiro precisa
# de threads. Requer -pthread aqui e headers COOP/COEP no serving. Ver
# docs/transcoding/01-escopo.md §10.
#
# ATENCAO: o x264 compila com threads, mas ENCODAR com threads > 1 crasha o wasm
# ("null function or function signature mismatch"). Em runtime e obrigatorio
# passar `-threads 1 -x264-params threads=1:sliced-threads=0`. Validado no
# Passo 2 — ver docs/transcoding/02-build.md.
emconfigure ./configure \
  --host=i686-gnu \
  --prefix="$PREFIX" \
  --enable-static \
  --enable-pic \
  --disable-cli \
  --disable-asm \
  --disable-opencl \
  --bit-depth=8 \
  --chroma-format=420 \
  --extra-cflags="-O3 -pthread" \
  --extra-ldflags="-pthread"

emmake make -j"$(nproc)"
emmake make install

echo ""
echo "=== libx264 instalada em $PREFIX ==="
ls -la "$PREFIX/lib/libx264.a"
