import { createQuery, isServer } from "@tanstack/solid-query";
import { createEffect, createSignal, For, Match, Show, Suspense, Switch } from "solid-js";
import { useSearchParams } from "solid-start";
import { usePreferences } from "~/stores/preferencesStore";
import { RelatedPlaylist } from "~/types";
import api from "~/utils/api";
import { useSyncStore } from "~/stores/syncStore";
import VideoCard from "./content/stream/VideoCard";
import PlaylistCard from "./content/playlist/PlaylistCard";

export default function RelatedVideos() {
  const [v, setV] = createSignal<string | undefined>(undefined);
  const [preferences] = usePreferences();
  const [searchParams] = useSearchParams();
  createEffect(() => {
    if (!searchParams.v) return;
    setV(searchParams.v);
  });
  const sync = useSyncStore();



  const videoQuery = createQuery(() => ({
    queryKey: ["streams", v(), preferences.instance.api_url],
    queryFn: () => api.fetchVideo(v(), preferences.instance.api_url),
    enabled: (v() && preferences.instance.api_url) ? true : false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    cacheTime: Infinity,
    staleTime: 100 * 60 * 1000,
    deferStream: true
  }));
  return (
    <Show
      when={videoQuery.data}
      fallback={<For each={Array(20).fill(0)}>{() => <VideoCard />}</For>}>
          <div class="w-full max-w-max md:max-w-min">
            <For each={videoQuery.data?.relatedStreams
                  // blocklist
                  .filter(
                    (item) =>
                      !sync.store.blocklist[item?.uploaderUrl?.split("/").pop()!]
                  )
        }>
              {(stream) => {
                return (
                  <Switch>
                    <Match when={stream.type === "stream"}>
                      <VideoCard v={stream}
                        layout="sm:grid"
                      />
                    </Match>
                    <Match when={stream.type === "playlist"}>
                      <PlaylistCard
                        item={stream as unknown as RelatedPlaylist}
                      />
                    </Match>
                  </Switch>
                );
              }}
            </For>
          </div>
    </Show>
  );
}
