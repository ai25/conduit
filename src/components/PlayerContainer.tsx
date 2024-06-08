import Player from "./player/Player";
import { Suspense, Switch, Match } from "solid-js";
import { useAppState } from "~/stores/appStateStore";
import { useLocation, useSearchParams } from "@solidjs/router";
import { useVideoContext } from "~/stores/VideoContext";

export default function PlayerContainer() {
  const video = useVideoContext();

  return (
    <Suspense fallback={<PlayerLoading />}>
      <Switch fallback={<PlayerLoading />}>
        <Match when={video.isPending}>
          <PlayerLoading />
        </Match>
        <Match when={video.isError}>
          <PlayerError error={video.error as Error} />
        </Match>
        <Match when={video.data}>
          <Player />
        </Match>
      </Switch>
    </Suspense>
  );
}

export const Spinner = (props: { class?: string }) => (
  <svg
    classList={{
      "h-24 w-24 text-white duration-300 animate-spin": true,
      [props.class!]: !!props.class,
    }}
    fill="none"
    viewBox="0 0 120 120"
    aria-hidden="true"
  >
    <circle
      class="opacity-25"
      cx="60"
      cy="60"
      r="54"
      stroke="currentColor"
      stroke-width="8"
    />
    <circle
      class="opacity-75"
      cx="60"
      cy="60"
      r="54"
      stroke="currentColor"
      stroke-width="10"
      pathLength="100"
      style={{
        "stroke-dasharray": 50,
        "stroke-dashoffset": "50",
      }}
    />
  </svg>
);

export const PlayerLoading = () => {
  const [searchParams] = useSearchParams();
  const [appState] = useAppState();
  const location = useLocation();
  return (
    <div
      classList={{
        "pointer-events-none aspect-video bg-black flex h-fit w-full max-w-full items-center justify-center":
          true,
        "!absolute inset-0 w-screen h-screen z-[999999]":
          !!searchParams.fullscreen,
        "!sticky sm:!relative !top-0": !searchParams.fullscreen,
        "!sticky !top-10 !left-1 !w-56 sm:!w-72 lg:!w-96 ":
          appState.player.small,
        "!hidden": location.pathname !== "/watch",
      }}
    >
      <Spinner />
    </div>
  );
};

export function PlayerError(props: { error: Error }) {
  return (
    <div class=" flex-col text-center gap-2 col-span-3 aspect-video bg-black overflow-auto flex h-full w-full items-center justify-center">
      <div class="text-lg sm:text-2xl font-bold text-red-300">
        {props.error.name} :(
      </div>
      <div class="flex flex-col">
        <div class="text-sm sm:text-lg text-white">{props.error.message}</div>
        <div class="text-sm sm:text-lg text-white">
          Please try switching to a different instance or refresh the page.
        </div>
      </div>
      {/* <div class="flex justify-center gap-2">
          <button
            class="px-4 py-2 text-lg text-white border border-white rounded-md"
            onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div> */}
    </div>
  );
}
