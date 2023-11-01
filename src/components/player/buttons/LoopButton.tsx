import { ToggleButton } from "@kobalte/core";
import { FaSolidRepeat } from "solid-icons/fa";
import { TbRepeat, TbRepeatOff } from "solid-icons/tb";
import { RiMediaRepeatFill } from "solid-icons/ri";
import { Tooltip, type TooltipPlacement } from "~/components/Tooltip";
import { createSignal, Show } from "solid-js";


export function LoopButton(props: LoopButtonProps) {
  const [open, setOpen] = createSignal(false);
  let timerId: NodeJS.Timeout | null = null;
  const handleOpenChange = (value: boolean) => {
    if (timerId) clearTimeout(timerId);
    if (value === false) return setOpen(false)
    else {
      timerId = setTimeout(() => {
        setOpen(true);
      }, 500);
    }
  };


  return (
    <Tooltip
      as="span"
      placement="top"
      gutter={28}
      open={open()}
      triggerSlot={
        <ToggleButton.Root
          role="button"
          class="ring-primary group relative mr-0.5 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 focus-visible:ring-4 aria-hidden:hidden 
          "
          onFocus={(e) => {
            e.stopPropagation();
            handleOpenChange(true);
          }}
          onBlur={(e) => {
            e.stopPropagation();
            handleOpenChange(false);
          }}
          onPointerEnter={(e) => {
            e.stopPropagation();
            handleOpenChange(true);
          }}
          onPointerLeave={(e) => {
            e.stopPropagation();
            handleOpenChange(false);
          }}
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
