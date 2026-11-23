# Plano de commits e testes

> Documento histórico, de antes da padronização com o core-studio. O formato de commit e o fluxo de
> trabalho valem pelo `docs/regras.md`; a pasta `frontend/` agora é `app/`; os testes da Fase 1 deste
> plano estão em `app/src/**/*.test.ts` (Vitest) e o CI em `.github/workflows/`.

Guia pra fatiar o trabalho atual em commits atômicos seguindo o padrão do histórico do projeto, e um roteiro pra montar CI com testes futuramente.

---

## Padrão de commit do projeto

Do `git log`, o padrão observado é:

```
<tipo>(<escopo>): <descrição curta em português>
   - <detalhe 1>
   - <detalhe 2>
   - <detalhe 3>
```

- **Tipos usados**: `feat`, `refactor`, `style`, `chore` (sugerido pra infra)
- **Escopo** (padrão mais recente): `Select - modal`, `Select - página`, `hooks`, `backend - api`, etc. Usa `área - subcomponente` com espaços ao redor do hífen.
- **Idioma**: português.
- **Bullets**: 3–6 pontos com o "o quê" da mudança.

---

## Ordem sugerida (11 commits)

A ordem importa: cada commit deve compilar sozinho. Onde houver dependência entre arquivos, o commit consumidor vem depois do commit que introduz o símbolo.

### 1. `chore(infra - docker): ajustar imagens e ignores`

**Arquivos:**
- `docker-compose.yml`
- `frontend/Dockerfile`
- `frontend/.dockerignore`
- `backend/.dockerignore`

**Mensagem:**
```
chore(infra - docker): ajustar imagens e ignores
   - Atualizar Dockerfile do frontend
   - Ajustar .dockerignore do frontend e backend
   - Atualizar docker-compose com novas configs
```

---

### 2. `chore(infra - vite): atualizar config do build`

**Arquivos:**
- `frontend/vite.config.ts`

**Mensagem:**
```
chore(infra - vite): atualizar config de build
   - Ajustar plugins e opções pro pipeline de transcode
   - <ver diff pra detalhar>
```

---

### 3. `chore(repo): atualizar gitignore, readme e package`

**Arquivos:**
- `.gitignore`
- `README.md`
- `package.json`

**Mensagem:**
```
chore(repo): atualizar gitignore, readme e package
   - Ignorar artefatos de build e temporários
   - Documentar novo fluxo do player no README
   - Ajustar scripts/deps no package.json raiz
```

---

### 4. `chore(scripts): adicionar scripts de build ffmpeg/x264`

**Arquivos:**
- `scripts/build-ffmpeg.sh`
- `scripts/build-x264.sh`
- `scripts/link-ffmpeg-wasm.sh`
- `scripts/smoke-test.mjs`

**Mensagem:**
```
chore(scripts): adicionar scripts de build do ffmpeg/x264
   - build-ffmpeg.sh e build-x264.sh pra compilar libs wasm
   - link-ffmpeg-wasm.sh pra vincular artefatos no frontend
   - smoke-test.mjs pra validação rápida do pipeline
```

---

### 5. `chore(cleanup): remover screenshots antigas`

**Arquivos:**
- `frontend/.screenshot/Captura de tela de 2026-04-27 08-55-*.png` (3 arquivos)

**Mensagem:**
```
chore(cleanup): remover screenshots antigas do repositorio
```

---

### 6. `refactor(Select): remover fluxo antigo de legendas do YouTube`

**Arquivos deletados:**
- `frontend/src/components/Select/SubtitleSelectModal.tsx`
- `frontend/src/components/Select/SubtitleSelectModal.module.css`
- `frontend/src/components/Select/YoutubeLinkModal.tsx`
- `frontend/src/components/Select/YoutubeLinkModal.module.css`
- `frontend/src/hooks/useSubtitles.ts`

**Mensagem:**
```
refactor(Select): remover fluxo antigo de legendas do YouTube
   - Deletar YoutubeLinkModal e SubtitleSelectModal
   - Deletar hook useSubtitles (consumia /api/subtitles/list)
   - Substituido por fluxo de arquivo local via VideoSelectModal
```

> ⚠️ **Atenção**: esse commit sozinho pode não compilar se ainda houver imports em `SelectPath.tsx`. Confirme antes: rode `npx tsc -b --noEmit` após stagear só esses deletes. Se o TS reclamar, junte com o próximo commit.

---

### 7. `feat(lib): pipeline de transcode e utilitarios MP4/SRT`

**Arquivos novos:**
- `frontend/src/lib/mp4Boxes.ts`
- `frontend/src/lib/srt.ts`
- `frontend/src/lib/videoCache.ts`
- `frontend/src/workers/transcode.worker.ts` (e demais arquivos em `workers/`)
- `frontend/src/hooks/useTranscodeSession.ts`

