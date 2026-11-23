---
name: LearnWatching
description: App de treino de listening em inglês com vídeo e legenda SRT, no padrão Apple HIG com a identidade Sinal Limpo.
colors:
  ciano: "#36D7DF"
  ciano-claro: "#8AF1F5"
  ciano-legenda: "#7CEBEF"
  ciano-fundo: "#14BCC5"
  ciano-tinta: "#00737A"
  ciano-foco: "#00666C"
  grafite-0: "#05090A"
  grafite-1: "#0A0E0F"
  grafite-2: "#11181A"
  grafite-3: "#182123"
  nevoa: "#E8F1F0"
  tinta: "#0D1617"
  sobre-acento: "#031A1C"
  verde: "#4FD18B"
  verde-tinta: "#17784A"
  coral: "#FF6F7D"
  coral-tinta: "#B8323F"
  coral-video: "#FF9AA3"
  ambar: "#F2B544"
  ambar-tinta: "#8A5A00"
  fundo: "#F3F6F6"
  superficie: "#FFFFFF"
  rotulo: "#0D1617"
  rotulo-2: "#435556"
  desativado: "#8D9C9D"
  borda-controle: "#7D8F91"
  fundo-escuro: "#0A0E0F"
  superficie-escura: "#11181A"
  superficie-escura-2: "#182123"
  rotulo-escuro: "#E8F1F0"
  rotulo-2-escuro: "#9DB0AF"
  desativado-escuro: "#64767A"
  borda-controle-escura: "#647A7D"
  borda-video: "#8FA3A5"
  video: "#000000"
  material-video: "rgba(11, 16, 17, 0.80)"
  caixa-legenda: "rgba(5, 9, 10, 0.84)"
typography:
  display:
    fontFamily: "Sora, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title1:
    fontFamily: "Sora, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title2:
    fontFamily: "Sora, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title3:
    fontFamily: "Sora, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  callout:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.45
  footnote:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
  caption:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "0.01em"
  numeros:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
    fontFeature: "tnum"
  legenda-video:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 0.9rem + 1.4vw, 2.125rem)"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "16": "64px"
  "24": "96px"
components:
  button-accent:
    backgroundColor: "{colors.ciano-fundo}"
    textColor: "{colors.sobre-acento}"
    rounded: "{rounded.sm}"
    height: "44px"
    padding: "0 16px"
  button-accent-dark:
    backgroundColor: "{colors.ciano}"
    textColor: "{colors.sobre-acento}"
  button-secondary:
    backgroundColor: "transparent"
    borderColor: "{colors.borda-controle}"
    textColor: "{colors.rotulo}"
    rounded: "{rounded.sm}"
    height: "44px"
    padding: "0 16px"
  button-sei:
    backgroundColor: "{colors.verde}"
    textColor: "{colors.sobre-acento}"
    rounded: "{rounded.sm}"
    height: "44px"
    padding: "0 20px"
  button-nao-sei:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.sobre-acento}"
    rounded: "{rounded.sm}"
    height: "44px"
    padding: "0 20px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.rotulo-escuro}"
    rounded: "{rounded.sm}"
    size: "44px"
  icon-button-on:
    backgroundColor: "rgba(54, 215, 223, 0.14)"
    textColor: "{colors.ciano}"
  input:
    backgroundColor: "{colors.superficie-escura}"
    borderColor: "{colors.borda-video}"
    textColor: "{colors.rotulo-escuro}"
    rounded: "{rounded.sm}"
    height: "44px"
    padding: "0 14px"
  card:
    backgroundColor: "{colors.superficie}"
    rounded: "{rounded.lg}"
    padding: "24px"
  popover:
    backgroundColor: "{colors.superficie-escura-2}"
    rounded: "{rounded.md}"
    padding: "16px"
  dialog:
    backgroundColor: "{colors.superficie}"
    rounded: "{rounded.xl}"
    padding: "32px"
    width: "560px"
  player-bar:
    backgroundColor: "{colors.material-video}"
    height: "64px"
  caption-box:
    backgroundColor: "{colors.caixa-legenda}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  chip:
    rounded: "{rounded.full}"
    height: "28px"
    padding: "0 10px"
---

# Design System: LearnWatching

Fonte da verdade no código (depois que a frente de aplicação terminar): `app/src/styles/tokens.css` (tokens), `app/src/styles/fonts.css` (`@font-face`), `app/src/styles/base.css` (reset e elementos), `app/src/styles/components.css` (classes base) e `app/src/components/ui/` (componentes base). Fontes em `app/public/fonts/`. O produto está descrito em `PRODUCT.md`.

Este documento tem duas partes. As seções do formato (Overview até Do's and Don'ts) descrevem a identidade. As seções seguintes (Tokens CSS, Fontes, Ícones, Contraste e **Aplicação**) são a especificação para quem vai aplicar: a seção **Aplicação** separa o que se faz agora (só aparência, sobre a estrutura atual) do que fica como proposta futura e depende de aprovação.

## Overview

**Ideia-guia: "Sinal Limpo"**

Aprender a ouvir inglês é tirar o sinal do ruído: no começo a fala é um borrão, e a cada frase uma palavra a mais fica nítida. A interface é o "chão de ruído", um grafite quieto, levemente esverdeado, que some atrás do vídeo. A marca é **um único sinal ciano** que só acende onde o ouvido pegou alguma coisa: a palavra acertada, o controle ligado, o foco do teclado, o botão que leva adiante. A geometria vem do osciloscópio e da forma de onda: linhas retas, cantos pequenos, números em fonte mono como num medidor. Nada de brilho, gradiente ou ornamento: o vídeo é o protagonista e a interface só mede a escuta.

O comportamento segue o Apple Human Interface Guidelines: controles nativos e quietos, alvos de 44 pt, materiais (vidro) só onde o conteúdo passa por baixo, foco de teclado visível, movimento curto e desligável.

**Key Characteristics:**
- O palco do vídeo é sempre escuro, nos dois temas. O resto do app (cabeçalho, seleção, Progresso, Shadowing, modal) segue o tema claro ou escuro.
- Grafite neutro-esverdeado em camadas no escuro; cinza muito claro e branco no claro.
- Um acento só, o ciano, e raro: no máximo um preenchimento ciano por tela.
- Verde e coral falam apenas de resposta (Sei / Não Sei, acerto / erro). Nunca decoram.
- Sora em títulos curtos; Atkinson Hyperlegible Next em todo texto e na legenda; JetBrains Mono em tempos, contadores e porcentagens.
- Ícones Lucide em traço 1.75. Nenhum emoji.

**Diferença em relação à CORE Studio:** a CORE é azul-marinho `#1F2A44` com laranja `#FF7A1A`, tema claro como base, Space Grotesk e Manrope. O LearnWatching é grafite com ciano, escuro como base no player, Sora, Atkinson e JetBrains Mono. Nenhum token tem laranja ou azul-marinho. O que os dois compartilham é o método: HIG, tokens em camadas, Lucide, 44 pt, sem emoji.

## Colors

Camadas como na CORE: **marca** (`--lw-*`, valores brutos, iguais nos dois temas) → **semânticos** (o que as telas usam) → **componentes**. Nenhuma tela usa hex direto. Os valores exatos de cada token estão em "Tokens CSS".

### Primary
- **Ciano** (`#36D7DF`, `--lw-ciano`): o sinal. No escuro e no palco: botão principal, controle ligado (CC, avanço automático, painel aberto), palavra acertada, foco (na variante clara `#8AF1F5`).
- **Ciano de preenchimento no claro** (`#14BCC5`): botão principal no tema claro, sempre com texto `#031A1C`.
- **Ciano de texto no claro** (`#00737A`): o ciano quando vira texto, link ou ícone sobre fundo claro. Foco no claro: `#00666C`.
- **Sobre o acento** (`#031A1C`): texto e ícone sobre ciano, verde e coral preenchidos (no escuro).

### Neutral
- **Escuro**: fundo `#0A0E0F`, superfície `#11181A`, elevada `#182123`; texto `#E8F1F0`, secundário `#9DB0AF`, desativado `#64767A`; borda de controle `#647A7D`.
- **Claro**: fundo `#F3F6F6`, superfície `#FFFFFF` (a elevação no claro é sombra, não cor); texto `#0D1617`, secundário `#435556`, desativado `#8D9C9D`; borda de controle `#7D8F91`.
- **Separadores decorativos**: texto a 8% (escuro) ou 10% (claro). Sem exigência de contraste; nunca são a única pista de um controle.

### Estado
- **Sei / acerto**: `#4FD18B` no escuro e no palco; `#17784A` no claro (texto branco sobre ele).
- **Não Sei / erro**: `#FF6F7D` no escuro; `#B8323F` no claro; `#FF9AA3` quando é texto ou ícone sobre o material do vídeo (o `#FF6F7D` ali dava 3.91:1 e não passa).
- **Aviso / "mais ou menos"**: `#F2B544` no escuro; `#8A5A00` no claro.
- Cada estado tem um fundo suave (`*-soft`): 14% da cor no escuro, 10% no claro.

### Palco do vídeo (igual nos dois temas)
- Letterbox `#000000`.
- **Material sobre o vídeo**: `rgba(11, 16, 17, 0.80)` com `blur(20px) saturate(140%)`. Pior caso (quadro branco atrás) compõe para `#3C4041`. Sem `backdrop-filter`, cai para o opaco `#182123`.
- **Caixa da legenda** (proposta, ver Aplicação): `rgba(5, 9, 10, 0.84)`, texto `#FFFFFF`, palavra acertada `#7CEBEF`. Hoje a cor da legenda vem das preferências do aluno (padrão: branco sobre preto a 78%).
- Borda de controle sobre o vídeo: `#8FA3A5`.

### Named Rules
**A regra do sinal raro.** Ciano marca o próximo passo, o que está ligado e o que foi acertado. No máximo um preenchimento ciano por tela; o resto do ciano é texto, ícone, sublinhado ou anel de foco.

**A regra do ciano em duas mãos.** No tema claro, o ciano tem duas cores: `#14BCC5` para preencher (com texto `#031A1C`) e `#00737A` para texto e ícone. Nunca `#14BCC5` ou `#36D7DF` como texto sobre fundo claro.

