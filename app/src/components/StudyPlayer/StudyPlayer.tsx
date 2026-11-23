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
import {
  ArrowRight,
  Captions,
  CaptionsOff,
  Check,
  ChevronLeft,
  CircleCheck,
  CircleDashed,
  CircleX,
  Play,
  Repeat,
  Settings2,
  X,
} from "lucide-react";
import { Button, IconButton } from "../ui";
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a URL do blob da cue atual nasce e é revogada neste effect; reescrever mudaria quando ela troca
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset do estado a cada cue faz parte do fluxo do player; reescrever mudaria a ordem dos renders
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- o contador do auto-avanço começa junto com o timer; tirar do effect mudaria o fluxo
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
      <div className={`palco ${styles.root}`}>
        <div className={styles.message}>Sessão concluída — não há mais cues.</div>
      </div>
    );
  }

  return (
    <div className={`palco ${styles.root}`}>
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
              <div
                className={`material-video ${styles.playIconOverlay}`}
                aria-hidden="true"
              >
                <Play aria-hidden="true" />
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

      <div className={`material-video ${styles.topBar}`}>
        <IconButton
          large
          className={styles.backButton}
          onClick={handleBack}
          type="button"
          title="Voltar para seleção"
          aria-label="Voltar"
        >
          <ChevronLeft aria-hidden="true" />
        </IconButton>

        <div className={styles.counter}>
          Frase {currentIndex + 1} de {cues.length}
        </div>

        <div className={styles.actions}>
          <Button
            variant="nao-sei"
            className={styles.answerButton}
            onClick={handleDontKnow}
            type="button"
            disabled={submitted}
          >
            <X aria-hidden="true" />
            <span>Não Sei</span>
          </Button>
          <Button
            variant="sei"
            className={styles.answerButton}
            onClick={handleKnow}
            type="button"
            disabled={showInput || submitted}
          >
            <Check aria-hidden="true" />
            <span>Sei</span>
          </Button>

          <IconButton
            large
            on={showSubtitle}
            onClick={() => setShowSubtitle((s) => !s)}
            type="button"
            title={showSubtitle ? "Ocultar legenda" : "Mostrar legenda"}
            aria-label="Alternar legenda"
          >
            {showSubtitle ? (
              <Captions aria-hidden="true" />
            ) : (
              <CaptionsOff aria-hidden="true" />
            )}
          </IconButton>

          <IconButton
            large
            on={showSubtitleSettings}
            onClick={() => setShowSubtitleSettings((s) => !s)}
            type="button"
            title="Configurações da legenda"
            aria-label="Configurações da legenda"
            aria-expanded={showSubtitleSettings}
          >
            <Settings2 aria-hidden="true" />
          </IconButton>

          <IconButton
            large
            on={autoplay}
            onClick={() => setAutoplay((a) => !a)}
            type="button"
            title={autoplay ? "Autoplay ligado" : "Autoplay desligado"}
            aria-label="Alternar autoplay"
          >
            <Repeat aria-hidden="true" />
          </IconButton>
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
        className={`material-video ${styles.inputArea} ${
          showInput || submitted ? styles.inputAreaOpen : ""
        }`}
      >
        {!submitted ? (
          <form onSubmit={submit} className={styles.form}>
            <input
              ref={inputRef}
              className={`input ${styles.input}`}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Digite o que você entendeu e pressione Enter…"
            />
            <IconButton
              type="button"
              onClick={handleCloseInput}
              title="Fechar sem responder"
              aria-label="Fechar"
            >
              <X aria-hidden="true" />
            </IconButton>
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
                    {correction.verdict === "great" && (
                      <>
                        <CircleCheck className={styles.scoreIcon} aria-hidden="true" />
                        Boa!
                      </>
                    )}
                    {correction.verdict === "okay" && (
                      <>
                        <CircleDashed className={styles.scoreIcon} aria-hidden="true" />
                        Mais ou menos
                      </>
                    )}
                    {correction.verdict === "poor" && (
                      <>
                        <CircleX className={styles.scoreIcon} aria-hidden="true" />
                        Tenta de novo na próxima
                      </>
                    )}
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
            <Button
              variant="accent"
              className={styles.nextButton}
              onClick={next}
              type="button"
            >
              Próxima frase
              <ArrowRight aria-hidden="true" />{" "}
              <span className={styles.nextHint}>
                {autoplay ? `(auto em ${countdown}s ou Enter)` : "(Enter)"}
              </span>
            </Button>
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
