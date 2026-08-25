// Passo 5 — Player da sessao de estudo.
//
// Fluxo:
//   Select page → navigate("/player", { state: { videoFile, subtitleFile } })
//   /player pega os arquivos do state, faz probe, monta o session, roda.
//
// Se acessar /player direto (sem state), redireciona pro /selectpath.

import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { StudyPlayer } from "../../components/StudyPlayer/StudyPlayer";
import {
  filterDialogueCues,
  parseSrt,
  type SrtCue,
} from "../../lib/srt";
import { useTranscodeSession } from "../../hooks/useTranscodeSession";
import { usePlayerSession } from "../../contexts/PlayerSessionContext";
import type {
  AudioTrack,
  VideoCodec,
  WorkerResponse,
} from "../../workers/transcode.worker";
import styles from "./Player.module.css";

export function PlayerPage() {
  const { session, hydrated } = usePlayerSession();

  // Espera a leitura do IndexedDB pra evitar redirect antes de saber
  // se ha sessao salva.
  if (!hydrated) {
    return (
      <div className={styles.centered}>
        <div className={styles.loader}>
          <div className={styles.spinner} />
          <div>Restaurando sessão…</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/selectpath" replace />;
  }

  return (
    <PlayerLoader
      videoFile={session.videoFile}
      subtitleFile={session.subtitleFile}
    />
  );
}

// Fase 1: carrega/parseia SRT + faz probe do video.
function PlayerLoader({
  videoFile,
  subtitleFile,
}: {
  videoFile: File;
  subtitleFile: File;
}) {
  const [cues, setCues] = useState<SrtCue[] | null>(null);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[] | null>(null);
  const [videoCodec, setVideoCodec] = useState<VideoCodec | null>(null);
  const [probeError, setProbeError] = useState<string | null>(null);

  // Parse SRT
  useEffect(() => {
    subtitleFile
      .text()
      .then((text) => {
        const parsed = parseSrt(text);
        const filtered = filterDialogueCues(parsed);
        setCues(filtered);
      })
      .catch((err) => setProbeError(`Falha lendo legenda: ${err.message}`));
  }, [subtitleFile]);

  // Probe video (detecta streams de audio + codec de video)
  useEffect(() => {
    const worker = new Worker(
      new URL("../../workers/transcode.worker.ts", import.meta.url),
      { type: "module" }
    );
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      if (msg.type === "PROBE_DONE") {
        setAudioTracks(msg.audioTracks);
        setVideoCodec(msg.videoCodec);
        worker.terminate();
      } else if (msg.type === "ERROR") {
        setProbeError(msg.message);
        worker.terminate();
      }
    };
    worker.onerror = (ev) =>
      setProbeError(ev.message || "worker crashou no probe");
    worker.postMessage({ type: "PROBE", file: videoFile });
    return () => worker.terminate();
  }, [videoFile]);

  // Prefere ingles; senao default; senao a primeira.
  const audioStreamIndex = useMemo(() => {
    if (!audioTracks || audioTracks.length === 0) return null;
    return (
      audioTracks.find((t) => t.language === "eng")?.streamIndex ??
      audioTracks.find((t) => t.isDefault)?.streamIndex ??
      audioTracks[0].streamIndex
    );
  }, [audioTracks]);

  if (probeError) {
    return (
      <div className={styles.centered}>
        <div className={styles.errorBox}>
          <strong>Erro:</strong> {probeError}
        </div>
      </div>
    );
  }

  if (!cues || !audioTracks || !videoCodec || audioStreamIndex === null) {
    return (
      <div className={styles.centered}>
        <div className={styles.loader}>
          <div className={styles.spinner} />
          <div>
            {!cues
              ? "Lendo legenda…"
              : !audioTracks
                ? "Analisando faixas do vídeo…"
                : "Preparando…"}
          </div>
        </div>
      </div>
    );
  }

  if (cues.length === 0) {
    return (
      <div className={styles.centered}>
        <div className={styles.errorBox}>
          Legenda sem cues de diálogo aproveitáveis.
        </div>
      </div>
    );
  }

  return (
    <SessionRunner
      videoFile={videoFile}
      cues={cues}
      audioStreamIndex={audioStreamIndex}
      videoCodec={videoCodec}
    />
  );
}

// Fase 2: sessao rodando — worker de transcode + player MSE + subtitle.
function SessionRunner({
  videoFile,
  cues,
  audioStreamIndex,
  videoCodec,
}: {
  videoFile: File;
  cues: SrtCue[];
  audioStreamIndex: number;
  videoCodec: VideoCodec;
}) {
  const session = useTranscodeSession({
    videoFile,
    cues,
    audioStreamIndex,
    videoCodec,
  });

  // Estado PREPARING: player nao renderiza ainda
  if (session.state.kind === "preparing") {
    const pct = Math.round(
      (session.state.ready / Math.max(1, session.state.total)) * 100
    );
    return (
      <div className={styles.centered}>
        <div className={styles.loader}>
          <div className={styles.spinner} />
          <div className={styles.loaderTitle}>Preparando sessão…</div>
          <div className={styles.loaderProgress}>
            {session.state.ready} de {session.state.total} cues processadas
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (session.state.kind === "error") {
    return (
      <div className={styles.centered}>
        <div className={styles.errorBox}>
          <strong>Erro na sessão:</strong> {session.state.message}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <StudyPlayer
        cues={cues}
        cuesReady={session.cuesReady}
        onCueReached={session.notifyCueReached}
      />

      {session.state.kind === "buffering" && (
        <div className={styles.overlayBadge}>
          Aguardando cue {session.state.waitingCue}…
        </div>
      )}
      {session.state.kind === "complete" && (
        <div className={styles.overlayBadge}>Sessão pronta (todas as cues)</div>
      )}
    </div>
  );
}
