
import type { JSX } from "solid-js";
import { Tooltip as KobalteTooltip } from "@kobalte/core";

export type TooltipPlacement = "top" | "bottom" | "left" | "right" | "top-end" | "left-end" | "right-end" | "bottom-end" | "top-start" | "left-start" | "right-start" | "bottom-start";

export function Tooltip(props: TooltipProps) {
  const animation = () => {
    switch (props.placement) {
      case "top":
        return "tooltip animate-out fade-out slide-out-to-bottom-2 data-[expanded]:animate-in data-[expanded]:fade-in data-[expanded]:slide-in-from-bottom-4";
      case "bottom":
        return "tooltip animate-out fade-out slide-out-to-top-2 data-[expanded]:animate-in data-[expanded]:fade-in data-[expanded]:slide-in-from-top-4";
      case "left":
        return "tooltip animate-out fade-out slide-out-to-right-2 data-[expanded]:animate-in data-[expanded]:fade-in data-[expanded]:slide-in-from-right-4";
      case "right":
        return "tooltip animate-out fade-out slide-out-to-left-2 data-[expanded]:animate-in data-[expanded]:fade-in data-[expanded]:slide-in-from-left-4";
      case "top-end":
        return "tooltip animate-out fade-out slide-out-to-bottom-2 data-[expanded]:animate-in data-[expanded]:fade-in data-[expanded]:slide-in-from-bottom-4";
      case "left-end":
        return "tooltip animate-out fade-out slide-out-to-right-2 data-[expanded]:animate-in data-[expanded]:fade-in data-[expanded]:slide-in-from-right-4";
      case "right-end":
        return "tooltip animate-out fade-out slide-out-to-left-2 data-[expanded]:animate-in data-[expanded]:fade-in data-[expanded]:slide-in-from-left-4";
      case "bottom-end":
        return "tooltip animate-out fade-out slide-out-to-top-2 data-[expanded]:animate-in data-[expanded]:fade-in data-[expanded]:slide-in-from-top-4";
      case "top-start":
        return "tooltip animate-out fade-out slide-out-to-bottom-2 data-[expanded]:animate-in data-[expanded]:fade-in data-[expanded]:slide-in-from-bottom-4";
      case "left-start":
        return "tooltip animate-out fade-out slide-out-to-right-2 data-[expanded]:animate-in data-[expanded]:fade-in data-[expanded]:slide-in-from-right-4";
      case "right-start":
        return "tooltip animate-out fade-out slide-out-to-left-2 data-[expanded]:animate-in data-[expanded]:fade-in data-[expanded]:slide-in-from-left-4";
      case "bottom-start":
        return "tooltip animate-out fade-out slide-out-to-top-2 data-[expanded]:animate-in data-[expanded]:fade-in data-[expanded]:slide-in-from-top-4";
      default:
        return "tooltip animate-out fade-out slide-out-to-bottom-2 data-[expanded]:animate-in data-[expanded]:fade-in data-[expanded]:slide-in-from-bottom-4";
    }
  };

  return (
    <KobalteTooltip.Root
      placement={props.placement}
      gutter={props.gutter ?? 8}
      open={props.open}
      onOpenChange={props.onOpenChange}
      openDelay={props.openDelay ?? 0}
    >
      <KobalteTooltip.Trigger as={props.as ?? "button"}
        disabled={props.disabled} class={props.class} onClick={props.onClick} >
        {props.triggerSlot}
      </KobalteTooltip.Trigger>
      <KobalteTooltip.Portal>
        <KobalteTooltip.Content
          class={`${animation()} z-10 rounded-sm bg-black/90 px-2 py-0.5 text-sm font-medium font-sans text-white`}
        >
          {props.contentSlot}
        </KobalteTooltip.Content>
      </KobalteTooltip.Portal>
    </KobalteTooltip.Root>
  );
}

export interface TooltipProps {
  triggerSlot: JSX.Element;
  contentSlot: JSX.Element;
  onClick?: () => void;
  placement?: TooltipPlacement;
  class?: string;
  disabled?: boolean;
  as?: keyof JSX.IntrinsicElements;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  gutter?: number;
  openDelay?: number;
}
