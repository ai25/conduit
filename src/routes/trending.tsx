import { Match, createEffect } from "solid-js";
import { For, Switch, createSignal } from "solid-js";
import { createRouteData, useRouteData } from "solid-start";
import VideoCard from "~/components/VideoCard";
import type { TrendingStream } from "~/types";
import { fetchWithTimeout } from "./watch";

export function routeData() {
  return createRouteData(async () => {
  });
}
export default function Trending() {
  const [trending, setTrending] = createSignal<TrendingStream[] | null>()
  const [error, setError] = createSignal<Error | null>(null);
  createEffect(async () => {

    try {
      const trending = await fetchWithTimeout(
        `https://pipedapi.kavin.rocks/trending?region=US`,
        { timeout: 5000 }
      );
      const res = await trending.json();

      console.log(res);
      setTrending(res as TrendingStream[]);
    } catch (err) {
      console.log("error", err);
      setError(err as Error);
    }
  })
  return (
    <div class="flex min-h-full flex-wrap justify-center bg-bg1">
      {/* {loading.value && (
          <div class="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50">
            <div class="text-2xl text-white">Loading...</div>
          </div>
        )} */}
        {/* {trending() && <></>} */}

      <Switch
        fallback={
          <For each={Array(40).fill(0)}>
            {() => <VideoCard v={undefined} />}
          </For>
        }>
        <Match when={!trending()} keyed>
          {(loading) =>
            loading && (
              <For each={Array(40).fill(0)}>
                {() => <VideoCard v={undefined} />}
              </For>
            )
          }
        </Match>
        <Match when={error()} keyed>
          <div>Error: {error()!.message}</div>
        </Match>
        <Match when={(trending() as TrendingStream[] &{error:any})?.error } keyed>
          {(error) =>
            error && <div>Error: {error.message}</div>
          }
        </Match>
        <Match when={(trending() as TrendingStream[])} keyed>
          {(videos) =>
            videos && (
              <For each={trending() as TrendingStream[]}>
                {(video) => <VideoCard v={video} />}
              </For>
            )
          }
        </Match>
      </Switch>
    </div>
  );
}
