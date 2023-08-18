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
import {
  DBContext,
  InstanceContext,
  PlayerContext,
  PreferencesContext,
} from "~/root";
import { Portal, isServer } from "solid-js/web";
// const Description = lazy(() => import("~/components/Description"));
// const VideoCard = lazy(() => import("~/components/VideoCard"));
import VideoCard from "~/components/VideoCard";
import { videoId } from "./history";
import { PipedCommentResponse } from "~/components/Comment";
import { getHlsManifest } from "~/utils/hls";
import PlaylistCard from "~/components/PlaylistCard";
import { createVirtualizer } from "@tanstack/solid-virtual";

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

  const [list, setList] = createSignal<any>(undefined);
  // const videoLoaded = useSignal(false);
  // const preferences = useContext(PreferencesContext);
  // const instance = useContext(InstanceContext);
  const [db] = useContext(DBContext);

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

  const [listId, setListId] = createSignal<string | undefined>(undefined);
  createEffect(async () => {
    console.log("fetching playlist")
    setListId(route.query.list);
    if (!listId()){
      setList(undefined);
      console.log("fetching playlistno list id")
      return
    }
    console.log("fetching playlistlist id", listId())
    if (!db()) return;

    const tx = db()!.transaction("playlists", "readonly");
    const store = tx.objectStore("playlists");
    const l = await store.get(listId()!);
    setList(l);
    console.log(l);
  });
  let parentRef: HTMLDivElement;
  const rowVirtualizer = createVirtualizer({
    count: 137,
    getScrollElement: () => parentRef,
    estimateSize: () => 72,
    overscan: 5,
  });
  console.log(rowVirtualizer, "rowVirtualizer");

  return (
    <div
      // classList={{
      //   "": !theatre(),
      //   "": theatre(),
      // }}
      class="flex flex-col md:flex-row max-w-full ">
      <div classList={{ "": !preferences.theatreMode }} class="w-full">
        <div class="min-h-full max-w-full">
          <Show when={video.value} keyed>
            {(video) => <Description video={video} />}
          </Show>
        </div>
      </div>
      <div
        classList={{
          "md:min-w-[22rem] md:w-[22rem] md:max-w-[29rem] h-full": !preferences.theatreMode,
        }}
        class="flex min-w-0 flex-col items-center gap-2">
        <div
          classList={{
            "lg:absolute lg:top-10 lg:right-0 -mx-2 mx-auto": !preferences.theatreMode,
            "lg:pl-4 md:mr-4": preferences.theatreMode,
          }}>
          <Show when={list()} keyed>
            {(list) => (
              <div class="overflow-hidden rounded-xl mx-2 mr-3 my-4 ">
              <div
                ref={parentRef}
                class="flex flex-col gap-2 min-w-full md:min-w-[20rem] w-full bg-bg2 max-h-[30rem] px-1 overflow-y-auto scrollbar">
                <h3 class="text-lg font-bold sm:text-xl ">{list.name}</h3>
                {/* <For each={rowVirtualizer.getVirtualItems()}>
                  {(item, index) => {
                    return (
                     <div
                     style={{
                       width: '100%',
                       height: `${item.size}px`,
                       transform: `translateY(${item.start}px)`,
                     }}
                   >
                      <PlaylistCard
                        list={list.id}
                        index={index() + 1}
                        v={list.videos[index()]}
                        active={route.query.index}
                      />
                   </div>
                    );
                  }}
                </For> */}
                <For each={list.videos}>
                  {(item, index) => {
                    return (
                      <PlaylistCard
                        list={list.id}
                        index={index() + 1}
                        v={item}
                        active={route.query.index}
                      />
                    );
                  }}
                </For>
              </div></div>
            )}
          </Show>
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
