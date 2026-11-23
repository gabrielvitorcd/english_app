import { useState, useEffect, type RefObject } from "react";
import { parseSrt, type SrtCue } from "../../lib/srt";

// Cue e mantido como alias de SrtCue pra nao quebrar quem ja importa daqui
// (Subtitle.tsx). Nova sessao (Passo 5) usa SrtCue diretamente do lib.
export type Cue = SrtCue;

export function useSrt(
  videoRef: RefObject<HTMLVideoElement | null>,
  srtSrc?: string,
) {
  const [cues, setCues] = useState<Cue[]>([]);
  const [currentCue, setCurrentCue] = useState<Cue | null>(null);

  useEffect(() => {
    if (!srtSrc) return;
    fetch(srtSrc)
      .then((r) => r.text())
      .then((raw) => setCues(parseSrt(raw)))
      .catch(() => console.warn("SRT not found:", srtSrc));
  }, [srtSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || cues.length === 0) return;
    const onTime = () => {
      const t = video.currentTime;
      const found = cues.find((c) => t >= c.start && t <= c.end) ?? null;
      setCurrentCue((prev) => (prev?.text === found?.text ? prev : found));
    };
    video.addEventListener("timeupdate", onTime);
    return () => video.removeEventListener("timeupdate", onTime);
  }, [cues, videoRef]);

  return { currentCue };
}
