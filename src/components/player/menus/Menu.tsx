import { JSX, Show } from "solid-js";
import type { MenuPlacement, TooltipPlacement } from "vidstack";

import { Tooltip } from "../Tooltip";
import { useSearchParams } from "@solidjs/router";

export function Menu(props: MenuProps) {
  const isPlacementBottom = () => props.placement.includes("bottom");
  const [params] = useSearchParams();
  return (
    <media-menu>
      <Tooltip
        triggerSlot={
          <media-menu-button class="group ring-primary relative mr-0.5 inline-flex h-8 w-8 sm:w-10 sm:h-10  cursor-pointer items-center justify-center rounded-md outline-none  hover:bg-white/20 data-[focus]:ring-[3px] aria-hidden:hidden ">
            {props.buttonSlot}
          </media-menu-button>
        }
        contentSlot={props.tooltipSlot}
        placement={props.tooltipPlacement}
      />

      <media-menu-items
        classList={{
          "animate-out fade-out slide-out-to-bottom-2 data-[open]:animate-in data-[open]:fade-in data-[open]:slide-in-from-bottom-4 flex h-[var(--menu-height)] !w-[clamp(0px,100%,400px)] flex-col overflow-y-auto overscroll-y-contain rounded-md border border-white/10 bg-black/95 p-2.5 font-sans text-sm font-medium outline-none backdrop-blur-sm transition-[height] duration-300 will-change-[height] data-[resizing]:overflow-hidden z-10 !fixed !bottom-[4.2rem] !left-0 !right-0 !top-auto sm:!bottom-auto sm:!left-auto sm:max-w-[calc(var(--media-width)-20px)] max-h-[60vh] sm:max-h-[65vh] mx-auto sm:ml-[unset] sm:mr-[unset]":
            true,
          "sm:!top-[5.4rem]": isPlacementBottom() && !params.fullscreen,
          "sm:!top-12": !!(isPlacementBottom() && params.fullscreen),
          "sm:!left-4  sm:!right-auto": props.placement.includes("start"),
          "sm:!right-4 sm:!left-auto": props.placement.includes("end"),
          "sm:!left-10 sm:!top-10": props.isSideTrigger,
        }}
        placement={props.placement}
      >
        <Show when={props.title}>
          <div class="w-full bg-black/90 mb-2 sticky -top-3 p-2 z-20">
            <div class="text-white/80 max-w-[calc(var(--media-width)-20px)] uppercase truncate">
              {props.title}
            </div>
          </div>
        </Show>
        {props.children}
      </media-menu-items>
    </media-menu>
  );
}

export interface MenuProps {
  placement: MenuPlacement;
  buttonSlot: JSX.Element;
  tooltipSlot: JSX.Element;
  children: JSX.Element;
  tooltipPlacement: TooltipPlacement;
  title?: string;
  class?: string;
  isSideTrigger?: boolean;
}
