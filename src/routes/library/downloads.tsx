import { createEffect, createSignal, For } from "solid-js";
import VideoCard from "~/components/VideoCard";
import { usePreferences } from "~/stores/preferencesStore";
import { PipedVideo } from "~/types";
import { generateThumbnailUrl } from "~/utils/helpers";
import { videoId } from "./history";

export default function Downloads() {
  const [videos, setVideos] = createSignal<Array<PipedVideo>>([]);
  const [preferences] = usePreferences();
  createEffect(async () => {
    const root = await navigator.storage.getDirectory();
    console.log(root, Object.keys(root));
    const downloaded = JSON.parse(localStorage.getItem("downloaded") || "[]");
    for (const id of downloaded) {
      const dir = await root.getDirectoryHandle(id, { create: false });
      if (!dir) continue;
      console.log(dir);
      const stream = await dir.getFileHandle("streams.json", { create: false });
      if (!stream) continue;
      const file = await stream.getFile();
      const json = await file.text();
      const data = JSON.parse(json);
      console.log(data);
      setVideos((v) => [...v, { ...data, id }]);
    }
  });
  return (
    <>
      <h1 class="text-xl">Downloads</h1>
      <div class="flex flex-wrap justify-center">
        <For each={videos()}>
          {(video) => (
            <VideoCard
              v={{
                ...video,
                url: `/watch?v=${videoId(video)}`,
                type: "stream",
                thumbnail: generateThumbnailUrl(
                  preferences.instance.image_proxy_url,
                  videoId(video)
                ),
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
