import { For, Match, Show, Switch } from "solid-js";
import { RelatedPlaylist } from "~/types";
import { useSyncStore } from "~/stores/syncStore";
import VideoCard from "./content/stream/VideoCard";
import PlaylistCard from "./content/playlist/PlaylistCard";
import { useVideoContext } from "~/stores/VideoContext";

export default function RelatedVideos() {
  const sync = useSyncStore();

  const video = useVideoContext();
  return (
    <Show
      when={video.data}
      fallback={<For each={Array(20).fill(0)}>{() => <VideoCard />}</For>}
    >
      <div class="w-[clamp(250px,100%,95vw)] max-w-max md:max-w-min">
        <For
          each={video.data?.relatedStreams
            // blocklist
            .filter(
              (item) =>
                !sync.store.blocklist[item?.uploaderUrl?.split("/").pop()!]
            )}
        >
          {(stream) => {
            return (
              <Switch>
                <Match when={stream.type === "stream"}>
                  <VideoCard v={stream} layout="sm:grid" />
                </Match>
                <Match when={stream.type === "playlist"}>
                  <PlaylistCard item={stream as unknown as RelatedPlaylist} />
                </Match>
              </Switch>
            );
          }}
        </For>
      </div>
    </Show>
  );
}
