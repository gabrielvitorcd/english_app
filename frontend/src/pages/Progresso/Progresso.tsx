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
            { n: "47", l: "Falas", c: "var(--tx)" },
            { n: "31", l: "Acertos", c: "var(--green)" },
            { n: "10", l: "Vocabulário", c: "var(--gold)" },
            { n: "16", l: "Anki Phrases", c: "var(--red)" },
          ].map((s, i) => (
            <div key={i} className={styles.sc}>
              <div className={styles["sc-n"]} style={{ color: s.c }}>
                {s.n}
              </div>
              <div className={styles["sc-l"]}>{s.l}</div>
            </div>
          ))}
        </div>

        <div className={styles.cols}>
          <div className={styles.panel}>
            <div className={styles.ph}>📚 Vocabulário</div>
            <div className={styles.pb}>
              {MOCK_ANKI_VOCABULARY.map((v, i) => (
                <div key={i} className={styles.pi}>
                  <span className={styles["pi-en"]}>{v.en}</span>
                  <span className={styles["pi-sep"]}>→</span>
                  <span className={styles["pi-pt"]}>{v.pt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.ph}>🃏 Anki Phrases</div>
            <div className={styles.pb}>
              {MOCK_ANKI_PHRASE.map((a, i) => (
                <div key={i} className={styles.pi}>
                  <span className={styles["pi-ph"]}>{a.phrase}</span>
                  <span className={`${styles["bdg"]} ${styles["bdg-r"]}`}>
                    {a.tries}×
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
