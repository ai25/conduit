import {
  createEffect,
  createRenderEffect,
  createSignal,
  For,
  Show,
  useContext,
} from "solid-js";
import { A } from "solid-start";
import { Playlist } from "~/types";
import { useSyncStore } from "~/stores/syncStore";
import { generateThumbnailUrl } from "~/utils/helpers";
import { videoId } from "./history";
import { usePreferences } from "~/stores/preferencesStore";
import { useAppState } from "~/stores/appStateStore";
import EmptyState from "~/components/EmptyState";
import PlaylistCard from "~/components/PlaylistCard";

export default function Playlists() {
  const sync = useSyncStore();
  const [preferences] = usePreferences();
  createEffect(() => {
    if (!preferences.instance) return;
    // const l: Record<string, Playlist> = {
    //   [playlist.id]: {
    //     bannerUrl: generateThumbnailUrl(
    //       preferences.instance.image_proxy_url,
    //       videoId(playlist.videos[0].thumbnail)
    //     ),
    //     description: "",
    //     name: playlist.name,
    //     nextpage: "",
    //     relatedStreams: playlist.videos,
    //     thumbnailUrl: playlist.thumbnail,
    //     uploader: "You",
    //     uploaderUrl: "",
    //     uploaderAvatar: "",
    //     videos: playlist.videos.length,
    //   } as unknown as Playlist,
    // };
    // console.log(l);
    // setTimeout(() => {
    //   sync.setStore("playlists", l);
    // }, 0);
  });
  createRenderEffect(() => {
    console.log(sync.store.playlists);
  });
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
                thumbnail: generateThumbnailUrl(
                  preferences.instance.image_proxy_url,
                  videoId(playlist.relatedStreams[0])
                ),
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
