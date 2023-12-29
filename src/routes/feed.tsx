import {
  For,
  Show,
  createEffect,
  createSignal,
  useContext,
  Suspense,
  createMemo,
  onCleanup,
} from "solid-js";
import { Spinner } from "~/components/PlayerContainer";
import { RelatedStream } from "~/types";
import { getStorageValue } from "~/utils/storage";
import { Title } from "solid-start";
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
import VideoCard from "~/components/VideoCard";
import { memo } from "solid-js/web";
import Button from "~/components/Button";

export default function Feed() {
  const [limit, setLimit] = createSignal(10);
  const [preferences] = usePreferences();
  const sync = useSyncStore();
  const query = createQuery<RelatedStream[]>(
    () => ({
      queryKey: [
        "feed",
        preferences.instance.api_url,
        sync.store.subscriptions,
      ],
      queryFn: async (): Promise<RelatedStream[]> => {
        const res = await fetch(
          preferences.instance.api_url + "/feed/unauthenticated",
          {
            method: "POST",
            body: JSON.stringify(Object.keys(sync.store.subscriptions)),
          }
        );
        if (!res.ok) {
          throw new Error("Error fetching feed");
        }
        return res.json() as Promise<RelatedStream[]>;
      },
      enabled: preferences.instance?.api_url &&
        Object.keys(sync.store.subscriptions).length > 0
        ? true
        : false,
      placeholderData: Array(50).fill(undefined),
    refetchOnMount: true,
    refetchOnReconnect: true,
    })
  );

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
  console.log(sync.store.subscriptions, Object.keys(sync.store.subscriptions), "feed");
  setAppState({
    loading: query.isInitialLoading || query.isRefetching || query.isFetching,
  });
});
createEffect(() => {
  console.log(query.data, "feed");
});

const newComponent = (
  <>
    <Suspense fallback={<Spinner />}>
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

      <Show when={!Object.keys(sync.store.subscriptions).length}>
        <div class="h-[80vh] w-full flex items-center justify-center">
          <EmptyState message="You have no subscriptions.">
            <Button as="a" label="Import" href="/import" />
          </EmptyState>
        </div>
      </Show>
      <Show when={Object.keys(sync.store.subscriptions).length}>
        <div class="mx-2 flex flex-wrap gap-2 justify-center">
          <Show when={!Array.isArray(query.data)}>
            <ErrorComponent error={query.data} />
          </Show>
          <Show when={query.data && query.data.length > 0}>
            <For each={query.data?.filter(
                    (item) =>
                      !sync.store.blocklist[item?.uploaderUrl?.split("/").pop()!]
                  )
                .slice(0, limit())}>
              {(video) => <VideoCard v={video} />}
            </For>
          </Show>
        </div>
      </Show>
      <div ref={setIntersectionRef} class="h-20 "></div>
    </Suspense>
  </>
);

return newComponent;
}