**A regra da resposta.** Verde e coral só aparecem ligados a Sei / Não Sei, acerto e erro. Nunca em decoração, gráfico neutro ou destaque de marca.

**A regra da cor nunca sozinha.** Todo estado tem ícone e palavra além da cor: o veredito tem ícone + texto, a palavra acertada tem sublinhado além do ciano, controle ligado tem fundo além da cor do ícone.

**A regra do palco escuro.** O vídeo, a legenda e tudo o que fica por cima deles usam sempre os valores escuros, também no tema claro (classe `.palco`).

## Typography

**Títulos e marca:** Sora (600 e 700)
**Texto, interface e legenda:** Atkinson Hyperlegible Next (400, 500 e 700)
**Tempos, contadores e porcentagens:** JetBrains Mono (500)

**Character:** a Sora é geométrica e um pouco larga, com terminais retos: lembra instrumento de medida, sem ser a Space Grotesk da CORE. A Atkinson Hyperlegible Next foi feita pelo Braille Institute para distinguir ao máximo letras parecidas (I/l/1, O/0, rn/m); para quem lê legenda em segunda língua, isso é função. A JetBrains Mono tem algarismos tabulares e zero cortado: "Frase 12 de 148" e "78%" não dançam quando mudam.

### Hierarchy
Escala de base 16 px (a Atkinson pede um corpo um pouco maior que os 15 do HIG):
- **Display** (Sora 700, 40 px, 1.1, −0.02em): título de tela no desktop; em 390 px cai para Title 1.
- **Title 1** (Sora 700, 30 px, 1.2): título de tela no celular, título de modal no desktop.
- **Title 2** (Sora 600, 24 px): título de cartão de origem, de seção.
- **Title 3** (Sora 600, 20 px): título de modal no celular, marca no cabeçalho.
- **Headline** (Atkinson 700, 17 px): rótulo de botão grande, cabeçalho de lista ou painel.
- **Body** (Atkinson 400, 16 px, 1.5): texto corrido, campos (16 px evita o zoom do iPhone ao focar).
- **Callout** (Atkinson 500, 15 px): botões comuns, abas, itens de menu.
- **Footnote** (Atkinson 400, 13 px): descrições, dicas, textos de apoio.
- **Caption** (Atkinson 700, 12 px, +0.01em): rótulos curtos ("Você digitou", "Frase real"). Menor tamanho do app; nada abaixo de 12 px.
- **Números** (JetBrains Mono 500, 13 px, `tnum`): contador, tempo, porcentagem, tamanho de arquivo.
- **Legenda sobre o vídeo** (Atkinson 500, 20 a 34 px com `clamp`, 1.3): proposta futura; hoje o tamanho e a fonte vêm das preferências do aluno.

### Named Rules
**A regra dos números.** Contadores, tempos, porcentagens e tamanhos usam `--font-mono` com `font-variant-numeric: tabular-nums`.

**A regra da caixa alta.** Nada de rótulo em caixa alta com letras espaçadas (como no HIG atual e na CORE). Os rótulos que hoje estão em maiúsculas ("VOCÊ DIGITOU", "SEI", "NÃO SEI") passam a caixa normal, só pelo CSS; o texto no código não muda.

**A regra da Sora curta.** Sora só em títulos curtos (até umas cinco palavras). Títulos longos, sobretudo em 390 px, usam Atkinson 700.

## Layout

- **Larguras de referência:** 1440 px e 390 px. Pontos de quebra oficiais: `max-width: 1023px` (tablet e desktop estreito) e `max-width: 599px` (celular). Os 768 px e 900 px de hoje migram para esses dois.
- **Margens laterais** (`--gutter`): 48 px a partir de 1024, 32 px até 1023, 16 px até 599.
- **Larguras máximas:** 720 px para painéis de leitura e resposta (`--read-max`), 960 px para a grade de cartões (`--grid-max`), 1440 px para páginas (`--page-max`).
- **Cabeçalho:** 64 px; 52 px no celular.
- **Player:** o vídeo ocupa toda a área abaixo do cabeçalho; a barra do player tem 64 px (ver Aplicação para o celular).
- **Ritmo:** grade de 4 pt (`--s-1` a `--s-24`). Mais espaço acima de um título do que abaixo.
- **Alvos de toque:** todo controle clicável tem pelo menos 44 × 44 pt (`--control-h`), também no desktop. Botões principais grandes: 56 pt (`--control-h-lg`).
- **Áreas seguras:** barras fixas respeitam `env(safe-area-inset-*)`.

## Elevation & Depth

No escuro, a superfície sobe pela cor (fundo → superfície → elevada) com um filete de luz no topo; no claro, pela sombra. Em repouso, nada tem sombra forte. O material (vidro) existe só sobre o vídeo e nos painéis que flutuam sobre ele.

### Shadow Vocabulary
| Nível | Escuro | Claro | Onde |
|---|---|---|---|
| 0 | `--bg` | `--bg` | Página. |
| 1 (`--shadow-1`) | `--surface` + `inset 0 1px 0 rgba(232,241,240,0.04)` | `--surface` + `0 1px 2px rgba(13,22,23,0.06)` | Cartões, listas, painéis de página. |
| 2 (`--shadow-2`) | `--surface-2` + `inset 0 1px 0 rgba(232,241,240,0.06), 0 8px 24px rgba(0,0,0,0.40)` | `0 2px 4px rgba(13,22,23,0.06), 0 8px 24px rgba(13,22,23,0.08)` | Popover, cartão em hover, painel de legenda. |
| 3 (`--shadow-3`) | `--surface-2` + `0 24px 64px rgba(0,0,0,0.55)` | `0 24px 64px rgba(13,22,23,0.16)` | Modal, com véu `--overlay` e `blur(8px)`. |
| Vídeo | `--surface-video` + `--material-blur` | igual | Barra do player, área de resposta e feedback, botão de play. |

### Named Rules
**A regra do vidro só no palco.** Desfoque (`backdrop-filter`) só sobre o vídeo e no véu do modal. Sempre com o fallback opaco `@supports not (backdrop-filter: blur(1px))` → `--surface-video-solid`.

**A regra do material que não afina.** A opacidade do material sobre o vídeo não desce de 0.80: o texto secundário ali fica em 4.63:1, a margem mais apertada do produto.

## Shapes

Cantos pequenos: o sinal é geométrico. 4 px (tecla, chip mínimo), 8 px (botões, campos, caixa da legenda), 12 px (popover, área de resposta, cartões de lista), 16 px (cartão de origem, painel de feedback), 24 px (modal), cápsula só para chips e veredito. Bordas finas de 1 px; 1.5 px nas tracejadas (área de soltar arquivo) e no botão de play. Sublinhado de sinal: 2 px, afastado 3 px do texto.

## Components

### Buttons
Cheios e diretos. Hover: `filter: brightness(1.08)` nos preenchidos e `--fill-hover` nos transparentes. Pressionar: opacidade 0.72, como no iOS. Desativado: opacidade 0.4 e `cursor: not-allowed`. Foco: `outline: 2px solid var(--focus); outline-offset: 2px`. Sem gradiente, sem sombra 3D, sem deslocamento ao passar o mouse.
- **Shape:** 8 px; altura 44 px (`--control-h`), 56 px no grande.
- **Accent (principal):** `--accent` com texto `--on-accent`. A ação que leva adiante ("Próxima frase", "Começar agora", "Enviar Vídeo").
- **Secondary:** transparente, borda 1 px `--border-control`, texto `--text` ("Cancelar", "Restaurar padrão").
- **Ghost:** transparente, texto `--text-2`; no hover ganha `--fill-hover` e texto `--text`.
- **Sei:** `--success` com texto `--on-success`, ícone `Check`.
- **Não Sei:** `--danger` com texto `--on-danger`, ícone `X`.
- **Icon button:** 44 × 44, transparente, ícone 20 px (24 px na barra do player). Ligado: fundo `--accent-soft` e ícone `--accent`. Sempre com `aria-label`.

### Inputs / Fields
- **Style:** 44 px de altura, fundo `--surface`, borda 1 px `--border-control` (sobre o vídeo: `--border-video`), 8 px de canto, texto `--fs-body` (16 px), placeholder `--text-2`.
- **Focus:** borda `--accent` e anel `--focus` de 2 px com afastamento de 2 px.
- **Range (sliders):** `accent-color: var(--accent)`; trilho com `--border-control`.
- **Select:** mesmo desenho do campo, seta Lucide `ChevronsUpDown` ou a nativa.
- **Área de soltar arquivo:** borda 1.5 px tracejada `--border-control`, 12 px de canto. Arrastando por cima: borda contínua `--accent` e fundo `--accent-soft`. Com arquivo: linha com ícone, nome cortado com reticências, tamanho em mono e botão de remover.

### Cards
- **Corner Style:** 16 px (cartão de origem), 12 px (cartões de lista).
- **Background:** `--surface`, nível 1.
- **Hover/foco:** nível 2 e borda 1 px `--accent`. Sem brilho atrás, sem deslocamento.
- **Internal Padding:** 24 px (16 px no celular).

### Popover (painel de legenda)
Nível 2 sobre o palco: `--surface-2` escuro, 12 px de canto, padding 16 px, largura 320 px (`--panel-w`). Título em headline, fechar com `X` 44 × 44, amostras de cor de 28 px com anel `--focus` na selecionada.

### Modal (seleção de vídeo)
Nível 3, 24 px de canto, padding 32 px, largura 560 px, véu `--overlay` com `blur(8px)`. Título em Title 1, subtítulo em `--text-2`, fechar `X` 44 × 44 no canto, rodapé com secundário e principal.

### Chips
Cápsula de 28 px, `--fs-caption`, ícone de 14 px. Selo de cartão: borda 1 px `--border`, texto `--text-2`. Veredito: fundo `*-soft`, ícone na cor do estado, texto `--text` (sobre o vídeo) ou na cor do estado (fora dele).

### Navigation
- **Cabeçalho:** 64 px, fundo `--bg` com borda inferior `--border`; marca à esquerda (ícone `AudioWaveform` em `--accent-text` + nome em Sora 600, Title 3), abas no centro, botão de menu 44 × 44 à direita.
- **Abas:** 44 px de altura, callout, `--text-2`; hover `--fill-hover`; ativa com fundo `--accent-soft` e texto `--accent-text`. Sem sombra.

