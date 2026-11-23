/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
// O build do ffmpeg.wasm usa pthreads, que dependem de SharedArrayBuffer.
// SharedArrayBuffer só existe em contexto "cross-origin isolated", o que exige
// estes dois headers. Sem eles, ffmpeg.js falha ao carregar.
// Ver docs/transcoding/02-build.md.
const crossOriginIsolation = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5200,
    strictPort: true,
    headers: crossOriginIsolation,
  },
  preview: {
    headers: crossOriginIsolation,
  },
  // .wasm é grande (6.6 MB): mantém como asset servido, não inline em base64
  assetsInclude: ["**/*.wasm"],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
