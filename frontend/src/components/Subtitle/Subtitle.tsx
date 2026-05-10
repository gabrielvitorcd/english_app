import { useState } from "react";
import { type Cue } from "../useSrt/useSrt";
import { lookup } from "../useSrt/dict";
import { translateWord } from "../useSrt/translator";
import styles from "./Subtitle.module.css";

interface SubtitleProps {
  cue: Cue | null;
  overlay?: boolean;
}

export function Subtitle({ cue, overlay = true }: SubtitleProps) {
  const [selWord, setSelWord] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const isVisible = true;

  const words = cue?.text.split(/\s+/) ?? [];

  const clickWord = async (w: string) => {
    const clean = w.replace(/[.,!?'"]/g, "").toLowerCase();
    if (selWord === clean) {
      setSelWord(null);
      return;
    }

    setSelWord(clean);

    let translation = lookup(clean);

    if (!translation && !translations[clean]) {
      setLoading(clean);
      const apiTranslation = await translateWord(clean);
      setLoading(null);

      if (apiTranslation) {
        setTranslations((prev) => ({ ...prev, [clean]: apiTranslation }));
      }
    }
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
          const translation = lookup(clean) ?? translations[clean];
          return (
            <span
              key={i}
              className={`${styles.word} ${isSel ? styles.sel : ""}`}
              onClick={() => clickWord(w)}
            >
              {w}
              {isSel && loading === clean && (
                <span className={styles.tip}>...</span>
              )}
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
