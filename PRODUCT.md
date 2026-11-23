# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

App de navegador (React 19 + TypeScript + Vite). O vídeo é preparado dentro do próprio navegador, com FFmpeg compilado para WebAssembly rodando num Web Worker; por isso a página precisa de isolamento entre origens (cabeçalhos `Cross-Origin-Opener-Policy: same-origin` e `Cross-Origin-Embedder-Policy: require-corp`). Há uma API FastAPI ao lado, ainda pequena. PWA instalável está fora do escopo agora (pendência registrada). Não há app nativo.

Aparelho principal: em aberto. O fluxo atual pressupõe um computador (o aluno escolhe arquivos de vídeo e legenda no disco e o navegador transcodifica com a CPU da máquina). O desenho cobre 1440 px e 390 px, mas o uso real no celular ainda não foi testado.

## Users

Pessoas que falam português e querem treinar a compreensão do inglês falado (listening) com vídeos que já têm: séries, filmes, vídeos baixados. A interface é em português do Brasil; a legenda estudada é em inglês.

Quem são exatamente (só a dona, um grupo pequeno ou público aberto), nível de inglês esperado e quantidade de usuários: em aberto. Não há contas nem login hoje (autenticação está fora do escopo agora).

## Product Purpose

Treinar o ouvido frase por frase. O app fatia o vídeo nos trechos de fala do arquivo `.srt`; o aluno ouve um trecho por vez, diz se entendeu e, se disse que sim, digita o que ouviu; em seguida vê a frase real e quais palavras acertou. Sucesso é o aluno entender cada vez mais sem legenda, usando o conteúdo de que já gosta.

## Operating Context

- O aluno já tem os arquivos no computador: um vídeo e uma legenda `.srt` em inglês. O app não baixa vídeo de lugar nenhum.
- O vídeo não sai do computador: a transcodificação e o corte em trechos acontecem no navegador (`src/workers/transcode.worker.ts`), sem enviar o arquivo ao servidor.
- A sessão (vídeo + legenda escolhidos) fica guardada no IndexedDB e volta ao reabrir a aba; os trechos já preparados ficam em cache no IndexedDB; as preferências de legenda ficam no `localStorage`.
- A API (FastAPI) tem hoje `GET /health` e `GET /api/subtitles/list?video_url=` (lista as legendas disponíveis de um vídeo do YouTube via yt-dlp). O app ainda não chama a API.
- Publicação: VPS compartilhada com a CORE Studio, atrás de um Caddy comum (a "borda"). O domínio ainda não existe.

## Capabilities and Constraints

### O que existe hoje (conferido no código de `app/src/`)

- **Seleção** (`/selectpath`): dois cartões de origem. "Arquivo Local" abre o modal de escolha de vídeo (MP4 ou MKV) e legenda (`.srt`), com arrastar e soltar. "Biblioteca Offline" aparece, mas leva a uma rota que não existe.
- **Preparação da sessão** (`/player`): lê o `.srt`, descarta trechos que não são fala (começam com `[`, `(`, `♪`, `♫` ou `#`), identifica as faixas de áudio (prefere a inglesa) e prepara os trechos com barra de progresso ("N de M cues processadas").
- **Player de estudo** (`components/StudyPlayer`):
  - toca o trecho atual em repetição; clique pausa e retoma; duplo clique alterna tela cheia;
  - **Sei** abre o campo para digitar; **Não Sei** mostra a frase real sem pedir resposta;
  - a correção é local e simples: compara palavra por palavra (sem pontuação, sem maiúsculas) e dá um veredito por porcentagem ("Boa!" a partir de 60%, "Mais ou menos" a partir de 30%, abaixo disso "Tenta de novo na próxima"), destacando as palavras acertadas na frase real;
  - **CC** mostra ou esconde a legenda sobre o vídeo;
  - **painel de legenda**: cor do texto, cor e opacidade do fundo, tamanho e família da fonte, com "Restaurar padrão"; as escolhas ficam salvas;
  - **avanço automático**: quando ligado, o trecho toca em repetição e o app passa para a próxima frase 3 segundos depois da resposta; Enter avança na hora;
  - contador "Frase N de M" e botão de voltar para a seleção.
