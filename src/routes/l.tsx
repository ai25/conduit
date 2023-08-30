import { downloadVideo } from "~/utils/hls";
import { RelatedStream } from "../types";
import { videoId } from "./history";
import Description from "~/components/Description";
import { useContext } from "solid-js";
import { PlayerContext } from "~/root";

export default () => {
  const [video] = useContext(PlayerContext);
  return (
    <>
      <Description video={video.value} />
    </>
  );
};
