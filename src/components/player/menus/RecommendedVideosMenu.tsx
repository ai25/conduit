import { RelatedStream } from "~/types";
import { Menu } from "./Menu";
import { MenuPlacement, TooltipPlacement } from "vidstack";
import { For } from "solid-js";
import { useQueue } from "~/stores/queueStore";
import { getVideoId } from "~/utils/helpers";
import { useNavigate } from "@solidjs/router";
import { usePlaylist } from "~/stores/playlistStore";

export const RecommendedVideosMenu = (props: RecommendedVideosMenuProps) => {
  const queue = useQueue();
  const navigate = useNavigate();
  const [playlist] = usePlaylist();

  return (
    <Menu
      isSideTrigger
      placement={props.placement}
      buttonSlot={
        <media-icon
          class="w-7 h-7 sm:h-8 sm:w-8"
          type="queue-list"
          aria-label="Queue"
        />
      }
      tooltipPlacement={props.tooltipPlacement}
      tooltipSlot={<span>Playlist</span>}
      title={props.title ?? "Queue"}
      class="w-[clamp(0px,100%,400px)] left-[100%]"
    >
      <For each={props.videos}>
        {(video) => (
          <button
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set("v", getVideoId(video)!);
              if (playlist()) {
                const index = playlist()!.relatedStreams.findIndex(
                  (v) => getVideoId(v) === getVideoId(video)
                );
                if (index) {
                  params.set("index", `${index + 1}`);
                }
              }
              const url = `${window.location.pathname}?${params.toString()}`;
              queue.setCurrentVideo(getVideoId(video)!);
              navigate(url);
            }}
            role="menuitem"
            tabIndex={-1}
            classList={{
              "text-start max-w-[calc(var(--media-width)-20px)] ring-primary parent left-0 flex  cursor-pointer select-none items-center justify-start rounded-sm p-2.5 bg-black/95 outline-none ring-inset  hover:bg-neutral-800/80 focus-visible:bg-neutral-800/80 focus-visible:ring-[3px] aria-hidden:hidden":
                true,
              "border-l-2 border-primary":
                props.currentVideoId === getVideoId(video),
            }}
          >
            <img
              class="h-18 w-32 shrink-0 rounded-md bg-bg1 aspect-video"
              src={video.thumbnail}
            />
            <div class="ml-2 flex grow flex-col overflow-hidden whitespace-pre-wrap">
              <div class="text-sm text-text1 truncate">{video.title}</div>
              <div class="text-xs text-text1/50">{video.uploaderName}</div>
            </div>
          </button>
        )}
      </For>
    </Menu>
  );
};

export interface RecommendedVideosMenuProps {
  placement: MenuPlacement;
  tooltipPlacement: TooltipPlacement;
  videos?: RelatedStream[];
  title?: string;
  currentVideoId: string;
}
