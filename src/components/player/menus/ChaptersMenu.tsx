import type { MenuPlacement, TooltipPlacement } from "vidstack";
import { MediaChaptersRadioGroupElement, MediaRadioElement } from "vidstack/elements";

import { Menu } from "./Menu";
import { ErrorBoundary } from "solid-js";


export function ChaptersMenu(props: ChaptersMenuProps) {
  console.log("chapters menu", props.thumbnails);
  return (
    <Menu
      placement={props.placement}
      buttonSlot={<media-icon
        aria-label="Chapters"
        class="h-8 w-8" type="chapters" />}
      tooltipPlacement={props.tooltipPlacement}
      tooltipSlot={<span>Chapters</span>}
    >
      <media-chapters-radio-group
        class="flex flex-col space-y-1"
        thumbnails={props.thumbnails}>
        <ErrorBoundary fallback="Something went wrong">
          <template>
            <ChapterRadio />
          </template>
        </ErrorBoundary>
      </media-chapters-radio-group>
    </Menu>
  );
}

const ChapterRadio = () => {
  return (
    <media-radio
      class="group flex cursor-pointer items-center p-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:m-1 data-[focus]:ring-blue-400 border-b border-b-white/20 last:border-b-0 relative 
      aria-checked:after:content-[' '] aria-checked:after:w-[var(--progress)] aria-checked:after:h-[3px] aria-checked:after:absolute aria-checked:after:bottom-0 after:left-0 after:bg-primary"
    >
      <media-thumbnail
        data-part="thumbnail"
        class="mr-3 overflow-hidden aspect-video rounded min-w-[120px] min-h-[56px] max-w-[120px] max-h-[68px]"
      ></media-thumbnail>
      <div class="flex flex-col ">
      <span data-part="label"
        class="text-white text-[15px] font-medium whitespace-nowrap"
      ></span>
      <span data-part="start-time"
        class="inline-block py-px px-1 w-max rounded-sm text-[rgb(168,169,171)] text-xs font-medium bg-[rgba(156,163,175,0.2)] mt-1.5"
      ></span>
      <span data-part="duration"
        class="text-xs text-white/50 font-medium rounded-sm mt-1.5"
      ></span>
      </div>
    </media-radio>
  )
}

export interface ChaptersMenuProps {
  placement: MenuPlacement;
  tooltipPlacement: TooltipPlacement;
  thumbnails: string;
}
