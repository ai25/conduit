
import { MenuRadio } from "./MenuRadio";
import { Submenu } from "./Submenu";

export function SpeedSubmenu() {
  return (
    <Submenu
      label="Speed"
      iconSlot={<media-icon class="h-5 w-5" type="playback-speed-circle" />}
    >
      <media-speed-radio-group class="w-full flex flex-col">
        <template>
          <MenuRadio />
        </template>
      </media-speed-radio-group>
    </Submenu>
  );
}
