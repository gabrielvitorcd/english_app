// Passo 5 — Player de sessão de estudo (loop-until-submit).
//
// UX:
//   1. Toca a cue em loop, sem input visível.
//   2. Aluno clica "Sei" → input desce do topo do video.
//   3. Enter → correção fake compara palavra a palavra.
//   4. Alternativa: clica "Não Sei" → revela legenda + marca como respondido.
//   5. Avanço automático (se autoplay on) ou botão "Próxima frase".

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SrtCue } from "../../lib/srt";
import {
  subtitleStyle,
  useSubtitleSettings,
} from "../../hooks/useSubtitleSettings";
import { SubtitleSettingsPanel } from "./SubtitleSettingsPanel";
import styles from "./StudyPlayer.module.css";

export type StudyPlayerProps = {
  cues: SrtCue[];
  cuesReady: Map<number, ArrayBuffer>;
  onCueReached: (cueIndex: number) => void;
};

type Correction = {
  matched: string[];
  missing: string[];
  scorePct: number;
  verdict: "great" | "okay" | "poor";
};

const NORMALIZE_RE = /[.,!?;:'"()[\]{}]/g;

function normalize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(NORMALIZE_RE, "")
    .split(/\s+/)
    .filter(Boolean);
}

function fakeCorrect(user: string, actual: string): Correction {
  const userWords = new Set(normalize(user));
  const actualWords = normalize(actual);
  const matched = actualWords.filter((w) => userWords.has(w));
  const missing = actualWords.filter((w) => !userWords.has(w));
  const scorePct =
    actualWords.length === 0
      ? 0
      : Math.round((matched.length / actualWords.length) * 100);
  const verdict: Correction["verdict"] =
    scorePct >= 60 ? "great" : scorePct >= 30 ? "okay" : "poor";
  return { matched, missing, scorePct, verdict };
}

const AUTO_ADVANCE_SEC = 3;

