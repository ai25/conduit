import { Match, createEffect } from "solid-js";
import { For, Switch, createSignal } from "solid-js";
import { createRouteData, useRouteData } from "solid-start";
import VideoCard from "~/components/VideoCard";
import type { TrendingStream } from "~/types";
import { fetchWithTimeout } from "./watch";

export function routeData() {
  return createRouteData(async () => {
    try {
      const trending = await fetchWithTimeout(
        `https://pipedapi.kavin.rocks/trending?region=US`,
        { timeout: 5000 }
      );
      const res = await trending.json();

      console.log(res);
      return res as TrendingStream[];
    } catch (err) {
      console.log("error", err);
      return err as Error;
    }
  });
}
export default function Trending() {
  const trending = useRouteData<typeof routeData>();
  return (
    <div class="flex min-h-full flex-wrap justify-center gap-4 bg-bg1">
      {/* {loading.value && (
          <div class="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50">
            <div class="text-2xl text-white">Loading...</div>
          </div>
        )} */}
      {!trending() && <div>Loading...</div>}
      <Switch fallback={<div>Loading...</div>}>
        <Match when={trending.loading}>
          <div>Loading...</div>
        </Match>
        <Match when={trending.error}>
          <div>Error: {trending.error.message}</div>
        </Match>
        <Match when={trending() instanceof Error}>
          <div>Error: {(trending() as Error).message}</div>
        </Match>
        <Match when={(trending() as TrendingStream[]).length > 0}>
          <For each={trending() as TrendingStream[]}>
            {(video) => <VideoCard v={video} />}
          </For>
        </Match>
      </Switch>
    </div>
  );
}