### Player
Descrito em detalhe em "Aplicação · Player" (o que muda agora sobre a estrutura atual) e em "Proposta futura".

## Do's and Don'ts

### Do:
- **Do** seguir o Apple HIG: controles nativos, foco visível, alvos de 44 pt, materiais só onde o conteúdo passa por baixo.
- **Do** usar os tokens de `app/src/styles/tokens.css`; nunca escrever cor ou tamanho solto, nem em CSS Module nem em `style={{}}`.
- **Do** usar os componentes de `app/src/components/ui/` e as classes de `components.css` antes de criar estilo novo.
- **Do** usar ícones Lucide (`lucide-react`), com tamanho e traço vindos do CSS (`--icon`, `--icon-stroke`).
- **Do** servir as fontes de `app/public/fonts/*.woff2` com `@font-face` em `styles/fonts.css`.
- **Do** usar `--font-mono` com algarismos tabulares em contadores, tempos e porcentagens.
- **Do** testar claro e escuro, em 1440 px e 390 px, e com `prefers-reduced-motion: reduce`.
- **Do** manter o palco do vídeo escuro nos dois temas (`.palco`).

### Don't:
- **Don't** usar emoji na interface (nem em texto, nem em `content:` de CSS).
- **Don't** importar fontes do Google Fonts (`@import` ou `<link>`): além da regra, o COEP `require-corp` bloqueia recursos de outra origem sem CORP.
- **Don't** usar `#14BCC5` ou `#36D7DF` como texto sobre fundo claro.
- **Don't** usar verde ou coral fora de resposta (Sei / Não Sei, acerto / erro).
- **Don't** usar gradiente, brilho, grão, sombra 3D ou animação decorativa contínua.
- **Don't** pôr texto pequeno com opacidade reduzida sobre o acento ou sobre o vídeo: use a cor de texto inteira.
- **Don't** usar rótulo em caixa alta com letras espaçadas.
- **Don't** usar vidro fora do palco do vídeo e do véu do modal.
- **Don't** mudar comportamento ou layout funcional do player ao aplicar o visual (ver Aplicação).

## Tokens CSS

Conteúdo que a frente de aplicação cria em `app/src/styles/tokens.css`. Nomes no padrão da CORE (`--s-*`, `--fs-*`, `--radius-*`, `--control-h`, `--dur`, `--ease`), com o prefixo `--lw-*` para a marca.

### Marca e escalas (iguais nos dois temas, em `:root`)

| Token | Valor | Uso |
|---|---|---|
| `--lw-ciano` | `#36D7DF` | Acento no escuro e no palco. |
| `--lw-ciano-claro` | `#8AF1F5` | Foco no escuro; hover do principal no escuro. |
| `--lw-ciano-legenda` | `#7CEBEF` | Palavra acertada na legenda (proposta). |
| `--lw-ciano-fundo` | `#14BCC5` | Preenchimento do principal no claro. |
| `--lw-ciano-tinta` | `#00737A` | Ciano como texto/ícone no claro. |
| `--lw-ciano-foco` | `#00666C` | Foco no claro. |
| `--lw-grafite-0` | `#05090A` | Base da caixa da legenda. |
| `--lw-grafite-1` | `#0A0E0F` | Fundo escuro. |
| `--lw-grafite-2` | `#11181A` | Superfície escura. |
| `--lw-grafite-3` | `#182123` | Elevada escura; fallback opaco do material. |
| `--lw-nevoa` | `#E8F1F0` | Texto no escuro. |
| `--lw-tinta` | `#0D1617` | Texto no claro. |
| `--lw-sobre-acento` | `#031A1C` | Texto sobre ciano, verde e coral preenchidos. |
| `--lw-branco` / `--lw-preto` | `#FFFFFF` / `#000000` | Texto da legenda; letterbox. |
| `--lw-verde` / `--lw-verde-tinta` | `#4FD18B` / `#17784A` | Sei (escuro / claro). |
| `--lw-coral` / `--lw-coral-tinta` / `--lw-coral-video` | `#FF6F7D` / `#B8323F` / `#FF9AA3` | Não Sei (escuro / claro / texto sobre o vídeo). |
| `--lw-ambar` / `--lw-ambar-tinta` | `#F2B544` / `#8A5A00` | Aviso (escuro / claro). |
| `--font-display` | `'Sora', system-ui, -apple-system, 'Segoe UI', sans-serif` | Títulos. |
| `--font-text` | `'Atkinson Hyperlegible Next', system-ui, -apple-system, 'Segoe UI', sans-serif` | Texto. |
| `--font-mono` | `'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace` | Números. |
| `--fs-display` … `--fs-caption` | `2.5rem` · `1.875rem` (`--fs-title1`) · `1.5rem` (`--fs-title2`) · `1.25rem` (`--fs-title3`) · `1.0625rem` (`--fs-headline`) · `1rem` (`--fs-body`) · `0.9375rem` (`--fs-callout`) · `0.8125rem` (`--fs-footnote`) · `0.75rem` (`--fs-caption`) | Escala da Typography. |
| `--fs-mono` | `0.8125rem` | Números. |
| `--fs-caption-video` | `clamp(1.25rem, 0.9rem + 1.4vw, 2.125rem)` | Legenda (proposta). |
| `--lh-display` / `--lh-title` / `--lh-text` / `--lh-caption` / `--lh-video` | `1.1` / `1.2` / `1.5` / `1.35` / `1.3` | Alturas de linha. |
| `--tracking-display` / `--tracking-title` / `--tracking-caption` | `-0.02em` / `-0.01em` / `0.01em` | Espaçamento entre letras. |
| `--fw-regular` / `--fw-medium` / `--fw-semibold` / `--fw-bold` | `400` / `500` / `600` / `700` | Pesos (só os servidos). |
| `--s-1` … `--s-24` | `4px` · `8px` (`-2`) · `12px` (`-3`) · `16px` (`-4`) · `20px` (`-5`) · `24px` (`-6`) · `32px` (`-8`) · `40px` (`-10`) · `48px` (`-12`) · `64px` (`-16`) · `96px` (`-24`) | Espaçamento. |
| `--gutter` | `48px` (32 px até 1023; 16 px até 599) | Margem lateral. |
| `--read-max` / `--grid-max` / `--page-max` | `720px` / `960px` / `1440px` | Larguras máximas. |
| `--radius-xs` … `--radius-full` | `4px` · `8px` (`-sm`) · `12px` (`-md`) · `16px` (`-lg`) · `24px` (`-xl`) · `999px` (`-full`) | Cantos. |
| `--hairline` / `--border-w-strong` | `1px` / `1.5px` | Bordas. |
| `--underline-w` / `--underline-offset` | `2px` / `3px` | Sublinhado de sinal. |
| `--control-h` / `--control-h-lg` | `44px` / `56px` | Alturas de controle. |
| `--icon` / `--icon-lg` / `--icon-xl` / `--icon-stroke` | `20px` / `24px` / `36px` / `1.75` | Ícones Lucide. |
| `--swatch` | `28px` | Amostra de cor do painel de legenda. |
| `--play-overlay` | `88px` | Botão de play sobre o vídeo pausado. |
| `--opacity-disabled` / `--opacity-pressed` | `0.4` / `0.72` | Estados. |
| `--navbar-h` | `64px` (52 px até 599) | Cabeçalho. |
| `--player-bar-h` | `64px` (112 px até 599, barra em duas linhas) | Barra do player. |
| `--panel-w` / `--dialog-w` | `320px` / `560px` | Popover e modal. |
| `--ease` | `cubic-bezier(.2, .8, .2, 1)` | Curva padrão. |
| `--dur-fast` / `--dur` / `--dur-slow` | `120ms` / `200ms` / `360ms` | Durações. |

### Palco do vídeo (iguais nos dois temas, em `:root`)

| Token | Valor |
|---|---|
| `--video-bg` | `var(--lw-preto)` |
| `--surface-video` | `rgba(11, 16, 17, 0.80)` |
| `--surface-video-solid` | `var(--lw-grafite-3)` |
| `--material-blur` | `blur(20px) saturate(140%)` |
| `--fill-video` / `--fill-video-hover` | `rgba(232, 241, 240, 0.10)` / `rgba(232, 241, 240, 0.16)` |
| `--border-video` | `#8FA3A5` |
| `--danger-video` | `var(--lw-coral-video)` |
| `--caption-bg` / `--caption-text` / `--caption-hit` | `rgba(5, 9, 10, 0.84)` / `var(--lw-branco)` / `var(--lw-ciano-legenda)` |
| `--video-dim` | `blur(10px) brightness(0.55)` (o filtro do vídeo pausado de hoje) |

### Semânticos por tema

