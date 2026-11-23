# Passo 1 — Escopo da Transcodificação (FFmpeg + WebAssembly)

> **Status:** definido (2026-07-30)
> **Objetivo deste documento:** congelar _o que_ o build do FFmpeg-WASM precisa suportar,
> antes de gastar tempo compilando. Cada codec habilitado custa tamanho de `.wasm`
> e tempo de build — a lista abaixo é o contrato que o Passo 2 (`emconfigure`) vai seguir.

---

## 1. Caso de uso

O usuário **já tem os arquivos no computador**. Não há download de YouTube nem
torrent dentro do app — o app recebe o que o usuário baixou por fora.

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. Usuário seleciona no computador:                              │
│      • 1 arquivo de vídeo  (mp4 / mkv / webm / avi / mov)         │
│      • 1 arquivo de legenda (srt / ass / vtt)  [opcional]         │
│                                                                   │
│ 2. App mostra loading "Preparando sessão…"                        │
│      → transcodifica 100% no browser (WASM), sem backend          │
│                                                                   │
│ 3. Saída normalizada:                                             │
│      • vídeo  → MP4 (H.264 + AAC)  — tocável em <video>           │
│      • legenda → SRT em texto puro — consumível pelo useSrt       │
│                                                                   │
│ 4. Resultado é cacheado no browser (Passo 4)                      │
│      → 2ª vez que abrir a mesma sessão, carrega direto do cache   │
└──────────────────────────────────────────────────────────────────┘
```

**Consequências de arquitetura:**

- Transcodificação é **client-side**. O backend FastAPI não participa deste fluxo.
- Não há upload de arquivo grande para servidor (bom: privacidade + custo + latência).
- O custo é CPU do usuário. Daí a importância do cache no Passo 4 — pagar o
  "preparando sessão" apenas uma vez por vídeo.

---

## 2. Origem dos arquivos e formatos reais

Mapeamento do que o usuário realisticamente terá em disco:

| Origem                          | Containers               | Vídeo                    | Áudio                       | Legenda                          |
| ------------------------------- | ------------------------ | ------------------------ | --------------------------- | -------------------------------- |
| YouTube (yt-dlp / baixadores)   | `.mp4`, `.webm`, `.mkv`  | H.264, VP9, ~~AV1~~      | AAC, Opus                   | `.srt`/`.vtt` à parte, `mov_text` |
| Filmes/séries (torrent, scene)  | `.mkv` (dominante), `.mp4`, `.avi` (releases antigos) | H.264 (x264), **HEVC/H.265**, MPEG-4 ASP (DivX/XviD) | AC3, EAC3, DTS, AAC, MP3, Opus | SRT, ASS/SSA (fansub), ~~PGS/VobSub~~ |

---

## 3. Contrato de entrada (o que o app aceita)

### 3.1 Containers (demuxers)

| Demuxer FFmpeg | Cobre                        |
| -------------- | ---------------------------- |
| `mov`          | `.mp4`, `.mov`, `.m4v`       |
| `matroska`     | `.mkv`, `.webm`              |
| `avi`          | `.avi`                       |

### 3.2 Vídeo (decoders)

| Decoder      | Por que                                                        |
| ------------ | -------------------------------------------------------------- |
| `h264`       | Formato mais comum em tudo — YouTube e torrent                 |
| `hevc`       | H.265 — dominante em releases recentes de filme/série          |
| `vp9`        | YouTube `.webm`                                                |
| `mpeg4`      | MPEG-4 ASP — DivX/XviD, releases antigos em `.avi`             |
| `msmpeg4v3`  | DivX 3 — `.avi` bem antigo                                     |

### 3.3 Áudio (decoders)

| Decoder  | Por que                                       |
| -------- | --------------------------------------------- |
| `aac`    | Padrão em MP4 (YouTube e torrent)             |
| `ac3`    | Dolby Digital — muito comum em rip de filme   |
| `eac3`   | Dolby Digital Plus                            |
| `dca`    | **DTS** (nome do decoder no FFmpeg é `dca`)   |
| `mp3`    | Releases antigos em `.avi`                    |
| `opus`   | YouTube `.webm`                               |
| `vorbis` | `.webm`/`.mkv` mais antigos                   |

### 3.4 Legenda (decoders)

| Decoder   | Cobre                                            |
| --------- | ------------------------------------------------ |
| `subrip`  | `.srt` — o caso mais comum                       |
| `ass`     | `.ass` / `.ssa` — fansub, legenda estilizada     |
| `webvtt`  | `.vtt` — saída típica de baixador de YouTube     |
| `movtext` | legenda embutida em MP4 (nome interno: `movtext`) |

---

## 4. Contrato de saída (o que o app produz)

Alvo único e normalizado — o player não precisa saber de onde veio o arquivo.

| Aspecto           | Escolha                | Justificativa                                                       |
| ----------------- | ---------------------- | ------------------------------------------------------------------- |
| Container         | `mp4` (muxer)          | Tocável em `<video>` em todo browser moderno                        |
| Encoder de vídeo  | **`libx264`** (H.264)  | Melhor compatibilidade/qualidade. Ver §6 (licença GPL)              |
| Encoder de áudio  | `aac` (nativo FFmpeg)  | Par canônico do H.264 em MP4; não precisa de lib externa            |
| Encoder de legenda| `srt`                  | Normaliza ASS/VTT/movtext → SRT puro                                |

### 4.1 Por que a legenda sai como arquivo separado (e não queimada no vídeo)

O player já funciona com **vídeo + SRT separados**: o hook
[`useSrt`](../../frontend/src/components/useSrt/useSrt.ts) faz `fetch(srtSrc)`,
lê como texto e parseia os cues.

Manter a legenda separada é obrigatório para o produto, não só conveniente:

- O fluxo de estudo **fatia o vídeo por timestamp do SRT** — precisa dos cues como dado.
- A legenda é comparada com o que o aluno digitou (avaliação por IA) — precisa do texto.
- O componente `Subtitle` permite **clicar em palavras** para tradução — precisa do texto.

Legenda queimada (hardsub) destruiria os três. Portanto: **nunca fazer burn-in.**

> **Nota de compatibilidade:** o parser em `useSrt.ts` aceita `,` ou `.` como
> separador de milissegundos, então o SRT gerado pelo FFmpeg (`,`) funciona sem ajuste.

---

## 5. Fora de escopo (decisões explícitas)

Registrado para não ser reaberto sem motivo novo.

| Item                        | Decisão          | Motivo                                                                                                                          |
| --------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **PGS / VobSub** (legenda bitmap) | Não suportar | São **imagens**, não texto. Viraria SRT só com OCR (ex: Tesseract-WASM) — projeto à parte. Se o rip só tiver PGS, o usuário busca um `.srt` (ex: OpenSubtitles). |
| **AV1** (decode)            | Adiar            | Raro fora de YouTube 4K/8K recente. Decoder em software é pesado e engorda o `.wasm`. Adicionar só se virar necessidade real.     |
| **Download in-app** (YouTube/torrent) | Não faz parte | O usuário traz os arquivos prontos. Manter o app fora dessa responsabilidade.                                                    |
| **Transcodificação no backend** | Não          | Fluxo é client-side. Evita upload de arquivos grandes, custo de servidor e questão de privacidade.                                |
| **Burn-in de legenda**      | Nunca            | Quebraria fatiamento por cue, avaliação por IA e clique-para-traduzir. Ver §4.1.                                                  |

---

## 6. Licença — ponto de atenção

`libx264` é **GPL**. Habilitá-lo exige `--enable-gpl` no `configure`, e o
binário resultante (`ffmpeg.wasm`) passa a ser coberto pela GPL.

Implicação prática: **distribuir o frontend com esse `.wasm` obriga a
disponibilizar o código-fonte correspondente** (incluindo os flags de build).

- Hoje o projeto é ISC e aberto → sem conflito.
- Se algum dia virar produto fechado/comercial, será preciso trocar o encoder
  (ex: `openh264`, com ressalvas de patente) ou reavaliar o licenciamento.

Decisão registrada: **aceitar GPL agora**, priorizando qualidade e compatibilidade.

---

## 7. Dependências que o Passo 2 precisa resolver

Levantado durante a definição do escopo — não é trivial e afeta a ordem do build:

1. **`libx264` não vem no source do FFmpeg.** É biblioteca externa: precisa ser
   cross-compilada com o `emsdk` **primeiro**, e só então o FFmpeg é configurado
   apontando para ela (`--enable-gpl --enable-libx264`).
2. **Parsers são fáceis de esquecer** e quebram a decodificação em silêncio.
   Necessários: `h264`, `hevc`, `vp9`, `mpeg4video`, `aac`, `ac3`, `dca`,
   `mpegaudio`, `opus`, `vorbis`.
3. **Bitstream filter `aac_adtstoasc`** é necessário para remuxar AAC dentro de MP4.
4. **Protocolo `file`** deve ficar habilitado — é como o MEMFS do Emscripten
   expõe os arquivos ao FFmpeg.

---

## 8. Validação dos nomes

Todos os identificadores acima foram **verificados contra o source clonado em
`ffmpeg-wasm/`** (FFmpeg `8.0.git`), não assumidos:

| Verificado em                      | O que foi conferido            |
| ---------------------------------- | ------------------------------ |
| `libavcodec/allcodecs.c`           | decoders, encoders             |
| `libavformat/allformats.c`         | demuxers, muxers               |
| `libavcodec/parsers.c`             | parsers                        |
| `libavcodec/bitstream_filters.c`   | `aac_adtstoasc`                |
| `libavformat/protocols.c`          | protocolo `file`               |

Duas correções que a verificação evitou:

- Legenda MP4 é **`movtext`**, não `mov_text`.
- Legenda `.srt` decodifica com **`subrip`** (`srt` existe como demuxer/encoder,
  mas o decoder chama `subrip`).

---

## 9. Lista final — contrato para o Passo 2

```
DEMUXERS   mov, matroska, avi
           srt, ass, webvtt                    (legenda como arquivo avulso)

