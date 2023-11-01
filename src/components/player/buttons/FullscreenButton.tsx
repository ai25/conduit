import { useSearchParams } from "solid-start";
import { ToggleButton } from "@kobalte/core";
import { Tooltip, type TooltipPlacement } from "~/components/Tooltip";
import { createEffect, createSignal, Show } from "solid-js";
import { isServer } from "solid-js/web";

export function FullscreenButton(props: FullscreenButtonProps) {
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = createSignal(false);
  let timerId: NodeJS.Timeout | null = null;
  const handleOpenChange = (value: boolean) => {
    if (timerId) clearTimeout(timerId);
    if (value === false) return setOpen(false)
    else {
      timerId = setTimeout(() => {
        setOpen(true);
      }, 500);
    }
  };
  createEffect(() => {
    document.onfullscreenchange = () => {
      if (document.fullscreenElement) setParams({ fullscreen: true });
      else setParams({ fullscreen: undefined });
    }
  });
  const [fullscreen, setFullscreen] = createSignal("fullscreen");
  createEffect(() => {
    setFullscreen(JSON.stringify({ fullscreen: params.fullscreen, document: document.fullscreenElement }));
  })

  return (
    <Tooltip
      as="span"
      placement="top"
      gutter={28}
      open={open()}
      triggerSlot={
        <ToggleButton.Root
          role="button"
          class="ring-primary group relative mr-0.5 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 focus-visible:ring-4 aria-hidden:hidden"

          onFocus={(e) => {
            e.stopPropagation();
            handleOpenChange(true);
          }}
          onBlur={(e) => {
            e.stopPropagation();
            handleOpenChange(false);
          }}
          onPointerEnter={(e) => {
            e.stopPropagation();
            handleOpenChange(true);
          }}
          onPointerLeave={(e) => {
            e.stopPropagation();
            handleOpenChange(false);
          }}
          onChange={(value) => {
            if (value) {
              document.documentElement.requestFullscreen();
              screen.orientation.lock("landscape").catch(() => { });
              setParams({ fullscreen: true }, { replace: true });
            } else {
              document.exitFullscreen();
              screen.orientation.unlock();
              setParams({ fullscreen: undefined }, { replace: true });
            }
          }}
        >
          <div class="absolute right-44 bottom-44 text-xl">
            {fullscreen()}
          </div>
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


