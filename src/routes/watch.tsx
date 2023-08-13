import { PipedVideo } from "~/types";
// import {
//   DBContext,
//   InstanceContext,
//   PlayerContext,
//   PreferencesContext,
//   getStorageValue,
//   setStorageValue,
// } from "../layout";
import Description from "~/components/Description";
import {
  Match,
  Show,
  Suspense,
  Switch,
  createEffect,
  createRenderEffect,
  createResource,
  createSignal,
  lazy,
  onCleanup,
  onMount,
  untrack,
  useContext,
} from "solid-js";
import {
  RouteDataArgs,
  createRouteData,
  useLocation,
  useRouteData,
} from "solid-start";
import { For } from "solid-js";
import { reconcile } from "solid-js/store";
import { InstanceContext, PlayerContext, PreferencesContext } from "~/root";
import { Portal, isServer } from "solid-js/web";
// const Description = lazy(() => import("~/components/Description"));
// const VideoCard = lazy(() => import("~/components/VideoCard"));
import VideoCard from "~/components/VideoCard";
import { videoId } from "./history";
import { PipedCommentResponse } from "~/components/Comment";
import { getHlsManifest } from "~/utils/hls";

export function extractVideoId(url: string | undefined): string | undefined {
  let id;
  if (url?.includes("/watch?v=")) {
    id = url.split("/watch?v=")[1];
  } else {
    id = url?.match("vi(?:_webp)?/([a-zA-Z0-9_-]{11})")?.[1];
  }
  return id ?? undefined;
}
export async function fetchWithTimeout(
  resource: string,
  options: RequestInit & { timeout: number } = { timeout: 800 }
) {
  const { timeout } = options;

  const controller = new AbortController();
  const id = setTimeout(() => {
    console.log("aborting");
    controller.abort(`Request exceeded timeout of ${timeout}ms.`);
  }, timeout);
  console.log("fetching", controller.signal);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}

export default function Watch() {
  console.log(new Date().toISOString().split("T")[1], "rendering watch page");

  const [video, setVideo] = useContext(PlayerContext);
  const [instance] = useContext(InstanceContext);
  const [preferences] = useContext(PreferencesContext);
  const route = useLocation();
  // const videoLoaded = useSignal(false);
  // const preferences = useContext(PreferencesContext);
  // const instance = useContext(InstanceContext);
  // const db = useContext(DBContext);

  async function fetchLocalVideo() {
    const rootDir = await navigator.storage.getDirectory();
    const dir = await rootDir.getDirectoryHandle(route.query.v);
    console.log("DIR", dir.getFileHandle("streams.json"));
    if (!dir) {
      console.log("no dir");
      return 0;
    }
    try {
      const videoInfoHandle = await dir.getFileHandle("streams.json");
      console.log(videoInfoHandle);
      const file = await (await videoInfoHandle.getFile()).text();
      console.log(file);
      const video = JSON.parse(file);
      console.log(video);
      const hls = await getHlsManifest(route.query.v);
      console.log(hls);
      setVideo({ value: { ...video, hls }, error: undefined });
      return 1;
    } catch (error) {
      console.error(error);
      return 0;
    }
  }

  createEffect(async () => {
    const v = route.query.v;
    console.log(v, "v");
    if (!v) return;
    if (untrack(() => videoId(video.value)) === v) {
      console.log("video already loaded");
      return;
    }
    const rootDir = await navigator.storage.getDirectory();
    if (rootDir) {
      try {
        const dir = await rootDir.getDirectoryHandle(v);
        console.log(dir);
        if (await fetchLocalVideo()) {
          console.log("DIRECTORY");
          return;
        }
      } catch (e) {
        console.info(e);
      }
    }
    const abortController = new AbortController();
    let data;

    try {
      const res = await fetch(`${instance()}/streams/${v}`, {
        signal: abortController.signal,
      });
      data = await res.json();
      if (data.error) throw new Error(data.error);
      console.log(data, "data");
      // const url = await getHlsManifest("VpWkcFsZ2Zs");
      // console.log(url, "URL");
      // setVideo({ value: { ...data, hls: url }, error: undefined });
      setVideo({ value: data, error: undefined });
    } catch (err) {
      setVideo({ value: undefined, error: err as Error });
      console.log(err, "error while fetching video");
    }
  });
  createEffect(() => {
    if (!video.value) return;
    if ("window" in globalThis) {
      console.log("setting title");
      document.title = `${video.value?.title} - Conduit`;
    }
  });

  const [theatre, setTheatre] = createSignal(true);
  createEffect(() => {
    console.log(
      "render effect in watch page, theatre is:",
      preferences.theatreMode
    );
    setTheatre(preferences.theatreMode);
    console.log("theatre() is set to ", theatre());
  });

  return (
    <div
      // classList={{
      //   "": !theatre(),
      //   "": theatre(),
      // }}
      class="flex flex-col md:flex-row max-w-full ">
      <div classList={{ "": !theatre() }} class="w-full">
        <div class="min-h-full max-w-full">
          <Show when={video.value} keyed>
            {(video) => <Description video={video} />}
          </Show>
        </div>
      </div>
      <div
        classList={{
          "md:min-w-[22rem] md:w-[22rem] md:max-w-[22rem] h-full": !theatre(),
        }}
        class="flex min-w-0 flex-col items-center gap-2 bg-red-500">
        <div
          classList={{
            "lg:absolute lg:top-10 lg:right-0 -mx-2": !theatre(),
          }}>
          <Show
            when={video.value}
            keyed
            fallback={
              <For each={Array(20).fill(0)}>{() => <VideoCard />}</For>
            }>
            {(video) => (
              <For each={video?.relatedStreams}>
                {(stream) => {
                  return <VideoCard v={stream} />;
                }}
              </For>
            )}
          </Show>
        </div>
      </div>
    </div>
  );
}
