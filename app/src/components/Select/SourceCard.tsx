import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Chip } from "../ui";
import styles from "./SourceCard.module.css";

export interface Source {
  id: string;
  path: string;
  label: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  badgeIcon: LucideIcon;
  number: string;
}

interface SourceCardProps {
  source: Source;
  index: number;
  onNavigate: (path: string) => void;
}

export function SourceCard({ source, index, onNavigate }: SourceCardProps) {
  const [, setHovered] = useState(false);
  const BadgeIcon = source.badgeIcon;

  return (
    <button
      className={`card card--lg card--interactive ${styles.card}`}
      // --i é a posição do cartão: o atraso da entrada é calc(var(--i) * var(--stagger)) no CSS
      style={{ "--i": index } as React.CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onNavigate(source.path)}
      aria-label={`Ir para ${source.label}`}
    >
      <div className={styles.top}>
        <div className={styles.iconWrap}>
          <div className={styles.icon}>{source.icon}</div>
        </div>

        <Chip className={styles.badge}>
          <BadgeIcon aria-hidden="true" />
          {source.badge}
        </Chip>
      </div>

      <div className={styles.body}>
        <h2 className={styles.label}>{source.label}</h2>
        <p className={styles.tagline}>{source.tagline}</p>
        <p className={styles.description}>{source.description}</p>
      </div>

      <div className={styles.glow} />
    </button>
  );
}
