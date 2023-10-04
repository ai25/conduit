import { ToggleButton } from "@kobalte/core";
import { FaSolidRepeat } from "solid-icons/fa";
import { TbRepeat } from "solid-icons/tb";
import { RiMediaRepeatFill } from "solid-icons/ri";
import type { TooltipPlacement } from "vidstack";

import { Tooltip } from "../Tooltip";
import { usePreferences } from "~/stores/preferencesStore";
import { Match, Switch } from "solid-js";

export function LoopButton(props: LoopButtonProps) {
  return (
    <Tooltip
      placement={props.tooltipPlacement}
      triggerSlot={
        <ToggleButton.Root
          defaultPressed={props.loop}
          onChange={props.onChange}
          class="ring-primary group relative mr-0.5 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 focus-visible:ring-4 aria-hidden:hidden"
        >
          <TbRepeat class="h-7 w-7 group-data-[pressed]:text-primary" />
        </ToggleButton.Root>
      }
      contentSlot={
        <>
          <span class="block">Looping</span>
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
