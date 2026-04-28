import { Play } from "../../components/PlayerVideo/VideoPlayer";

export function PlayerPage() {
  const videoUrl = "/videos/friends/friends1x01.mp4";

  return (
    <>
      <Play src={videoUrl} />
    </>
  );
}
