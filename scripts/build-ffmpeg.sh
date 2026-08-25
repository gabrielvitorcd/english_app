#!/usr/bin/env bash
#
# Passo 2b — cross-compila FFmpeg para WebAssembly com Emscripten.
#
# A lista de codecs/formatos abaixo e o contrato definido em
# docs/transcoding/01-escopo.md §9 — todos os nomes foram verificados
# contra o source em ffmpeg-wasm/ (nao assumidos).
#
# Requer: ./scripts/build-x264.sh executado antes (libx264.a em build/wasm).
#
# Uso: ./scripts/build-ffmpeg.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FF_DIR="$ROOT/ffmpeg-wasm"
PREFIX="$ROOT/build/wasm"

source "$ROOT/emsdk/emsdk_env.sh" >/dev/null 2>&1

if [ ! -f "$PREFIX/lib/libx264.a" ]; then
  echo "ERRO: libx264.a nao encontrada. Rode ./scripts/build-x264.sh primeiro." >&2
  exit 1
fi

# Faz o configure do FFmpeg achar a libx264 que acabamos de instalar.
export PKG_CONFIG_PATH="$PREFIX/lib/pkgconfig"
export EM_PKG_CONFIG_PATH="$PREFIX/lib/pkgconfig"

cd "$FF_DIR"

emconfigure ./configure \
  --prefix="$PREFIX" \
  --target-os=none \
  --arch=x86_32 \
  --enable-cross-compile \
  --cc=emcc \
  --cxx=em++ \
  --ar=emar \
  --ranlib=emranlib \
  --nm=llvm-nm \
  --objcc=emcc \
  --dep-cc=emcc \
  --disable-x86asm \
  --disable-inline-asm \
  --disable-asm \
  --disable-stripping \
  --disable-doc \
  --disable-network \
  --disable-autodetect \
  --disable-debug \
  --disable-runtime-cpudetect \
  --enable-pthreads \
  --disable-w32threads \
  --disable-os2threads \
  --enable-ffmpeg \
  --disable-ffplay \
  --disable-ffprobe \
  --enable-gpl \
  --enable-libx264 \
  --enable-static \
  --disable-shared \
  --enable-avcodec \
  --enable-avformat \
  --enable-avfilter \
  --enable-swscale \
  --enable-swresample \
  --enable-avutil \
  --disable-everything \
  --enable-protocol=file \
  --enable-demuxer=mov,matroska,avi \
  --enable-demuxer=srt,ass,webvtt \
  --enable-decoder=h264,hevc,vp9,mpeg4,msmpeg4v3 \
  --enable-decoder=aac,ac3,eac3,dca,mp3,opus,vorbis \
  --enable-decoder=subrip,ass,webvtt,movtext \
  --enable-parser=h264,hevc,vp9,mpeg4video \
  --enable-parser=aac,ac3,dca,mpegaudio,opus,vorbis \
  --enable-encoder=libx264 \
  --enable-encoder=aac \
  --enable-encoder=srt \
  --enable-muxer=mp4,srt \
  --enable-bsf=aac_adtstoasc \
  --enable-filter=scale,aresample,aformat,format,null,anull \
  --enable-filter=copy,trim,atrim,buffer,buffersink,abuffer,abuffersink \
  --enable-filter=fps,setpts,asetpts,concat,hflip,transpose \
  --extra-cflags="-I$PREFIX/include -O3 -pthread" \
  --extra-ldflags="-L$PREFIX/lib -pthread" \
  --pkg-config-flags="--static"

emmake make -j"$(nproc)"
emmake make install

echo ""
echo "=== bibliotecas FFmpeg instaladas ==="
ls -la "$PREFIX/lib/"*.a
