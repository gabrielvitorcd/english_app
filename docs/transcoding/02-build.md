# Passo 2 — Build do FFmpeg + libx264 para WebAssembly

> **Status:** concluído e validado (2026-07-30)
> **Escopo de referência:** [01-escopo.md](./01-escopo.md)

---

## 1. Como reproduzir o build

Três scripts, nesta ordem:

```bash
./scripts/build-x264.sh          # 1. cross-compila libx264 (dependencia externa)
./scripts/build-ffmpeg.sh        # 2. cross-compila FFmpeg + CLI
./scripts/link-ffmpeg-wasm.sh    # 3. link final -> frontend/public/ffmpeg/
```

Validação:

```bash
node scripts/smoke-test.mjs <arquivo-de-video>
```

### Artefatos gerados

| Arquivo                              | Tamanho | Papel                        |
| ------------------------------------ | ------- | ---------------------------- |
| `frontend/public/ffmpeg/ffmpeg.js`   | ~100 KB | glue code (ES module)        |
| `frontend/public/ffmpeg/ffmpeg.wasm` | 6.6 MB  | o binário                    |
| `build/wasm/lib/*.a`                 | ~12 MB  | intermediários (não servidos)|

Nada disso é versionado — `emsdk/`, `ffmpeg-wasm/`, `libx264/`, `build/` e
`frontend/public/ffmpeg/` estão no `.gitignore`. O que se versiona são os scripts.

---

## 2. Decisão: pthreads habilitado (caminho A)

O Passo 1 deixou pthreads em aberto. O Passo 2 **forçou a decisão**:

No FFmpeg 8, `fftools/ffmpeg_sched.c` usa `pthread_t`/`pthread_mutex_t`
**incondicionalmente** — não há fallback `#if HAVE_THREADS`. O scheduler do CLI
foi reescrito para ser inerentemente multi-thread. Ou seja: **sem pthreads, não
há CLI**, e sem CLI seria preciso escrever ~300-500 linhas de wrapper em C sobre
a API libav.

Decisão: habilitar pthreads e usar o CLI (mesmo caminho do ffmpeg.wasm oficial).

**Consequência obrigatória:** pthreads exige `SharedArrayBuffer`, que só existe
em contexto *cross-origin isolated*. Isso demandou dois headers em
[`vite.config.ts`](../../frontend/vite.config.ts):

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Sem eles, `ffmpeg.js` **não carrega**. Aplicados em `server` (dev) e `preview`.
Em produção, o mesmo precisa valer no serving (nginx/CDN).

> **Atenção de produto:** COOP/COEP restringe embutir recursos de terceiros na
> mesma página (iframes, imagens cross-origin sem CORS). Se um dia o app for
> embutir player do YouTube ou similar, isso precisa ser reavaliado.

---

## 3. Problemas encontrados e resolvidos

Registrado porque nenhum deles é óbvio e todos custariam tempo de novo.

### 3.1 `x264 not found using pkg-config` (mensagem enganosa)

O `.pc` estava correto e o `pkg-config` existia. O `ffbuild/config.log` revelou
a causa real: o configure usava **`gcc` nativo**, e o `ld` do sistema não
reconhece um `.a` de WASM (`file format not recognized`).

Motivo: `--target-os=none` faz o FFmpeg ignorar o `CC` que `emconfigure` exporta.

Correção — passar a toolchain explicitamente:

```
--cc=emcc --cxx=em++ --ar=emar --ranlib=emranlib --nm=llvm-nm
```

**Lição:** ler `ffbuild/config.log`. A mensagem do configure aponta o sintoma,
não a causa.

### 3.2 `undefined symbol: print_filtergraph`

O link falhou por dois símbolos ausentes. Estavam em
`fftools/graph/graphprint.c` — um **subdiretório**. O comando original usava
`ls fftools/*.o`, que não desce um nível.

Correção: `find fftools -name "*.o"`, incluindo `graph/`, `textformat/` e
`resources/`.

### 3.3 `FS.filesystems` undefined

`FORCE_FILESYSTEM=1` sozinho não inclui os backends de filesystem.
Correção: `-lnodefs.js -lworkerfs.js`.

- **NODEFS** — dá acesso ao disco real; usado pelo smoke test em Node.
- **WORKERFS** — monta um `File` do browser **sem copiar para a memória**.
  Crítico: um filme de 2.4 GB não cabe no heap do wasm32 (teto 4 GB).

