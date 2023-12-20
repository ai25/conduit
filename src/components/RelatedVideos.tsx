import { createQuery, isServer } from "@tanstack/solid-query";
import { createEffect, createSignal, For, Match, Show, Suspense, Switch } from "solid-js";
import { useSearchParams } from "solid-start";
import { usePreferences } from "~/stores/preferencesStore";
import { RelatedPlaylist } from "~/types";
import api from "~/utils/api";
import PlaylistCard from "./PlaylistCard";
import VideoCard from "./VideoCard";

export default function RelatedVideos() {
  const [v, setV] = createSignal<string | undefined>(undefined);
  const [preferences] = usePreferences();
  const [searchParams] = useSearchParams();
  createEffect(() => {
    if (!searchParams.v) return;
    setV(searchParams.v);
  });


  const videoQuery = createQuery(
    () => ["streams", v(), preferences.instance.api_url],
    () => api.fetchVideo(v(), preferences.instance.api_url),
    {
      get enabled() {
        return preferences.instance?.api_url &&
          !isServer &&
          v()
          ? true
          : false;
      },
      refetchOnReconnect: false,
      refetchOnMount: false,
      staleTime: 100 * 60 * 1000,
      cacheTime: Infinity,
    }
  );

  return (
    <Suspense
      fallback={<For each={Array(20).fill(0)}>{() => <VideoCard />}</For>}>
      <Show
        when={videoQuery.data}
        fallback={<For each={Array(20).fill(0)}>{() => <VideoCard />}</For>}>
        <Show when={videoQuery.data!.relatedStreams}>
          <div class="w-full max-w-max md:max-w-min">
            <For each={videoQuery.data!.relatedStreams}>
              {(stream) => {
                return (
                  <Switch>
                    <Match when={stream.type === "stream"}>
                      <VideoCard v={stream}
                        layout="list"
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
      </Show>
    </Suspense>
  );
}
