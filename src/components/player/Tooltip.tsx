import type { JSX } from "solid-js";
import type { TooltipPlacement } from "vidstack";

export function Tooltip(props: TooltipProps) {
  const isPlacementBot = () => props.placement.includes("bottom");
  return (
    <media-tooltip class={props.class}>
      <media-tooltip-trigger>{props.triggerSlot}</media-tooltip-trigger>
      <media-tooltip-content
        classList={{
          "tooltip animate-out fade-out slide-out-to-bottom-2 data-[visible]:animate-in data-[visible]:fade-in data-[visible]:slide-in-from-bottom-4 z-10 rounded-sm bg-black/90 px-2 py-0.5 text-sm font-medium text-white": true,
          "!top-12": isPlacementBot(),
        }}
        placement={props.placement}
      >
        {props.contentSlot}
      </media-tooltip-content>
    </media-tooltip>
  );
}

export interface TooltipProps {
  triggerSlot: JSX.Element;
  contentSlot: JSX.Element;
  placement: TooltipPlacement;
  class?: string;
}
