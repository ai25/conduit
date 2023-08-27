import { useLocation } from "solid-start";
import VideoCard from "~/components/VideoCard";
import {
  For,
  Show,
  Switch,
  createRenderEffect,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";
import { InstanceContext } from "~/root";
import { z } from "zod";
import { getStorageValue } from "~/utils/storage";
import { RelatedChannel, RelatedPlaylist, RelatedStream } from "~/types";
import { Match } from "solid-js";
import PlaylistCard from "~/components/PlaylistCard";
import { A } from "@solidjs/router";
import { Checkmark } from "~/components/Description";
import { assertType } from "~/utils/helpers";
export interface SearchQuery {
  items: RelatedStream[];
  nextpage: string;
  suggestion: any;
  corrected: boolean;
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
  const selectedFilter = route.query.filter ?? "all";
  const [instance] = useContext(InstanceContext);
  createRenderEffect(() => {
    console.log(route, "route");
  });
  onMount(() => {
    console.log(route);
    handleRedirect();
    window.addEventListener("scroll", handleScroll);
    // if (this.handleRedirect()) return;
    updateResults();
    saveQueryToHistory();
  });
  onCleanup(() => {
    window.removeEventListener("scroll", handleScroll);
  });
  async function fetchResults() {
    return await (
      await fetch(
        `${instance()}/search?q=${route.query.q}&filter=${
          route.query.filter ?? "all"
        }`
      )
    ).json();
  }
  async function updateResults() {
    document.title = route.query.q + " - Conduit";
    const results = await fetchResults();
    console.log(results, "results");
    setResults(results);
  }
  // function updateFilter() {
  //     this.$router.replace({
  //         query: {
  //             search_query: this.$route.query.search_query,
  //             filter: this.selectedFilter,
  //         },
  //     });
  // }
  function handleScroll() {
    // if (this.loading || !this.results || !this.results.nextpage) return;
    // if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
    //     this.loading = true;
    //     this.fetchJson(this.apiUrl() + "/nextpage/search", {
    //         nextpage: this.results.nextpage,
    //         q: this.$route.query.search_query,
    //         filter: this.$route.query.filter ?? "all",
    //     }).then(json => {
    //         this.results.nextpage = json.nextpage;
    //         this.results.id = json.id;
    //         this.loading = false;
    //         json.items.map(stream => this.results.items.push(stream));
    //     });
    // }
  }
  function handleRedirect() {
    // const query = this.$route.query.search_query;
    // const url =
    //     /(?:http(?:s)?:\/\/)?(?:www\.)?youtube\.com(\/[/a-zA-Z0-9_?=&-]*)/gm.exec(query)?.[1] ??
    //     /(?:http(?:s)?:\/\/)?(?:www\.)?youtu\.be\/(?:watch\?v=)?([/a-zA-Z0-9_?=&-]*)/gm
    //         .exec(query)?.[1]
    //         .replace(/^/, "/watch?v=");
    // if (url) {
    //     this.$router.push(url);
    //     return true;
    // }
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
  return (
    <>
      <h1 class="text-center my-2" v-text="$route.query.search_query" />

      <label for="ddlSearchFilters">
        {/* <strong v-text="`${$t('actions.filter')}:`" /> */}
      </label>
      {/* <select id="ddlSearchFilters" v-model="selectedFilter" default="all" class="select w-auto" change="updateFilter()">
        <option v-for="filter in availableFilters" key="filter" value="filter" v-t="`search.${filter}`" />
    </select> */}

      <hr />

      <div v-if="results && results.corrected">
        {/* <i18n-t keypath="search.did_you_mean" tag="div" class="text-lg">
            <router-link to="{ name: 'SearchResults', query: { search_query: results.suggestion } }">
                <em v-text="results.suggestion" />
            </router-link>
        </i18n-t> */}
      </div>

      <div class="flex flex-wrap">
        <For each={results()?.items}>
          {(item) => (
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
                  <div class="w-44 mx-1 flex flex-col gap-2 items-start">
                    <A href={item.url} class="group outline-none">
                      <div class="relative w-20 overflow-hidden rounded-full group-hover:ring-2 group-focus-visible:ring-2  ring-accent1 transition-all duration-200">
                        <img
                          class="w-full rounded-full group-hover:scale-105 group-focus-visible:scale-105"
                          src={item.thumbnail}
                          loading="lazy"
                        />
                      </div>
                    </A>
                    <A class="link" href={item.url}>
                      <div class="flex gap-1">
                        <span>{item.name}</span>
                        <Show when={item.verified}>
                          <Checkmark />
                        </Show>
                      </div>
                    </A>

                    {/* <template v-if="props.item.videos >= 0">
                      <br v-if="props.item.uploaderName" />
                      <strong v-text="`${props.item.videos} ${$t('video.videos')}`" />
                    </template> */}

                    <br />
                  </div>
                )}
              </Match>
              <Match
                when={assertType<RelatedPlaylist>(item, "type", "playlist")}
                keyed>
                {(item) => <PlaylistCard item={item} />}
              </Match>
            </Switch>
          )}
        </For>
      </div>
    </>
  );
}