| Token | Claro (`:root`) | Escuro (`[data-theme='dark']`, `prefers-color-scheme: dark` e `.palco`) |
|---|---|---|
| `color-scheme` | `light` | `dark` |
| `--bg` | `#F3F6F6` | `var(--lw-grafite-1)` |
| `--surface` | `#FFFFFF` | `var(--lw-grafite-2)` |
| `--surface-2` | `#FFFFFF` | `var(--lw-grafite-3)` |
| `--text` | `var(--lw-tinta)` | `var(--lw-nevoa)` |
| `--text-2` | `#435556` | `#9DB0AF` |
| `--text-disabled` | `#8D9C9D` | `#64767A` |
| `--accent` | `var(--lw-ciano-fundo)` | `var(--lw-ciano)` |
| `--accent-hover` | `var(--lw-ciano)` | `var(--lw-ciano-claro)` |
| `--accent-text` | `var(--lw-ciano-tinta)` | `var(--lw-ciano)` |
| `--on-accent` | `var(--lw-sobre-acento)` | `var(--lw-sobre-acento)` |
| `--accent-soft` | `rgba(0, 115, 122, 0.10)` | `rgba(54, 215, 223, 0.14)` |
| `--success` / `--on-success` | `var(--lw-verde-tinta)` / `var(--lw-branco)` | `var(--lw-verde)` / `var(--lw-sobre-acento)` |
| `--success-soft` | `rgba(23, 120, 74, 0.10)` | `rgba(79, 209, 139, 0.14)` |
| `--danger` / `--on-danger` | `var(--lw-coral-tinta)` / `var(--lw-branco)` | `var(--lw-coral)` / `var(--lw-sobre-acento)` |
| `--danger-soft` | `rgba(184, 50, 63, 0.10)` | `rgba(255, 111, 125, 0.14)` |
| `--warning` | `var(--lw-ambar-tinta)` | `var(--lw-ambar)` |
| `--warning-soft` | `rgba(138, 90, 0, 0.10)` | `rgba(242, 181, 68, 0.14)` |
| `--focus` | `var(--lw-ciano-foco)` | `var(--lw-ciano-claro)` |
| `--border` | `rgba(13, 22, 23, 0.10)` | `rgba(232, 241, 240, 0.08)` |
| `--border-control` | `#7D8F91` | `#647A7D` |
| `--fill` / `--fill-hover` | `rgba(13, 22, 23, 0.05)` / `rgba(13, 22, 23, 0.08)` | `rgba(232, 241, 240, 0.06)` / `rgba(232, 241, 240, 0.10)` |
| `--track-idle` | `rgba(13, 22, 23, 0.18)` | `rgba(232, 241, 240, 0.22)` |
| `--overlay` | `rgba(13, 22, 23, 0.40)` | `rgba(5, 9, 10, 0.60)` |
| `--shadow-1` | `0 1px 2px rgba(13, 22, 23, 0.06)` | `inset 0 1px 0 rgba(232, 241, 240, 0.04)` |
| `--shadow-2` | `0 2px 4px rgba(13, 22, 23, 0.06), 0 8px 24px rgba(13, 22, 23, 0.08)` | `inset 0 1px 0 rgba(232, 241, 240, 0.06), 0 8px 24px rgba(0, 0, 0, 0.40)` |
| `--shadow-3` | `0 24px 64px rgba(13, 22, 23, 0.16)` | `0 24px 64px rgba(0, 0, 0, 0.55)` |
| `--selection` | `rgba(20, 188, 197, 0.28)` | `rgba(54, 215, 223, 0.28)` |
| `--scrollbar` | `rgba(13, 22, 23, 0.22)` | `rgba(232, 241, 240, 0.22)` |

### Estrutura do arquivo

```css
/* LearnWatching · Sinal Limpo. Camadas: marca (--lw-*) → semânticos → componentes. */
:root {
  /* marca, fontes, escalas, palco: tabelas acima */
  /* semânticos do tema claro: coluna "Claro" */
}
@media (max-width: 1023px) { :root { --gutter: 32px; } }
@media (max-width: 599px) {
  :root { --gutter: 16px; --navbar-h: 52px; --player-bar-h: 112px; --fs-display: 1.875rem; }
}
/* Escuro: o mesmo bloco de valores nos três seletores */
@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) { /* coluna "Escuro" */ } }
:root[data-theme='dark'] { /* coluna "Escuro" */ }
.palco { /* coluna "Escuro" */ color: var(--text); background: var(--video-bg); }
```

`.palco` é uma classe global (não de CSS Module), posta na raiz do `StudyPlayer` e nos estados de carregamento e erro da página do player. Ela redefine os semânticos para os valores escuros dentro dela, então os componentes usam sempre `--text`, `--surface-2` etc., sem saber se estão no palco.

Os nomes atuais de `index.css` (`--s1`, `--s2`, `--s3`, `--b1`, `--b2`, `--b3`, `--tx`, `--mu`, `--mu2`, `--gold`, `--blue`, `--green`, `--red`) podem virar apelidos durante a migração (`--tx: var(--text)`, `--mu`/`--mu2: var(--text-2)`, `--s1: var(--surface)`, `--s2`/`--s3: var(--surface-2)`, `--b1`/`--b2: var(--border)`, `--b3: var(--border-control)`, `--gold`/`--blue: var(--accent-text)`, `--green: var(--success)`, `--red: var(--danger)`), mas no fim da aplicação nenhum arquivo pode usar os nomes antigos e os apelidos saem.

## Fontes

Arquivos em `app/public/fonts/`, copiados de `files/` dos pacotes **@fontsource 5.3.0** (subconjunto `latin`, que cobre inglês e os acentos do português). Licença SIL OFL 1.1 nos três (campo `license: OFL-1.1` e `LICENSE` de cada pacote).

| Arquivo em `app/public/fonts/` | Origem (pacote@versão → arquivo) | Peso | Tamanho |
|---|---|---|---|
| `Sora-SemiBold.woff2` | `@fontsource/sora@5.3.0` → `files/sora-latin-600-normal.woff2` | 600 | 15,0 kB |
| `Sora-Bold.woff2` | `@fontsource/sora@5.3.0` → `files/sora-latin-700-normal.woff2` | 700 | 15,1 kB |
| `AtkinsonHyperlegibleNext-Regular.woff2` | `@fontsource/atkinson-hyperlegible-next@5.3.0` → `files/atkinson-hyperlegible-next-latin-400-normal.woff2` | 400 | 12,1 kB |
| `AtkinsonHyperlegibleNext-Medium.woff2` | `@fontsource/atkinson-hyperlegible-next@5.3.0` → `files/atkinson-hyperlegible-next-latin-500-normal.woff2` | 500 | 12,6 kB |
| `AtkinsonHyperlegibleNext-Bold.woff2` | `@fontsource/atkinson-hyperlegible-next@5.3.0` → `files/atkinson-hyperlegible-next-latin-700-normal.woff2` | 700 | 12,7 kB |
| `JetBrainsMono-Medium.woff2` | `@fontsource/jetbrains-mono@5.3.0` → `files/jetbrains-mono-latin-500-normal.woff2` | 500 | 21,8 kB |
| `OFL.txt` | texto da SIL OFL 1.1 com as três linhas de copyright: Sora ("Copyright 2019 The Sora Project Authors"), Atkinson Hyperlegible Next ("Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors") e JetBrains Mono ("Copyright 2020 The JetBrains Mono Project Authors"), tiradas do `LICENSE` de cada pacote | — | — |

Total: cerca de 89 kB em seis arquivos. Como baixar sem instalar os pacotes no app: `npm pack @fontsource/sora@5.3.0` (e os outros dois) numa pasta temporária, extrair e copiar os arquivos acima. Os pacotes `@fontsource/*` não entram no `package.json`.

`app/src/styles/fonts.css`, no modelo da CORE:

```css
/* LearnWatching · @font-face (SIL OFL 1.1). Arquivos em /public/fonts. */
@font-face { font-family: 'Sora'; font-style: normal; font-weight: 600; font-display: swap; src: url('/fonts/Sora-SemiBold.woff2') format('woff2'); }
@font-face { font-family: 'Sora'; font-style: normal; font-weight: 700; font-display: swap; src: url('/fonts/Sora-Bold.woff2') format('woff2'); }
@font-face { font-family: 'Atkinson Hyperlegible Next'; font-style: normal; font-weight: 400; font-display: swap; src: url('/fonts/AtkinsonHyperlegibleNext-Regular.woff2') format('woff2'); }
@font-face { font-family: 'Atkinson Hyperlegible Next'; font-style: normal; font-weight: 500; font-display: swap; src: url('/fonts/AtkinsonHyperlegibleNext-Medium.woff2') format('woff2'); }
@font-face { font-family: 'Atkinson Hyperlegible Next'; font-style: normal; font-weight: 700; font-display: swap; src: url('/fonts/AtkinsonHyperlegibleNext-Bold.woff2') format('woff2'); }
@font-face { font-family: 'JetBrains Mono'; font-style: normal; font-weight: 500; font-display: swap; src: url('/fonts/JetBrainsMono-Medium.woff2') format('woff2'); }
```

Sai o `@import url("https://fonts.googleapis.com/...")` da primeira linha de `app/src/index.css` e todas as referências a "DM Serif Display", "DM Sans", "Menlo"/"Consolas" e `-apple-system` soltas nos CSS Modules (passam a `var(--font-*)`). Como os arquivos são da mesma origem, o COEP `require-corp` não bloqueia nada.

## Ícones

Pacote `lucide-react` **1.77.0** (versão atual no npm em 22/11/2026; nomes conferidos no `dist/lucide-react.d.ts` do pacote). Atenção: nessa versão `Trash2` e `FileVideo` são apenas apelidos de `Trash` e `FilePlay`, e não há ícones de marca (não existe `Youtube`). Use os nomes canônicos abaixo. Tamanho e traço vêm do CSS (`width/height: var(--icon)`, `stroke-width: var(--icon-stroke)`); ícone decorativo leva `aria-hidden="true"`, botão só com ícone leva `aria-label`.

### Emoji e símbolos que viram ícone (aplicar agora)

| Arquivo (em `app/src/`) | Hoje | Lucide | Observação |
|---|---|---|---|
| `pages/Progresso/Progresso.tsx:45` | `📚 Vocabulário` | `BookOpen` | Ícone `--accent-text`, 20 px; o texto "Vocabulário" fica. |
| `pages/Progresso/Progresso.tsx:50` | `→` entre palavra e tradução | `ArrowRight` | 14 px, `--text-2`, `aria-hidden`. |
| `pages/Progresso/Progresso.tsx:58` | `🃏 Anki Phrases` | `Layers` | O texto "Anki Phrases" fica (troca de texto é proposta futura). |
| `pages/Progresso/Progresso.tsx:64` | `{tries}×` | nenhum | Não é emoji; fica como está, em `--font-mono`. |
| `pages/Shadowing/Shadowing.tsx:27` | botão `▶` | `Play` | Botão 44 × 44 com `aria-label="Tocar frase"`. |
| `pages/Shadowing/Shadowing.tsx:29` | botão `●` (gravar) | `Mic` | Botão 44 × 44 com `aria-label="Gravar"`; continua sem ação, como hoje. |
| `pages/Shadowing/Shadowing.tsx:35` | `💡` na dica | `Lightbulb` | Ícone `--warning`, dica em `--surface-2`. |
| `pages/TranscodeTest/TranscodeTest.tsx:342` e `:384` | `✗` | `CircleX` | `--danger`. |
| `pages/TranscodeTest/TranscodeTest.tsx:376` | `⚡ Cache hit` / `✓ Encodado` | `Zap` / `CircleCheck` | `--accent-text` / `--success`; os textos ficam. |
| `components/StudyPlayer/StudyPlayer.tsx:467` | `✓ Boa!` | `CircleCheck` | Texto "Boa!" fica. |
| `components/StudyPlayer/StudyPlayer.tsx:468` | `≈ Mais ou menos` | `CircleDashed` | Texto "Mais ou menos" fica. |
| `components/StudyPlayer/StudyPlayer.tsx:470` | `✗ Tenta de novo na próxima` | `CircleX` | Texto fica. |
| `components/StudyPlayer/StudyPlayer.tsx:485` | `Próxima frase →` | `ArrowRight` | Depois do texto. |
| `pages/Select/SelectPath.tsx:31` e `:56` | selos `◆` / `▲` (`badgeIcon`) | `Lock` / `Server` | Os textos "100% local" e "Auto-hospedado" ficam. O campo `badgeIcon` passa a receber o componente do ícone. |
| `lib/srt.ts:82` | `♪ ♫ #` | nenhum | É lógica: regex que **descarta** trechos de letra de música do SRT. Não aparece na interface. Não mexer. |