**Mensagem:**
```
feat(lib): pipeline de transcode e utilitarios MP4/SRT
   - Parser de SRT com filterDialogueCues
   - Utilitarios de manipulacao de boxes MP4
   - Cache de video transcodificado em memoria
   - Worker de transcode com FFmpeg wasm
   - Hook useTranscodeSession que orquestra probe + transcode por cue
```

---

### 8. `feat(TranscodeTest - página): pagina de debug do pipeline`

**Arquivos novos:**
- `frontend/src/pages/TranscodeTest/*`

E ajuste no `App.tsx` só pra registrar essa rota (se quiser separar do wiring do PlayerProvider, faz um commit anterior só com essa linha; do contrário junta com o commit 11).

**Mensagem:**
```
feat(TranscodeTest - página): pagina de debug do pipeline de transcode
   - Consumir useTranscodeSession diretamente sem UX de estudo
   - Facilita validacao manual do worker durante desenvolvimento
   - Rota /transcode-test acessivel em dev
```

> 💡 **Sugestão**: registre a rota condicional a `import.meta.env.DEV` (checar item 3 do audit anterior).

---

### 9. `feat(hooks): adicionar useSubtitleSettings com persistencia`

**Arquivos novos:**
- `frontend/src/hooks/useSubtitleSettings.ts`

**Mensagem:**
```
feat(hooks): adicionar useSubtitleSettings com persistencia
   - Gerenciar cor, fundo, opacidade, tamanho e fonte da legenda
   - Persistir preferencias em localStorage
   - Exportar helpers hexToRgba e subtitleStyle
```

---

### 10. `feat(StudyPlayer): player de estudo fullscreen com painel de legenda`

**Arquivos novos:**
- `frontend/src/components/StudyPlayer/StudyPlayer.tsx`
- `frontend/src/components/StudyPlayer/StudyPlayer.module.css`
- `frontend/src/components/StudyPlayer/SubtitleSettingsPanel.tsx`
- `frontend/src/components/StudyPlayer/SubtitleSettingsPanel.module.css`

**Mensagem:**
```
feat(StudyPlayer): player de estudo fullscreen com painel de legenda
   - Video fullscreen com overlays no hover (topBar auto-hide)
   - Click no video toca/pausa, duplo click alterna fullscreen
   - Overlay Netflix-style de play e blur no video pausado
   - TopBar com voltar, Nao Sei (vermelho), Sei (verde), CC e autoplay
   - Input desliza do topo ao clicar Sei; feedback substitui o input
   - SubtitleSettingsPanel com swatches, sliders e select de fonte
```

---

### 11. `feat(Player - página): refatorar Player pra usar StudyPlayer fullscreen`

**Arquivos modificados/novos:**
- `frontend/src/pages/Player/Player.tsx`
- `frontend/src/pages/Player/Player.module.css` (novo)

**Mensagem:**
```
feat(Player - página): refatorar Player pra usar StudyPlayer fullscreen
   - Trocar layout antigo por container fixed 100vw x 100vh
   - Esconder Heading global quando Player esta montado (via :has())
   - Delegar UX de estudo pro StudyPlayer
   - Manter estados de loading/error com spinner centralizado
```

---

### 12. `feat(contexts): persistencia da sessao com IndexedDB`

**Arquivos novos:**
- `frontend/src/contexts/PlayerSessionContext.tsx`
- `frontend/src/lib/sessionDb.ts`

**Arquivos modificados:**
- `frontend/src/App.tsx` (wrap com `<PlayerSessionProvider>`)
- `frontend/src/pages/Select/SelectPath.tsx` (chamar `setSession()`)
- `frontend/src/pages/Select/SelectPath.module.css` (só se houver mudança de estilo relacionada)

**Mensagem:**
```
feat(contexts): persistencia da sessao com IndexedDB
   - PlayerSessionContext expondo session + hydrated + set/clear
   - Wrapper minimo de IndexedDB (sessionDb) guardando File direto
   - Hidratacao no boot, escrita fire-and-forget em cada setSession
   - App wrappado com Provider; Player espera hydrated antes de redirecionar
   - SelectPath grava sessao via setSession ao inves de location.state
```

---

### 13. `chore(useSrt): ajustes pontuais no hook legado`

**Arquivos:**
- `frontend/src/components/useSrt/useSrt.ts`

**Mensagem:**
```
chore(useSrt): ajustes no hook legado consumido pelo Subtitle
   - <descreva pelo diff>
```

> Ainda é usado por `src/components/Subtitle/Subtitle.tsx`. Se as alterações forem só formatação/tipo, mantenha esse commit pequeno.

---

## Resumo em ordem cronológica

| # | Commit | Motivo |
|---|--------|--------|
| 1 | `chore(infra - docker)` | isolar mudanças de imagem |
| 2 | `chore(infra - vite)` | config de build |
| 3 | `chore(repo)` | gitignore/readme/package |
| 4 | `chore(scripts)` | scripts de build wasm |
| 5 | `chore(cleanup)` | screenshots |
| 6 | `refactor(Select)` | remover fluxo YouTube |
| 7 | `feat(lib)` | pipeline transcode |
| 8 | `feat(TranscodeTest - página)` | página de debug |
| 9 | `feat(hooks)` | useSubtitleSettings |
| 10 | `feat(StudyPlayer)` | componente + painel legenda |
| 11 | `feat(Player - página)` | player fullscreen |
| 12 | `feat(contexts)` | persistência IndexedDB |
| 13 | `chore(useSrt)` | ajustes menores |

