# LearnWatching (guia para o Claude)

Monorepo do LearnWatching: aprender inglês assistindo vídeos com legendas (o aluno vê um trecho, marca "Sei / Não Sei" ou digita o que entendeu e recebe a correção). Tudo em português do Brasil: interface, mensagens de erro, comentários, commits e PRs. A dona questiona antes de implementar: pergunte quando a decisão for dela. O que o produto é e o que ainda é planejado está em `PRODUCT.md`.

## Partes
- `backend/`: FastAPI, monólito modular com camadas hexagonais, no mesmo padrão do core-studio (veja `backend/README.md`).
  - **Contratos de import:** são verificados pelo `lint-imports`. Para outro módulo, use só o que o `__init__.py` exporta.
  - **Mudou rotas ou schemas?** Rode `make openapi` para atualizar `docs/openapi.json`, depois `npm run api:types` em `app/`.
  - Os endpoints `GET /health` e `GET /api/subtitles/list?video_url=` são contrato com o app: caminho e resposta não mudam sem a dona pedir.
- `app/`: React + TypeScript + Vite. Os tipos da API são gerados de `docs/openapi.json`.
  - **Transcode no navegador:** `src/workers/transcode.worker.ts` + `hooks/useTranscodeSession.ts` + `lib/{mp4Boxes,srt,videoCache,sessionDb}.ts`, com o ffmpeg.wasm em `src/vendor/ffmpeg/`. Esse bundle **não está no git**: gere com `make wasm` (precisa do emsdk) ou copie de outra pasta de trabalho. Sem ele o build quebra.
  - **COOP/COEP:** o ffmpeg.wasm usa pthreads (SharedArrayBuffer), então o app só funciona com `Cross-Origin-Opener-Policy: same-origin` e `Cross-Origin-Embedder-Policy: require-corp` (no `vite.config.ts` e no `backend/deploy/site.caddy`). Todo recurso de outra origem quebra com o COEP: fontes, imagens e scripts são servidos pelo próprio app.
  - Os vídeos de teste ficam em `app/public/videos/` (fora do git, cerca de 4 GB) e nunca vão para o build publicado.
- `scripts/`: compilação do ffmpeg.wasm (`build-x264.sh`, `build-ffmpeg.sh`, `link-ffmpeg-wasm.sh`; `make wasm`) e `smoke-test.mjs`.
- Deploy: a VPS é a mesma do core-studio, atrás da borda (Caddy compartilhado em `/opt/borda`, mantido no repositório do core-studio). Veja a seção de deploy do `backend/README.md`.

## Design
Regras em `DESIGN.md` (identidade "Sinal Limpo"), no padrão Apple HIG.
- Fontes: Sora para títulos, Atkinson Hyperlegible Next para texto e legenda, JetBrains Mono para tempos e contadores. Servidas pelo app em `app/public/fonts/*.woff2` (licença OFL), nunca pelo Google Fonts.
- Cores: só pelos tokens de `app/src/styles/tokens.css` (grafite + ciano `#36D7DF` no escuro; claro e escuro em todo o app, com o palco do vídeo sempre escuro). Nenhuma cor ou tamanho solto no código: CSS Modules usam só `var(--...)`.
- Componentes base em `app/src/components/ui/` (`Button`, `IconButton`, `Chip`, `Spinner`) e classes de `components.css`.
- Interface sem emoji, com ícones Lucide (`lucide-react`). Alvos de toque de 44 pt; conferir em 1440 px e 390 px.

## Verificação antes de dizer que terminou
- tudo: `make check` na raiz (backend + app)
- backend: `cd backend && make check` (precisa de Postgres: `TEST_DATABASE_URL=...` ou Docker)
- app: `make app` na raiz (typecheck, lint, test e build sem copiar `public/`; o `npm run build` direto copia os ~4 GB de `app/public/videos/` para `dist/`)

## Regras de desenvolvimento
@docs/regras.md
