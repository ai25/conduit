import { RelatedStream } from "~/types";
import { MenuPlacement, TooltipPlacement } from "vidstack";
import { For, Ref, createEffect, createSignal, on } from "solid-js";
import { useQueue } from "~/stores/queueStore";
import { getVideoId } from "~/utils/helpers";
import { useNavigate } from "@solidjs/router";
import { usePlaylist } from "~/stores/playlistStore";
import { Tooltip } from "../Tooltip";

export const RecommendedVideosMenu = (props: RecommendedVideosMenuProps) => {
  const queue = useQueue();
  const navigate = useNavigate();
  const [playlist] = usePlaylist();
  const [currentItemRef, setCurrentItemRef] = createSignal<
    HTMLButtonElement | undefined
  >();

  return (
    <media-menu
      on:open={() => {
        currentItemRef()?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }}
    >
      <Tooltip
        triggerSlot={
          <media-menu-button class="group ring-primary relative mr-0.5 inline-flex h-8 w-8 sm:w-10 sm:h-10  cursor-pointer items-center justify-center rounded-md outline-none  hover:bg-white/20 data-[focus]:ring-[3px] aria-hidden:hidden ">
            <media-icon
              class="w-7 h-7 sm:h-8 sm:w-8"
              type="queue-list"
              aria-label="Queue"
            />
          </media-menu-button>
        }
        contentSlot={<span>{props.title || "Queue"}</span>}
        placement={props.tooltipPlacement}
      />
      <media-menu-portal>
        <media-menu-items
          classList={{
            "animate-out fade-out slide-out-to-bottom-2 data-[open]:animate-in data-[open]:fade-in data-[open]:slide-in-from-bottom-4 flex flex-col overflow-y-auto overscroll-y-contain rounded-md border border-white/10 bg-black/95 p-2.5 font-sans text-sm font-medium outline-none backdrop-blur-sm transition-[height] duration-300 will-change-[height] data-[resizing]:overflow-hidden !fixed z-[9999] !w-[clamp(0px,100%,400px)] max-w-[98vw] h-[clamp(0px,100%,600px)] max-h-[60vh] sm:max-h-[80vh] !bottom-6 !left-0 !right-0 !top-auto sm:!top-12 sm:!left-10 mx-auto sm:ml-[unset] sm:mr-[unset]":
              true,
          }}
        >
          <div class="w-full bg-black/90 mb-2 sticky -top-3 p-2 z-20">
            <div class="text-white/80 max-w-[calc(var(--media-width)-20px)] uppercase truncate">
              {props.title ?? "Queue"}
            </div>
          </div>
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
                ref={(ref) => {
                  if (props.currentVideoId === getVideoId(video)) {
                    setCurrentItemRef(ref);
                    console.log("setCurrentItemRef", ref);
                  }
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
        </media-menu-items>
      </media-menu-portal>
    </media-menu>
  );
};

export interface RecommendedVideosMenuProps {
  placement: MenuPlacement;
  tooltipPlacement: TooltipPlacement;
  videos?: RelatedStream[];
  title?: string;
  currentVideoId: string;
}
