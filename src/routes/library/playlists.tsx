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
import {
  createPlaylist,
  generateThumbnailUrl,
  getVideoId,
} from "~/utils/helpers";
import { usePreferences } from "~/stores/preferencesStore";
import { useAppState } from "~/stores/appStateStore";
import EmptyState from "~/components/EmptyState";
import PlaylistCard from "~/components/content/playlist/PlaylistCard";
import { Title } from "@solidjs/meta";
import Button from "~/components/Button";
import Modal from "~/components/Modal";
import Select from "~/components/Select";
import { FaSolidPlus } from "solid-icons/fa";

export default function Playlists() {
  const sync = useSyncStore();
  const [preferences] = usePreferences();
  const [appState] = useAppState();
  createEffect(() => {
    console.log(Object.keys(sync.store.playlists).length, "playlists");
  });
  const isEmpty = () => Object.keys(sync.store.playlists).length === 0;
  const [sortBy, setSortBy] = createSignal({
    value: "date",
    label: "Date added",
  });

  return (
    <>
      <Title>Playlists</Title>

      <div class="flex items-center gap-2 w-full mt-2 p-2">
        <Select
          options={[
            {
              value: "date",
              label: "Date added",
            },
            {
              value: "az",
              label: "A-Z",
            },
          ]}
          value={sortBy()}
          onChange={setSortBy}
        />
        <button
          class="flex items-center gap-2 outline-none focus-visible:ring-2 ring-primary/80 rounded-full py-2 px-3"
          onClick={() => createPlaylist(sync.setStore)}
        >
          <FaSolidPlus class="w-5 h-5" /> Create a playlist
        </button>
      </div>
      <Show when={!isEmpty()} fallback={<EmptyState />}>
        <div class="flex flex-wrap">
          <For each={Object.entries(sync.store.playlists)}>
            {([id, playlist]) => (
              <PlaylistCard
                item={{
                  ...playlist,
                  url: `/playlist?list=${id}`,
                  playlistType: "playlist",
                  thumbnail: playlist.relatedStreams?.[0]?.thumbnail,
                  type: "playlist",
                  uploaderName: playlist.uploader,
                  uploaderVerified: false,
                  uploaderUrl: "",
                }}
              />
            )}
          </For>
        </div>
      </Show>
    </>
  );
}