Os `→` em comentários e logs (`StudyPlayer.tsx` linhas 5 a 7, `useTranscodeSession.ts`, `transcode.worker.ts`) não são interface e ficam.

### SVGs desenhados à mão que viram Lucide (aplicar agora)

| Onde | Hoje | Lucide |
|---|---|---|
| `StudyPlayer.tsx` | voltar (seta), play do vídeo pausado, X do "Não Sei", check do "Sei", CC, engrenagem, avanço automático (setas em loop), fechar o campo | `ChevronLeft`, `Play`, `X`, `Check`, `Captions` (ligado) / `CaptionsOff` (desligado), `Settings2`, `Repeat`, `X` |
| `SubtitleSettingsPanel.tsx` | fechar | `X` |
| `VideoSelectModal.tsx` | fechar, enviar, arquivo de vídeo, remover, legenda, seta do botão | `X`, `Upload`, `FilePlay`, `X`, `FileText`, `ArrowRight` |
| `SelectPath.tsx` (ícones das origens) | upload, monitor | `Upload`, `Server` |
| `Heading.tsx` | logotipo (play em círculo), menu | `AudioWaveform` (provisório até existir o símbolo próprio), `Menu` |
| `pages/Home/HomePage.tsx` | recursos (play em círculo, idiomas, gráfico, microfone), fontes (YouTube, upload, monitor), setas, play do "Ver demo" e do vídeo de exemplo | `CirclePlay`, `Languages`, `ChartColumn`, `Mic`; `MonitorPlay`, `Upload`, `Server`; `ArrowRight`; `Play` |
| `Player.tsx` (carregando) | spinner em CSS | fica em CSS (com tokens) ou `LoaderCircle` girando; com movimento reduzido, para |

## Contraste AA

Fórmula de luminância relativa da WCAG 2.x (script no Apêndice). Camadas translúcidas foram compostas sobre o **pior caso**: o material e a caixa da legenda sobre um quadro de vídeo **branco** (e a legenda também sobre preto). Cores compostas: material sobre branco `#3C4041`; caixa da legenda (0.84) sobre branco `#2D3031`, sobre preto `#040808`; legenda padrão de hoje (preto a 0.78) sobre branco `#383838`. Mínimos: texto 4.5:1; ícones, bordas de controle e foco 3:1. Texto desativado é isento pela WCAG (mostrado só como referência).

