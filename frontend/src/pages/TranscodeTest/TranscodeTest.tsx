// Passo 3+4 — pagina scratch de validacao do pipeline de transcode + cache.
//
// Passo 3: WORKERFS + pthreads + escolha de audio + UI nao trava
// Passo 4: cache em IndexedDB — 2a slice da mesma cue retorna instantanea
//
// Sera removida quando o Passo 5 substituir por PROCESS_BLOCK + queue.

import { useEffect, useRef, useState } from "react";
import type {
  AudioTrack,
  ProbeRequest,
  SliceRequest,
  WorkerResponse,
} from "../../workers/transcode.worker";
import {
  clearSliceCache,
  countCachedSlices,
  videoFingerprint,
} from "../../lib/videoCache";
import styles from "./TranscodeTest.module.css";

type ProbeStatus =
  | { kind: "idle" }
  | { kind: "probing"; ms: number }
  | { kind: "ready" }
  | { kind: "error"; message: string };

type SliceStatus =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "done"; ms: number; bytes: number; cached: boolean }
  | { kind: "error"; message: string };

function trackLabel(t: AudioTrack): string {
  const lang = t.language ? t.language.toUpperCase() : "??";
  const title = t.title ? ` "${t.title}"` : "";
  const details = [t.codec, t.channels, t.bitrate].filter(Boolean).join(", ");
  const def = t.isDefault ? " · default" : "";
  return `#0:${t.streamIndex} · ${lang}${title} (${details})${def}`;
}

const ulog = (...args: unknown[]) => console.log("[UI]", ...args);

function newWorker(): Worker {
  ulog("newWorker: criando Worker");
  return new Worker(
    new URL("../../workers/transcode.worker.ts", import.meta.url),
    { type: "module" }
  );
}

