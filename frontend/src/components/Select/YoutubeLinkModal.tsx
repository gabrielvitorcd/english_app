import { useState } from "react";
import styles from "./YoutubeLinkModal.module.css";

export interface YoutubeLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function YoutubeLinkModal({
  isOpen,
  onClose,
  onSubmit,
}: YoutubeLinkModalProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const validateUrl = (inputUrl: string): boolean => {
    if (!inputUrl.trim()) {
      setError("Por favor, insira um link do YouTube");
      return false;
    }

    if (!YOUTUBE_REGEX.test(inputUrl)) {
      setError("Apenas links do YouTube são permitidos");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = () => {
    if (validateUrl(url)) {
      onSubmit(url);
      setUrl("");
      setError("");
      onClose();
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
    if (error) setError("");
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Fechar modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

          {error && (
            <div className={styles.error}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className={styles.info}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <span>Seu progresso fica salvo automaticamente</span>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={`${styles.submitButton} ${!url.trim() ? styles.disabled : ""}`}
            onClick={handleSubmit}
            disabled={!url.trim()}
          >
            Enviar
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
