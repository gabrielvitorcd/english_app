import styles from "./VideoPlayer.module.css";

export function Play({ src }: { src: string }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.background} />
      <div className={styles.container}>
        <video controls className={styles.video} poster="/src/assets/hero.png">
          <source src={src} type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