DECODERS   vídeo    h264, hevc, vp9, mpeg4, msmpeg4v3
           áudio    aac, ac3, eac3, dca, mp3, opus, vorbis
           legenda  subrip, ass, webvtt, movtext

PARSERS    h264, hevc, vp9, mpeg4video,
           aac, ac3, dca, mpegaudio, opus, vorbis

ENCODERS   vídeo    libx264                    (externo, GPL — compilar antes)
           áudio    aac
           legenda  srt

MUXERS     mp4                                 (vídeo de saída)
           srt                                 (legenda de saída)

BSF        aac_adtstoasc
PROTOCOL   file
```

---

## 10. Próximos passos

| Passo | O que é                                                                 | Status |
| ----- | ----------------------------------------------------------------------- | ------ |
| **2** | Cross-compilar `libx264` com emsdk, depois `emconfigure`/`emmake` do FFmpeg com a lista do §9 | ✅ concluído — [02-build.md](./02-build.md) |
| **3** | Validar o `.wasm` no browser (WORKERFS, arquivo grande, legenda externa) | pendente |
| **4** | Cache no browser (IndexedDB) — pagar "Preparando sessão" uma vez por vídeo | pendente |
| **5** | Integração no frontend: Web Worker (não travar a UI) + tela de progresso + nova fonte em `Select/` | pendente |

### Questão do pthreads — resolvida no Passo 2

Estava em aberto: single-thread (simples) ou pthreads (rápido, mas exige
COOP/COEP)? O Passo 2 mostrou que **não era uma escolha livre**: o CLI do
FFmpeg 8 usa pthreads incondicionalmente, então sem eles não há CLI.

Decidido: **pthreads habilitado**, COOP/COEP configurados no Vite.

Ressalva descoberta na validação: o **x264 não pode encodar com mais de uma
thread** dentro do wasm (crasha). É obrigatório passar
`-threads 1 -x264-params threads=1:sliced-threads=0` em runtime.
Detalhes em [02-build.md §3.4](./02-build.md).