- **Página inicial** (`/`): apresentação com chamadas, "Como funciona" e "Escolha sua fonte". Os cartões de fonte (YouTube, Arquivo Local, Biblioteca) levam a rotas que não existem e o botão "Ver demo" não faz nada.
- **Página de teste do transcode** (`/transcode-test`): ferramenta de desenvolvimento para validar o pipeline; não aparece no menu.

### O que existe só como tela de demonstração (dados fixos no código)

- **Progresso** (`/progresso`): números, vocabulário e frases são exemplos escritos no código ("S01E01 · Central Perk"), não vêm do uso.
- **Shadowing** (`/shadowing`): lista fixa de frases; os botões de tocar e gravar não fazem nada.

### Planejado (citado no `README.md` e no `.specs/general_prompt.md`), ainda não existe

- **Avaliação por IA**: um modelo de linguagem compararia o que o aluno digitou com a legenda e daria feedback. Hoje a correção é a comparação palavra a palavra descrita acima, feita no navegador.
- **Shadowing de verdade**: o aluno repetiria em voz alta as frases que acertou (com gravação no futuro).
- **Revisão espaçada estilo Anki** para as frases que errou.
- **Progresso com dados reais** (estatísticas e vocabulário salvos).
- **YouTube e outras fontes** além de arquivos locais (a API já lista legendas do YouTube, mas o app não usa).
- **Tradução ao clicar numa palavra**: o código existe (`components/Subtitle`, `components/useSrt/translator.ts`, com cache em IndexedDB e o serviço MyMemory), mas nenhuma tela o usa.
- Fora do escopo agora: PWA, fila de jobs/worker no servidor, autenticação, Kong.

### Restrições

- Tudo em português do Brasil: interface, mensagens e comentários. A legenda estudada é em inglês.
- A lógica do player e do pipeline de transcode não muda nas tarefas de estrutura, ferramentas e visual (regra de ouro do projeto).
- Stack: React 19 + TypeScript + Vite no `app/`; FastAPI no `backend/`; Postgres próprio.
- Mudanças chegam por PR para a `develop`, no método de `docs/regras.md`.

## Brand Commitments

- Identidade visual **Sinal Limpo**, descrita em `DESIGN.md`: grafite levemente esverdeado com um único acento ciano; Sora (títulos), Atkinson Hyperlegible Next (texto e legenda) e JetBrains Mono (tempos e contadores), todas SIL OFL 1.1 e servidas pelo próprio app.
- O palco do vídeo é sempre escuro; o resto do app tem tema claro e escuro.
- Interface sem emoji, com ícones Lucide.
- Deve ser claramente diferente da CORE Studio (outra paleta, outras fontes); o que os dois produtos compartilham é o método (Apple HIG, tokens, Lucide, alvos de 44 pt).
- Nome do produto: em aberto. O `README.md` usa **LearnWatching**; a interface mostra "EnglishSRT" no cabeçalho, "English SRT" no rodapé da página inicial e "English Audio" no título da aba.

## Evidence on Hand

- Não há logotipo, fotos, depoimentos nem números de uso. Nada disso deve ser inventado.
- A frase "Milhares de pessoas já estão melhorando seu inglês" da página inicial não tem base e não deve ser reaproveitada.
- Os números e listas de Progresso e Shadowing são exemplos fixos, não dados.
- Documentação técnica do transcode em `docs/transcoding/` (escopo e build do FFmpeg-WASM).

## Product Principles

Tirados do que o app já faz; a dona confirma ou ajusta.

1. **O vídeo é o protagonista.** A interface mede a escuta e sai da frente.
2. **Uma frase por vez.** O aluno ouve, responde e só então vê a resposta.
3. **O vídeo não sai do computador.** No fluxo local, nada é enviado ao servidor.
4. **Feedback honesto.** Mostrar a frase real e o que foi acertado, sem esconder o erro nem enfeitar o acerto.
5. **Com o que o aluno já tem.** Funcionar com os arquivos de vídeo e legenda que ele já baixou.

## Accessibility & Inclusion

Sem requisito específico definido (em aberto). Piso: WCAG AA nos dois temas e sobre o vídeo (contraste e foco de teclado, números em `DESIGN.md`), alvos de toque de 44 pt e respeito a `prefers-reduced-motion`. A legenda é ajustável pelo aluno (cor, fundo, opacidade, tamanho, fonte) e a fonte de texto escolhida (Atkinson Hyperlegible Next) foi feita para distinguir bem letras parecidas, o que ajuda quem lê em segunda língua.
