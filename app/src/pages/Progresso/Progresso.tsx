import { ArrowRight, BookOpen, Layers } from "lucide-react";
import { Chip } from "../../components/ui";
import styles from "./Progresso.module.css";

export function ProgressoPage() {
  const MOCK_ANKI_VOCABULARY = [
    { en: "all of a sudden", pt: "de repente" },
    { en: "hurting", pt: "machucando" },
    { en: "out loud", pt: "em voz alta" },
    { en: "go through", pt: "passar por" },
    { en: "answer", pt: "responder" },
    { en: "angry", pt: "nervoso" },
  ];

  const MOCK_ANKI_PHRASE = [
    { phrase: "Could you not do that?", tries: 3 },
    { phrase: "I'm fine, just a little nervous.", tries: 2 },
  ];

  return (
    <>
      <div className={styles.page}>
        <div>
          <div className={styles["page-h"]}>Progresso</div>
          <div className={styles["page-sub"]}>S01E01 · Central Perk</div>
        </div>

        <div className={styles.stats}>
          {/* Inserir Dados Reais do Player */}
          {[
            { n: "47", l: "Falas", c: "var(--text)" },
            { n: "31", l: "Acertos", c: "var(--success)" },
            { n: "10", l: "Vocabulário", c: "var(--accent-text)" },
            { n: "16", l: "Anki Phrases", c: "var(--danger)" },
          ].map((s, i) => (
            <div key={i} className={`card ${styles.sc}`}>
              <div className={`num ${styles["sc-n"]}`} style={{ color: s.c }}>
                {s.n}
              </div>
              <div className={styles["sc-l"]}>{s.l}</div>
            </div>
          ))}
        </div>

        <div className={styles.cols}>
          <div className={`card ${styles.panel}`}>
            <div className={styles.ph}>
              <BookOpen className={styles.phIcon} aria-hidden="true" />
              Vocabulário
            </div>
            <div className={styles.pb}>
              {MOCK_ANKI_VOCABULARY.map((v, i) => (
                <div key={i} className={styles.pi}>
                  <span className={styles["pi-en"]}>{v.en}</span>
                  <ArrowRight className={styles["pi-sep"]} aria-hidden="true" />
                  <span className={styles["pi-pt"]}>{v.pt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`card ${styles.panel}`}>
            <div className={styles.ph}>
              <Layers className={styles.phIcon} aria-hidden="true" />
              Anki Phrases
            </div>
            <div className={styles.pb}>
              {MOCK_ANKI_PHRASE.map((a, i) => (
                <div key={i} className={styles.pi}>
                  <span className={styles["pi-ph"]}>{a.phrase}</span>
                  <Chip tone="danger" className={`num ${styles["bdg"]}`}>
                    {a.tries}×
                  </Chip>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
