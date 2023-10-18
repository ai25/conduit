import { Tooltip, type TooltipPlacement } from "~/components/Tooltip";


export function NextButton(props: NextButtonProps) {
  return (
    <Tooltip
      onClick={props.onClick}
      placement={props.tooltipPlacement}
      disabled={props.disabled}
      openDelay={500}
      class="ring-primary relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 focus-visible:ring-4 disabled:text-gray-300 disabled:cursor-not-allowed"
      triggerSlot={
          <media-icon
          aria-label="Next"
          class="h-10 w-10" type="chevron-right" />
      }
      contentSlot={
        <>
          <span>Next (Shift+N)</span> 
        </>
      }
    />
  );
}

export interface NextButtonProps {
  tooltipPlacement: TooltipPlacement;
  onClick?: () => void;
  disabled?: boolean;
}
