import numeral from "numeral";
import { createRenderEffect, For } from "solid-js";
import {
  createEffect,
  createSignal,
  onMount,
  Show,
  useContext,
} from "solid-js";
import { Title, useLocation } from "solid-start";
import { Playlist as PlaylistType, RelatedStream } from "~/types";
import { fetchJson } from "~/utils/helpers";
import { useSyncStore } from "~/stores/syncStore";
import { createQuery } from "@tanstack/solid-query";
import { usePreferences } from "~/stores/preferencesStore";
import PlaylistItem from "~/components/content/playlist/PlaylistItem";

export default function Playlist() {
  const [list, setList] = createSignal<PlaylistType>();
  const route = useLocation();
  const isLocal = () => route.query.list?.startsWith("conduit-");
  const id = route.query.list;
  const sync = useSyncStore();
  const [preferences] = usePreferences();

  createEffect(async () => {
    if (!id) return;
    if (!isLocal()) return;
    await new Promise((r) => setTimeout(r, 100));
    const l = sync.store.playlists[id];
    setList(l);
  });
  const query = createQuery(() => ({
    queryKey: ["playlist"],
    queryFn: async (): Promise<PlaylistType> =>
      (await fetch(preferences.instance.api_url + "/playlists/" + id)).json(),
    enabled: preferences.instance.api_url && !isLocal() && id ? true : false,
  }));

  createEffect(() => {
    if (!query.data) return;
    setList(query.data);
  });

  return (
    <>
      <Title>{list() ? list()!.name : "Playlist"}</Title>
      <Show when={list()} keyed>
        {(l) => {
          return (
            <div class="max-w-5xl mx-auto">
              <h1 class="text-2xl font-bold mb-4">{list()!.name}</h1>

              <div class="grid grid-cols-1 gap-4 ">
                <Show when={l.relatedStreams.length > 0}>
                  <For each={l.relatedStreams
                  // blocklist
                  .filter(
                    (item) =>
                      !sync.store.blocklist[item?.uploaderUrl?.split("/").pop()!]
                  )
                  }>
                    {(video, index) => (
                      <PlaylistItem
                        active=""
                        v={video}
                        index={index() + 1}
                        list={id}
                      />
                    )}
                  </For>
                </Show>
              </div>
            </div>
          );
        }}
      </Show>
    </>
  );
}