| Tema | Par | Frente | Fundo | Razão | Mínimo | Passa |
|---|---|---|---|---|---|---|
| Escuro | Texto primário / fundo | `#E8F1F0` | `#0A0E0F` | 16.88:1 | 4.5:1 | sim |
| Escuro | Texto primário / superfície | `#E8F1F0` | `#11181A` | 15.62:1 | 4.5:1 | sim |
| Escuro | Texto primário / elevada | `#E8F1F0` | `#182123` | 14.27:1 | 4.5:1 | sim |
| Escuro | Texto secundário / fundo | `#9DB0AF` | `#0A0E0F` | 8.56:1 | 4.5:1 | sim |
| Escuro | Texto secundário / superfície (placeholder do campo) | `#9DB0AF` | `#11181A` | 7.92:1 | 4.5:1 | sim |
| Escuro | Texto secundário / elevada | `#9DB0AF` | `#182123` | 7.23:1 | 4.5:1 | sim |
| Escuro | Texto desativado / superfície (isento) | `#64767A` | `#11181A` | 3.77:1 | — | isento |
| Escuro | Acento como texto / fundo | `#36D7DF` | `#0A0E0F` | 11.03:1 | 4.5:1 | sim |
| Escuro | Acento como texto / elevada | `#36D7DF` | `#182123` | 9.33:1 | 4.5:1 | sim |
| Escuro | Acento / seleção (accent-soft sobre fundo) | `#36D7DF` | `#102A2C` | 8.59:1 | 4.5:1 | sim |
| Escuro | Texto sobre botão acento | `#031A1C` | `#36D7DF` | 10.22:1 | 4.5:1 | sim |
| Escuro | Texto sobre botão acento em hover | `#031A1C` | `#8AF1F5` | 13.68:1 | 4.5:1 | sim |
| Escuro | "Sei" texto/ícone / elevada | `#4FD18B` | `#182123` | 8.45:1 | 4.5:1 | sim |
| Escuro | "Não Sei" texto/ícone / elevada | `#FF6F7D` | `#182123` | 6.11:1 | 4.5:1 | sim |
| Escuro | Aviso texto / elevada | `#F2B544` | `#182123` | 8.96:1 | 4.5:1 | sim |
| Escuro | Texto sobre botão "Sei" | `#031A1C` | `#4FD18B` | 9.27:1 | 4.5:1 | sim |
| Escuro | Texto sobre botão "Não Sei" | `#031A1C` | `#FF6F7D` | 6.69:1 | 4.5:1 | sim |
| Escuro | Borda de controle / superfície | `#647A7D` | `#11181A` | 3.95:1 | 3:1 | sim |
| Escuro | Borda de controle / elevada | `#647A7D` | `#182123` | 3.61:1 | 3:1 | sim |
| Escuro | Foco / fundo | `#8AF1F5` | `#0A0E0F` | 14.76:1 | 3:1 | sim |
| Escuro | Foco / elevada | `#8AF1F5` | `#182123` | 12.48:1 | 3:1 | sim |
| Vídeo | Texto primário / material (quadro branco atrás) | `#E8F1F0` | `#3C4041` | 9.13:1 | 4.5:1 | sim |
| Vídeo | Texto secundário / material (quadro branco) | `#9DB0AF` | `#3C4041` | 4.63:1 | 4.5:1 | sim |
| Vídeo | Acento como texto (palavra acertada no feedback) / material | `#36D7DF` | `#3C4041` | 5.97:1 | 4.5:1 | sim |
| Vídeo | Ícone ativo (CC, avanço) / accent-soft sobre material | `#36D7DF` | `#3B5557` | 4.55:1 | 3:1 | sim |
| Vídeo | "Sei" texto/ícone / material | `#4FD18B` | `#3C4041` | 5.41:1 | 4.5:1 | sim |
| Vídeo | Texto da faixa "Boa!" / success-soft sobre material | `#E8F1F0` | `#3F544B` | 7.08:1 | 4.5:1 | sim |
| Vídeo | Ícone "Boa!" / success-soft sobre material | `#4FD18B` | `#3F544B` | 4.19:1 | 3:1 | sim |
| Vídeo | Aviso texto / material | `#F2B544` | `#3C4041` | 5.73:1 | 4.5:1 | sim |
| Vídeo | Texto da faixa "Mais ou menos" / warning-soft sobre material | `#E8F1F0` | `#555041` | 7.00:1 | 4.5:1 | sim |
| Vídeo | Ícone "Mais ou menos" / warning-soft sobre material | `#F2B544` | `#555041` | 4.39:1 | 3:1 | sim |
| Vídeo | "Não Sei" (danger-video) / material | `#FF9AA3` | `#3C4041` | 5.20:1 | 4.5:1 | sim |
| Vídeo | Texto da faixa "Tenta de novo" / danger-soft sobre material | `#E8F1F0` | `#574749` | 7.60:1 | 4.5:1 | sim |
| Vídeo | Ícone "Tenta de novo" (danger-video) / danger-soft sobre material | `#FF9AA3` | `#574749` | 4.33:1 | 3:1 | sim |
| Vídeo | Borda de controle no vídeo / material | `#8FA3A5` | `#3C4041` | 3.97:1 | 3:1 | sim |
| Vídeo | Foco / material | `#8AF1F5` | `#3C4041` | 7.98:1 | 3:1 | sim |
| Vídeo | Legenda branca / caixa 0.84 (quadro branco) | `#FFFFFF` | `#2D3031` | 13.30:1 | 4.5:1 | sim |
| Vídeo | Legenda branca / caixa 0.84 (quadro preto) | `#FFFFFF` | `#040808` | 20.13:1 | 4.5:1 | sim |
| Vídeo | Palavra acertada na legenda / caixa 0.84 (quadro branco) | `#7CEBEF` | `#2D3031` | 9.49:1 | 4.5:1 | sim |
| Vídeo | Legenda padrão atual (#FFF sobre preto 0.78, quadro branco) | `#FFFFFF` | `#383838` | 11.73:1 | 4.5:1 | sim |
| Claro | Texto primário / fundo | `#0D1617` | `#F3F6F6` | 16.89:1 | 4.5:1 | sim |
| Claro | Texto primário / superfície | `#0D1617` | `#FFFFFF` | 18.35:1 | 4.5:1 | sim |
| Claro | Texto secundário / fundo | `#435556` | `#F3F6F6` | 7.23:1 | 4.5:1 | sim |
| Claro | Texto secundário / superfície | `#435556` | `#FFFFFF` | 7.86:1 | 4.5:1 | sim |
| Claro | Texto desativado / superfície (isento) | `#8D9C9D` | `#FFFFFF` | 2.85:1 | — | isento |
| Claro | Acento como texto / fundo | `#00737A` | `#F3F6F6` | 5.18:1 | 4.5:1 | sim |
| Claro | Acento como texto / superfície | `#00737A` | `#FFFFFF` | 5.63:1 | 4.5:1 | sim |
| Claro | Acento como texto / seleção (accent-soft sobre fundo) | `#00737A` | `#DBE9EA` | 4.51:1 | 4.5:1 | sim |
| Claro | Texto sobre botão acento | `#031A1C` | `#14BCC5` | 7.73:1 | 4.5:1 | sim |
| Claro | Texto sobre botão acento em hover | `#031A1C` | `#36D7DF` | 10.22:1 | 4.5:1 | sim |
| Claro | "Sei" texto/ícone / superfície | `#17784A` | `#FFFFFF` | 5.49:1 | 4.5:1 | sim |
| Claro | "Não Sei" texto/ícone / superfície | `#B8323F` | `#FFFFFF` | 5.89:1 | 4.5:1 | sim |
| Claro | Aviso texto / superfície | `#8A5A00` | `#FFFFFF` | 5.93:1 | 4.5:1 | sim |
| Claro | Texto branco sobre botão "Sei" | `#FFFFFF` | `#17784A` | 5.49:1 | 4.5:1 | sim |
| Claro | Texto branco sobre botão "Não Sei" | `#FFFFFF` | `#B8323F` | 5.89:1 | 4.5:1 | sim |
| Claro | Borda de controle / superfície | `#7D8F91` | `#FFFFFF` | 3.38:1 | 3:1 | sim |
| Claro | Borda de controle / fundo | `#7D8F91` | `#F3F6F6` | 3.11:1 | 3:1 | sim |
| Claro | Foco / superfície | `#00666C` | `#FFFFFF` | 6.74:1 | 3:1 | sim |
| Claro | Foco / fundo | `#00666C` | `#F3F6F6` | 6.20:1 | 3:1 | sim |

**Leitura da tabela:**
- Os 57 pares obrigatórios passam. Menor razão: **3.11:1** (borda de controle sobre o fundo claro; mínimo 3:1). Menor razão de texto: **4.51:1** (ciano-texto sobre a seleção no claro) e, sobre o vídeo, **4.63:1** (texto secundário no material com quadro branco atrás).
- Mudança em relação à direção original: a faixa de veredito sobre o vídeo com texto na cor do estado sobre o fundo `*-soft` **não passava** (verde 4.19:1, âmbar 4.39:1, coral 4.33:1). Por isso, sobre o vídeo, o texto da faixa é `--text` (7.00 a 7.60:1) e só o ícone leva a cor do estado (passa como ícone, 3:1). Nenhuma cor foi alterada.
- Por que existe `--danger-video`: o coral `#FF6F7D` sobre o material dava 3.91:1.
- Margens apertadas: se a opacidade do material cair abaixo de 0.80 ou o `backdrop-filter` não existir sem o fallback opaco, o texto secundário no vídeo deixa de passar.

## Aplicação

Esta seção é a ordem de serviço para a frente de aplicação (dona de `app/src/styles/`, `app/src/components/ui/`, `app/public/fonts/`, dos `.css`/`.module.css`, dos `.tsx` só no que for visual e do `lucide-react` no `app/package.json`).

**Regra desta etapa:** muda a aparência, não muda comportamento nem layout funcional. Mesmos elementos, mesma ordem no DOM, mesmos textos, mesmos handlers, mesmos estados, mesmas condições de `disabled`, mesmo posicionamento funcional (o que está no topo continua no topo, o campo continua descendo do topo, a legenda continua onde o painel de legenda manda). Pode: trocar classes e CSS, trocar SVG por Lucide, trocar `<button className>` por `<Button>` de `ui/` mantendo `onClick`, `type`, `disabled`, `title` e `aria-*` idênticos, e acrescentar a classe global `palco`.

### Aplicar agora · base

1. **Fontes:** os seis `.woff2` e o `OFL.txt` da seção Fontes em `app/public/fonts/`; `app/src/styles/fonts.css`.
2. **`app/src/styles/tokens.css`** com todos os tokens da seção Tokens CSS (claro em `:root`, escuro via `prefers-color-scheme`, `[data-theme='dark']` e `.palco`). O tema segue o sistema; o atributo `data-theme` já fica suportado para um seletor futuro.
3. **`app/src/styles/base.css`:** o reset que hoje está em `index.css`; `body` com `--bg`, `--text`, `--font-text`, `--fs-body`, `--lh-text`, `caret-color: var(--accent)`; `h1–h4` em `--font-display`; `:focus-visible` com `outline: 2px solid var(--focus); outline-offset: 2px`; `::selection { background: var(--selection) }`; barra de rolagem fina com `--scrollbar`; `.sr-only`; `.num { font-family: var(--font-mono); font-variant-numeric: tabular-nums }`; e `@media (prefers-reduced-motion: reduce)` zerando animações e transições.
4. **`app/src/styles/components.css`:** `.btn` (`--accent`, `--secondary`, `--ghost`, `--sei`, `--nao-sei`, `--lg`, `--icon`), `.icon-btn` (e `.icon-btn--on`), `.input`, `.card`, `.chip` (e variantes de veredito), `.popover`, `.dialog`, `.spinner`, conforme Components.
5. **`app/src/components/ui/`:** `Button.tsx` (variantes e tamanhos acima), `IconButton.tsx` (44 × 44, `aria-label` obrigatório, prop `on` só visual), `Chip.tsx`, `Spinner.tsx` e `index.ts`. Ícone sempre por `children`; tamanho e traço pelo CSS.
6. **`app/src/index.css`:** sai o `@import` do Google Fonts e o `:root` antigo; passa a importar (ou o `main.tsx` importa) `styles/fonts.css`, `tokens.css`, `base.css` e `components.css`, nessa ordem. `App.css` usa só tokens.
7. **`lucide-react@1.77.0`** em `dependencies` do `app/package.json`.
8. **Movimento:** `--ease` e `--dur*` em todas as transições; animações de entrada (cartões, modal) curtas e desligadas com movimento reduzido; saem as animações contínuas decorativas (vídeo de exemplo flutuando, barra de progresso falsa em loop na página inicial).

### Aplicar agora · Player (`StudyPlayer.tsx`, `StudyPlayer.module.css`, `SubtitleSettingsPanel.*`, `Player.module.css`)

O comportamento e o layout funcional continuam: barra de controles no topo que aparece com o mouse em cima ou com foco dentro (`:hover` / `:focus-within`), Sei e Não Sei na barra, campo que desce do topo, feedback no mesmo painel, legenda sobre o vídeo com o estilo das preferências do aluno, clique pausa, duplo clique tela cheia.

- **Raiz:** classe global `palco` junto do `styles.root`; fonte `--font-text`; cor `--text`.
- **Vídeo:** fundo `--video-bg`; pausado usa `filter: var(--video-dim)` (mesmo valor de hoje), transição `--dur-slow`.
- **Play sobre o vídeo pausado:** círculo de `--play-overlay` (88 px; hoje 96), fundo `--surface-video` + `--material-blur`, borda `--border-w-strong` `--border-video`, ícone `Play` de `--icon-xl` em `--text`. Sem sombra preta forte.
- **"Aguardando cue N…":** `--text-2`, `--fs-footnote`.
- **Barra do topo (`.topBar`):** mesma posição e mesma regra de aparecer/sumir; o gradiente preto vira `--surface-video` + `--material-blur` (fallback `--surface-video-solid`), altura `--player-bar-h`, padding `0 var(--gutter)`. Ordem e posições iguais: voltar à esquerda, ações no centro, contador à direita.
  - **Voltar:** `IconButton` com `ChevronLeft` (`--icon-lg`), sem caixa 3D, sem deslocamento no hover.
  - **Contador:** `--font-mono`, `--fs-mono`, `--text-2`. Texto igual ("Frase N de M").
  - **Não Sei / Sei:** `.btn--nao-sei` / `.btn--sei`, altura `--control-h` (hoje 48), `--radius-sm`, `--fs-callout` peso 700, sem `text-transform`, ícones `X` e `Check` de `--icon`. Saem gradientes, sombras 3D e o "afundar" no clique; pressionar = `--opacity-pressed`. Desativado: `--opacity-disabled` (mesma condição de hoje).
  - **CC, painel de legenda, avanço automático:** `IconButton` 44 × 44, ícones `Captions`/`CaptionsOff`, `Settings2`, `Repeat` em `--icon-lg`. Ligado (`showSubtitle`, painel aberto, `autoplay`): fundo `--accent-soft`, ícone `--accent` (4.55:1). Sai o amarelo.
  - **390 px (até 599 px):** só CSS, sem mexer no DOM: a barra quebra em duas linhas (voltar e contador na primeira, `position: static`; ações na segunda, Sei e Não Sei com `flex: 1`), daí `--player-bar-h: 112px`. Hoje, em 390 px, as ações (mais de 400 px de largura) não cabem e passam por cima do voltar e do contador, que estão em `position: absolute`.
- **Painel de legenda:** `.popover` nível 2 sobre o palco, `--panel-w`, `--radius-md`, título em `--fs-headline`, rótulos em `--fs-caption` sem caixa alta, valores ("78%", "22px") em `--font-mono`, amostras de `--swatch` com `--radius-full`, borda `--hairline` `--border`, selecionada com anel `--focus`; sliders com `accent-color: var(--accent)`; select como `.input`; "Restaurar padrão" como `.btn--secondary`. As **cores das amostras** (`COLOR_PRESETS`, `BG_PRESETS`) e os valores padrão de `useSubtitleSettings.ts` são dados de preferência do aluno, não estilo: ficam como estão e são a única exceção à regra de cor solta.
- **Legenda sobre o vídeo (`.subtitleOverlay`):** mesma posição (8% da base, 85% de largura máxima); `--radius-sm`, padding `var(--s-2) var(--s-4)`, `line-height: var(--lh-video)`. Cor, fundo, tamanho e fonte continuam vindo do `subtitleStyle()`.
- **Área do campo e do feedback (`.inputArea`):** mesma animação de descer do topo e mesma largura (`min(var(--read-max), 100% - 2 × var(--gutter))`); `top: calc(var(--player-bar-h) + var(--s-1))`; fundo `--surface-video` + `--material-blur`, `--radius-md`, borda `--hairline` `--border`, sombra `--shadow-2`; curva `--ease`, duração `--dur-slow`.
  - **Campo:** `.input` de 44 px sobre `--surface`, borda `--border-video`, `--fs-body`; foco com borda `--accent` e anel `--focus`. Placeholder igual.
  - **Fechar:** `IconButton` com `X` (hoje 36 px, passa a 44).
  - **Rótulos "Você digitou" / "Frase real":** `--fs-caption`, `--text-2`, sem caixa alta.
  - **Textos:** `--fs-body`, `--text`. **Palavra acertada (`.matched`):** `--accent-text`, peso 700, `text-decoration: underline var(--underline-w)` com `text-underline-offset: var(--underline-offset)` (hoje verde).
  - **Veredito (`.score*`):** faixa `--radius-sm` com fundo `--success-soft` / `--warning-soft` / `--danger-soft`, sem borda; ícone `CircleCheck` / `CircleDashed` / `CircleX` na cor do estado (`--success`, `--warning`, `--danger-video`); **texto em `--text`** (regra de contraste); números da contagem podem ir num `<span class="num">`. Textos iguais.
  - **Próxima frase:** `.btn--accent` de 44 px com `ArrowRight`; a dica "(auto em Ns ou Enter)" em `--fs-footnote` na cor `--on-accent` inteira (sem opacidade).
- **"Sessão concluída":** `--text-2`, `--fs-body`.
- **Página do player (`Player.module.css`):** estados de carregamento e erro também dentro de `.palco`. Spinner com `--accent` sobre `--track-idle`; "N de M cues processadas" em `--font-mono`; barra de progresso com trilho `--track-idle` e preenchimento `--accent`, `--radius-full`; caixa de erro com `--danger-soft` e texto `--text` com o rótulo em `--danger`; selos "Aguardando cue…" / "Sessão pronta" em `--surface-video` com `--font-mono`.

### Aplicar agora · demais telas

- **Cabeçalho (`Heading.*`):** altura `--navbar-h`, fundo `--bg` com borda inferior `--border` (sai o vidro), padding `0 var(--gutter)`. Marca: `AudioWaveform` em `--accent-text` no lugar do quadrado com gradiente; texto em Sora 600 `--fs-title3`, cor `--text`, com o trecho destacado ("SRT") em `--accent-text`. Abas e botão de menu como em Navigation. O comportamento abaixo de 600 px (abas escondidas) não muda.
- **Seleção (`SelectPath.*`, `SourceCard.*`):** saem o grão (`::before`) e a mancha de luz (`::after`) e o brilho do cartão (`.glow`). Grade com `--grid-max`, gap `--s-6` (`--s-3` no celular), uma coluna até 1023 px. Cartão = Card (16 px, `--surface`, nível 1; hover/foco nível 2 + borda `--accent`); ícone de `--icon-lg` num quadrado de 48 px com `--accent-soft` e ícone `--accent-text`; selo como Chip com o ícone Lucide; título em `--fs-title2`, frase em `--fs-callout` `--text`, descrição em `--fs-footnote` `--text-2`; altura mínima 240 px (160 no celular) no lugar dos 450 px. Saem as cores próprias por origem (`accent`/`accentDim` no `SelectPath.tsx` e o `style` inline com `--accent` no `SourceCard.tsx`, que hoje **sobrescreveria** o token `--accent` dentro do cartão).
- **Modal (`VideoSelectModal.*`):** Modal da seção Components; área de soltar como em Inputs; botão "Enviar Vídeo" como `.btn--accent` (desativado nas mesmas condições de hoje); "Cancelar" como `.btn--secondary`; remover arquivo como `IconButton` com `X`. No celular (até 599 px), só por CSS, o modal ocupa a largura toda presa à base, com `--radius-xl` só nos cantos de cima e altura máxima de 92%; os botões do rodapé dividem a largura.
- **Página inicial (`HomePage.*`):** título em `--fs-display` (Title 1 no celular) com o destaque em `--accent-text` sólido (sai o gradiente no texto); botões como `.btn--accent` e `.btn--secondary`; cartões de recurso e de fonte como Card, ícones Lucide da tabela em `--accent-text` (saem as cores por fonte, `color` inline); vídeo de exemplo com `--video-bg`, legenda de exemplo com `--caption-bg`/`--caption-text` e barra com `--accent` (sem animação contínua); seção final e rodapé com tokens. Textos iguais.
- **Progresso (`Progresso.*`):** título em `--fs-title1`, subtítulo `--text-2`; números das estatísticas em `--font-mono` grande (`--fs-title1`) com cores por token no lugar de `var(--tx)`/`var(--green)`/`var(--gold)`/`var(--red)`: Falas `--text`, Acertos `--success`, Vocabulário `--accent-text`, Anki Phrases `--danger`; painéis como Card nível 1; ícones `BookOpen`, `ArrowRight`, `Layers`; contagem "N×" em mono dentro de Chip com `--danger-soft`.
- **Shadowing (`Shadowing.*`):** cartões nível 1, número em `--font-mono` `--text-2`, frase em `--fs-headline`; botões `Play` e `Mic` como `IconButton` (o de gravar com ícone `--danger`); dica com `Lightbulb`, fundo `--surface-2` (com `--shadow-1` no claro) e texto `--text-2`.
- **Teste do transcode (`TranscodeTest.*`):** só tokens (cores, fontes, espaçamentos) e os ícones da tabela; é ferramenta de desenvolvimento, sem polimento extra.
- **Componentes sem uso (`components/Subtitle/*`, `components/PlayerVideo/*`):** só trocar cores e fontes por tokens, para cumprir a regra de nada solto.

### Como conferir

- Nenhuma cor solta fora de `tokens.css`: `grep -rnE "#[0-9a-fA-F]{3,8}\b|rgba?\(" app/src --include=*.css --include=*.tsx` só pode achar `styles/tokens.css` e as exceções de preferência de legenda (`SubtitleSettingsPanel.tsx`, `useSubtitleSettings.ts`).
- Nenhum tamanho solto: `grep -rnE "[0-9.]+(px|rem|em)\b" app/src --include=*.module.css` não acha nada (bordas de 1 px usam `--hairline`). Aceitos sem token: `0`, percentuais, `fr`, `vh`/`vw`, `calc()` só com tokens e os `@media` (custom property não funciona dentro de `@media`).
- Nenhum emoji ou símbolo usado como ícone: `grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{25A0}-\x{25FF}\x{2190}-\x{21FF}\x{2248}]" app/src --include=*.tsx --include=*.ts --include=*.css` só pode achar comentários, logs e o `lib/srt.ts`.
- Nenhuma fonte externa: `grep -rn "fonts.googleapis\|DM Serif\|DM Sans" app/` vazio.
- Visual: claro e escuro (emulação de `prefers-color-scheme` no navegador), 1440 px e 390 px, foco por teclado em todos os controles, `prefers-reduced-motion`.

### Fora do dono da aplicação (pedir ao orquestrador)

- `app/index.html` (dono: frente B): `<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/AtkinsonHyperlegibleNext-Regular.woff2">` e o mesmo para `Sora-Bold.woff2`; `<meta name="theme-color">` com `#F3F6F6` (claro) e `#0A0E0F` (escuro, `media="(prefers-color-scheme: dark)"`); `lang="pt-BR"` (hoje `en`, mas a interface é em português).

### Proposta futura (depende de aprovação, muda comportamento ou layout funcional)

Nada disto entra na etapa atual. Cada item muda o que o aluno faz ou onde as coisas ficam, ou troca texto.

1. **Dock de resposta na base do vídeo.** Sei e Não Sei saem da barra do topo e vão para um painel fixo na base (largura `--read-max`, botões de `--control-h-lg`, Não Sei à esquerda e Sei à direita, sempre no mesmo lugar). O campo nasce no lugar dos botões (em vez de descer do topo) e o feedback cresce para cima a partir dele (até 50% da altura do vídeo). Ícones passam a dizer a consequência: `Eye` no Não Sei ("mostrar a frase") e `Keyboard` no Sei ("vou digitar").
2. **Trilha de frases (`CueTrack`).** Uma barra vertical por frase (3 px, gap 2 px, altura proporcional à duração): respondidas em `--success`/`--danger`, atual em `--accent` mais larga e alta, futuras em `--track-idle`; janela de cerca de 60 frases; clicar numa barra respondida volta para ela; `role="progressbar"` com `aria-valuetext`. No player e no Progresso. Precisa guardar o resultado de cada frase, o que hoje não existe.
3. **Barra do topo nova:** tempo em mono (`00:41.2`), botão de tela cheia visível (`Maximize`/`Minimize`), "ouvir de novo" (`Repeat`, ou `RotateCcw` se `Repeat` continuar no avanço automático) e atalhos `S`, `N`, `R`, `Enter`, `Esc` (conferir conflitos).
4. **Controles que somem por tempo** (2 s depois de tocar) e que ficam sempre visíveis em telas de toque (`@media (hover: none)`); hoje dependem de `:hover`/`:focus-within`.
5. **Celular em pé:** vídeo no topo, e abaixo dele (seguindo o tema) a trilha, "ouvir de novo" e o dock ao alcance do polegar; campo que sobe junto com o teclado (`visualViewport`); menu `Ellipsis` juntando avanço automático e tela cheia.
6. **Contagem do avanço automático** como anel de 20 px em volta do `ArrowRight`, com o número só no `aria-live`, no lugar do texto "(auto em Ns ou Enter)".
7. **Palavra perdida marcada** com sublinhado coral pontilhado na frase real (exige marcar as palavras não acertadas no `RevealedText`).
8. **Legenda no padrão da marca:** Atkinson como fonte padrão e como opção no painel; caixa padrão `--caption-bg` com texto `--caption-text`; tamanho relativo (`--fs-caption-video` × escala de 0.8 a 1.6); piso de opacidade do fundo em 0.75 (abaixo disso, no quadro branco, o contraste se aproxima de 4.5:1); palavra acertada em `--caption-hit` sublinhada depois de responder. Muda `useSubtitleSettings.ts` e o painel.
9. **Seleção com cabeçalho:** título "De onde vem o vídeo de hoje?" e subtítulo; selos com outros textos ("Privado" com `Lock`, "Permanente" com `Archive`); trilha decorativa e "Escolher" + `ArrowRight` na base do cartão, acendendo no hover.
10. **Modal:** botão principal desligado até haver vídeo **e** legenda (hoje basta o vídeo e a falta de legenda é barrada depois, sem aviso); textos "Escolher vídeo", "Começar a estudar", "Adicionar .srt"; remover com `Trash`; formatos e limite reais na área de soltar.
11. **Navegação no celular:** barra de abas inferior (`Play` Estudar, `Mic` Shadowing, `ChartNoAxesColumn` Progresso) e botão de tema (`SunMoon`) com a escolha salva em `data-theme`.
12. **Símbolo próprio:** cinco barras verticais de alturas 2-4-6-3-5, a do meio em ciano (versão `currentColor`), substituindo o `AudioWaveform`; favicon e ícones.
13. **Nome único "LearnWatching"** em toda a interface (cabeçalho "EnglishSRT", rodapé "English SRT", título da aba "English Audio") e na chave do `localStorage` (`englishsrt.subtitle-settings.v1`, que exige migração).
14. **Textos:** "Anki Phrases" → "Frases para revisar", "Mais ou menos" → "Quase", tirar da página inicial a frase "Milhares de pessoas já estão melhorando seu inglês" (sem base) e as promessas que o app ainda não cumpre (tradução ao clicar, gravar pronúncia, YouTube).
15. **Animação de marca:** a barra atual da trilha pulsando de altura (escala Y 0.9 a 1.0, 1.2 s) só enquanto o trecho toca; parada com movimento reduzido.
16. **Acessibilidade sem mudança visual:** `aria-pressed` nos botões de ligar/desligar (CC, avanço automático, painel), `aria-live` no veredito, `role="dialog"` e `aria-modal` com foco preso no modal.

## Apêndice · script de contraste

Rodado com `python3 -I contraste.py`; a saída é a tabela da seção Contraste AA. Para mudar uma cor: alterar aqui, rodar de novo e atualizar a tabela e os tokens.

```python
"""Contraste WCAG 2.x da identidade Sinal Limpo. Uso: python3 -I contraste.py"""
def hex2rgb(h):
    h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
def comp(fg, a, bg):
    f, b = hex2rgb(fg), hex2rgb(bg)
    return '#%02X%02X%02X' % tuple(round(a*x + (1-a)*y) for x, y in zip(f, b))
def lum(h):
    def c(v):
        v /= 255; return v/12.92 if v <= 0.04045 else ((v+0.055)/1.055)**2.4
    r, g, b = (c(v) for v in hex2rgb(h)); return 0.2126*r + 0.7152*g + 0.0722*b
def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True); return (la+0.05)/(lb+0.05)

W, K = '#FFFFFF', '#000000'
D = dict(bg='#0A0E0F', s='#11181A', s2='#182123', tx='#E8F1F0', tx2='#9DB0AF', off='#64767A',
         ac='#36D7DF', acH='#8AF1F5', on='#031A1C', ok='#4FD18B', no='#FF6F7D', warn='#F2B544',
         foco='#8AF1F5', ctl='#647A7D')
L = dict(bg='#F3F6F6', s='#FFFFFF', tx='#0D1617', tx2='#435556', off='#8D9C9D', ac='#14BCC5',
         acH='#36D7DF', act='#00737A', on='#031A1C', ok='#17784A', no='#B8323F', warn='#8A5A00',
         foco='#00666C', ctl='#7D8F91')
V = dict(mat=comp('#0B1011', 0.80, W), capW=comp('#05090A', 0.84, W), capK=comp('#05090A', 0.84, K),
         hit='#7CEBEF', noV='#FF9AA3', ctlV='#8FA3A5',
         capPadrao=comp('#000000', 0.78, W))
rows = []
def add(t, p, fg, bg, m): rows.append((t, p, fg, bg, ratio(fg, bg), m))
E, C, VI = 'Escuro', 'Claro', 'Vídeo'
add(E,'Texto primário / fundo',D['tx'],D['bg'],4.5)
add(E,'Texto primário / superfície',D['tx'],D['s'],4.5)
add(E,'Texto primário / elevada',D['tx'],D['s2'],4.5)
add(E,'Texto secundário / fundo',D['tx2'],D['bg'],4.5)
add(E,'Texto secundário / superfície (placeholder do campo)',D['tx2'],D['s'],4.5)
add(E,'Texto secundário / elevada',D['tx2'],D['s2'],4.5)
add(E,'Texto desativado / superfície (isento)',D['off'],D['s'],0)
add(E,'Acento como texto / fundo',D['ac'],D['bg'],4.5)
add(E,'Acento como texto / elevada',D['ac'],D['s2'],4.5)
add(E,'Acento / seleção (accent-soft sobre fundo)',D['ac'],comp(D['ac'],0.14,D['bg']),4.5)
add(E,'Texto sobre botão acento',D['on'],D['ac'],4.5)
add(E,'Texto sobre botão acento em hover',D['on'],D['acH'],4.5)
add(E,'"Sei" texto/ícone / elevada',D['ok'],D['s2'],4.5)
add(E,'"Não Sei" texto/ícone / elevada',D['no'],D['s2'],4.5)
add(E,'Aviso texto / elevada',D['warn'],D['s2'],4.5)
add(E,'Texto sobre botão "Sei"',D['on'],D['ok'],4.5)
add(E,'Texto sobre botão "Não Sei"',D['on'],D['no'],4.5)
add(E,'Borda de controle / superfície',D['ctl'],D['s'],3)
add(E,'Borda de controle / elevada',D['ctl'],D['s2'],3)
add(E,'Foco / fundo',D['foco'],D['bg'],3)
add(E,'Foco / elevada',D['foco'],D['s2'],3)
add(VI,'Texto primário / material (quadro branco atrás)',D['tx'],V['mat'],4.5)
add(VI,'Texto secundário / material (quadro branco)',D['tx2'],V['mat'],4.5)
add(VI,'Acento como texto (palavra acertada no feedback) / material',D['ac'],V['mat'],4.5)
add(VI,'Ícone ativo (CC, avanço) / accent-soft sobre material',D['ac'],comp(D['ac'],0.14,V['mat']),3)
add(VI,'"Sei" texto/ícone / material',D['ok'],V['mat'],4.5)
add(VI,'Texto da faixa "Boa!" / success-soft sobre material',D['tx'],comp(D['ok'],0.14,V['mat']),4.5)
add(VI,'Ícone "Boa!" / success-soft sobre material',D['ok'],comp(D['ok'],0.14,V['mat']),3)
add(VI,'Aviso texto / material',D['warn'],V['mat'],4.5)
add(VI,'Texto da faixa "Mais ou menos" / warning-soft sobre material',D['tx'],comp(D['warn'],0.14,V['mat']),4.5)
add(VI,'Ícone "Mais ou menos" / warning-soft sobre material',D['warn'],comp(D['warn'],0.14,V['mat']),3)
add(VI,'"Não Sei" (danger-video) / material',V['noV'],V['mat'],4.5)
add(VI,'Texto da faixa "Tenta de novo" / danger-soft sobre material',D['tx'],comp(D['no'],0.14,V['mat']),4.5)
add(VI,'Ícone "Tenta de novo" (danger-video) / danger-soft sobre material',V['noV'],comp(D['no'],0.14,V['mat']),3)
add(VI,'Borda de controle no vídeo / material',V['ctlV'],V['mat'],3)
add(VI,'Foco / material',D['foco'],V['mat'],3)
add(VI,'Legenda branca / caixa 0.84 (quadro branco)',W,V['capW'],4.5)
add(VI,'Legenda branca / caixa 0.84 (quadro preto)',W,V['capK'],4.5)
add(VI,'Palavra acertada na legenda / caixa 0.84 (quadro branco)',V['hit'],V['capW'],4.5)
add(VI,'Legenda padrão atual (#FFF sobre preto 0.78, quadro branco)',W,V['capPadrao'],4.5)
add(C,'Texto primário / fundo',L['tx'],L['bg'],4.5)
add(C,'Texto primário / superfície',L['tx'],L['s'],4.5)
add(C,'Texto secundário / fundo',L['tx2'],L['bg'],4.5)
add(C,'Texto secundário / superfície',L['tx2'],L['s'],4.5)
add(C,'Texto desativado / superfície (isento)',L['off'],L['s'],0)
add(C,'Acento como texto / fundo',L['act'],L['bg'],4.5)
add(C,'Acento como texto / superfície',L['act'],L['s'],4.5)
add(C,'Acento como texto / seleção (accent-soft sobre fundo)',L['act'],comp(L['act'],0.10,L['bg']),4.5)
add(C,'Texto sobre botão acento',L['on'],L['ac'],4.5)
add(C,'Texto sobre botão acento em hover',L['on'],L['acH'],4.5)
add(C,'"Sei" texto/ícone / superfície',L['ok'],L['s'],4.5)
add(C,'"Não Sei" texto/ícone / superfície',L['no'],L['s'],4.5)
add(C,'Aviso texto / superfície',L['warn'],L['s'],4.5)
add(C,'Texto branco sobre botão "Sei"',W,L['ok'],4.5)
add(C,'Texto branco sobre botão "Não Sei"',W,L['no'],4.5)
add(C,'Borda de controle / superfície',L['ctl'],L['s'],3)
add(C,'Borda de controle / fundo',L['ctl'],L['bg'],3)
add(C,'Foco / superfície',L['foco'],L['s'],3)
add(C,'Foco / fundo',L['foco'],L['bg'],3)
if __name__ == '__main__':
    print('compostas: material/branco', V['mat'], '| caixa/branco', V['capW'], '| caixa/preto', V['capK'], '| legenda padrão/branco', V['capPadrao'])
    print('| Tema | Par | Frente | Fundo | Razão | Mínimo | Passa |')
    print('|---|---|---|---|---|---|---|')
    fails = 0; req = []
    for t, p, fg, bg, r, m in rows:
        ok = 'isento' if m == 0 else ('sim' if r >= m else 'NÃO')
        fails += ok == 'NÃO'
        if m: req.append((r, m, t, p))
        print(f'| {t} | {p} | `{fg}` | `{bg}` | {r:.2f}:1 | {str(m)+":1" if m else "—"} | {ok} |')
    lo = min(req); lo45 = min(x for x in req if x[1] == 4.5)
    print(f'\nfalhas: {fails}; pares obrigatórios: {len(req)}; menor: {lo[0]:.2f}:1 ({lo[2]}: {lo[3]}); menor texto 4.5: {lo45[0]:.2f}:1 ({lo45[2]}: {lo45[3]})')
```
