
import { Tooltip, type TooltipPlacement } from "~/components/Tooltip";


export function PrevButton(props: PrevButtonProps) {
  return (
    <Tooltip
      onClick={props.onClick}
      placement={props.tooltipPlacement}
      disabled={props.disabled}
      openDelay={500}
      class="ring-primary relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 focus-visible:ring-4 disabled:text-gray-300 disabled:cursor-not-allowed"
      triggerSlot={
          <media-icon
          aria-label="Prev"
          class="h-10 w-10" type="chevron-left" />
      }
      contentSlot={
        <>
          <span>Previous (Shift+P)</span>
        </>
      }
    />
  );
}

export interface PrevButtonProps {
  tooltipPlacement: TooltipPlacement;
  disabled?: boolean;
  onClick?: () => void;
}
