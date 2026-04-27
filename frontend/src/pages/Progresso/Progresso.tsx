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
          <div className="page-h">Progresso</div>
          <div className="page-sub">S01E01 · Central Perk</div>
        </div>

        <div className="stats">
          {/* Inserir Dados Reais do Player */}
          {[
            { n: "47", l: "Falas", c: "var(--tx)" },
            { n: "31", l: "Acertos", c: "var(--green)" },
            { n: "10", l: "Vocabulário", c: "var(--gold)" },
            { n: "16", l: "Anki Phrases", c: "var(--red)" },
          ].map((s, i) => (
            <div key={i} className="sc">
              <div className="sc-n" style={{ color: s.c }}>
                {s.n}
              </div>
              <div className="sc-l">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="cols">
          <div className="panel">
            <div className="ph">📚 Vocabulário</div>
            <div className="pb">
              {MOCK_ANKI_VOCABULARY.map((v, i) => (
                <div key={i} className="pi">
                  <span className="pi-en">{v.en}</span>
                  <span className="pi-sep">→</span>
                  <span className="pi-pt">{v.pt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="ph">🃏 Anki Phrases</div>
            <div className="pb">
              {MOCK_ANKI_PHRASE.map((a, i) => (
                <div key={i} className="pi">
                  <span className="pi-ph">{a.phrase}</span>
                  <span className="bdg bdg-r">{a.tries}×</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
