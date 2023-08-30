import Description from "~/components/Description";
import {
  Show,
  createEffect,
  createSignal,
  onMount,
  untrack,
  useContext,
} from "solid-js";
import { useLocation } from "solid-start";
import { For } from "solid-js";
import {
  DBContext,
  InstanceContext,
  PlayerContext,
  PreferencesContext,
  SolidStoreContext,
} from "~/root";
import VideoCard from "~/components/VideoCard";
import { videoId } from "./history";
import { getHlsManifest } from "~/utils/hls";
import PlaylistItem from "~/components/PlaylistItem";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { fetchJson } from "~/utils/helpers";
import { usePlaylist } from "~/stores/playlistStore";
import { SyncedDB } from "~/stores/syncedStore";
import type { Virtualizer } from "@tanstack/virtual-core";
import Button from "~/components/Button";
import { useAppState } from "~/stores/appStateStore";

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

  const [playlist, setPlaylist] = usePlaylist();
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

  const [appState, setAppState] = useAppState();

  createEffect(async () => {
    const v = route.query.v;
    console.log(v, "v");
    if (!v) return;
    const origin = new URL(instance()).hostname.split(".").slice(-2).join(".");
    const newOrigin = untrack(() =>
      new URL(video.value?.hls ?? "https://example.com").hostname
        .split(".")
        .slice(-2)
        .join(".")
    );
    const id = untrack(() => videoId(video.value));

    console.log(origin, newOrigin, "HOSTS");
    console.log("fetching video");
    if (id === v && origin === newOrigin) {
      console.log("video already loaded");
      return;
    }
    setAppState({ loading: true });
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
    } finally {
      setAppState({ loading: false });
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
  const isLocalPlaylist = () => route.query.list?.startsWith("conduit-");
  createEffect(() => {
    if (!route.query.list) {
      setPlaylist(undefined);
      return;
    }
  });

  createEffect(async () => {
    if (!route.query.list) return;
    if (isLocalPlaylist()) return;
    const json = await fetchJson(`${instance()}/playlists/${route.query.list}`);
    setPlaylist({ ...json, id: route.query.list });
    console.log(json);
  });
  const solidStore = useContext(SolidStoreContext);
  createEffect(async () => {
    if (!route.query.list) {
      setPlaylist(undefined);
      console.log("fetching playlistno list id");
      return;
    }
    if (!isLocalPlaylist()) return;
    console.log("fetching playlist");
    setListId(route.query.list);
    console.log("fetching playlistlist id", listId());
    if (!solidStore()) return;
    const list = SyncedDB.playlists.findUnique(solidStore()!, route.query.list);
    console.log("setting playlist", list);
    setPlaylist(list);

    // if (!db()) return;

    // const tx = db()!.transaction("playlists", "readonly");
    // const store = tx.objectStore("playlists");
    // const l = await store.get(listId()!);
    // setPlaylist(l);
    // console.log(l);
  });
  const [parentRef, setParentRef] = createSignal<HTMLDivElement | undefined>(
    undefined
  );
  const [rowVirtualizer, setRowVirtualizer] = createSignal<Virtualizer<
    HTMLDivElement,
    any
  > | null>(null);
  createEffect(() => {
    if (!playlist()) return;
    setRowVirtualizer(
      createVirtualizer({
        count: playlist()!.relatedStreams.length,
        getScrollElement: () => parentRef()!,
        estimateSize: () => 85,
        overscan: 5,
        debug: true,
        // initialOffset: 85 * (Number(route.query.index) - 1),
      })
    );
  });
  createEffect(() => {
    if (!route.query.index) return;
    if (!parentRef()) return;
    if (!rowVirtualizer()) return;
    console.log("scrolling");
    requestAnimationFrame(() => {
      rowVirtualizer()!.scrollToIndex(Number(route.query.index) - 1);
    });
  });

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
          "md:min-w-[22rem] md:w-[22rem] md:max-w-[29rem] h-full":
            !preferences.theatreMode,
        }}
        class="flex min-w-0 flex-col items-center gap-2">
        <div
          classList={{
            "lg:absolute lg:top-10 lg:right-0":
              !preferences.theatreMode,
            "lg:pl-4 md:mr-4": preferences.theatreMode,
          }}>
          <Show when={playlist()} keyed>
            {(list) => (
              <Show when={rowVirtualizer()} fallback={<div>Loading</div>}>
                <div class="overflow-hidden rounded-xl mx-2 mr-3 my-4 ">
                  <div
                    ref={(ref) => setParentRef(ref)}
                    class="relative flex flex-col gap-2 min-w-full md:min-w-[20rem] w-full bg-bg2 max-h-[30rem] px-1 overflow-y-auto scrollbar">
                    <h3 class="sticky text-lg font-bold sm:text-xl ">
                      {list.name}
                    </h3>
                    <div
                      style={{
                        height: `${rowVirtualizer()!.getTotalSize()}px`,
                        width: "100%",
                        position: "relative",
                      }}>
                      <For each={rowVirtualizer()!.getVirtualItems()}>
                        {(item) => {
                          return (
                            <div
                              style={{
                                width: "100%",
                                height: `${item.size}px`,
                                position: "absolute",
                                top: 0,
                                left: 0,
                                transform: `translateY(${item.start}px)`,
                              }}>
                              <PlaylistItem
                                list={route.query.list}
                                index={item.index + 1}
                                v={list.relatedStreams[item.index]}
                                active={route.query.index ?? 1}
                              />
                            </div>
                          );
                        }}
                      </For>
                    </div>
                    {/* <For each={list.relatedStreams}>
                    {(item, index) => {
                      return (
                        <PlaylistItem
                          list={route.query.list}
                          index={index() + 1}
                          v={item}
                          active={route.query.index ?? 1}
                        />
                      );
                    }}
                  </For> */}
                  </div>
                </div>
              </Show>
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
