// Passo 5 — worker de transcode da sessao de estudo.
//
// Contrato principal:
//
//   PROBE      → PROBE_DONE { audioTracks, videoCodec }
//   PROCESS_BLOCK { cues[], hashes, codecHint } → CUE_READY x N, BLOCK_DONE
//   SLICE      (legacy, scratch page) → SLICE_DONE
//
// Arquitetura do runtime:
//
//   ┌─ Outer worker (este arquivo) ──────────────────────────────────┐
//   │  await create({ arguments, preRun, onExit, ... })              │
//   │     └── preRun: mkdir + FS.mount(WORKERFS, ...)                │
//   │     └── emscripten spawna pthread "main" (PROXY_TO_PTHREAD)    │
//   │  create() resolve                                              │
//   │  await done.promise ← livre pra atender postMessages           │
//   │                                                                │
//   │  ffmpeg roda em pthread; pthreads filhas (demux/enc/mux) leem  │
//   │  o WORKERFS via postMessage. Como o outer worker esta idle no  │
//   │  await, ele processa essas requests → sem deadlock.            │
//   │                                                                │
//   │  main() sai → onExit dispara no outer thread → done.finish()   │
//   │  onExit LE OS OUTPUTS antes do teardown (EXIT_RUNTIME=1).      │
//   └────────────────────────────────────────────────────────────────┘

/// <reference lib="webworker" />
/// <reference types="vite/client" />

declare const self: DedicatedWorkerGlobalScope;

import ffmpegJsSource from "../vendor/ffmpeg/ffmpeg.js?raw";
import ffmpegWasmUrl from "../vendor/ffmpeg/ffmpeg.wasm?url";
import { getCachedSlice, putCachedSlice } from "../lib/videoCache";
import type { SrtCue } from "../lib/srt";

// ─────────────────────────────────────────────────────────────────────────────
// Debug logging
// ─────────────────────────────────────────────────────────────────────────────
const t0 = performance.now();
const dlog = (...args: unknown[]) =>
  console.log(
    `[worker +${((performance.now() - t0) / 1000).toFixed(2)}s]`,
    ...args
  );

dlog("worker carregado. ffmpegJsSource.length =", ffmpegJsSource.length);

// ─────────────────────────────────────────────────────────────────────────────
// Factory (cacheada — o texto do ffmpeg.js e o mesmo entre requests)
// ─────────────────────────────────────────────────────────────────────────────
type FFmpegModule = {
  FS: {
    mkdir: (path: string) => void;
    mount: (fs: unknown, opts: { files?: File[] }, mountpoint: string) => void;
    unmount: (mountpoint: string) => void;
    readFile: (path: string) => Uint8Array;
    unlink: (path: string) => void;
    filesystems: { WORKERFS: unknown; MEMFS: unknown };
  };
};

type CreateFFmpeg = (opts: {
  arguments?: string[];
  print?: (line: string) => void;
  printErr?: (line: string) => void;
  preRun?: Array<(M: FFmpegModule) => void>;
  onExit?: (code: number) => void;
  onAbort?: (reason: unknown) => void;
  mainScriptUrlOrBlob?: string;
  locateFile?: (path: string, prefix: string) => string;
}) => Promise<FFmpegModule>;

let factoryPromise: Promise<{ create: CreateFFmpeg; blobUrl: string }> | null =
  null;

async function loadFactory() {
  if (!factoryPromise) {
    factoryPromise = (async () => {
      const blobUrl = URL.createObjectURL(
        new Blob([ffmpegJsSource], { type: "application/javascript" })
      );
      const mod = (await import(/* @vite-ignore */ blobUrl)) as {
        default: CreateFFmpeg;
      };
      return { create: mod.default, blobUrl };
    })();
  }
  return factoryPromise;
}

// ─────────────────────────────────────────────────────────────────────────────
// Detector de fim do main() (dois sinais: onExit + marcador no log)
// ─────────────────────────────────────────────────────────────────────────────
type DoneHandle = {
  promise: Promise<number>;
  finish: (code: number) => void;
  fail: (err: Error) => void;
};

