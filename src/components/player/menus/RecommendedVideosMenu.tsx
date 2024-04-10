import { RelatedStream } from "~/types";
import { Menu } from "./Menu";
import { MenuPlacement, TooltipPlacement } from "vidstack";
import { For } from "solid-js";
import { useQueue } from "~/stores/queueStore";
import { getVideoId } from "~/utils/helpers";
import { useNavigate } from "@solidjs/router";

export const RecommendedVideosMenu = (props: RecommendedVideosMenuProps) => {
  const queue = useQueue();
  const navigate = useNavigate();
  console.log("RecommendedVideosMenu", props.videos);
  return (
    <Menu
      placement={props.placement}
      buttonSlot={
        <media-icon class="h-8 w-8" type="queue-list" aria-label="Queue" />
      }
      tooltipPlacement={props.tooltipPlacement}
      tooltipSlot={<span>Playlist</span>}
      title={props.title ?? "Queue"}
    >
      <For each={props.videos}>
        {(video) => (
          <button
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set("v", getVideoId(video)!);
              const url = `${window.location.pathname}?${params.toString()}`;
              navigate(url);
            }}
            role="menuitem"
            tabIndex={-1}
            classList={{
              "text-start max-w-[calc(var(--media-width)-20px)] ring-primary parent left-0 flex w-full cursor-pointer select-none items-center justify-start rounded-sm p-2.5 bg-black/95 outline-none ring-inset  hover:bg-neutral-800/80 focus-visible:bg-neutral-800/80 focus-visible:ring-[3px] aria-hidden:hidden":
                true,
              "border-l-2 border-primary":
                getVideoId(queue.currentVideo) === getVideoId(video),
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
}
