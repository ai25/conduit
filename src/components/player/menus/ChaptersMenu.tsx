import type { MenuPlacement, TooltipPlacement } from "vidstack";

import { Menu } from "./Menu";

export function ChaptersMenu(props: ChaptersMenuProps) {
  return (
    <Menu
      placement={props.placement}
      buttonSlot={<media-icon class="h-8 w-8" type="chapters" />}
      tooltipPlacement={props.tooltipPlacement}
      tooltipSlot={<span>Chapters</span>}
    >
      <media-chapters-radio-group class="vds-chapters-radio-group vds-radio-group"></media-chapters-radio-group>
    </Menu>
  );
}

export interface ChaptersMenuProps {
  placement: MenuPlacement;
  tooltipPlacement: TooltipPlacement;
}
