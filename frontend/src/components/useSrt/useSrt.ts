import { useState, useEffect, type RefObject } from "react";

export interface Cue {
  start: number;
  end: number;
  text: string;
}

function parseSrt(raw: string): Cue[] {
  const blocks = raw.trim().split(/\n\s*\n/);
  return blocks.flatMap((block) => {
    const lines = block.trim().split("\n");
    if (lines.length < 3) return [];
    const match = lines[1].match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/,
    );
    if (!match) return [];
    const toSec = (h: string, m: string, s: string, ms: string) =>
      +h * 3600 + +m * 60 + +s + +ms / 1000;
    return [
      {
        start: toSec(match[1], match[2], match[3], match[4]),
        end: toSec(match[5], match[6], match[7], match[8]),
        text: lines
          .slice(2)
          .join(" ")
          .replace(/<[^>]+>/g, ""),
      },
    ];
  });
}

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
