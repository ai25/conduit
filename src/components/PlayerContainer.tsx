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
  createEffect,
  ErrorBoundary,
  Switch,
  Match,
} from "solid-js";
import { usePreferences } from "~/stores/preferencesStore";
import { PipedVideo } from "~/types";
import { isServer } from "solid-js/web";
import { useAppState } from "~/stores/appStateStore";
import { useSearchParams } from "solid-start";
import { createQuery } from "@tanstack/solid-query";
import api from "~/utils/api";

export default function PlayerContainer(props: {
}) {
  const route = useLocation();
  const [preferences] = usePreferences();

  const [searchParams] = useSearchParams();
  console.log(preferences.instance.api_url, "api url");
  const [v, setV] = createSignal<string | undefined>(undefined);
  createEffect(() => {
    console.log(videoQuery,"video query");
    if (!searchParams.v) return;
    setV(searchParams.v);
  });
  const videoQuery = createQuery(() => ({
    queryKey: ["streams", v(), preferences.instance.api_url],
    queryFn: () => api.fetchVideo(v(), preferences.instance.api_url),
    enabled: v() && preferences.instance.api_url ? true : false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    cacheTime: Infinity,
    staleTime: 100 * 60 * 1000,
  }));

  return (
    <ErrorBoundary
    fallback={(props) => <>ERROR
      {JSON.stringify(props, null, 2)}
    </>}
    >
      <Suspense fallback={<PlayerLoading />}
      >
        <Switch fallback={<PlayerLoading />}>
        <Match when={videoQuery.isPending}>
          <PlayerLoading />
        </Match>
        <Match when={videoQuery.isError}>
          <PlayerError error={videoQuery.error as Error} />
        </Match>
        <Match when={videoQuery.data}>
          <Player onReload={() => videoQuery.refetch()} />
        </Match>
        </Switch>
      </Suspense>
    </ErrorBoundary>
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
  const location = useLocation();
  return (
    <div
      classList={{
        "pointer-events-none aspect-video bg-black flex h-fit w-full max-w-full items-center justify-center": true,
        "!absolute inset-0 w-screen h-screen z-[999999]": !!searchParams.fullscreen,
        "!sticky sm:!relative !top-0": !searchParams.fullscreen,
        "!sticky !top-10 !left-1 !w-56 sm:!w-72 lg:!w-96 ": appState.player.small,
        "!hidden": location.pathname !== "/watch",
      }}
    >
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