export function TranscodeTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [selectedAudioIndex, setSelectedAudioIndex] = useState<number | null>(
    null
  );
  const [probeStatus, setProbeStatus] = useState<ProbeStatus>({ kind: "idle" });

  const [startSec, setStartSec] = useState(47);
  const [durationSec, setDurationSec] = useState(3);
  const [sliceStatus, setSliceStatus] = useState<SliceStatus>({ kind: "idle" });

  const [log, setLog] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [cachedCount, setCachedCount] = useState<number>(0);

  const workerRef = useRef<Worker | null>(null);
  const probeWorkerRef = useRef<Worker | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  // Chave do cache (montada aqui na scratch page — na producao vira
  // `${fingerprint}_${srtHash}_cue${cueIndex}`, ver videoCache.ts).
  const cacheKey =
    file && selectedAudioIndex != null
      ? `${videoFingerprint(file)}_${startSec}_${durationSec}_a${selectedAudioIndex}`
      : null;

  // Le contagem de cues cacheadas ao montar e apos operacoes de cache
  const refreshCachedCount = () => {
    countCachedSlices().then(setCachedCount).catch(() => {});
  };
  useEffect(() => {
    refreshCachedCount();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      probeWorkerRef.current?.terminate();
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  // Contador visivel enquanto encode ou probe rodam — se a UI travar, congela.
  useEffect(() => {
    const busy =
      sliceStatus.kind === "running" || probeStatus.kind === "probing";
    if (!busy) return;
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, [sliceStatus.kind, probeStatus.kind]);

  // Probe automatico ao trocar arquivo — descobre as streams de audio.
  useEffect(() => {
    ulog("useEffect[file] triggered. file =", file?.name);
    if (!file) {
      ulog("useEffect[file]: sem file, resetando estado");
      setAudioTracks([]);
      setSelectedAudioIndex(null);
      setProbeStatus({ kind: "idle" });
      return;
    }

    ulog("useEffect[file]: iniciando probe para", file.name, "size:", file.size);
    setAudioTracks([]);
    setSelectedAudioIndex(null);
    setProbeStatus({ kind: "probing", ms: 0 });
    setLog([]);
    setTick(0);

    probeWorkerRef.current?.terminate();
    const worker = newWorker();
    probeWorkerRef.current = worker;
    const startedAt = performance.now();

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      if (msg.type === "LOG") {
        setLog((prev) => [...prev, msg.line]);
      } else if (msg.type === "PROBE_DONE") {
        ulog("PROBE_DONE recebido:", msg.audioTracks.length, "faixas", msg.audioTracks);
        setAudioTracks(msg.audioTracks);
        const preferred =
          msg.audioTracks.find((t) => t.language === "eng") ??
          msg.audioTracks.find((t) => t.isDefault) ??
          msg.audioTracks[0];
        ulog("PROBE_DONE: pré-selecionando streamIndex =", preferred.streamIndex);
        setSelectedAudioIndex(preferred.streamIndex);
        setProbeStatus({ kind: "ready" });
        worker.terminate();
        probeWorkerRef.current = null;
      } else if (msg.type === "ERROR") {
        ulog("ERROR recebido do probe:", msg.message);
        setProbeStatus({ kind: "error", message: msg.message });
        worker.terminate();
        probeWorkerRef.current = null;
      }
    };

    worker.onerror = (ev) => {
      ulog("worker.onerror (probe):", ev.message, ev);
      setProbeStatus({
        kind: "error",
        message: ev.message || "erro desconhecido no worker (probe)",
      });
      worker.terminate();
      probeWorkerRef.current = null;
    };

    const req: ProbeRequest = { type: "PROBE", file };
    ulog("postMessage PROBE");
    worker.postMessage(req);

    // Atualiza o contador de tempo do probe
    const tickId = setInterval(() => {
      setProbeStatus((s) =>
        s.kind === "probing"
          ? { kind: "probing", ms: performance.now() - startedAt }
          : s
      );
    }, 100);
    return () => {
      clearInterval(tickId);
      worker.terminate();
      probeWorkerRef.current = null;
    };
  }, [file]);

  const runSlice = () => {
    ulog("runSlice: clique. file =", file?.name, "audio idx =", selectedAudioIndex);
    if (!file || selectedAudioIndex == null) {
      ulog("runSlice: aborted (file ou audio ausente)");
      return;
    }

    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setLog([]);
    setSliceStatus({ kind: "running" });
    setTick(0);

    workerRef.current?.terminate();
    const worker = newWorker();
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      if (msg.type === "LOG") {
        setLog((prev) => [...prev, msg.line]);
      } else if (msg.type === "SLICE_DONE") {
        ulog(
          "SLICE_DONE recebido. bytes =",
          msg.mp4.byteLength,
          "ms =",
          msg.ms,
          "cached =",
          msg.cached
        );
        const blob = new Blob([msg.mp4], { type: "video/mp4" });
        setVideoUrl(URL.createObjectURL(blob));
        setSliceStatus({
          kind: "done",
          ms: msg.ms,
          bytes: msg.mp4.byteLength,
          cached: msg.cached,
        });
        refreshCachedCount();
      } else if (msg.type === "ERROR") {
        ulog("ERROR recebido do slice:", msg.message);
        setSliceStatus({ kind: "error", message: msg.message });
      }
    };

    worker.onerror = (ev) => {
      ulog("worker.onerror (slice):", ev.message, ev);
      setSliceStatus({
        kind: "error",
        message: ev.message || "erro desconhecido no worker (slice)",
      });
    };

    const req: SliceRequest = {
      type: "SLICE",
      file,
      startSec,
      durationSec,
      audioStreamIndex: selectedAudioIndex,
      cacheKey: cacheKey ?? undefined,
    };
    ulog("postMessage SLICE:", {
      startSec,
      durationSec,
      audioStreamIndex: selectedAudioIndex,
      cacheKey,
    });
    worker.postMessage(req);
  };

  const handleClearCache = async () => {
    ulog("handleClearCache: limpando cache");
    await clearSliceCache();
    refreshCachedCount();
    ulog("handleClearCache: ok");
  };

  const canSlice =
    !!file &&
    selectedAudioIndex != null &&
    probeStatus.kind === "ready" &&
    sliceStatus.kind !== "running";

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Transcode Test (Passo 3 + 4)</h1>
      <p className={styles.subtitle}>
        Valida ffmpeg.wasm + WORKERFS + pthreads + cache IndexedDB. Rota
        scratch — sera removida no Passo 5.
      </p>

      <div className={`${styles.card} ${styles.cacheBar}`}>
        <span>
          Cache IndexedDB: <strong>{cachedCount}</strong> cue
          {cachedCount === 1 ? "" : "s"} armazenada
          {cachedCount === 1 ? "" : "s"}
        </span>
        <button
          className={styles.buttonGhost}
          onClick={handleClearCache}
          disabled={cachedCount === 0}
        >
          Limpar cache
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>Video</label>
            <input
              type="file"
              accept="video/*,.mkv,.mp4,.webm,.avi,.mov"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className={styles.field}>
            <label>Start (s)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={startSec}
              onChange={(e) => setStartSec(Number(e.target.value))}
            />
          </div>
          <div className={styles.field}>
            <label>Duration (s)</label>
            <input
              type="number"
              min="0.5"
              step="0.1"
              value={durationSec}
              onChange={(e) => setDurationSec(Number(e.target.value))}
            />
          </div>
          <button
            className={styles.button}
            onClick={runSlice}
            disabled={!canSlice}
          >
            {sliceStatus.kind === "running"
              ? `Fatiando… (${(tick / 10).toFixed(1)}s)`
              : "Fatiar cue"}
          </button>
        </div>

        {/* Audio tracks — aparece apos o probe */}
        {probeStatus.kind === "probing" && (
          <div className={styles.status}>
            Analisando streams do arquivo… ({(probeStatus.ms / 1000).toFixed(1)}
            s)
          </div>
        )}
        {probeStatus.kind === "error" && (
          <div className={`${styles.status} ${styles.statusErr}`}>
            ✗ Probe falhou: {probeStatus.message}
          </div>
        )}
        {probeStatus.kind === "ready" && audioTracks.length > 0 && (
          <div className={styles.tracks}>
            <div className={styles.tracksLabel}>Faixa de audio</div>
            <div className={styles.tracksList}>
              {audioTracks.map((t) => (
                <label key={t.streamIndex} className={styles.trackItem}>
                  <input
                    type="radio"
                    name="audio"
                    value={t.streamIndex}
                    checked={selectedAudioIndex === t.streamIndex}
                    onChange={() => setSelectedAudioIndex(t.streamIndex)}
                  />
                  <span>{trackLabel(t)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className={styles.status}>
          {sliceStatus.kind === "idle" && probeStatus.kind === "idle" &&
            "Aguardando arquivo…"}
          {sliceStatus.kind === "running" && (
            <>
              Encode em progresso. Digite nos campos acima — se responderem, a
              UI nao esta travada.
            </>
          )}
          {sliceStatus.kind === "done" && (
            <span className={styles.statusOk}>
              {sliceStatus.cached ? "⚡ Cache hit" : "✓ Encodado"} —{" "}
              {(sliceStatus.bytes / 1024).toFixed(0)} KB em{" "}
              {sliceStatus.ms < 1000
                ? `${sliceStatus.ms.toFixed(0)}ms`
                : `${(sliceStatus.ms / 1000).toFixed(2)}s`}
            </span>
          )}
          {sliceStatus.kind === "error" && (
            <span className={styles.statusErr}>✗ {sliceStatus.message}</span>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <div ref={logRef} className={styles.log}>
          {log.length === 0 ? "(log do ffmpeg aparece aqui)" : log.join("\n")}
        </div>
      </div>

      {videoUrl && (
        <div className={styles.card}>
          <video className={styles.video} src={videoUrl} controls autoPlay />
        </div>
      )}
    </div>
  );
}
