import {
  For,
  Show,
  createEffect,
  createSignal,
  useContext,
  Suspense,
  createMemo,
  onCleanup,
  Switch,
  createRenderEffect,
  onMount,
} from "solid-js";
import { Spinner } from "~/components/Spinner";
import { RelatedStream } from "~/types";
import { createQuery, isServer } from "@tanstack/solid-query";
import { useSyncStore } from "~/stores/syncStore";
import { ErrorComponent } from "~/components/Error";
import useIntersectionObserver from "~/hooks/useIntersectionObserver";
import EmptyState from "~/components/EmptyState";
import { A } from "@solidjs/router";
import { useAppState } from "~/stores/appStateStore";
import { usePreferences } from "~/stores/preferencesStore";
import { Tooltip } from "@kobalte/core";
import { FaSolidArrowsRotate } from "solid-icons/fa";
import { lazy } from "solid-js";
import { memo } from "solid-js/web";
import Button from "~/components/Button";
import VideoCard, {
  VideoCardFallback,
} from "~/components/content/stream/VideoCard";
import { Title } from "@solidjs/meta";
import { filterContent } from "~/utils/content-filter";
import { Match } from "solid-js";

export default function Feed() {
  const [limit, setLimit] = createSignal(10);
  const [preferences] = usePreferences();
  const sync = useSyncStore();
  const query = createQuery<RelatedStream[]>(() => ({
    queryKey: ["feed", preferences.instance.api_url, sync.store.subscriptions],
    queryFn: async (): Promise<RelatedStream[]> => {
      const res = await fetch(
        preferences.instance.api_url + "/feed/unauthenticated",
        {
          method: "POST",
          body: JSON.stringify(Object.keys(sync.store.subscriptions)),
        }
      );
      if (!res.ok) {
        throw res.json();
      }
      return res.json();
    },
    enabled:
      preferences.instance?.api_url &&
      !isServer &&
      Object.keys(sync.store.subscriptions).length
        ? true
        : false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  }));

  const [intersectionRef, setIntersectionRef] = createSignal<
    HTMLDivElement | undefined
  >();
  const isIntersecting = useIntersectionObserver({
    setTarget: () => intersectionRef(),
  });

  createEffect(() => {
    if (isIntersecting()) {
      setLimit((l) => l + 10);
    }
  });

  const [appState, setAppState] = useAppState();

  createEffect(() => {
    setAppState({
      loading: query.isRefetching || query.isFetching,
    });
  });

  createEffect(() => {
    console.log("query feed", query.error?.message);
  });

  const newComponent = (
    <>
      <Title>Feed | Conduit</Title>
      <div class="mx-2 flex flex-wrap gap-2 justify-center">
        <Tooltip.Root>
          <Tooltip.Trigger
            classList={{
              "fixed right-4 rounded-full w-10 h-10 bg-primary disabled:opacity-75 z-50 flex items-center justify-center":
                true,
              "animate-spin": query.isFetching,
              "bottom-10": !appState.player.small,
              "bottom-24 md:bottom-20": appState.player.small,
            }}
            disabled={query.isFetching}
            onClick={() => {
              if (!query.isFetching) {
                query.refetch();
              }
            }}
          >
            <FaSolidArrowsRotate fill="currentColor" class="w-6 h-6" />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content class="p-2 bg-bg2 rounded max-w-[min(calc(100vw-16px),380px)] animate-[contentHide] data-[expanded]:animate-[contentShow]">
              <Tooltip.Arrow />
              <p>Refresh (Shift + R)</p>
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Switch
          fallback={
            <For each={Array(20)}>
              {() => <VideoCardFallback layout="sm:grid" />}
            </For>
          }
        >
          <Match when={query.data && query.data?.length > 0}>
            <For
              each={filterContent(
                query.data!,
                preferences,
                sync.store.blocklist
              ).slice(0, limit())}
            >
              {(video) => <VideoCard v={video} />}
            </For>
          </Match>
          <Match
            when={
              appState.sync.ready &&
              !query.data?.length &&
              !Object.keys(sync.store.subscriptions).length
            }
          >
            <div class="h-[80vh] w-full flex items-center justify-center">
              <EmptyState message="You have no subscriptions.">
                <Button as="a" label="Import" href="/import" />
              </EmptyState>
            </div>
          </Match>
          <Match
            when={
              appState.sync.ready &&
              !query.data?.length &&
              Object.keys(sync.store.subscriptions).length
            }
          >
            <ErrorComponent error={query.error} />
          </Match>
        </Switch>
      </div>
      <div ref={setIntersectionRef} class="h-20 " />
    </>
  );

  return newComponent;
}
