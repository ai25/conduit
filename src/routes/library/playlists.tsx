import {
  createEffect,
  createRenderEffect,
  createSignal,
  For,
  Show,
  useContext,
} from "solid-js";
import { Playlist } from "~/types";
import { useSyncStore } from "~/stores/syncStore";
import { generateThumbnailUrl, getVideoId } from "~/utils/helpers";
import { usePreferences } from "~/stores/preferencesStore";
import { useAppState } from "~/stores/appStateStore";
import EmptyState from "~/components/EmptyState";
import PlaylistCard from "~/components/content/playlist/PlaylistCard";

export default function Playlists() {
  const sync = useSyncStore();
  const [preferences] = usePreferences();
  const [appState] = useAppState();

  return (
    <>
      <Show
        when={sync.store.playlists}
        fallback={
          appState.sync.providers.idb !== "connected" ? (
            "Loading"
          ) : (
            <EmptyState />
          )
        }
      >
        <For each={Object.entries(sync.store.playlists)}>
          {([id, playlist]) => (
            <PlaylistCard
              item={{
                ...playlist,
                url: `/playlist?list=${id}`,
                playlistType: "playlist",
                thumbnail: playlist.thumbnailUrl,
                type: "playlist",
                uploaderName: playlist.uploader,
                uploaderVerified: false,
                uploaderUrl: "",
              }}
            />
          )}
        </For>
      </Show>
    </>
  );
}
