
import { MenuRadio } from "./MenuRadio";
import { Submenu } from "./Submenu";

export function AudioSubmenu() {
  return (
    <Submenu
      label="Audio"
      iconSlot={<media-icon class="h-5 w-5" type="volume-high" />}
    >
      <media-audio-radio-group class="w-full flex flex-col">
        <template>
          <MenuRadio />
        </template>
      </media-audio-radio-group>
    </Submenu>
  );
}
