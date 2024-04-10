import { ToggleButton } from "@kobalte/core";
import { Tooltip, type TooltipPlacement } from "~/components/Tooltip";
import { createEffect, createSignal, Show } from "solid-js";
import { useSearchParams } from "@solidjs/router";

export function FullscreenButton(props: FullscreenButtonProps) {
  const [params, setParams] = useSearchParams();
  createEffect(() => {
    document.onfullscreenchange = () => {
      if (document.fullscreenElement) {
        setParams({ fullscreen: true }, { replace: true });
        screen.orientation.lock("landscape").catch(() => {});
      } else setParams({ fullscreen: undefined }, { replace: true });
    };
  });
  const isFullscreen = () => !!params.fullscreen;
  return (
    <Tooltip
      as="div"
      placement="top"
      gutter={28}
      openDelay={500}
      triggerSlot={
        <ToggleButton.Root
          pressed={isFullscreen()}
          role="button"
          class="ring-primary group relative mr-0.5 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 focus-visible:ring-4 aria-hidden:hidden"
          onChange={(value) => {
            if (value) {
              console.log(`fullscreen button pressed, entering fullscreen`);
              document.documentElement.requestFullscreen();
              screen.orientation.lock("landscape").catch(() => {});
              setParams({ fullscreen: true }, { replace: true });
              document.body.scroll({ top: 0, left: 0, behavior: "smooth" });
            } else {
              document.exitFullscreen();
              screen.orientation.unlock();
              setParams({ fullscreen: undefined }, { replace: true });
            }
          }}
        >
          <Show when={params.fullscreen}>
            <media-icon
              class="h-8 w-8"
              type={"fullscreen-exit"}
              aria-label={"Exit Fullscreen"}
            />
          </Show>
          <Show when={!params.fullscreen}>
            <media-icon
              class="h-8 w-8"
              type={"fullscreen"}
              aria-label={"Enter Fullscreen"}
            />
          </Show>
        </ToggleButton.Root>
      }
      contentSlot={
        <>
          <Show when={params.fullscreen}>
            <span class="">Exit Fullscreen</span>
          </Show>
          <Show when={!params.fullscreen}>
            <span class="">Enter Fullscreen</span>
          </Show>
        </>
      }
    />
  );
}

export interface FullscreenButtonProps {
  tooltipPlacement: TooltipPlacement;
}
