# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Inicia servidor de desenvolvimento (Vite)
npm run build    # Build: tsc -b && vite build
npm run lint     # ESLint
npm run preview  # Preview do build
```

## Arquitetura

Aplicação React 19 + TypeScript + Vite para prática de listening em inglês com vídeos e legendas.

### Estrutura de Páginas (`src/pages/`)

| Página          | Rota         | Descrição                                        |
| --------------- | ------------ | ------------------------------------------------ |
| `PlayerPage`    | `/player`    | Player de vídeo com legendas sincronizadas (SRT) |
| `ProgressoPage` | `/progresso` | Dashboard de estatísticas e vocabulário          |
| `ShadowingPage` | `/shadowing` | Exercícios de repetição/frases                   |

### Componentes (`src/components/`)

- **`VideoPlayer`** – Wrapper do elemento `<video>` com autoplay e loop
- **`Subtitle`** – Renderiza legenda atual; permite clicar em palavras para ver tradução
- **`useSrt`** – Hook que parseia arquivo `.srt` e sincroniza legendas com `timeupdate` do vídeo
- **`Heading`** – Navegação superior com tabs
- **`dict.ts`** – Dicionário EN→PT para tradução de palavras ao clicar

### Padrões

- Componentes usam **CSS Modules** (`styles.xxx`)
- `VideoPlayer` usa `forwardRef` para expor referência do vídeo
- Sincronização de legenda: hook `useSrt` busca cue atual baseado em `video.currentTime`
- Rotas usam `react-router-dom` com `Navigate` para redirecionar `/` → `/player`

### Dados

- Vídeo: `/videos/friends/friends1x01.mp4`
- Legenda: `/videos/friends/friends1x01.srt`
- Ambos servidos da pasta `public/`

### `suggestion-commit`

Sempre que este comando for invocado:

1. Execute `git diff --cached --name-status` para pegar apenas os arquivos em stage.
2. Para cada arquivo:
   - Status `A` → leia o arquivo e descreva o que ele faz
   - Status `M` → execute `git diff --cached <arquivo>` e descreva apenas as alterações
3. Gere uma mensagem de commit por arquivo no formato:

<tipo>(frontend - <componente>): <descrição curta em português>

- <detalhe 1 do que foi implementado/alterado>
- <detalhe 2>
- <detalhe 3>

4. Responda **ÚNICA E EXCLUSIVAMENTE** com as mensagens, separadas por linha em branco.
5. **Proibido** incluir `git commit -m`, aspas, explicações ou qualquer outro texto.
