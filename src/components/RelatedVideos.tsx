import { For, Match, Show, Switch } from "solid-js";
import { RelatedPlaylist } from "~/types";
import { useSyncStore } from "~/stores/syncStore";
import VideoCard, { VideoCardFallback } from "./content/stream/VideoCard";
import PlaylistCard from "./content/playlist/PlaylistCard";
import { useVideoContext } from "~/stores/VideoContext";
import { filterContent } from "~/utils/content-filter";
import { usePreferences } from "~/stores/preferencesStore";

export default function RelatedVideos() {
  const sync = useSyncStore();

  const video = useVideoContext();
  const [preferences] = usePreferences();
  return (
    <div class="w-[clamp(250px,100%,98vw)] ">
      <For
        each={filterContent(
          video.data!.relatedStreams,
          preferences,
          sync.store.blocklist
        )}
      >
        {(stream) => {
          return (
            <Switch>
              <Match when={stream.type === "stream"}>
                <VideoCard v={stream} layout="list" />
              </Match>
              <Match when={stream.type === "playlist"}>
                <PlaylistCard
                  layout="list"
                  item={stream as unknown as RelatedPlaylist}
                />
              </Match>
            </Switch>
          );
        }}
      </For>
    </div>
  );
}

export const RelatedVideosFallback = () => {
  return (
    <div class="w-[clamp(250px,100%,98vw)] ">
      <For each={Array(20)}>{() => <VideoCardFallback layout="list" />}</For>
    </div>
  );
};
