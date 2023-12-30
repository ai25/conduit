import {
  For,
  Show,
  Switch,
  createEffect,
  createSignal,
  ErrorBoundary,
} from "solid-js";
import { getStorageValue } from "~/utils/storage";
import {
  ContentItem,
  RelatedChannel,
  RelatedPlaylist,
  RelatedStream,
} from "~/types";
import { Match } from "solid-js";
import { A, useSearchParams } from "@solidjs/router";
import { Checkmark } from "~/components/Description";
import { assertType, fetchJson } from "~/utils/helpers";
import numeral from "numeral";
import Button from "~/components/Button";
import SubscribeButton from "~/components/SubscribeButton";
import { Spinner } from "~/components/PlayerContainer";
import Select from "~/components/Select";
import Modal from "~/components/Modal";
import { useAppState } from "~/stores/appStateStore";
import FilterEditor, {
  Filter,
  evaluateFilter,
} from "~/components/FilterEditor";
import { createInfiniteQuery } from "@tanstack/solid-query";
import { useSyncStore } from "~/stores/syncStore";
import useIntersectionObserver from "~/hooks/useIntersectionObserver";
import EmptyState from "~/components/EmptyState";
import { usePreferences } from "~/stores/preferencesStore";
import { Suspense } from "solid-js";
import { isServer } from "solid-js/web";
import VideoCard from "~/components/content/stream/VideoCard";
import PlaylistCard from "~/components/content/playlist/PlaylistCard";
import ChannelCard from "~/components/content/channel/ChannelCard";
export interface SearchQuery {
  items: ContentItem[];
  nextpage: string;
  suggestion?: any;
  corrected?: boolean;
}

