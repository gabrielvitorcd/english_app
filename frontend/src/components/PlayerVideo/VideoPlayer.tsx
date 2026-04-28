import styles from "./VideoPlayer.module.css";

export function Play() {
  return (
    <>
      <div className={styles["video-col"]}>
        <div className={styles["video-bg"]} />
        <div className={styles["video-placeholder"]}>
          <div className={styles["video-icon"]}>◈</div>
          <div className={styles["video-lbl"]}>VIDEO</div>
        </div>
      </div>
    </>
  );
}