export function StudyPlayer({
  cues,
  cuesReady,
  onCueReached,
}: StudyPlayerProps) {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_ADVANCE_SEC);
  const [isPaused, setIsPaused] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [showSubtitleSettings, setShowSubtitleSettings] = useState(false);

  const {
    settings: subtitleSettings,
    update: updateSubtitleSettings,
    reset: resetSubtitleSettings,
  } = useSubtitleSettings();

  const inputRef = useRef<HTMLInputElement>(null);
  const previousUrlRef = useRef<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const clickTimerRef = useRef<number | null>(null);

  const currentCue = cues[currentIndex] ?? null;
  const currentMp4 = cuesReady.get(currentIndex);

  useEffect(() => {
    if (!currentMp4) return;
    const url = URL.createObjectURL(
      new Blob([currentMp4], { type: "video/mp4" })
    );
    setBlobUrl(url);
    if (previousUrlRef.current) URL.revokeObjectURL(previousUrlRef.current);
    previousUrlRef.current = url;
    return () => {
      URL.revokeObjectURL(url);
      if (previousUrlRef.current === url) previousUrlRef.current = null;
    };
  }, [currentMp4]);

  useEffect(() => {
    onCueReached(currentIndex);
  }, [currentIndex, onCueReached]);

  // Reseta estado por cue: input escondido, sem submit, sem legenda visivel
  useEffect(() => {
    setShowInput(false);
    setSubmitted(false);
    setAnswer("");
  }, [currentIndex]);

  // Foca o input quando ele aparece (após click no botao verde)
  useEffect(() => {
    if (showInput && !submitted) {
      // pequeno delay pra animar antes de focar
      const t = window.setTimeout(() => inputRef.current?.focus(), 200);
      return () => window.clearTimeout(t);
    }
  }, [showInput, submitted]);

  // Sincroniza estado isPaused com play/pause do <video> atual
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setIsPaused(false);
    const onPause = () => setIsPaused(true);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    setIsPaused(v.paused);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, [blobUrl]);

  const togglePlayPause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const toggleFullscreen = () => {
    const el = videoWrapRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleVideoClick = () => {
    if (clickTimerRef.current !== null) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    clickTimerRef.current = window.setTimeout(() => {
      togglePlayPause();
      clickTimerRef.current = null;
    }, 220);
  };

  const handleVideoDoubleClick = () => {
    if (clickTimerRef.current !== null) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    toggleFullscreen();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setSubmitted(true);
  };

  const next = () => {
    if (currentIndex + 1 >= cues.length) return;
    setCurrentIndex((i) => i + 1);
  };

  // Sei = abre o input
  const handleKnow = () => setShowInput(true);

  // Fecha o input sem responder (limpa o que foi digitado)
  const handleCloseInput = () => {
    setShowInput(false);
    setAnswer("");
  };

  // Nao Sei = marca como respondido com answer vazio.
  // A frase real aparece no painel de feedback (nao mexe no toggle CC,
  // que e uma preferencia do usuario).
  const handleDontKnow = () => {
    setAnswer("");
    setSubmitted(true);
  };

  const handleBack = () => navigate("/selectpath");

  // Auto-avanco após submit — só ativa se autoplay estiver ligado.
  // Enter avanca imediato independentemente.
  useEffect(() => {
    if (!submitted) return;
    setCountdown(AUTO_ADVANCE_SEC);
    const tick = window.setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    const advance = autoplay
      ? window.setTimeout(() => next(), AUTO_ADVANCE_SEC * 1000)
      : null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") next();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearInterval(tick);
      if (advance !== null) window.clearTimeout(advance);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, currentIndex, autoplay]);

  const correction = useMemo(
    () =>
      submitted && currentCue
        ? fakeCorrect(answer, currentCue.text)
        : null,
    [submitted, answer, currentCue]
  );

  if (!currentCue) {
    return (
      <div className={styles.root}>
        <div className={styles.message}>Sessão concluída — não há mais cues.</div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.videoWrap} ref={videoWrapRef}>
        {blobUrl ? (
          <>
            <video
              key={blobUrl}
              ref={videoRef}
              className={`${styles.video} ${isPaused ? styles.videoPaused : ""}`}
              src={blobUrl}
              autoPlay={autoplay}
              loop={autoplay}
              playsInline
              onClick={handleVideoClick}
              onDoubleClick={handleVideoDoubleClick}
            />
            {isPaused && (
              <div className={styles.playIconOverlay} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
          </>
        ) : (
          <div className={styles.waiting}>
            Aguardando cue {currentIndex + 1}…
          </div>
        )}
        {showSubtitle && (
          <div
            className={styles.subtitleOverlay}
            style={subtitleStyle(subtitleSettings)}
          >
            {currentCue.text}
          </div>
        )}
      </div>

      <div className={styles.topBar}>
        <button
          className={styles.backButton}
          onClick={handleBack}
          type="button"
          title="Voltar para seleção"
          aria-label="Voltar"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className={styles.counter}>
          Frase {currentIndex + 1} de {cues.length}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.dontKnowButton}
            onClick={handleDontKnow}
            type="button"
            disabled={submitted}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            <span>Não Sei</span>
          </button>
          <button
            className={styles.knowButton}
            onClick={handleKnow}
            type="button"
            disabled={showInput || submitted}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span>Sei</span>
          </button>

          <button
            className={`${styles.iconButton} ${showSubtitle ? styles.iconButtonActive : ""}`}
            onClick={() => setShowSubtitle((s) => !s)}
            type="button"
            title={showSubtitle ? "Ocultar legenda" : "Mostrar legenda"}
            aria-label="Alternar legenda"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-9 10.5H8.5v1H11V17H7v-4.5h4v2zm6.5 0H15v1h2.5V17H14v-4.5h3.5v2z" />
            </svg>
          </button>

          <button
            className={`${styles.iconButton} ${showSubtitleSettings ? styles.iconButtonActive : ""}`}
            onClick={() => setShowSubtitleSettings((s) => !s)}
            type="button"
            title="Configurações da legenda"
            aria-label="Configurações da legenda"
            aria-expanded={showSubtitleSettings}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>

          <button
            className={`${styles.iconButton} ${autoplay ? styles.iconButtonActive : ""}`}
            onClick={() => setAutoplay((a) => !a)}
            type="button"
            title={autoplay ? "Autoplay ligado" : "Autoplay desligado"}
            aria-label="Alternar autoplay"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          </button>
        </div>
      </div>

      {showSubtitleSettings && (
        <SubtitleSettingsPanel
          settings={subtitleSettings}
          update={updateSubtitleSettings}
          reset={resetSubtitleSettings}
          onClose={() => setShowSubtitleSettings(false)}
        />
      )}

      <div
        className={`${styles.inputArea} ${
          showInput || submitted ? styles.inputAreaOpen : ""
        }`}
      >
        {!submitted ? (
          <form onSubmit={submit} className={styles.form}>
            <input
              ref={inputRef}
              className={styles.input}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Digite o que você entendeu e pressione Enter…"
            />
            <button
              type="button"
              className={styles.closeButton}
              onClick={handleCloseInput}
              title="Fechar sem responder"
              aria-label="Fechar"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </form>
        ) : (
          <div className={styles.feedback}>
            {answer.trim() ? (
              <>
                <div className={styles.answerBlock}>
                  <div className={styles.answerLabel}>Você digitou</div>
                  <div className={styles.answerText}>{answer}</div>
                </div>
                <div className={styles.answerBlock}>
                  <div className={styles.answerLabel}>Frase real</div>
                  <RevealedText cue={currentCue} matched={correction!.matched} />
                </div>
                {correction && (
                  <div
                    className={`${styles.score} ${
                      correction.verdict === "great"
                        ? styles.scoreGreat
                        : correction.verdict === "okay"
                          ? styles.scoreOkay
                          : styles.scorePoor
                    }`}
                  >
                    {correction.verdict === "great" && "✓ Boa!"}
                    {correction.verdict === "okay" && "≈ Mais ou menos"}
                    {correction.verdict === "poor" &&
                      "✗ Tenta de novo na próxima"}
                    {" — "}
                    {correction.matched.length} de{" "}
                    {correction.matched.length + correction.missing.length}{" "}
                    palavras ({correction.scorePct}%)
                  </div>
                )}
              </>
            ) : (
              <div className={styles.answerBlock}>
                <div className={styles.answerLabel}>Frase real</div>
                <div className={styles.answerText}>{currentCue.text}</div>
              </div>
            )}
            <button className={styles.nextButton} onClick={next} type="button">
              Próxima frase →{" "}
              <span className={styles.nextHint}>
                {autoplay ? `(auto em ${countdown}s ou Enter)` : "(Enter)"}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RevealedText({
  cue,
  matched,
}: {
  cue: SrtCue;
  matched: string[];
}) {
  const matchedSet = new Set(matched);
  const words = cue.text.split(/(\s+)/);
  return (
    <div className={styles.answerText}>
      {words.map((chunk, i) => {
        const normalized = chunk.toLowerCase().replace(NORMALIZE_RE, "");
        const isMatch = normalized && matchedSet.has(normalized);
        return (
          <span key={i} className={isMatch ? styles.matched : undefined}>
            {chunk}
          </span>
        );
      })}
    </div>
  );
}
