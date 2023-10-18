import type { MenuPlacement, TooltipPlacement } from "vidstack";
import { AudioSubmenu } from "./AudioSubmenu";
import { SpeedSubmenu } from "./SpeedSubmenu";

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
          aria-label="Settings"
        />
      }
      tooltipPlacement={props.tooltipPlacement}
      tooltipSlot={<span>Settings</span>}
    >
      <QualitySubmenu />
      <CaptionSubmenu />
      <AudioSubmenu />
      <SpeedSubmenu />
    </Menu>
  );
}

export interface SettingsMenuProps {
  placement: MenuPlacement;
  tooltipPlacement: TooltipPlacement;
}
