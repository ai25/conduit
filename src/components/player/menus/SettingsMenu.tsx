import type { MenuPlacement, TooltipPlacement } from "vidstack";

import { CaptionSubmenu } from "./CaptionSubmenu";
import { Menu } from "./Menu";
import { QualitySubmenu } from "./QualitySubmenu";

export function SettingsMenu(props: SettingsMenuProps) {
  return (
    <Menu
      placement={props.placement}
      buttonSlot={
        <media-icon
          class="h-8 w-8 transform transition-transform duration-200 ease-out group-data-[open]:rotate-90"
          type="settings"
        />
      }
      tooltipPlacement={props.tooltipPlacement}
      tooltipSlot={<span>Settings</span>}
    >
      <QualitySubmenu />
      <CaptionSubmenu />
    </Menu>
  );
}

export interface SettingsMenuProps {
  placement: MenuPlacement;
  tooltipPlacement: TooltipPlacement;
}
