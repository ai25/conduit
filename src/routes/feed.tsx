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

export default function Feed() {
  const [limit, setLimit] = createSignal(100);
  const channels = () =>
    getStorageValue("localSubscriptions", [], "json", "localStorage");
  const [preferences] = usePreferences();

  const sync = useSyncedStore();
  const query = createQuery(
    () => ["feed"],
    async (): Promise<RelatedStream[]> =>
      (
        await fetch(preferences.instance.api_url + "/feed/unauthenticated", {
          method: "POST",
          body: JSON.stringify(channels()),
        })
      ).json(),
    {
      get enabled() {
        return preferences.instance?.api_url && channels()?.length > 0
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
      <Title>Feed | Conduit</Title>
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
      <div ref={setIntersectionRef} class="h-20 "></div>
    </>
  );
}
