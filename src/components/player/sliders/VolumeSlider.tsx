import { SliderPreview } from "./SliderPreview";
import { SliderThumb } from "./SliderThumb";

export function VolumeSlider() {
  return (
    <media-volume-slider class="group relative mx-[7.5px] transition-all duration-200 inline-flex h-10 w-full cursor-pointer touch-none select-none items-center outline-none aria-hidden:hidden max-w-0 hover:max-w-[5rem] peer-hover:max-w-[5rem] data-[hocus]:max-w-[5rem]">
      {/* Track */}
      <div class="ring-primary relative z-0 h-[5px] w-full rounded-sm bg-white/30 group-data-[focus]:ring-[3px]">
        <div class="bg-primary absolute h-full w-[var(--slider-fill)] rounded-sm will-change-[width]" />
      </div>
      <SliderThumb />
      <SliderPreview noClamp>
        <media-slider-value
          class="rounded-sm bg-black px-2 py-px text-[13px] font-medium"
          type="pointer"
          format="percent"
        />
      </SliderPreview>
    </media-volume-slider>
  );
}
