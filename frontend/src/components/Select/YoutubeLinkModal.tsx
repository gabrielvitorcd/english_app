import { useState, useEffect } from "react";
import { useSubtitles } from "../../hooks/useSubtitles";
import type { SubtitleInfo } from "../../hooks/useSubtitles";
import styles from "./YoutubeLinkModal.module.css";

export interface YoutubeLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  onSubtitlesLoaded?: (url: string, subtitles: SubtitleInfo[]) => void;
}

const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function YoutubeLinkModal({
  isOpen,
  onClose,
  onSubmit,
  onSubtitlesLoaded,
}: YoutubeLinkModalProps) {
  const [url, setUrl] = useState("");
  const [validationError, setValidationError] = useState("");

  const {
    subtitles,
    isLoading,
    error: apiError,
    fetchSubtitles,
    clearSubtitles,
  } = useSubtitles();

  // Limpa os dados do hook e do input local quando o modal fechar ou abrir
  useEffect(() => {
    if (!isOpen) {
      setUrl("");
      setValidationError("");
      clearSubtitles();
    }
  }, [isOpen, clearSubtitles]);

  if (!isOpen) return null;

  const validateUrl = (inputUrl: string): boolean => {
    if (!YOUTUBE_REGEX.test(inputUrl)) {
      setValidationError("Apenas links de Videos do YouTube são permitidos");
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleSubmit = () => {
    if (validateUrl(url)) {
      onSubmit(url);
      onClose();
    }
  };

  const handleLoadSubtitles = async () => {
    if (!validateUrl(url)) return;

    try {
      // Dispara a chamada através do hook
      const fetchedSubtitles = await fetchSubtitles(url);

      // Se retornou dados com sucesso, aciona o callback da propriedade
      if (fetchedSubtitles && onSubtitlesLoaded) {
        onSubtitlesLoaded(url, fetchedSubtitles);
      }
    } catch {
      // O erro já foi tratado e armazenado internamente pelo hook (apiError)
      // Mantemos o catch vazio aqui apenas para evitar Uncaught Promise Rejection no console
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (validationError) setValidationError("");
  };

  // Prioriza o erro de validação local antes de exibir o erro vindo da API
  const activeError = validationError || apiError;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Fechar modal"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>Vídeo do YouTube</h2>
          <p className={styles.subtitle}>
            Cole o link de um vídeo do YouTube para começar a estudar
          </p>
        </div>

        <div className={styles.inputSection}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                <polygon
                  points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </div>
            <input
              type="text"
              className={styles.input}
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>

          {activeError && (
            <div className={styles.error}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{activeError}</span>
            </div>
          )}

          {subtitles && subtitles.length > 0 && (
            <div className={styles.subtitlesSection}>
              <h3 className={styles.subtitlesTitle}>
                Legendas disponíveis ({subtitles.length})
              </h3>
              <ul className={styles.subtitlesList}>
                {subtitles.map((sub) => (
                  <li key={sub.language_code} className={styles.subtitleItem}>
                    <span className={styles.subtitleName}>
                      {sub.language_name}
                    </span>
                    {sub.is_auto_generated && (
                      <span className={styles.subtitleBadge}>Auto</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isLoading && (
            <div className={styles.loading}>
              <svg
                className={styles.spinner}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
              <span>Buscando legendas...</span>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={`${styles.loadButton} ${!url.trim() || isLoading ? styles.disabled : ""}`}
            onClick={handleLoadSubtitles}
            disabled={!url.trim() || isLoading}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            Buscar legendas
          </button>

          <button
            className={`${styles.submitButton} ${!url.trim() ? styles.disabled : ""}`}
            onClick={handleSubmit}
            disabled={!url.trim()}
          >
            Enviar
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