export default function Search() {
  const availableFilters = [
    "all",
    "videos",
    "channels",
    "playlists",
    "music_songs",
    "music_videos",
    "music_albums",
    "music_playlists",
  ];
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedFilter, setSelectedFilter] = createSignal(
    searchParams.filter ?? "all"
  );
  const sync = useSyncStore();
  const [appState, setAppState] = useAppState();
  const [preferences] = usePreferences();

  const fetchSearch = async ({
    pageParam = "initial",
  }): Promise<SearchQuery> => {
    if (pageParam === "initial") {
      return await (
        await fetch(
          `${preferences.instance.api_url}/search?q=${searchParams.search_query
          }&filter=${selectedFilter()}`
        )
      ).json();
    } else {
      return await fetchJson(
        `${preferences.instance.api_url}/nextpage/search`,
        {
          nextpage: pageParam,
          q: searchParams.search_query,
          filter: selectedFilter(),
        }
      );
    }
  };

  const query = createInfiniteQuery(
    () => ({
      queryKey: ["search", searchParams.search_query, selectedFilter()],
      queryFn: fetchSearch,
      enabled: preferences.instance?.api_url &&
        searchParams.search_query &&
        selectedFilter() &&
        !isServer
        ? true
        : false,
      getNextPageParam: (lastPage) => {
        return lastPage.nextpage;
      },
      refetchOnMount: false,
      refetchOnReconnect: false,
      initialPageParam: "initial",
      initialData: () => undefined
    })
  );

  createEffect(() => {
    document.title = searchParams.search_query + " - Conduit";
    saveQueryToHistory();
  });

  createEffect(() => {
    console.log(
      "app state loading",
      query.isLoading,
      query.isFetching,
    );
    setAppState({
      loading:
        query.isLoading ||
        query.isFetching ||
        query.isRefetching,
    });
  });

  const intersecting = useIntersectionObserver({
    setTarget: () => intersectionRef(),
  });
  let interval: any;
  createEffect(() => {
    console.log(intersecting(), intersectionRef(), "intersecting");
    if (intersecting()) {
      query.fetchNextPage();
      return;
    }
    if (!query.isFetching || !query.hasNextPage) return;
    clearInterval(interval);
    interval = setInterval(() => {
      const parentBottom = parentRef()!.getBoundingClientRect().bottom;
      const intersectionBottom =
        intersectionRef()!.getBoundingClientRect().bottom;
      if (intersectionBottom < parentBottom) {
        query.fetchNextPage();
        console.log("fetching next page");
      }
    }, 1000);
  });

  function updateFilter(value: string) {
    setSelectedFilter(value);
    setSearchParams({ filter: value });
  }

  function saveQueryToHistory() {
    const query = searchParams.search_query;
    if (!query) return;
    const searchHistory = getStorageValue(
      "search_history",
      [],
      "json",
      "localStorage"
    );
    if (searchHistory.includes(query)) {
      const index = searchHistory.indexOf(query);
      searchHistory.splice(index, 1);
    }
    searchHistory.unshift(query);
    if (searchHistory.length > 10) searchHistory.shift();
    localStorage.setItem("search_history", JSON.stringify(searchHistory));
  }

  const [parentRef, setParentRef] = createSignal<HTMLDivElement | undefined>(
    undefined
  );
  const [intersectionRef, setIntersectionRef] = createSignal<
    HTMLDivElement | undefined
  >(undefined);

  const [filtersModalOpen, setFiltersModalOpen] = createSignal(false);
  const [filterErrors, setFilterErrors] = createSignal<string[]>([]);
  const [filter, setFilter] = createSignal<Filter>(
    (!isServer &&
      JSON.parse(localStorage.getItem("search_filter") ?? "null")) ?? {
      conditions: [],
      operators: [],
    }
  );

  return (
    <>
      <Suspense
        fallback={
          <div class="flex flex-wrap py-12 items-center justify-center w-full h-full">
            <For each={Array(40).fill(0)}>
              {() => <VideoCard v={undefined} />}
            </For>
          </div>
        }
      >
        <div class="flex items-center justify-between my-2">
          <Select
            options={availableFilters.map((filter) => ({
              value: filter,
              label: filter
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase()),
            }))}
            value={{ value: selectedFilter(), label: selectedFilter().replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), disabled: false }}
            onChange={(value) => updateFilter(value.value)}
          />
          <button onClick={() => setFiltersModalOpen(true)}>
            Advanced Filters
          </button>
        </div>

        <Show when={filterErrors().length > 0}>
          <div class="bg-red-300 p-2 rounded-md text-red-900 flex justify-between items-center">
            <span>{filterErrors()[filterErrors().length - 1]}</span>
            <span>x{filterErrors().length}</span>{" "}
          </div>
        </Show>
        <ErrorBoundary
          fallback={(err, reset) => (
            <div>
              Something went wrong {"\n"}
              {err.message}
              <button onClick={reset}>Retry</button>
            </div>
          )}
        >
          <Modal
            isOpen={filtersModalOpen()}
            setIsOpen={setFiltersModalOpen}
            title="Advanced Filters"
          >
            <div class="flex flex-col justify-center items-center gap-4 h-full min-w-[20rem] min-h-[10rem]">
              <FilterEditor filter={filter()} setFilter={setFilter} />
              <div class="flex flex-col gap-2">
                <div class="flex gap-2">
                  <Button
                    appearance="link"
                    label="Save Filter"
                    onClick={() => {
                      localStorage.setItem(
                        "search_filter",
                        JSON.stringify(filter())
                      );
                    }}
                  />
                  <Button
                    appearance="subtle"
                    label="Clear Filter"
                    onClick={() => {
                      setFilterErrors([]);
                      setFilter({ conditions: [], operators: [] });
                    }}
                  />
                </div>

                <Button
                  label="Done"
                  onClick={() => {
                    setFiltersModalOpen(false);
                  }}
                />
              </div>
            </div>
          </Modal>
        </ErrorBoundary>
        <Show when={query.data?.pages?.[0].corrected}>
          <div class="mt-2">
            <p class="">
              Did you mean{" "}
              <A
                href={`/results?search_query=${query.data?.pages[0].suggestion
                  }&filter=${selectedFilter()}`}
                class="link !text-accent1"
              >
                {query.data?.pages[0].suggestion}
              </A>
              ?
            </p>
          </div>
        </Show>

        <div
          ref={(ref) => setParentRef(ref)}
          class="flex flex-wrap justify-center min-h-screen h-full items-start"
        >
          <Show when={query.data?.pages?.[0]?.items.length === 0}>
            <div class="flex flex-col items-center justify-center w-full h-full">
              <EmptyState />
            </div>
          </Show>
          <Show
            when={
              query.data?.pages?.[0]?.items &&
              query.data.pages[0].items.length > 0
            }
            fallback={
              <For each={Array(40).fill(0)}>
                {() => <VideoCard v={undefined} />}
              </For>
            }
          >
            <For
              each={query
                .data!.pages?.map((page) => page.items)
                .flat()
                // remove duplicates
                .filter(
                  (item, index, self) =>
                    self.findIndex((t) => t?.url === item?.url) === index
                )
                // blocklist
                .filter(
                  (item) =>
                    !sync.store.blocklist[(item as RelatedStream).uploaderUrl?.split("/").pop()!]
                )
              }
            >
              {(item) => (
                <Show
                  when={evaluateFilter(filter(), item as any, (e) =>
                    setFilterErrors((errors) => [
                      ...errors,
                      (e as Error).message,
                    ])
                  )}
                >
                  <Switch>
                    <Match
                      when={assertType<RelatedStream>(item, "type", "stream")}
                      keyed
                    >
                      {(item) => <VideoCard v={item} />}
                    </Match>
                    <Match
                      when={assertType<RelatedChannel>(item, "type", "channel")}
                      keyed
                    >
                      {(item) => (
                      <ChannelCard item={item} />
                      )}
                    </Match>
                    <Match
                      when={assertType<RelatedPlaylist>(
                        item,
                        "type",
                        "playlist"
                      )}
                      keyed
                    >
                      {(item) => <PlaylistCard item={item} />}
                    </Match>
                  </Switch>
                </Show>
              )}
            </For>
          </Show>

          <Show when={appState.loading}>
            <div class="w-full flex justify-center">
              <Spinner />
            </div>
          </Show>
          <div
            ref={(ref) => setIntersectionRef(ref)}
            class="w-full h-20 mt-2"
          />
        </div>
      </Suspense>
    </>
  );
}
