import { useRef } from "react";
import { VideoPlayer } from "../../components/PlayerVideo/VideoPlayer";
import { Subtitle } from "../../components/Subtitle/Subtitle";
import { useSrt } from "../../components/useSrt/useSrt";

const VIDEO_SRC = "/videos/friends/friends1x01.mp4";
const SRT_SRC = "/videos/friends/friends1x01.srt";

export function PlayerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { currentCue } = useSrt(videoRef, SRT_SRC);

  return (
    <VideoPlayer ref={videoRef} src={VIDEO_SRC}>
      <Subtitle cue={currentCue} overlay />
    </VideoPlayer>
  );
}
