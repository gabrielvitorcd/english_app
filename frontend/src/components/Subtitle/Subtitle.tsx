import { useState } from "react";
import { type Cue } from "../useSrt/useSrt";
import { lookup } from "../useSrt/dict";
import styles from "./Subtitle.module.css";

interface SubtitleProps {
  cue: Cue | null;
  overlay?: boolean;
}

export function Subtitle({ cue, overlay = true }: SubtitleProps) {
  const [selWord, setSelWord] = useState<string | null>(null);

  const isVisible = true;

  const words = cue?.text.split(/\s+/) ?? [];

  const clickWord = (w: string) => {
    const clean = w.replace(/[.,!?'"]/g, "").toLowerCase();
    setSelWord((prev) => (prev === clean ? null : clean));
  };

  if (!cue) return null;

  return (
    <div
      className={`${styles.wrap} ${overlay ? styles.overlay : styles.block}`}
    >
      <div className={`${styles.line} ${!isVisible ? styles.hidden : ""}`}>
        {words.map((w, i) => {
          const clean = w.replace(/[.,!?'"]/g, "").toLowerCase();
          const isSel = selWord === clean;
          const translation = lookup(clean);
          return (
            <span
              key={i}
              className={`${styles.word} ${isSel ? styles.sel : ""}`}
              onClick={() => clickWord(w)}
            >
              {w}
              {isSel && translation && (
                <span className={styles.tip}>{translation}</span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
