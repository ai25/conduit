import {
  parseCookie,
  useLocation,
  useNavigate,
  useServerContext,
} from "solid-start";
import Player from "./Player";
import {
  Show,
  createRenderEffect,
  createSignal,
  Suspense,
} from "solid-js";
import { usePreferences } from "~/stores/preferencesStore";
import { PipedVideo } from "~/types";
import { isServer } from "solid-js/web";
import {useAppState} from "~/stores/appStateStore";
import { useSearchParams } from "solid-start";

export default function PlayerContainer(props: {
  video: PipedVideo | undefined;
  error: any;
  loading: boolean;
  onReload: () => void;
}) {
  const route = useLocation();
  const [preferences] = usePreferences();
  const Loading = () =>
    route.pathname === "/watch" ? <PlayerLoading /> : <></>;
  const Error = (props: any) =>
    route.pathname === "/watch" ? (
      <PlayerError error={{ name: props.name, message: props.message }} />
    ) : (
      <></>
    );

  return (
    <div
      classList={{
      }}
    >
      <Suspense 
        fallback={<Loading />}
      >
        <Show when={props.loading}>
          <Loading />
        </Show>
        <Show when={props.error}>
          <Error message={props.error!.message} name={props.error!.name} />
        </Show>
        <Show when={props.video}>
          <Player video={props.video!} onReload={props.onReload} />
        </Show>
      </Suspense>
      <div
        id="column"
        classList={{
          "w-0 h-0": theatre(),
          "w-max min-w-max h-max overflow-y-auto": !theatre(),
        }}
      />
      {/* <div
        classList={{
          "hidden lg:flex": !preferences.theatreMode,
          hidden: preferences.theatreMode,
        }}
        class="w-[28rem] relative h-1 self-start justify-start">
        <div class="absolute top-0 flex w-full justify-start items-center flex-col h-full">
          <Show
            when={video.value}
            keyed
            fallback={
              <For each={Array(20).fill(0)}>{() => <VideoCard />}</For>
            }>
            {(video) => (
              <For each={video.relatedStreams}>
                {(stream) => {
                  return <VideoCard v={stream} />;
                }}
              </For>
            )}
          </Show>
        </div>
      </div> */}
    </div>
  );
}

export const Spinner = (props: { class?: string }) => (
  <svg
    classList={{ "h-24 w-24 text-white duration-300 animate-spin": true, [props.class!]: !!props.class }}
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
  return (
    <div classList={{
      "pointer-events-none aspect-video bg-black flex h-fit w-full max-w-full items-center justify-center": true,
      "!absolute inset-0 w-screen h-screen": !!searchParams.fullscreen,
      "!sticky sm:!relative !top-0": !searchParams.fullscreen,
      "!sticky !top-10 !left-1 !w-56 sm:!w-72 lg:!w-96 ": appState.player.small,
      "!hidden": appState.player.dismissed,

    }}>
      <Spinner />
    </div>
  );
};

export function PlayerError(props: { error: Error }) {
  return (
    <div class="pointer-events-none flex-col text-center gap-2 col-span-3 aspect-video bg-black  flex h-full w-full items-center justify-center">
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
