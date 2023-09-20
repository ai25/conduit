import { createQuery } from "@tanstack/solid-query";
import { FaSolidCircleExclamation, FaSolidExclamation } from "solid-icons/fa";
import { Match, Show, Suspense, createEffect } from "solid-js";
import { For, Switch, createSignal } from "solid-js";
import { Title, createRouteData, useRouteData } from "solid-start";
import { ErrorComponent } from "~/components/Error";
import VideoCard from "~/components/VideoCard";
import { useAppState } from "~/stores/appStateStore";
import { usePreferences } from "~/stores/preferencesStore";
import { useSyncedStore } from "~/stores/syncedStore";
import type { TrendingStream } from "~/types";

export default function Trending() {
  const sync = useSyncedStore();
  const [preferences] = usePreferences();
  const query = createQuery(
    () => ["trending"],
    async (): Promise<TrendingStream[] & { error: Error }> =>
      (
        await fetch(preferences.instance.api_url + "/trending?region=US")
      ).json(),
    {
      get enabled() {
        return preferences.instance?.api_url ? true : false;
      },
      placeholderData: Array(40).fill(undefined),
    }
  );
  const [, setAppState] = useAppState();
  createEffect(() => {
    setAppState(
      "loading",
      query.isFetching || query.isRefetching || query.isInitialLoading
    );
  });
  return (
    <div class="flex min-h-full flex-wrap justify-center bg-bg1">
      <Title>Trending | Conduit</Title>
      <Show when={query.error}>{(query.error as Error).message}</Show>
      <Show when={!Array.isArray(query.data)}>
        <ErrorComponent error={query.data} />
      </Show>
      <Show when={query.data} keyed>
        {(videos) =>
          videos && (
            <For each={videos}>{(video) => <VideoCard v={video} />}</For>
          )
        }
      </Show>
    </div>
  );
}
