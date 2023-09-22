import { For, Show, createEffect, createSignal, useContext } from "solid-js";
import VideoCard from "~/components/VideoCard";
import { Spinner } from "~/components/PlayerContainer";
import { RelatedStream } from "~/types";
import { getStorageValue } from "~/utils/storage";
import { Title } from "solid-start";
import { createQuery } from "@tanstack/solid-query";
import { useSyncedStore } from "~/stores/syncedStore";
import { ErrorComponent } from "~/components/Error";
import useIntersectionObserver from "~/hooks/useIntersectionObserver";
import EmptyState from "~/components/EmptyState";
import { A } from "@solidjs/router";
import { useAppState } from "~/stores/appStateStore";
import { usePreferences } from "~/stores/preferencesStore";
import { Button, Tooltip } from "@kobalte/core";
import { FaSolidArrowsRotate } from "solid-icons/fa";

export default function Feed() {
  const [limit, setLimit] = createSignal(100);
  const [preferences] = usePreferences();

  const sync = useSyncedStore();
  const query = createQuery(
    () => ["feed"],
    async (): Promise<RelatedStream[]> =>
      (
        await fetch(preferences.instance.api_url + "/feed/unauthenticated", {
          method: "POST",
          body: JSON.stringify(sync.store.subscriptions),
        })
      ).json(),
    {
      get enabled() {
        return preferences.instance?.api_url &&
          sync.store.subscriptions?.length > 0
          ? true
          : false;
      },
      placeholderData: Array(50).fill(undefined),
    }
  );

  const [intersectionRef, setIntersectionRef] = createSignal<
    HTMLDivElement | undefined
  >();
  const isIntersecting = useIntersectionObserver({
    setTarget: () => intersectionRef(),
  });
  createEffect(() => {
    console.log(query.data);
    if (isIntersecting()) {
      setLimit((l) => l + 10);
    }
  });
  const [appState, setAppState] = useAppState();
  createEffect(() => {
    setAppState({
      loading: query.isInitialLoading || query.isRefetching || query.isFetching,
    });
  });
  return (
    <>
      <Tooltip.Root>
        <Tooltip.Trigger
          class="fixed bottom-20 sm:bottom-10 right-10 rounded-full w-10 h-10 bg-primary z-50 flex items-center justify-center"
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
      <Title>Feed | Conduit</Title>

      <Show when={!appState.synced}>
        <div class="fixed inset-0 flex items-center justify-center">
          <div class="bg-bg2 rounded p-4">
            <p class="text-center">Syncing...</p>
          </div>
        </div>
      </Show>
      <Show when={!sync.store.subscriptions?.length && appState.synced}>
        <div class="h-[80vh] w-full flex items-center justify-center">
          <EmptyState />
        </div>
      </Show>
      <Show when={sync.store.subscriptions?.length}>
        <div class="mx-2 flex flex-wrap justify-center">
          <Show when={!Array.isArray(query.data)}>
            <ErrorComponent error={query.data} />
          </Show>
          <Show when={query.data && query.data.length > 0}>
            <For each={query.data?.slice(0, limit())}>
              {(video) => <VideoCard v={video} />}
            </For>
          </Show>
          <Show when={query.data && query.data.length === 0}>
            <div class="h-[80vh] items-center justify-center flex flex-col gap-2">
              <EmptyState />
              <A href="/import">Import subscriptions</A>
            </div>
          </Show>
        </div>
      </Show>
      <div ref={setIntersectionRef} class="h-20 "></div>
    </>
  );
}
