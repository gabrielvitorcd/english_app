import { forwardRef } from "react";
import styles from "./VideoPlayer.module.css";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  children?: React.ReactNode;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ src, poster, children }, ref) => {
    return (
      <div className={styles.box}>
        <video
          ref={ref}
          className={styles.video}
          poster={poster}
          controls
          autoPlay
          loop
          playsInline /* Importante para autoplay em navegadores mobile (iOS) */
        >
          <source src={src} type="video/mp4" />
        </video>
        {children}
      </div>
    );
  },
);

VideoPlayer.displayName = "VideoPlayer";
