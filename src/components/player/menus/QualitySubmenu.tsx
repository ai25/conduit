import { MenuRadio } from "./MenuRadio";
import { Submenu } from "./Submenu";

export function QualitySubmenu() {
  return (
    <Submenu
      label="Quality"
      iconSlot={<media-icon class="h-5 w-5" type="settings" />}
    >
      <media-quality-radio-group class="w-full flex flex-col">
        <template>
          <MenuRadio />
        </template>
      </media-quality-radio-group>
    </Submenu>
  );
}
