// Passo 5 — hook que gerencia a sessao de estudo: worker persistente,
// fila de blocos, buffer inicial, gatilho do proximo bloco na metade do bloco
// atual, e estados PREPARING → READY → BUFFERING → COMPLETE.
//
// Uso (Player.tsx):
//   const session = useTranscodeSession({ videoFile, cues, audioStreamIndex, videoCodec });
//   // session.state, session.cuesReady, session.notifyCueReached(N)
//
// Semantica dos blocos (fechada com o usuario):
//   - Bloco inicial: 20 cues → libera o player quando terminam
//   - Blocos seguintes: 10 cues cada, em background
//   - Gatilho: usuario atinge a metade do bloco atual
//     (cue 10 → pede 20..29 ; cue 25 → pede 30..39 ; etc)

import { useCallback, useEffect, useRef, useState } from "react";
import type { SrtCue } from "../lib/srt";
import { sha256Hex, videoFingerprint } from "../lib/videoCache";
import type {
  ProcessBlockRequest,
  VideoCodec,
  WorkerResponse,
} from "../workers/transcode.worker";

const INITIAL_BUFFER = 20;
const BLOCK_SIZE = 10;

export type SessionState =
  | { kind: "preparing"; ready: number; total: number }
  | { kind: "ready" }
  | { kind: "buffering"; waitingCue: number }
  | { kind: "complete" }
  | { kind: "error"; message: string };

export type UseTranscodeSessionArgs = {
  videoFile: File;
  /** Cues ja filtradas e reindexadas (sem [efeitos sonoros]). */
  cues: SrtCue[];
  audioStreamIndex: number;
  videoCodec: VideoCodec;
};

export type UseTranscodeSessionResult = {
  state: SessionState;
  /** cueIndex → ArrayBuffer do MP4 pronto. Novo Map a cada update (React deps). */
  cuesReady: Map<number, ArrayBuffer>;
  /** Player chama quando entra numa cue nova — dispara gatilho do proximo bloco. */
  notifyCueReached: (cueIndex: number) => void;
};

/** h264 → copy (~50x mais rapido); qualquer outro → transcode (~0.2x tempo real). */
function codecStrategy(codec: VideoCodec): "copy" | "transcode" {
  return codec === "h264" ? "copy" : "transcode";
}

