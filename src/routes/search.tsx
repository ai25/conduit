import { useLocation, useNavigate } from "solid-start";
import VideoCard from "~/components/VideoCard";
import {
  For,
  Show,
  Switch,
  createEffect,
  createRenderEffect,
  createSignal,
  onCleanup,
  onMount,
  useContext,
  ErrorBoundary,
} from "solid-js";
import { set, z } from "zod";
import { getStorageValue } from "~/utils/storage";
import {
  ContentItem,
  RelatedChannel,
  RelatedPlaylist,
  RelatedStream,
} from "~/types";
import { Match } from "solid-js";
import PlaylistCard from "~/components/PlaylistCard";
import { A } from "@solidjs/router";
import { Checkmark } from "~/components/Description";
import { assertType, fetchJson } from "~/utils/helpers";
import numeral from "numeral";
import Button from "~/components/Button";
import SubscribeButton from "~/components/SubscribeButton";
import { Spinner } from "~/components/PlayerContainer";
import Field from "~/components/Field";
import Select from "~/components/Select";
import { FaSolidMinus, FaSolidPlus, FaSolidX } from "solid-icons/fa";
import { RadioGroup } from "@kobalte/core";
import { Transition } from "solid-headless";
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
export interface SearchQuery {
  items: ContentItem[];
  nextpage: string;
  suggestion?: any;
  corrected?: boolean;
}

export default function Search() {
  const [results, setResults] = createSignal<SearchQuery>();
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
  const route = useLocation();
  const [selectedFilter, setSelectedFilter] = createSignal(
    route.query.filter ?? "all"
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
          `${preferences.instance.api_url}/search?q=${
            route.query.q
          }&filter=${selectedFilter()}`
        )
      ).json();
    } else {
      return await fetchJson(
        `${preferences.instance.api_url}/nextpage/search`,
        {
          nextpage: pageParam,
          q: route.query.q,
          filter: selectedFilter(),
        }
      );
    }
  };

  const query = createInfiniteQuery(
    () => ["search", route.query.q, selectedFilter()],
    fetchSearch,
    {
      get enabled() {
        console.log("enabled", route.query.q);
        return preferences.instance?.api_url &&
          route.query.q &&
          selectedFilter() &&
          !isServer
          ? true
          : false;
      },
      getNextPageParam: (lastPage) => {
        return lastPage.nextpage;
      },
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  onMount(() => {
    document.title = route.query.q + " - Conduit";
    saveQueryToHistory();
  });
  createEffect(() => {
    console.log(
      "app state loading",
      query.isLoading,
      query.isFetching,
      query.isInitialLoading
    );
    setAppState({
      loading:
        query.isInitialLoading ||
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
  const navigate = useNavigate();
  function updateFilter(value: string) {
    setSelectedFilter(value);
    console.log(location, route);
    const url = new URL(location.origin + route.pathname + route.search);
    url.searchParams.set("filter", value);
    navigate(url.pathname + url.search);
    // fetchResults()
  }

  function saveQueryToHistory() {
    const query = route.query.q;
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
            options={availableFilters}
            defaultValue="all"
            value={selectedFilter()}
            onChange={(value) => updateFilter(value)}
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
            <div class="flex flex-col justify-center items-center gap-2 h-full min-w-[20rem] min-h-[10rem]">
              <FilterEditor filter={filter()} setFilter={setFilter} />
              <Button
                label="Save Filter"
                onClick={() => {
                  localStorage.setItem(
                    "search_filter",
                    JSON.stringify(filter())
                  );
                }}
              />
            </div>
          </Modal>
        </ErrorBoundary>
        <Show when={query.data?.pages?.[0].corrected}>
          <div class="mt-2">
            <p class="">
              Did you mean{" "}
              <A
                href={`/search?q=${
                  query.data?.pages[0].suggestion
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
          class="flex flex-wrap justify-evenly min-h-screen h-full items-start"
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
              // remove duplicates
              each={query
                .data!.pages?.map((page) => page.items)
                .flat()
                .filter(
                  (item, index, self) =>
                    self.findIndex((t) => t?.url === item?.url) === index
                )}
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
                        <div class="mx-4 my-2 flex flex-col gap-2 items-start w-full lg:w-72 max-h-20 lg:max-h-full max-w-md">
                          <div class="flex items-center gap-2 w-full lg:flex-col lg:items-start">
                            <A href={item.url} class="group outline-none">
                              <div class="relative w-20 overflow-hidden rounded-full group-hover:ring-2 group-focus-visible:ring-2  ring-accent1 transition-all duration-200">
                                <img
                                  class="w-full rounded-full group-hover:scale-105 group-focus-visible:scale-105"
                                  src={item.thumbnail}
                                  loading="lazy"
                                />
                              </div>
                            </A>
                            <div class="flex flex-col justify-center gap-1 min-w-0 w-full h-20 max-h-20 text-text2 text-xs self-end">
                              <div class="flex items-center gap-1">
                                <A class="link text-sm" href={item.url}>
                                  <div class="flex gap-1">
                                    <span>{item.name}</span>
                                    <Show when={item.verified}>
                                      <Checkmark />
                                    </Show>
                                  </div>
                                </A>
                                <Show when={item.videos >= 0}>
                                  <p>&#183; {item.videos} videos</p>
                                </Show>
                              </div>
                              <Show when={item.description}>
                                <p class="two-line-ellipsis ">
                                  {item.description}
                                </p>
                              </Show>
                              <Show
                                when={item.subscribers >= 0}
                                fallback={<p></p>}
                              >
                                <p>
                                  {numeral(item.subscribers)
                                    .format("0a")
                                    .toUpperCase()}{" "}
                                  subscribers
                                </p>
                              </Show>
                            </div>
                            <SubscribeButton id={item.url.split("/").pop()!} />
                          </div>
                        </div>
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