Depois de cada commit rode `npx tsc -b --noEmit` pra garantir que não quebrou nada.

---

# Plano de testes e CI

Setup pra ter testes automatizados + pipeline CI. Comece pelas camadas de baixo (unidade) e suba conforme a confiança.

## Stack sugerida

- **Test runner**: [Vitest](https://vitest.dev) — nativo do Vite, zero-config, roda TS direto.
- **React**: `@testing-library/react` + `@testing-library/user-event`.
- **DOM**: `jsdom` (via Vitest).
- **IndexedDB mock**: `fake-indexeddb`.
- **E2E** (fase 2): [Playwright](https://playwright.dev).
- **CI**: GitHub Actions.

Instalação:

```bash
npm i -D vitest @vitest/ui @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom fake-indexeddb
```

Script no `package.json`:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
}
```

`vite.config.ts` (adicionar bloco `test`):

```ts
test: {
  environment: "jsdom",
  globals: true,
  setupFiles: ["./src/test/setup.ts"],
  coverage: {
    reporter: ["text", "html"],
    exclude: ["src/workers/**", "src/pages/TranscodeTest/**"]
  }
}
```

`src/test/setup.ts`:

```ts
import "@testing-library/jest-dom";
import "fake-indexeddb/auto";
```

---

## Fases dos testes

### Fase 1 — Unidade (rápido, alto ROI)

Alvos: funções puras e hooks isolados.

| Arquivo | O que testar |
|---------|--------------|
| `src/lib/srt.ts` | `parseSrt` com casos válidos, timestamps malformados, `filterDialogueCues` filtrando corretamente |
| `src/lib/mp4Boxes.ts` | leituras de boxes com buffers fixtures pequenos |
| `src/lib/sessionDb.ts` | com `fake-indexeddb`: save/load/clear, round-trip de File |
| `src/hooks/useSubtitleSettings.ts` | `hexToRgba` (várias formas), `subtitleStyle`, persistência no localStorage |
| `src/hooks/useTranscodeSession.ts` | com worker mockado, transições de estado preparing → playing → complete/error |

Meta de cobertura da Fase 1: **80%+ em `src/lib/` e `src/hooks/`**.

### Fase 2 — Componentes

Alvos: comportamento observável, não implementação.

| Componente | Casos-chave |
|-----------|-------------|
| `StudyPlayer` | click Sei abre input; click Não Sei mostra frase real; Enter submete; X fecha input; próxima frase reseta estado |
| `SubtitleSettingsPanel` | swatch ativo destacado; slider dispara `update`; reset volta padrão; X chama `onClose` |
| `PlayerPage` | com `PlayerSessionProvider` mockado: mostra spinner enquanto `hydrated=false`; redireciona sem sessão; renderiza StudyPlayer com sessão |
| `SubtitleOverlay` (via StudyPlayer) | inline style reflete settings; toggle CC oculta/mostra |

Padrão: usar `@testing-library/react` com queries por role/label ao invés de class name.

### Fase 3 — Integração / E2E (opcional inicialmente)

Fluxo golden path com Playwright:
1. Landing → Select → escolher vídeo+SRT locais
2. Player abre → hover topBar → clica Sei → digita → Enter → feedback
3. Volta → confere que sessão persiste após reload da aba

Rodar contra `vite preview` do build.

---

## Pipeline CI (GitHub Actions)

Arquivo: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npx tsc -b --noEmit
      - run: npm test
      - run: npm run build
```

Adicionar depois, quando tiver E2E:

```yaml
  e2e:
    runs-on: ubuntu-latest
    needs: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
        working-directory: frontend
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
        working-directory: frontend
```

---

## Roadmap sugerido

1. **Semana 1** — setup Vitest + `fake-indexeddb`, cobrir `src/lib/srt.ts` e `sessionDb.ts`.
2. **Semana 2** — cobrir hooks (`useSubtitleSettings`, `useTranscodeSession`) + subir pipeline CI mínimo (lint + tsc + tests + build).
3. **Semana 3** — componentes StudyPlayer e SubtitleSettingsPanel; adicionar coverage threshold (60% overall pra começar, subir com o tempo).
4. **Semana 4+** — Playwright pra golden path; badge do CI no README; branch protection exigindo verde pra merge.

---

## Alvos que NÃO vale testar

- `src/workers/transcode.worker.ts` — depende de FFmpeg wasm real; validar com o `smoke-test.mjs` em `scripts/`.
- `src/pages/TranscodeTest/` — página de debug, dev-only.
- CSS Modules — testar aparência é fluky; use snapshots com moderação.
- Chamadas reais de `<video>.play()` em jsdom — mockar HTMLMediaElement.
