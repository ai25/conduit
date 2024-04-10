import { createRenderEffect, For } from "solid-js";
import {
  createEffect,
  createSignal,
  onMount,
  Show,
  useContext,
} from "solid-js";
import { Playlist as PlaylistType, RelatedStream } from "~/types";
import { fetchJson } from "~/utils/helpers";
import { useSyncStore } from "~/stores/syncStore";
import { createQuery } from "@tanstack/solid-query";
import { usePreferences } from "~/stores/preferencesStore";
import EmptyState from "~/components/EmptyState";
import PlaylistItem from "~/components/content/playlist/PlaylistItem";
import { Title } from "@solidjs/meta";

export default function WatchLater() {
  const sync = useSyncStore();

  return (
    <>
      <Title>Watch Later</Title>
      <div class="max-w-5xl mx-auto">
        <h1 class="text-2xl font-bold mb-4">Watch Later</h1>

        <div class="grid grid-cols-1 gap-4 ">
          <Show when={Object.keys(sync.store.watchLater).length > 0}>
            <For each={Object.values(sync.store.watchLater)}>
              {(video, index) => (
                <PlaylistItem
                  active=""
                  v={video}
                  index={index() + 1}
                  list="watchLater"
                />
              )}
            </For>
          </Show>
          <Show when={Object.keys(sync.store.watchLater).length === 0}>
            <EmptyState />
          </Show>
        </div>
      </div>
    </>
  );
}