export function useTranscodeSession(
  args: UseTranscodeSessionArgs
): UseTranscodeSessionResult {
  const { videoFile, cues, audioStreamIndex, videoCodec } = args;

  const initialTotal = Math.min(INITIAL_BUFFER, cues.length);
  const [state, setState] = useState<SessionState>({
    kind: "preparing",
    ready: 0,
    total: initialTotal,
  });
  const [cuesReady, setCuesReady] = useState<Map<number, ArrayBuffer>>(
    () => new Map()
  );

  // Coordenadas do proximo bloco a pedir (em refs pra o notifyCueReached ler
  // sempre o valor mais recente sem depender de re-render).
  const nextBlockStartRef = useRef(initialTotal);
  const nextTriggerRef = useRef(Math.floor(initialTotal / 2));

  // sendBlock e criado dentro do effect (depende dos hashes) — o notifyCueReached
  // precisa de acesso via ref.
  const sendBlockRef = useRef<((from: number, to: number) => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    const worker = new Worker(
      new URL("../workers/transcode.worker.ts", import.meta.url),
      { type: "module" }
    );

    // Reset state on new session
    setState({ kind: "preparing", ready: 0, total: initialTotal });
    setCuesReady(new Map());
    nextBlockStartRef.current = initialTotal;
    nextTriggerRef.current = Math.floor(initialTotal / 2);
    let readyCount = 0;

    // Canonicaliza as cues pra gerar srtHash estavel. Muda quando o SRT muda.
    const srtCanonical = cues
      .map((c) => `${c.index}|${c.start}|${c.end}|${c.text}`)
      .join("\n");

    (async () => {
      const videoFp = videoFingerprint(videoFile);
      const srtHash = await sha256Hex(srtCanonical);
      if (cancelled) return;

      const codecHint = codecStrategy(videoCodec);
      console.log(
        `[useTranscodeSession] videoCodec="${videoCodec}" → codecHint="${codecHint}" (copy = corte alinha no keyframe anterior; transcode = corte exato)`
      );

      const sendBlock = (fromIdx: number, toIdx: number) => {
        const cuesInBlock = cues.slice(fromIdx, toIdx);
        if (cuesInBlock.length === 0) return;
        console.log(
          `[useTranscodeSession] enviando bloco [${fromIdx}..${toIdx}) — ${cuesInBlock.length} cues, primeira SRT=[${cuesInBlock[0].start.toFixed(
            3
          )}s→${cuesInBlock[0].end.toFixed(3)}s]`
        );
        const req: ProcessBlockRequest = {
          type: "PROCESS_BLOCK",
          videoFile,
          cues: cuesInBlock,
          videoFingerprint: videoFp,
          srtHash,
          audioStreamIndex,
          codecHint,
        };
        worker.postMessage(req);
      };
      sendBlockRef.current = sendBlock;

      worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const msg = e.data;
        if (msg.type === "CUE_READY") {
          setCuesReady((prev) => {
            const next = new Map(prev);
            next.set(msg.cueIndex, msg.mp4);
            return next;
          });
          readyCount += 1;

          setState((s) => {
            if (s.kind === "preparing") {
              const total = s.total;
              const ready = Math.min(readyCount, total);
              return ready >= total
                ? { kind: "ready" }
                : { kind: "preparing", ready, total };
            }
            if (s.kind === "buffering" && s.waitingCue === msg.cueIndex) {
              return { kind: "ready" };
            }
            return s;
          });
        } else if (msg.type === "BLOCK_DONE") {
          if (readyCount >= cues.length) {
            setState({ kind: "complete" });
          }
        } else if (msg.type === "ERROR") {
          setState({
            kind: "error",
            message:
              msg.cueIndex !== undefined
                ? `Cue ${msg.cueIndex}: ${msg.message}`
                : msg.message,
          });
        }
      };

      worker.onerror = (ev) => {
        setState({
          kind: "error",
          message: ev.message || "worker crashou sem mensagem",
        });
      };

      // Dispara o bloco inicial
      sendBlock(0, initialTotal);
    })();

    return () => {
      cancelled = true;
      worker.terminate();
      sendBlockRef.current = null;
    };
    // Recria o worker quando muda a sessao (video/legenda/audio/codec).
  }, [videoFile, cues, audioStreamIndex, videoCodec, initialTotal]);

  const notifyCueReached = useCallback(
    (cueIndex: number) => {
      // Se a cue nao esta pronta, entra em buffering (evento raro)
      setState((s) => {
        if (s.kind !== "ready" && s.kind !== "buffering") return s;
        // Consultamos via closure atualizada — cuesReady esta no estado
        // pai; usamos setState com callback pra evitar stale
        return s;
      });

      // Gatilho do proximo bloco: passou pela metade do bloco atual?
      const trigger = nextTriggerRef.current;
      const nextStart = nextBlockStartRef.current;
      if (cueIndex >= trigger && nextStart < cues.length) {
        const end = Math.min(nextStart + BLOCK_SIZE, cues.length);
        sendBlockRef.current?.(nextStart, end);
        nextBlockStartRef.current = end;
        nextTriggerRef.current = nextStart + Math.floor(BLOCK_SIZE / 2);
      }
    },
    [cues.length]
  );

  // BUFFERING: precisa de acesso ao cuesReady atual. Efeito separado que
  // observa quando o player pede uma cue nao-pronta.
  const lastReachedRef = useRef<number | null>(null);
  const notifyCueReachedWithBuffering = useCallback(
    (cueIndex: number) => {
      lastReachedRef.current = cueIndex;
      if (!cuesReady.has(cueIndex) && cueIndex < cues.length) {
        setState((s) =>
          s.kind === "ready" || s.kind === "buffering"
            ? { kind: "buffering", waitingCue: cueIndex }
            : s
        );
      }
      notifyCueReached(cueIndex);
    },
    [cuesReady, cues.length, notifyCueReached]
  );

  return { state, cuesReady, notifyCueReached: notifyCueReachedWithBuffering };
}
