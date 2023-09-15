import VideoCard from "~/components/VideoCard";

import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  useContext,
  createMemo,
} from "solid-js";
import { ErrorMessage, useLocation } from "solid-start";
import { getStorageValue, setStorageValue } from "~/utils/storage";
import {
  ContentItem,
  Channel as PipedChannel,
  RelatedChannel,
  RelatedPlaylist,
  RelatedStream,
  Tab,
} from "~/types";
import Button from "~/components/Button";
import { Spinner } from "~/components/PlayerContainer";
import { assertType, fetchJson } from "~/utils/helpers";
import { A } from "@solidjs/router";
import { Checkmark } from "~/components/Description";
import PlaylistCard from "~/components/PlaylistCard";
import useIntersectionObserver from "~/hooks/useIntersectionObserver";
import { useAppState } from "~/stores/appStateStore";
import SubscribeButton from "~/components/SubscribeButton";
import { usePreferences } from "~/stores/preferencesStore";
import {
  createInfiniteQuery,
  CreateInfiniteQueryResult,
} from "@tanstack/solid-query";
import { isServer } from "solid-js/web";
import EmptyState from "~/components/EmptyState";

export default function Channel() {
  const [channel, setChannel] = createSignal<PipedChannel | undefined>();
  const [error, setError] = createSignal<Error | undefined>();
  const [tabs, setTabs] = createSignal<any[]>([]);
  const [selectedTab, setSelectedTab] = createSignal("videos");
  const [preferences] = usePreferences();
  const route = useLocation();
  // onMount(() => {
  //   getChannelData();
  // });

  const [appState, setAppState] = useAppState();

  async function fetchChannelOrNextPage({
    pageParam,
  }: {
    pageParam?: string;
  }): Promise<PipedChannel> {
    if (!pageParam) {
      const url = `${preferences.instance.api_url}${route.pathname}/`;
      return fetch(url).then((res) => res.json());
    } else {
      return await fetchJson(
        `${preferences.instance.api_url}/nextpage/channel/${query.data?.pages[0].id}`,
        {
          nextpage: pageParam,
        }
      );
    }
  }

  const query = createInfiniteQuery(
    () => ["channelData"],
    fetchChannelOrNextPage,
    {
      getNextPageParam: (lastPage) => lastPage.nextpage,
      get enabled() {
        return !!route?.pathname && preferences?.instance?.api_url && !isServer
          ? true
          : false;
      },
    }
  );
  // Fetching logic for tabs
  async function fetchTabNextPage(
    data: string,
    { pageParam }: { pageParam?: string }
  ): Promise<any> {
    if (!pageParam) {
      return await fetchJson(`${preferences.instance.api_url}/channels/tabs`, {
        data: data,
      });
    } else {
      return await fetchJson(`${preferences.instance.api_url}/channels/tabs`, {
        nextpage: pageParam ?? null,
      });
    }
  }

  const shortsQuery = createInfiniteQuery(
    () => ["tabData", "shorts"],
    (context) =>
      fetchTabNextPage(
        query.data!.pages[0].tabs!.find((tab) => tab.name === "shorts")!.data!,
        context
      ),
    {
      getNextPageParam: (lastPage) => lastPage.nextpage,
      get enabled() {
        return query.data?.pages?.[0]?.tabs?.find(
          (tab) => tab.name === "shorts"
        )?.data &&
          !isServer &&
          !!route?.pathname &&
          preferences?.instance?.api_url &&
          selectedTab() === "shorts"
          ? true
          : false;
      },
    }
  );
  const livestreamsQuery = createInfiniteQuery(
    () => ["tabData", "livestreams"],
    (context) =>
      fetchTabNextPage(
        query.data!.pages[0].tabs!.find((tab) => tab.name === "livestreams")!
          .data!,
        context
      ),
    {
      getNextPageParam: (lastPage) => lastPage.nextpage,
      get enabled() {
        return query.data?.pages?.[0]?.tabs?.find(
          (tab) => tab.name === "livestreams"
        )?.data &&
          !isServer &&
          !!route?.pathname &&
          preferences?.instance?.api_url &&
          selectedTab() === "livestreams"
          ? true
          : false;
      },
    }
  );
  const channelsQuery = createInfiniteQuery(
    () => ["tabData", "channels"],
    (context) =>
      fetchTabNextPage(
        query.data!.pages[0].tabs!.find((tab) => tab.name === "channels")!
          .data!,
        context
      ),
    {
      getNextPageParam: (lastPage) => lastPage.nextpage,
      get enabled() {
        return query.data?.pages?.[0]?.tabs?.find(
          (tab) => tab.name === "channels"
        )?.data &&
          !isServer &&
          !!route?.pathname &&
          preferences?.instance?.api_url &&
          selectedTab() === "channels"
          ? true
          : false;
      },
    }
  );
  const playlistsQuery = createInfiniteQuery(
    () => ["tabData", "playlists"],
    (context) =>
      fetchTabNextPage(
        query.data!.pages[0].tabs!.find((tab) => tab.name === "playlists")!
          .data!,
        context
      ),
    {
      getNextPageParam: (lastPage) => lastPage.nextpage,
      get enabled() {
        return query.data?.pages?.[0]?.tabs?.find(
          (tab) => tab.name === "playlists"
        )?.data &&
          !isServer &&
          !!route?.pathname &&
          preferences?.instance?.api_url &&
          selectedTab() === "playlists"
          ? true
          : false;
      },
    }
  );

  const tabQueries = new Map<string, CreateInfiniteQueryResult<any>>();

  createEffect(() => {
    if (!query.data) return;
    const channel = query.data.pages[0];
    if (!channel) return;
    document.title = `${channel.name} - Conduit`;
    const tabs = channel.tabs;
    if (!tabs) return;
    console.log("tabs", tabs);
    setTabs([{ name: "videos", data: null }, ...tabs]);
    for (const tab of tabs) {
      if (!tabQueries.has(tab.name)) {
        switch (tab.name) {
          case "videos":
            tabQueries.set(tab.name, query);
            break;
          case "shorts":
            tabQueries.set(tab.name, shortsQuery);
            break;
          case "livestreams":
            tabQueries.set(tab.name, livestreamsQuery);
            break;
          case "channels":
            tabQueries.set(tab.name, channelsQuery);
            break;
          case "playlists":
            tabQueries.set(tab.name, playlistsQuery);
            break;
          default:
            break;
        }
      }
    }
  });
  const [currentQuery, setCurrentQuery] =
    createSignal<CreateInfiniteQueryResult<any>>(query);

  const isIntersecting = useIntersectionObserver({
    setTarget: () => intersection(),
    threshold: 0.1,
  });

  createEffect(() => {
    if (isIntersecting()) {
      console.log("intersecting");
      if (currentQuery().isFetchingNextPage) return;
      if (!currentQuery().hasNextPage) return;

      currentQuery().fetchNextPage();
      console.log(query.data);
    }
  });

  function loadTab(index: number) {
    setSelectedTab(tabs()[index].name);
    setCurrentQuery(tabQueries.get(tabs()[index].name) ?? query);
    console.log(route.pathname, "route", new URL(window.location.href));

    // update the tab query in the url path
    // const url = new URL(window.location.href);
    // url.searchParams.set("tab", tabs()[index].name ?? "videos");
    // history.replaceState(window.history.state, "", url);
  }

  const [intersection, setIntersection] = createSignal<
    HTMLDivElement | undefined
  >(undefined);

  return (
    <div>
      <div class="flex justify-center place-items-center">
        <img
          height="48"
          width="48"
          class="rounded-full m-1"
          src={channel()?.avatarUrl}
        />
        <h1 v-text="channel.name" />
        {/* <font-awesome-icon class="ml-1.5 !text-3xl" v-if="channel.verified" icon="check" /> */}
      </div>
      <Show when={channel()?.bannerUrl}>
        <img src={channel()!.bannerUrl} class="w-full pb-1.5" loading="lazy" />
      </Show>
      <p class="whitespace-pre-wrap">
        <span innerHTML={channel()?.description} />
      </p>

      <Show when={channel()?.id}>
        <SubscribeButton id={channel()!.id!} />
      </Show>

      <div class="flex mt-4 mb-2">
        <For each={tabs()}>
          {(tab, index) => {
            console.log(selectedTab(), index(), tab.name);
            return (
              <Button
                label={tab.name}
                activated={selectedTab() == tab.name}
                onClick={() => loadTab(index())}
              />
            );
          }}
        </For>
      </div>

      <hr />

      <div class="flex flex-wrap justify-center">
        <Switch fallback={<Spinner />}>
          <Match when={currentQuery().error}>
            <ErrorMessage error={currentQuery().error} />
          </Match>
          <Match
            when={
              currentQuery().isSuccess &&
              (!currentQuery().data?.pages ||
                !currentQuery().data?.pages?.[0] ||
                !(
                  currentQuery().data?.pages?.[0]?.relatedStreams ||
                  currentQuery().data?.pages?.[0]?.content
                ))
            }
          >
            <EmptyState />
          </Match>
          <Match
            when={
              currentQuery().isSuccess
              // currentQuery().data?.pages?.[0] &&
              // (currentQuery().data?.pages?.[0]?.relatedStreams ||
              //   currentQuery().data?.pages?.[0]?.content)
            }
          >
            <For
              each={currentQuery()
                .data?.pages?.map((page) => page.relatedStreams ?? page.content)
                .flat()}
            >
              {(item) => {
                return (
                  <Switch fallback={"no item"}>
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
                );
              }}
            </For>
          </Match>
        </Switch>
        <Show when={appState.loading}>
          <div class="w-full flex justify-center">
            <Spinner />
          </div>
        </Show>
        <div ref={(ref) => setIntersection(ref)} class="w-full h-20 mt-2" />
      </div>
    </div>
  );
}
