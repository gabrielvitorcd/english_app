import styles from "./Shadowing.module.css";

export function ShadowingPage() {
  const MOCK_SHADOWING = [
    "I just wanna be married again.",
    "Could you not do that?",
    "All of a sudden it hit me.",
    "You have to answer me right now.",
  ];

  return (
    <>
      <div className={styles["shad-wrap"]}>
        <div>
          <div className={styles["page-h"]}>Shadowing</div>
          <div className={styles["page-sub"]}>
            Frases que você acertou — repita e internalize
          </div>
        </div>
        {MOCK_SHADOWING.map((s, i) => (
          <div key={i} className={styles["shad-card"]}>
            <div className={styles["shad-n"]}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className={styles["shad-t"]}>{s}</div>
            <div className={styles["shad-btns"]}>
              <button className={styles["shad-btn"]}>▶</button>
              <button className={`${styles["shad-btn"]} ${styles.rec}`}>
                ●
              </button>
            </div>
          </div>
        ))}
        <div className={styles.tip}>
          💡 Ouça a frase original, pause e repita tentando imitar o ritmo e a
          entonação nativa. Foque no som, não na tradução.
        </div>
      </div>
    </>
  );
}
