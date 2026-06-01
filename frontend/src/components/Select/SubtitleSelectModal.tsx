import styles from "./SubtitleSelectModal.module.css";

export interface SubtitleInfo {
  language_code: string;
  language_name: string;
  is_auto_generated: boolean;
}

export interface SubtitleSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (languageCode: string) => void;
  subtitles: SubtitleInfo[];
  videoTitle?: string;
  isLoading?: boolean;
}

const getFlag = (code: string): string => {
  const flags: Record<string, string> = {
    en: "🇺🇸",
    es: "🇪🇸",
    fr: "🇫🇷",
    de: "🇩🇪",
    it: "🇮🇹",
    pt: "🇵🇹",
    ja: "🇯🇵",
    ko: "🇰🇷",
    zh: "🇨🇳",
    ru: "🇷🇺",
    ar: "🇸🇦",
    hi: "🇮🇳",
  };
  return flags[code] || "🌐";
};

export function SubtitleSelectModal({
  isOpen,
  onClose,
  onSelect,
  subtitles,
  videoTitle,
  isLoading = false,
}: SubtitleSelectModalProps) {
  if (!isOpen) return null;

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
          <h2 className={styles.title}>Selecionar Legenda</h2>
          {videoTitle && <p className={styles.subtitle}>{videoTitle}</p>}
        </div>

        {isLoading ? (
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
            <span>Buscando legendas disponíveis...</span>
          </div>
        ) : subtitles.length > 0 ? (
          <div className={styles.content}>
            <p className={styles.info}>
              {subtitles.length} legenda{subtitles.length !== 1 ? "s" : ""}{" "}
              disponível{subtitles.length !== 1 ? "is" : ""}
            </p>
            <ul className={styles.list}>
              {subtitles.map((sub) => (
                <li key={sub.language_code}>
                  <button
                    className={styles.item}
                    onClick={() => onSelect(sub.language_code)}
                  >
                    <span className={styles.flag}>
                      {getFlag(sub.language_code)}
                    </span>
                    <div className={styles.info}>
                      <span className={styles.language}>
                        {sub.language_name}
                      </span>
                      {sub.is_auto_generated && (
                        <span className={styles.badge}>Auto-gerada</span>
                      )}
                    </div>
                    <svg
                      className={styles.arrow}
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className={styles.empty}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <p>Nenhuma legenda encontrada para este vídeo</p>
          </div>
        )}
      </div>
    </div>
  );
}
