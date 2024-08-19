import { Title } from "@solidjs/meta";
import { createEffect, createSignal, For } from "solid-js";
import VideoCard from "~/components/content/stream/VideoCard";
import { usePreferences } from "~/stores/preferencesStore";
import { PipedVideo } from "~/types";
import { generateThumbnailUrl, getVideoId } from "~/utils/helpers";
import { getDownloadedOPFSVideos } from "~/utils/opfs-helpers";

export default function Downloads() {
  const [videos, setVideos] = createSignal<Array<PipedVideo>>([]);
  createEffect(() => {
    getDownloadedOPFSVideos().then((videos) => {
      setVideos(videos);
    });
  });
  return (
    <>
      <Title>Downloads</Title>
      <div class="flex flex-wrap justify-center">
        <For each={videos()}>
          {(video, index) => (
            <VideoCard
              v={{
                ...video,
                url: `/watch?v=${getVideoId(video)}&offline=true&list=DL&index=${index() + 1}`,
                type: "stream",
                thumbnail: video.thumbnailUrl,
                uploaderName: video.uploader,
                uploadedDate: video.uploadDate,
                shortDescription: "",
                uploaded: new Date(video.uploadDate).getTime(),
                isShort: false,
              }}
            />
          )}
        </For>
      </div>
    </>
  );
}