function makeDoneHandle(): DoneHandle {
  let settled = false;
  let settle!: (code: number) => void;
  let reject!: (err: Error) => void;
  const promise = new Promise<number>((res, rej) => {
    settle = res;
    reject = rej;
  });
  return {
    promise,
    finish: (code) => {
      if (settled) return;
      settled = true;
      settle(code);
    },
    fail: (err) => {
      if (settled) return;
      settled = true;
      reject(err);
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Contrato de mensagens
// ─────────────────────────────────────────────────────────────────────────────
export type AudioTrack = {
  streamIndex: number;
  language?: string;
  codec: string;
  channels: string;
  bitrate?: string;
  title?: string;
  isDefault: boolean;
};

/** Nome cru do codec de video (ex: "h264", "hevc", "vp9", "mpeg4"). */
export type VideoCodec = string;

export type ProbeRequest = { type: "PROBE"; file: File };

/** SLICE — legacy, usado apenas pela scratch page TranscodeTest. */
export type SliceRequest = {
  type: "SLICE";
  file: File;
  startSec: number;
  durationSec: number;
  audioStreamIndex: number;
  cacheKey?: string;
};

/**
 * PROCESS_BLOCK — contrato principal da sessao de estudo.
 *
 * codecHint determina o pipeline:
 *  - "copy"      → -c:v copy (remux; ~50x mais rapido que transcode). Usa
 *                  quando o input ja e H.264/AAC compativel.
 *  - "transcode" → libx264 + aac (~0.2x tempo real; 14s pra 3s de video 1080p).
 *
 * Main deve descobrir o codec via PROBE_DONE.videoCodec e mapear:
 *  h264 → "copy"; qualquer outro → "transcode".
 */
export type ProcessBlockRequest = {
  type: "PROCESS_BLOCK";
  videoFile: File;
  cues: SrtCue[];
  videoFingerprint: string;
  srtHash: string;
  audioStreamIndex: number;
  codecHint: "copy" | "transcode";
};

export type WorkerRequest =
  | ProbeRequest
  | SliceRequest
  | ProcessBlockRequest;

export type WorkerResponse =
  | { type: "LOG"; line: string }
  | { type: "PROBE_DONE"; audioTracks: AudioTrack[]; videoCodec: VideoCodec }
  | { type: "SLICE_DONE"; mp4: ArrayBuffer; ms: number; cached: boolean }
  | {
      type: "CUE_READY";
      cueIndex: number;
      mp4: ArrayBuffer;
      cached: boolean;
      ms: number;
    }
  | { type: "BLOCK_DONE"; codecDetected: "copy" | "transcode" }
  | { type: "ERROR"; message: string; cueIndex?: number };

const post = (msg: WorkerResponse, transfer?: Transferable[]) =>
  self.postMessage(msg, { transfer: transfer ?? [] });

// ─────────────────────────────────────────────────────────────────────────────
// Parsers de log do ffmpeg
// ─────────────────────────────────────────────────────────────────────────────
function parseAudioTracks(log: string[]): AudioTrack[] {
  const tracks: AudioTrack[] = [];
  let current: AudioTrack | null = null;

  const streamRe = /^\s*Stream #0:(\d+)(?:\(([^)]+)\))?: Audio: (.+)$/;
  const titleRe = /^\s+title\s*:\s*(.+?)\s*$/;

  for (const line of log) {
    const m = line.match(streamRe);
    if (m) {
      const [, indexStr, language, rest] = m;
      const parts = rest.split(",").map((s) => s.trim());
      const codec = parts[0] ?? "";
      const channels = parts[2] ?? "";
      const bitratePart = parts.find((p) => /^\d+\s*kb\/s/i.test(p));
      const bitrate = bitratePart
        ? bitratePart.replace(/\s*\(default\).*$/, "").trim()
        : undefined;
      current = {
        streamIndex: Number(indexStr),
        language,
        codec,
        channels,
        bitrate,
        isDefault: /\(default\)/.test(line),
      };
      tracks.push(current);
      continue;
    }
    if (current) {
      const t = line.match(titleRe);
      if (t) {
        current.title = t[1];
        continue;
      }
      if (/^\s*Stream #/.test(line) || !/^\s{4,}/.test(line)) {
        current = null;
      }
    }
  }
  return tracks;
}

/**
 * Extrai o codec da primeira stream de video encontrada.
 * Linhas alvo (exemplos reais do ffmpeg 8):
 *   Stream #0:0(eng): Video: h264 (High), yuv420p(progressive), ...
 *   Stream #0:0: Video: hevc (Main), yuv420p, ...
 *   Stream #0:0(eng): Video: vp9, yuv420p, ...
 * Retorna "" se nao achar.
 */
function parseVideoCodec(log: string[]): VideoCodec {
  const re = /^\s*Stream #0:\d+(?:\([^)]+\))?: Video: (\w+)/;
  for (const line of log) {
    const m = line.match(re);
    if (m) return m[1];
  }
  return "";
}

// ─────────────────────────────────────────────────────────────────────────────
// runFFmpeg — helper generico que faz uma invocacao completa do ffmpeg
// ─────────────────────────────────────────────────────────────────────────────
type RunOpts = {
  args: string[];
  file: File;
  onLog: (line: string) => void;
  markerDone?: (line: string) => boolean;
  onFinish?: (code: number, M: FFmpegModule) => void;
};

async function runFFmpeg(opts: RunOpts): Promise<number> {
  const { create, blobUrl } = await loadFactory();
  const done = makeDoneHandle();
  let capturedM: FFmpegModule | null = null;

  const sink = (line: string) => {
    opts.onLog(line);
    if (opts.markerDone && opts.markerDone(line)) {
      done.finish(0);
    }
  };

  await create({
    arguments: opts.args,
    print: sink,
    printErr: sink,
    preRun: [
      (M) => {
        capturedM = M;
        M.FS.mkdir("/work");
        M.FS.mount(
          M.FS.filesystems.WORKERFS,
          { files: [opts.file] },
          "/work"
        );
      },
    ],
    onExit: (code) => {
      if (capturedM && opts.onFinish) {
        try {
          opts.onFinish(code, capturedM);
        } catch (e) {
          dlog("onFinish threw:", e);
        }
      }
      done.finish(code);
    },
    onAbort: (reason) => {
      done.fail(new Error(String(reason)));
    },
    mainScriptUrlOrBlob: blobUrl,
    locateFile: (path, prefix) =>
      path.endsWith(".wasm") ? ffmpegWasmUrl : prefix + path,
  });

  return await done.promise;
}

// ─────────────────────────────────────────────────────────────────────────────
// Args do ffmpeg pra encodar uma cue — comum entre SLICE e PROCESS_BLOCK
//
// -ss ANTES de -i        input seek (rapido, alinha no keyframe anterior)
// -map 0:v:0             primeira stream de video
// -map 0:<audioIdx>      stream de audio escolhida (indice absoluto)
// -c:v copy              se strategy=copy — remux, sem re-encode (fast)
// -c:v libx264 ...       se strategy=transcode — libx264 single-thread
// -c:a aac -ac 2         downmix pra estereo sempre (5.1 nao toca bem em <video>)
// -movflags +frag_...    fMP4 pra MSE. Cada saida vira uma sequencia moof+mdat
//                        que a gente da appendBuffer na SourceBuffer.
// ─────────────────────────────────────────────────────────────────────────────
function buildEncodeArgs(params: {
  fileName: string;
  startSec: number;
  durationSec: number;
  audioStreamIndex: number;
  strategy: "copy" | "transcode";
  outPath: string;
}): string[] {
  const { fileName, startSec, durationSec, audioStreamIndex, strategy, outPath } = params;

  const common = [
    "-hide_banner",
    "-progress", "/progress.log",
    "-ss", String(startSec),
    "-i", `/work/${fileName}`,
    "-t", String(durationSec),
    "-map", "0:v:0",
    "-map", `0:${audioStreamIndex}`,
    // TESTE A: sem -copyts -start_at_zero. O default do muxer MP4
    // (-avoid_negative_ts auto) rebaseá pra 0 automaticamente. As flags
    // removidas estavam interagindo com -t no modo copy e descartando 100%
    // dos packets (output com frame=0). Se voltar a dessincronia A/V,
    // trocar por: "-avoid_negative_ts", "make_zero".
  ];

  const videoArgs = strategy === "copy"
    ? ["-c:v", "copy"]
    : [
        "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28",
        "-threads", "1", "-x264-params", "threads=1:sliced-threads=0",
      ];

  // Audio sempre re-encoda: o input costuma ser ac3/eac3/dts e o browser
  // aceita AAC melhor em MP4. Downmix pra estereo.
  const audioArgs = ["-c:a", "aac", "-b:a", "128k", "-ac", "2"];

  const outputArgs = [
    // MP4 padrao com moov no inicio (faststart). Como saimos do MSE
    // pro fluxo StudyPlayer (um <video src=blob> por cue), nao precisamos
    // mais de fragmented MP4. faststart e mais robusto pra playback avulso
    // e evita quirks de A/V sync que fMP4 as vezes tem.
    "-movflags", "+faststart",
    "-y", outPath,
  ];

  return [...common, ...videoArgs, ...audioArgs, ...outputArgs];
}

// ─────────────────────────────────────────────────────────────────────────────
// Encoda UMA cue (com cache lookup). Reutilizado por SLICE e PROCESS_BLOCK.
// ─────────────────────────────────────────────────────────────────────────────
type EncodeCueParams = {
  file: File;
  startSec: number;
  durationSec: number;
  audioStreamIndex: number;
  strategy: "copy" | "transcode";
  cacheKey?: string;
  logSink?: (line: string) => void;
};

async function encodeOneCue(
  params: EncodeCueParams
): Promise<{ mp4: ArrayBuffer; cached: boolean; ms: number }> {
  const started = performance.now();

  if (params.cacheKey) {
    try {
      const cached = await getCachedSlice(params.cacheKey);
      if (cached) {
        return {
          mp4: cached.slice(0),
          cached: true,
          ms: performance.now() - started,
        };
      }
    } catch (e) {
      dlog("cache get falhou (nao critico):", e);
    }
  }

  const outPath = "/out.mp4";
  const args = buildEncodeArgs({
    fileName: params.file.name,
    startSec: params.startSec,
    durationSec: params.durationSec,
    audioStreamIndex: params.audioStreamIndex,
    strategy: params.strategy,
    outPath,
  });

  let capturedMp4: Uint8Array | null = null;

  const code = await runFFmpeg({
    args,
    file: params.file,
    onLog: (line) => params.logSink?.(line),
    onFinish: (_code, M) => {
      try {
        capturedMp4 = M.FS.readFile(outPath);
      } catch (e) {
        dlog("onFinish: falha lendo output:", e);
      }
    },
  });

  if (code !== 0) throw new Error(`ffmpeg exit code ${code}`);
  if (!capturedMp4) throw new Error("Output vazio ou nao lido");

  // Copia pra ArrayBuffer transferivel
  const bytes = capturedMp4 as unknown as Uint8Array;
  const mp4 = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(mp4).set(bytes);

  if (params.cacheKey) {
    try {
      await putCachedSlice(params.cacheKey, mp4.slice(0));
    } catch (e) {
      dlog("cache put falhou (nao critico):", e);
    }
  }

  return { mp4, cached: false, ms: performance.now() - started };
}

// ─────────────────────────────────────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────────────────────────────────────
async function handleProbe(req: ProbeRequest): Promise<void> {
  dlog("handleProbe: iniciado. file:", req.file.name, "size:", req.file.size);
  const localLog: string[] = [];

  try {
    await runFFmpeg({
      args: ["-hide_banner", "-i", `/work/${req.file.name}`],
      file: req.file,
      onLog: (line) => {
        localLog.push(line);
        post({ type: "LOG", line });
      },
      markerDone: (line) =>
        line.includes("At least one output file must be specified"),
    });

    const audioTracks = parseAudioTracks(localLog);
    const videoCodec = parseVideoCodec(localLog);
    dlog(
      "handleProbe: audio tracks:",
      audioTracks.length,
      "video codec:",
      videoCodec
    );
    if (audioTracks.length === 0) {
      throw new Error("Nenhuma faixa de audio encontrada no arquivo.");
    }
    if (!videoCodec) {
      throw new Error("Nao foi possivel detectar o codec de video.");
    }
    post({ type: "PROBE_DONE", audioTracks, videoCodec });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    dlog("handleProbe: ERRO:", message);
    post({ type: "ERROR", message });
  }
}

async function handleSlice(req: SliceRequest): Promise<void> {
  dlog(
    "handleSlice: start:",
    req.startSec,
    "duration:",
    req.durationSec,
    "cacheKey:",
    req.cacheKey ?? "(nenhuma)"
  );
  try {
    const result = await encodeOneCue({
      file: req.file,
      startSec: req.startSec,
      durationSec: req.durationSec,
      audioStreamIndex: req.audioStreamIndex,
      // SLICE (scratch) sempre transcoda — o produto usa PROCESS_BLOCK que
      // decide a estrategia com base no codec detectado.
      strategy: "transcode",
      cacheKey: req.cacheKey,
      logSink: (line) => post({ type: "LOG", line }),
    });
    dlog(
      "handleSlice: pronto. bytes =",
      result.mp4.byteLength,
      "cached =",
      result.cached
    );
    post(
      {
        type: "SLICE_DONE",
        mp4: result.mp4,
        ms: result.ms,
        cached: result.cached,
      },
      [result.mp4]
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    dlog("handleSlice: ERRO:", message);
    post({ type: "ERROR", message });
  }
}

// Padding aplicado nas cues antes de mandar pro ffmpeg. Compensa o "delay de
// leitura" caracteristico do SRT (fansubs colocam o timestamp ~100-200ms
// depois do audio real).
const CUE_PADDING_SEC = 0.2;

async function handleProcessBlock(req: ProcessBlockRequest): Promise<void> {
  dlog(
    "handleProcessBlock: iniciado. cues:",
    req.cues.length,
    "codecHint:",
    req.codecHint
  );

  for (const cue of req.cues) {
    // Aplica padding, clampando o start em 0 pra nao pedir tempo negativo.
    const startPadded = Math.max(0, cue.start - CUE_PADDING_SEC);
    const durationPadded = cue.end - cue.start + 2 * CUE_PADDING_SEC;

    const cacheKey = `${req.videoFingerprint}_${req.srtHash}_cue${cue.index}`;

    dlog(
      `cue ${cue.index} — SRT: [${cue.start.toFixed(3)}s → ${cue.end.toFixed(
        3
      )}s]  duracao SRT: ${(cue.end - cue.start).toFixed(
        3
      )}s | pedido ao ffmpeg: -ss ${startPadded.toFixed(
        3
      )} -t ${durationPadded.toFixed(3)} | strategy: ${req.codecHint}`
    );

    // Captura o log inteiro num buffer local — se der erro, dumpamos as
    // ultimas linhas pra o console pra saber o que aconteceu.
    // Tambem capturamos linhas que revelam a duracao REAL do output.
    const errorLog: string[] = [];
    let outputDurationLine: string | null = null;
    let lastTimeLine: string | null = null;
    try {
      const result = await encodeOneCue({
        file: req.videoFile,
        startSec: startPadded,
        durationSec: durationPadded,
        audioStreamIndex: req.audioStreamIndex,
        strategy: req.codecHint,
        cacheKey,
        logSink: (line) => {
          errorLog.push(line);
          if (errorLog.length > 30) errorLog.shift();
          // "Duration: 00:00:07.98, ..." aparece no header de containers lidos.
          // No output stderr do ffmpeg normalmente vem so a "time=..." do
          // progress. Guardamos ambos pra ter uma ideia da duracao real.
          if (/Duration:\s*\d\d:\d\d:\d\d\.\d\d/.test(line)) {
            outputDurationLine = line.trim();
          }
          const t = line.match(/time=(\d\d):(\d\d):(\d\d\.\d+)/);
          if (t) lastTimeLine = `${t[1]}:${t[2]}:${t[3]}`;
        },
      });
      dlog(
        `cue ${cue.index} — output ffmpeg: ${
          outputDurationLine ?? "(sem Duration no log)"
        } | ultimo time=: ${lastTimeLine ?? "(nenhum)"} | mp4 bytes: ${
          result.mp4.byteLength
        }`
      );
      // Se o MP4 saiu suspeitosamente pequeno (< 5 KB), dumpa as ultimas linhas
      // do stderr do ffmpeg. Container MP4 vazio tem ~300 bytes; qualquer coisa
      // com video real passa fácil de 100 KB.
      if (result.mp4.byteLength < 5000) {
        dlog(
          `cue ${cue.index} — OUTPUT SUSPEITO (${result.mp4.byteLength} bytes). ultimas linhas do ffmpeg:`
        );
        for (const line of errorLog) dlog("  ffmpeg>", line);
      }
      dlog(
        "handleProcessBlock: cue",
        cue.index,
        "pronta. cached =",
        result.cached,
        "ms =",
        result.ms.toFixed(0)
      );
      post(
        {
          type: "CUE_READY",
          cueIndex: cue.index,
          mp4: result.mp4,
          cached: result.cached,
          ms: result.ms,
        },
        [result.mp4]
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      dlog(
        "handleProcessBlock: cue",
        cue.index,
        "ERRO:",
        message,
        "\n--- ultimas linhas do ffmpeg ---"
      );
      for (const line of errorLog) dlog("  ffmpeg>", line);
      dlog("--- fim do log ---");
      post({ type: "ERROR", message, cueIndex: cue.index });
      // Segue processando as proximas cues — uma cue que falha nao aborta o
      // bloco. Main decide se retry ou pula.
    }
  }

  dlog("handleProcessBlock: bloco concluido. codec =", req.codecHint);
  post({ type: "BLOCK_DONE", codecDetected: req.codecHint });
}

// ─────────────────────────────────────────────────────────────────────────────
// Dispatch
// ─────────────────────────────────────────────────────────────────────────────
self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  dlog("worker recebeu mensagem:", e.data?.type);
  if (e.data?.type === "PROBE") await handleProbe(e.data);
  else if (e.data?.type === "SLICE") await handleSlice(e.data);
  else if (e.data?.type === "PROCESS_BLOCK") await handleProcessBlock(e.data);
  else dlog("worker: tipo desconhecido:", e.data);
};

export {};
