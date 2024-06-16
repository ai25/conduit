import { ToggleButton } from "@kobalte/core";
import { Tooltip, type TooltipPlacement } from "~/components/Tooltip";
import { createEffect, createSignal, Show } from "solid-js";
import { useSearchParams } from "@solidjs/router";

export function FullscreenButton(props: FullscreenButtonProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  createEffect(() => {
    document.onfullscreenchange = () => {
      if (document.fullscreenElement) {
        setSearchParams({ fullscreen: true }, { replace: true });
        screen.orientation.lock("landscape").catch(() => {});
      } else setSearchParams({ fullscreen: undefined }, { replace: true });
    };
  });
  const isFullscreen = () => !!searchParams.fullscreen;
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
          class="mr-1 ring-primary group relative z-1 inline-flex h-8 w-8 sm:h-10 sm:w-10 cursor-pointer items-center justify-center rounded-md outline-none hover:bg-white/20 focus-visible:ring-[3px] aria-hidden:hidden pointer-events-auto"
          onChange={(value) => {
            if (value) {
              try {
                document.documentElement.requestFullscreen();
                screen.orientation.lock("landscape").catch(() => {});
                setSearchParams({ fullscreen: true }, { replace: true });
                document.body.scroll({ top: 0, left: 0, behavior: "smooth" });
              } catch (_) {
                setSearchParams({ fullscreen: undefined }, { replace: true });
              }
            } else {
              try {
                document.exitFullscreen();
                screen.orientation.unlock();
                setSearchParams({ fullscreen: undefined }, { replace: true });
              } catch (_) {
                setSearchParams({ fullscreen: true }, { replace: true });
              }
            }
          }}
        >
          <Show when={searchParams.fullscreen}>
            <media-icon
              class="h-8 w-8"
              type={"fullscreen-exit"}
              aria-label={"Exit Fullscreen"}
            />
          </Show>
          <Show when={!searchParams.fullscreen}>
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
          <Show when={searchParams.fullscreen}>
            <span class="">Exit Fullscreen</span>
          </Show>
          <Show when={!searchParams.fullscreen}>
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
