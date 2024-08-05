import { Title } from "@solidjs/meta";
import { createEffect, createSignal, For } from "solid-js";
import VideoCard from "~/components/content/stream/VideoCard";
import { usePreferences } from "~/stores/preferencesStore";
import { PipedVideo } from "~/types";
import { generateThumbnailUrl, getVideoId } from "~/utils/helpers";

export default function Downloads() {
  const [videos, setVideos] = createSignal<Array<PipedVideo>>([]);
  const [preferences] = usePreferences();
  const getVideos = async () => {
    const root = await navigator.storage.getDirectory();
    const allVideosDir = await root.getDirectoryHandle("__videos");
    console.log(allVideosDir, "allVideosDir");
    for await (const entry of (allVideosDir as any).values()) {
      if (entry.kind === "directory") {
        try {
          console.log(entry, "allVideosDir");
          const completed = await entry.getFileHandle("completed");
          console.log(completed, "completed");
          if (!completed) continue;
          const stream = await entry.getFileHandle("streams.json");
          if (!stream) continue;
          const file = await stream.getFile();
          const data = await file.text();
          const json = JSON.parse(data);
          const thumbnailFileHandle = await entry.getFileHandle("thumbnail");
          let thumbnailUrl = "";
          if (thumbnailFileHandle) {
            const thumbnailFile = await thumbnailFileHandle.getFile();
            thumbnailUrl = URL.createObjectURL(thumbnailFile);
          }
          setVideos((v) => [...v, { ...json, id: entry.name, thumbnailUrl }]);
          console.log(videos(), "videos()");
        } catch (e) {
          console.error(e);
          continue;
        }
      }
    }
  };
  createEffect(() => {
    getVideos();
  });
  return (
    <>
      <Title>Downloads</Title>
      <div class="flex flex-wrap justify-center">
        <For each={videos()}>
          {(video) => (
            <VideoCard
              v={{
                ...video,
                url: `/watch?v=${getVideoId(video)}`,
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
