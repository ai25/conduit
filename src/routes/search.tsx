import { useLocation } from "solid-start";
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
} from "solid-js";
import { InstanceContext } from "~/root";
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
  const [instance] = useContext(InstanceContext);
  const [fetching, setFetching] = createSignal(false);
  const [appState, setAppState] = useAppState();

  onMount(() => {
    updateResults();
    saveQueryToHistory();
  });
  async function fetchResults() {
    return await (
      await fetch(
        `${instance().api_url}/search?q=${
          route.query.q
        }&filter=${selectedFilter()}`
      )
    ).json();
  }
  async function updateResults() {
    setAppState({ loading: true });
    document.title = route.query.q + " - Conduit";
    const results = await fetchResults();
    console.log(results, "results");
    setResults(results);
    setAppState({ loading: false });
  }
  function updateFilter(value: string) {
    setSelectedFilter(value);
    console.log(location, route);
    const url = new URL(location.origin + route.pathname + route.search);
    url.searchParams.set("filter", value);
    location.replace(url);
    // fetchResults()
  }
  async function fetchNextPage() {
    if (fetching() || !results()?.nextpage) {
      console.log("checking:", fetching(), "nextpage:", results()?.nextpage);
      return;
    }
    setAppState({ loading: true });
    setFetching(true);
    const nextPage = await fetchJson(`${instance().api_url}/nextpage/search`, {
      nextpage: results()!.nextpage,
      q: route.query.q,
      filter: route.query.filter ?? "all",
    });
    console.log(nextPage, "nextPage");
    if (nextPage.items?.length > 0) {
      setResults((results) => ({
        ...results,
        items: [...results!.items, ...nextPage.items],
        nextpage: nextPage.nextpage,
      }));
    }
    setAppState({ loading: false });
    setFetching(false);
    // if there aren't enough results to fill the page the intersection observer won't trigger
    setTimeout(() => {
      checkIntersection();
    }, 1000);
  }
  async function checkIntersection() {
    const parentBottom = parentRef()!.getBoundingClientRect().bottom;
    const intersectionBottom =
      intersectionRef()!.getBoundingClientRect().bottom;
    if (intersectionBottom < parentBottom) {
      await fetchNextPage();
      console.log("fetching next page");
    }
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
  const [intersectionObserver, setIntersectionObserver] = createSignal<
    IntersectionObserver | undefined
  >();
  function handleScroll(e: any) {
    const entry = e[0];
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }

  createEffect(() => {
    console.log(intersectionRef(), "intersection");
    if (!intersectionRef()) return;

    setIntersectionObserver(
      new IntersectionObserver(handleScroll, {
        threshold: 0.1,
      })
    );

    intersectionObserver()!.observe(intersectionRef()!);
  });

  const [filtersModalOpen, setFiltersModalOpen] = createSignal(false);
  const [filterErrors, setFilterErrors] = createSignal<string[]>([]);
  const [filter, setFilter] = createSignal<Filter>({
    conditions: [],
    operators: [],
  });
  return (
    <>
      <h1 class="text-center my-2" v-text="$route.query.search_query" />

      <label for="ddlSearchFilters">
        {/* <strong v-text="`${$t('actions.filter')}:`" /> */}
      </label>
      {/* <select id="ddlSearchFilters" v-model="selectedFilter" default="all" class="select w-auto" change="updateFilter()">
        <option v-for="filter in availableFilters" key="filter" value="filter" v-t="`search.${filter}`" />
    </select> */}
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

      <hr />
      <Show when={filterErrors().length > 0}>
        <div class="bg-red-300 p-2 rounded-md text-red-900 flex justify-between items-center">
          <span>{filterErrors()[filterErrors().length - 1]}</span>
          <span>x{filterErrors().length}</span>{" "}
        </div>
      </Show>
      <Modal
        isOpen={filtersModalOpen()}
        setIsOpen={setFiltersModalOpen}
        title="Advanced Filters">
        <div class="flex justify-center items-start h-full min-w-[20rem] min-h-[10rem]">
          <FilterEditor filter={filter()} setFilter={setFilter} />
        </div>
      </Modal>
      <Show when={results()?.corrected}>
        <div class="mt-2">
          <p class="">
            Did you mean{" "}
            <A
              href={`/search?q=${
                results()!.suggestion
              }&filter=${selectedFilter}`}
              class="link !text-accent1">
              {results()!.suggestion}
            </A>
            ?
          </p>
        </div>
      </Show>

      <div
        ref={(ref) => setParentRef(ref)}
        class="flex flex-wrap justify-center min-h-screen h-full items-start">
        <For
          // remove duplicates
          each={results()?.items.filter(
            (item, index, self) =>
              self.findIndex((t) => t.url === item.url) === index
          )}
          fallback={
            <For each={Array(20).fill(0)}>
              {() => <VideoCard v={undefined} />}
            </For>
          }>
          {(item) => (
            <Show
              when={evaluateFilter(filter(), item as any, (e) =>
                setFilterErrors((errors) => [...errors, (e as Error).message])
              )}>
              <Switch>
                <Match
                  when={assertType<RelatedStream>(item, "type", "stream")}
                  keyed>
                  {(item) => <VideoCard v={item} />}
                </Match>
                <Match
                  when={assertType<RelatedChannel>(item, "type", "channel")}
                  keyed>
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
                            <p class="two-line-ellipsis ">{item.description}</p>
                          </Show>
                          <Show when={item.subscribers >= 0} fallback={<p></p>}>
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
                  when={assertType<RelatedPlaylist>(item, "type", "playlist")}
                  keyed>
                  {(item) => <PlaylistCard item={item} />}
                </Match>
              </Switch>
            </Show>
          )}
        </For>

        <Show when={appState.loading}>
          <div class="w-full flex justify-center">
            <Spinner />
          </div>
        </Show>
        <div ref={(ref) => setIntersectionRef(ref)} class="w-full h-20 mt-2" />
      </div>
    </>
  );
}
