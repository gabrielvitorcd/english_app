import { useState } from "react";
import styles from "./SourceCard.module.css";

export interface Source {
  id: string;
  path: string;
  label: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  accentDim: string;
  badge: string;
  badgeIcon: string;
  number: string;
}

interface SourceCardProps {
  source: Source;
  index: number;
  onNavigate: (path: string) => void;
}

export function SourceCard({ source, index, onNavigate }: SourceCardProps) {
  const [, setHovered] = useState(false);

  return (
    <button
      className={styles.card}
      style={
        {
          "--accent": source.accent,
          "--accent-dim": source.accentDim,
          animationDelay: `${index * 120}ms`,
        } as React.CSSProperties
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onNavigate(source.path)}
      aria-label={`Ir para ${source.label}`}
    >
      <div className={styles.top}>
        <div className={styles.iconWrap}>
          <div className={styles.icon}>{source.icon}</div>
        </div>

        <div className={styles.badge}>
          <span className={styles.badgeIcon}>{source.badgeIcon}</span>
          {source.badge}
        </div>
      </div>

      <div className={styles.body}>
        <h2 className={styles.label}>{source.label}</h2>
        <p className={styles.tagline}>{source.tagline}</p>
        <p className={styles.description}>{source.description}</p>
      </div>

      <div className={styles.footer}>
        <span className={styles.cta}>
          Começar
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
        </span>

        <span className={styles.path}>{source.path}</span>
      </div>

      <div className={styles.glow} />
    </button>
  );
}
