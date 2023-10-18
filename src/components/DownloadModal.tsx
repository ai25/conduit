
import { toaster } from "@kobalte/core";
import { createEffect, createSignal, For, Show } from "solid-js";
import { videoId } from "~/routes/library/history";
import { usePreferences } from "~/stores/preferencesStore";
import Field from "./Field";
import Modal from "./Modal";
import ToastComponent from "./Toast";
import { PipedVideo, RelatedStream } from "~/types";
import VideoCard from "./VideoCard";

type Quality = {
  quality: string;
  codec: string | undefined;
  bitrate: number;
  fps: number;
  contentLength: number;
}
export default function DownloadModal(props: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  id: string;
}) {

  const [video, setVideo] = createSignal<PipedVideo | null>(null);
  const [preview, setPreview] = createSignal<RelatedStream | undefined>();
  const [qualities, setQualities] = createSignal<Quality[] | null>(null);
  const [preferences] = usePreferences();
  createEffect(async () => {
    const res = await fetch(`${preferences.instance.api_url}/streams/${props.id}`);
    const data = await res.json() as PipedVideo;
    setVideo(data);
    setPreview({
      title: data.title,
      thumbnail: data.thumbnailUrl,
      duration: data.duration,
      type: "stream",
      url: `/watch?v=${props.id}`,
      uploaderName: data.uploader,
      uploaderUrl: data.uploaderUrl,
      uploaderAvatar: data.uploaderAvatar,
      uploaderVerified: data.uploaderVerified,
      views: data.views,
      uploaded: new Date(data.uploadDate).getTime(),
    } as RelatedStream)
    if (!Array.isArray(data.videoStreams)) throw new Error("No video streams");
    setQualities(data.videoStreams.map((v) => ({
      quality: v.quality,
      codec: v.codec,
      bitrate: v.bitrate,
      fps: v.fps,
      contentLength: v.contentLength,
    })));


  });

  return (
    <Modal
      title="Download"
      isOpen={props.isOpen}
      setIsOpen={props.setIsOpen}
    >
      <div class="flex flex-col gap-2 items-center justify-center w-[90vw] max-w-3xl">
        <Show when={preview()}>
          <VideoCard v={preview()} />
        </Show>
        <Show when={qualities() && qualities()!.length > 0}>
          <div class="flex flex-col gap-2 items-center justify-center overflow-auto w-full">
            <For each={qualities()}>
              {(quality) => (
                  <div class="flex gap-2 justify-between mb-2 w-full even:bg-bg2 p-2">
                    <div class="flex flex-col gap-2 items-start justify-center text-sm">
                      <div><span class="text-text2">Quality: </span> {quality.quality}</div>
                      <div> <span class="text-text2">Codec: </span>{quality.codec}</div>
                      <div><span class="text-text2">Bitrate: </span>{(quality.bitrate / 1000).toFixed(2)} kbps</div>
                      <div> <span class="text-text2">FPS: </span>{quality.fps}</div>
                      <div> <span class="text-text2">Size: </span>{(quality.contentLength / 1000000).toFixed(2)} MB</div>
                    </div>
                    <button class="btn btn-primary" onClick={() => { }}>Download</button>
                  </div>
              )}
            </For>
          </div>
        </Show>
      </div>



    </Modal>
  )
}
