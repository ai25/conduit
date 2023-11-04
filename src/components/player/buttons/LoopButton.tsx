import { ToggleButton } from "@kobalte/core";
import { FaSolidRepeat } from "solid-icons/fa";
import { TbRepeat, TbRepeatOff } from "solid-icons/tb";
import { RiMediaRepeatFill } from "solid-icons/ri";
import { Tooltip, type TooltipPlacement } from "~/components/Tooltip";
import { createSignal, Show } from "solid-js";


export function LoopButton(props: LoopButtonProps) {
  return (
    <Tooltip
      as="span"
      placement="top"
      gutter={28}
      openDelay={500}
      triggerSlot={
        <ToggleButton.Root
          role="button"
          class="ring-primary group relative mr-0.5 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 focus-visible:ring-4 aria-hidden:hidden 
          "
          defaultPressed={props.loop}
          onChange={props.onChange}
        >
          <TbRepeat
            aria-label={"Loop On"}
            class="h-7 w-7 hidden group-data-[pressed]:block " />
          <TbRepeatOff
            aria-label={"Loop Off"}
            class="h-7 w-7 block group-data-[pressed]:hidden " />
        </ToggleButton.Root>
      }
      contentSlot={
        <>
          <Show when={props.loop}>
            <span class="">Loop Off</span>
          </Show>
          <Show when={!props.loop}>
            <span class="">Loop On</span>
          </Show>
        </>
      }
    />
  );
}

export interface LoopButtonProps {
  tooltipPlacement: TooltipPlacement;
  loop: boolean;
  onChange: (value: boolean) => void;
}
