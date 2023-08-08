import { useLocation } from "solid-start";
import Player from "./Player";
import { For, Match, Switch, createRenderEffect, useContext } from "solid-js";
import { PlayerContext, PreferencesContext } from "~/root";
import VideoCard from "./VideoCard";

export default function PlayerContainer() {
  const route = useLocation();
  const [video] = useContext(PlayerContext);
  const [preferences] = useContext(PreferencesContext);

  createRenderEffect(() => {
    console.log(preferences.theatreMode, "theatre mode");
  });
  if (route.pathname !== "/watch") return null;
  const Loading = () =>
    route.pathname === "/watch" ? <LoadingState /> : <></>;
  const Error = (props: any) =>
    route.pathname === "/watch" ? (
      <ErrorState message={props.message} name={props.name} />
    ) : (
      <></>
    );
  return (
    <div
      class="flex sticky md:static top-0 z-50 md:z-0 mx-4"
      classList={{
        hidden: route.pathname !== "/watch",
        "max-h-[calc(100vh-4rem)]": preferences.theatreMode,
      }}>
      <Switch fallback={<Loading />}>
        <Match when={video.error} keyed>
          <Error message={video.error!.message} name={video.error!.name} />
        </Match>
        <Match when={video.value} keyed>
          {(video) => {
            return <Player />;
          }}
        </Match>
      </Switch>
      <div
        classList={{ "hidden lg:flex": !preferences.theatreMode,
        "hidden": preferences.theatreMode
     }}
        class="w-[28rem] relative h-1 self-start justify-start">
        <div class="absolute top-0 flex w-full justify-start items-center flex-col h-full">
          <For each={video.value?.relatedStreams}>
            {(stream) => {
              return <VideoCard v={stream} />;
            }}
          </For>
        </div>
      </div>
    </div>
  );
}

export const Spinner = () => (
  <svg
    class="h-24 w-24 text-white  transition-opacity duration-200 ease-linear animate-spin"
    fill="none"
    viewBox="0 0 120 120"
    aria-hidden="true">
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

const LoadingState = () => {
  return (
    <div class="pointer-events-none aspect-video bg-black flex h-full w-full max-w-full items-center justify-center">
      <Spinner />
    </div>
  );
};

function ErrorState(error: Error) {
  return (
    <div class="pointer-events-none flex-col text-center gap-2 col-span-3 aspect-video bg-black  flex h-full w-full items-center justify-center">
      <div class="text-lg sm:text-2xl font-bold text-red-300">
        {error.name} :(
      </div>
      <div class="flex flex-col">
        <div class="text-sm sm:text-lg text-white">{error.message}</div>
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