### 3.4 `RuntimeError: null function or function signature mismatch` ⚠️

O mais importante. O encode crashava e o MP4 saía com **48 bytes** (só header).

Isolamento: `-c copy` funcionava (8 MB, exit 0) → demux/mux estavam sólidos, o
problema era exclusivo do **encode**. Forçando o x264 a uma thread, passou.

**Causa:** o libx264 multi-thread crasha dentro do wasm.

**Portanto, em runtime é obrigatório:**

```
-threads 1 -x264-params threads=1:sliced-threads=0
```

Nota: pthreads continua necessário no *build* (o CLI exige, §2) — o que não
funciona é o **x264 encodar** com mais de uma thread. As duas coisas convivem.

---

## 4. Validação — resultado real

Testado com `friends1x01.mkv` (2.4 GB; recorte de 20 s), via
`scripts/smoke-test.mjs`:

```
✓ demux + copy para MP4
      Input #0, matroska,webm
      Stream #0:0(eng): Video: h264 (High), yuv420p, 1920x1080, 23.98 fps
      Stream #0:1(por): Audio: ac3, 48000 Hz, stereo, 192 kb/s
      Stream #0:2(por): Subtitle: subrip
✓ transcode H.264 + AAC (faststart)
✓ extrai legenda embutida -> .srt
✓ copy.mp4       8177 KB
✓ out.mp4        2257 KB
✓ faststart      moov no inicio

Primeiros cues:
  1
  00:00:00,083 --> 00:00:01,960
  Ele é corcunda e usa peruca?
```

O arquivo real exercitou justamente o caminho não-trivial do escopo:
**MKV + AC3 + legenda subrip embutida** — típico de release de série. Confirmou
`ac3 → aac` e `h264 → libx264`, e a legenda saiu com **vírgula** nos
milissegundos, formato que o [`useSrt`](../../frontend/src/components/useSrt/useSrt.ts)
parseia sem ajuste.

Os 37 componentes do contrato (§9 do escopo) foram verificados um a um em
`ffbuild/config.mak` — todos `yes`, incluindo `CONFIG_LIBX264`, `CONFIG_GPL` e
o BSF `aac_adtstoasc`.

### 4.1 `+faststart` — descoberta durante a validação

O MP4 saía com o `moov` atom **no fim** do arquivo. Nesse layout, o `<video>`
precisa baixar o arquivo inteiro antes de começar a tocar.

Correção: `-movflags +faststart`. Verificado no smoke test (checa que `moov`
aparece antes de `mdat`).

---

## 5. Comando de referência para o Passo 5

O que a integração no frontend deve invocar:

```bash
# video -> MP4 normalizado
ffmpeg -i <entrada> \
  -c:v libx264 -preset ultrafast -crf 28 \
  -threads 1 -x264-params threads=1:sliced-threads=0 \   # obrigatorio (§3.4)
  -c:a aac -b:a 128k \
  -movflags +faststart \                                  # obrigatorio (§4.1)
  saida.mp4

# legenda embutida -> SRT puro
ffmpeg -i <entrada> -map 0:s:0 -c:s srt legenda.srt
```

`-preset ultrafast -crf 28` foi o usado na validação. Vale ajustar no Passo 5
medindo qualidade contra tempo — em WASM single-thread o encode é lento
(~0.45x tempo real no teste, num recorte 1080p).

---

## 6. Pontos abertos para os próximos passos

| # | Ponto | Onde resolver |
| - | ----- | ------------- |
| 1 | Encode single-thread é lento (~0.45x em 1080p). Vale avaliar reduzir resolução, ou `-c:v copy` quando a entrada já é H.264 — evitaria re-encode na maioria dos casos de YouTube/torrent. | Passo 5 |
| 2 | WORKERFS está linkado mas ainda não exercitado no browser — é o que evita carregar 2.4 GB no heap. | Passo 3 |
| 3 | Legenda **externa** (`.srt`/`.ass` avulso escolhido pelo usuário) só foi validada na forma embutida. O caminho de arquivo separado precisa de teste. | Passo 3 |
| 4 | COOP/COEP em **produção** (nginx/CDN), não só no Vite dev. | Passo 5 |
| 5 | `-t 5` foi usado para agilizar os testes; falta medir um arquivo inteiro (~22 min) para dimensionar o "Preparando sessão". | Passo 3 |
