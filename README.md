# LearnWatching

Aprender inglês assistindo vídeos com legendas. O aluno escolhe um vídeo e a legenda (`.srt`) do próprio
computador. O app prepara o vídeo no navegador e mostra frase por frase. O aluno marca "Sei" ou "Não Sei"
ou digita o que entendeu, e recebe a correção palavra por palavra. O que existe hoje e o que é planejado
está em [`PRODUCT.md`](PRODUCT.md).

| Pasta | O que é | Onde roda |
|---|---|---|
| [`backend/`](backend/README.md) | API (FastAPI + Postgres): lista as legendas de um vídeo do YouTube | VPS (Docker Compose, atrás da borda compartilhada com o core-studio) |
| `app/` | App em React + TypeScript + Vite: seleção do vídeo, player de estudo, Progresso e Shadowing | Navegador. A transcodificação roda no próprio navegador (ffmpeg.wasm num Web Worker) |
| `scripts/` | Compilação do ffmpeg.wasm (`make wasm`) e um teste do bundle em Node | PC |
| `docs/` | Regras de desenvolvimento, contrato da API (`openapi.json`, gerado com `make openapi`) e notas do transcode | |
| [`DESIGN.md`](DESIGN.md) | Identidade visual "Sinal Limpo" e regras de design | |

## Como as partes conversam

```
 Navegador ────────────────────────────────────────────┐
 │ React (app/)  ──▶  Web Worker + ffmpeg.wasm          │   vídeo e legenda do computador do aluno,
 │                    (prepara o vídeo, IndexedDB)      │   que nunca saem do navegador
 └──────────────┬──────────────────────────────────────┘
                │ HTTPS
                ▼
   borda (Caddy compartilhado) ──▶ API (backend/) ──▶ Postgres
```

O ffmpeg.wasm usa SharedArrayBuffer, então o app só funciona com os cabeçalhos
`Cross-Origin-Opener-Policy: same-origin` e `Cross-Origin-Embedder-Policy: require-corp`. Eles estão no
`app/vite.config.ts` (dev) e no `backend/deploy/site.caddy` (produção).

## Desenvolvimento

```bash
# Banco + API (detalhes em backend/README.md)
cd backend && docker compose -f compose.dev.yml up -d && uv sync && make migrate && make dev   # http://localhost:8000

# App (Node 22+)
cd app && npm ci && cp .env.example .env && npm run dev                                        # http://localhost:5200
```

**O bundle do ffmpeg.wasm não está no git.** O `app/src/vendor/ffmpeg/` (`ffmpeg.js` + `ffmpeg.wasm`) é
gerado por `make wasm`, que precisa do emsdk; veja `docs/transcoding/02-build.md`. Também dá para copiá-lo
de outra pasta de trabalho. Sem ele o build do app quebra.

Os vídeos de teste ficam em `app/public/videos/` (fora do git). O `npm run build` direto copia o `public/`
inteiro para `dist/`, inclusive os vídeos. O `make app` e o `make teste` montam sem copiar os vídeos.

Scripts do app:
- `dev`, `build`, `preview`;
- `typecheck`;
- `lint`, sem avisos tolerados;
- `test`: Vitest para o SRT, os boxes MP4, o `sessionDb` e o estilo da legenda;
- `api:types`: gera `src/api/schema.d.ts` a partir de `docs/openapi.json`.

A variável do app é `VITE_API_URL` (padrão `http://localhost:8000`).

## Comandos da raiz

| Comando | O que faz |
|---|---|
| `make check` | verificações de tudo (backend + app), as mesmas do GitHub Actions |
| `make hooks` | instala o gancho `pre-push`, que roda `make -s check` antes de cada push (uma vez por clone) |
| `make teste` / `make teste-parar` | ambiente de teste no PC com a branch atual, em `https://app.localhost:8443` |
| `make deploy` / `make deploy-voltar` | publica a `main` na VPS / volta para a versão anterior (veja `backend/README.md`) |
| `make wasm` | compila o ffmpeg.wasm em `app/src/vendor/ffmpeg/` |

## Qualidade

| Parte | O que o workflow confere |
|---|---|
| `backend` | ruff, format, lint-imports, mypy strict, migrations sem pendência, `openapi.json` em dia, pytest com Postgres |
| `app` | typecheck, lint, testes e build (no CI, com um ffmpeg.wasm falso, porque o real não está no git) |
| `deploy` | desligado (`DEPLOY_ENABLED`); o deploy é feito pelo `make deploy` no PC |

O jeito de trabalhar (branches, commits, PRs) está em `docs/regras.md`. É o mesmo do core-studio.

## Pendências

- **PWA:** instalar como app e funcionar offline.
- **Fila de jobs e autenticação:** necessárias para a avaliação das respostas por IA (hoje a correção é uma
  comparação palavra por palavra no navegador). O `backend/README.md` explica como trazê-las do core-studio.
- **Kong:** API gateway na frente das APIs (borda → Kong → APIs). É uma linha no `site.caddy` de cada projeto.
- **Domínio:** ainda não existe. Tudo está em variável (`LEARN_DOMAIN`, `LEARN_APP_DOMAIN`, `PUBLIC_API_URL`),
  e o `make deploy` recusa rodar sem ele.
