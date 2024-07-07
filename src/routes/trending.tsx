import { createQuery, isServer } from "@tanstack/solid-query";
import { FaSolidCheck, FaSolidSort } from "solid-icons/fa";
import { Match, Show, Suspense, createEffect } from "solid-js";
import { For, Switch, createSignal } from "solid-js";
import { ErrorComponent } from "~/components/Error";
import { useAppState } from "~/stores/appStateStore";
import { usePreferences } from "~/stores/preferencesStore";
import { useSyncStore } from "~/stores/syncStore";
import type { TrendingStream } from "~/types";
import { TRENDING_REGIONS } from "~/config/constants";
import { Select as KobalteSelect } from "@kobalte/core";
import VideoCard, {
  VideoCardFallback,
} from "~/components/content/stream/VideoCard";
import { Title } from "@solidjs/meta";
import Select from "~/components/Select";
import { filterContent } from "~/utils/content-filter";

export default function Trending() {
  const sync = useSyncStore();
  const [preferences, setPreferences] = usePreferences();
  const query = createQuery(() => ({
    queryKey: [
      "trending",
      preferences.instance.api_url,
      preferences.content.trendingRegion,
    ],
    queryFn: async (): Promise<TrendingStream[]> => {
      const res = await fetch(
        preferences.instance.api_url +
          "/trending?region=" +
          preferences.content.trendingRegion
      );
      if (!res.ok) {
        throw new Error("Error fetching trending");
      }
      return await res.json();
    },
    enabled: preferences.instance?.api_url && !isServer ? true : false,
  }));

  return (
    <div class="flex min-h-full flex-wrap justify-center bg-bg1">
      <Title>Trending | Conduit</Title>
      <div class="flex flex-col w-full mt-2 p-2">
        <Select
          options={TRENDING_REGIONS.map((region) => ({
            value: region.value,
            label: region.flag + region.label,
          }))}
          onChange={(value) => {
            setPreferences("content", "trendingRegion", value.value);
          }}
          value={{
            value: preferences.content.trendingRegion,
            label:
              TRENDING_REGIONS.find(
                (r) => r.value === preferences.content.trendingRegion
              )?.label ?? "",
          }}
        />
      </div>

      <Show when={query.error}>{(query.error as Error).message}</Show>
      <Show when={query.data && !Array.isArray(query.data)}>
        <ErrorComponent error={query.data} />
      </Show>
      <div class="flex flex-wrap justify-center">
        <Show
          when={query.data}
          keyed
          fallback={
            <For each={Array(20)}>
              {() => <VideoCardFallback layout="sm:grid" />}
            </For>
          }
        >
          {(videos) =>
            videos && (
              <For
                each={filterContent(videos, preferences, sync.store.blocklist)}
              >
                {(video) => <VideoCard v={video} layout="sm:grid" />}
              </For>
            )
          }
        </Show>
      </div>
    </div>
  );
}
