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
  Suspense,
} from "solid-js";
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
import { Spinner } from "~/components/Spinner";
import {
  assertType,
  fetchJson,
  formatRelativeShort,
  getVideoId,
} from "~/utils/helpers";
import { A, useLocation } from "@solidjs/router";
import { Checkmark } from "~/components/Description";
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
import { Collapsible, Tabs } from "@kobalte/core";
import { Transition, TransitionGroup } from "solid-transition-group";
import { FaSolidCheck, FaSolidEye } from "solid-icons/fa";
import PlaylistCard from "~/components/content/playlist/PlaylistCard";
import VideoCard, {
  VideoCardFallback,
} from "~/components/content/stream/VideoCard";
import numeral from "numeral";
import { ErrorComponent } from "~/components/Error";
import VideoCardMenu from "~/components/content/stream/VideoCardMenu";
import { useSyncStore } from "~/stores/syncStore";
import { createTimeAgo } from "@solid-primitives/date";
import Link from "~/components/Link";
// Fetching logic for tabs
async function fetchTabNextPage(
  instance: string,
  data: string,
  { pageParam }: { pageParam?: string }
): Promise<any> {
  if (!pageParam) {
    return await fetchJson(`${instance}/channels/tabs`, {
      data: data,
    });
  } else {
    return await fetchJson(`${instance}/channels/tabs`, {
      data: data,
      nextpage: pageParam ?? null,
    });
  }
}

export default function Channel() {
  const [tabs, setTabs] = createSignal<any[]>([]);
  const [preferences] = usePreferences();
  const route = useLocation();
  const [selectedTab, setSelectedTab] = createSignal(
    route.query.tab ?? "videos"
  );

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

  const query = createInfiniteQuery(() => ({
    queryKey: ["channelData", route.pathname, preferences.instance.api_url],
    queryFn: fetchChannelOrNextPage,
    getNextPageParam: (lastPage) => lastPage.nextpage,
    enabled: !!route?.pathname && preferences?.instance?.api_url ? true : false,
    initialPageParam: null,
    deferStream: true,
    initialData: () => undefined,
  }));

  createEffect(() => {
    if (!query.data) return;
    const channel = query.data.pages[0];
    if (!channel) return;
    document.title = `${channel.name} - Conduit`;
    const tabs = channel.tabs;
    if (!tabs) return;
    console.log("tabs", tabs);
    setTabs([{ name: "videos", data: null }, ...tabs]);
  });

  const isIntersecting = useIntersectionObserver({
    setTarget: () => intersection(),
    threshold: 0.1,
  });
  const [intersection, setIntersection] = createSignal<
    HTMLDivElement | undefined
  >(undefined);

  createEffect(() => {
    if (isIntersecting()) {
      console.log("intersecting");
      if (query.isFetchingNextPage) return;
      if (!query.hasNextPage) return;

      query.fetchNextPage();
      console.log(query.data);
    }
  });

  const [currentIndex, setCurrentIndex] = createSignal(
    tabs().findIndex((tab) => tab.name === selectedTab()) ?? 0
  );

  function loadTab(name: string) {
    console.log("loadTab", name);
    setCurrentIndex(
      tabs().findIndex((tab) => tab.name === name) ?? currentIndex()
    );
    setSelectedTab(name);

    // update the tab query in the url path
    const url = new URL(window.location.href);
    url.searchParams.set("tab", name ?? "videos");
    history.replaceState(window.history.state, "", url);
  }

  const channelDescription = () => query.data?.pages?.[0]?.description ?? "";

  return (
    <Suspense fallback={<ChannelFallback />}>
      <Show when={query.data} fallback={<ChannelFallback />}>
        <div class="flex flex-col justify-center gap-2 w-[95%] max-w-screen-xl mx-auto py-4">
          <Show when={query.data?.pages?.[0]?.bannerUrl}>
            <div class="relative w-full min-h-[100px] h-full aspect-[6.2] rounded-2xl overflow-hidden ">
              <img
                src={query.data?.pages[0].bannerUrl}
                class="absolute top-0 left-0 h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </Show>
          <div class="flex items-center flex-wrap gap-2">
            <Show when={query.data?.pages?.[0]?.avatarUrl}>
              <div class="relative rounded-full overflow-hidden aspect-square w-20 h-20">
                <img
                  height="160"
                  width="160"
                  class="absolute w-full h-full object-cover"
                  src={query.data?.pages?.[0]?.avatarUrl}
                />
              </div>
            </Show>
            <div class="flex flex-col flex-1 items-start justify-center gap-1 ml-2">
              <h1 class="flex items-center gap-2 text-xl font-bold ">
                {query.data?.pages?.[0]?.name}
                <Show when={query.data?.pages?.[0]?.verified}>
                  <span>
                    <Checkmark />
                  </span>
                </Show>
              </h1>
              <Show when={(query.data?.pages?.[0]?.subscriberCount || -1) >= 0}>
                <div class="text-text2">
                  {numeral(query.data?.pages[0].subscriberCount).format("0,0")}{" "}
                  Subscribers
                </div>
              </Show>
            </div>
            <Show when={query.data?.pages?.[0]?.id}>
              <div class="">
                <SubscribeButton
                  name={query.data?.pages[0].name!}
                  id={query.data?.pages[0].id!}
                />
              </div>
            </Show>
          </div>
          <div class="text-text2">
            <Show when={channelDescription().length >= 200}>
              <CollapsibleText description={channelDescription()} />
            </Show>
            <Show when={channelDescription().length < 200}>
              {channelDescription()}
            </Show>
          </div>
          <Tabs.Root
            class="w-full min-h-screen"
            value={selectedTab()}
            onChange={(value) => loadTab(value)}
            activationMode="manual"
          >
            <Tabs.List class="relative flex items-center border-b-2 border-bg2 overflow-x-auto scrollbar-horizontal [&::-webkit-scrollbar]:!h-1">
              <For
                each={[
                  "videos",
                  "shorts",
                  "livestreams",
                  "playlists",
                  "channels",
                ].filter((tab) => {
                  if (tab === "videos") return true;
                  return query.data?.pages?.[0]?.tabs?.find(
                    (channelTab) => channelTab.name === tab
                  );
                })}
              >
                {(tab) => {
                  return (
                    <Tabs.Trigger
                      class="inline-block px-3 py-2 outline-none hover:bg-primary/20 focus-visible:bg-primary/20 first-letter:uppercase"
                      value={tab}
                    >
                      {tab}
                    </Tabs.Trigger>
                  );
                }}
              </For>
              <Tabs.Indicator class="absolute bottom-0 w-full h-1 bg-primary transition-all duration-250" />
            </Tabs.List>
            <Tabs.Content value="videos">
              <div class="flex flex-wrap justify-center">
                <Show when={query.error}>{JSON.stringify(query.error)}</Show>
                <Suspense fallback={<Spinner />}>
                  <Show when={query.data}>
                    <Switch fallback={<Spinner />}>
                      <Match
                        when={
                          query.data!.pages &&
                          query.data!.pages.length > 0 &&
                          !query.data!.pages[0].relatedStreams?.length
                        }
                      >
                        <EmptyState />
                      </Match>
                      <Match
                        when={
                          query.isSuccess &&
                          query.data!.pages.length > 0 &&
                          query.data!.pages[0].relatedStreams?.length
                        }
                      >
                        <For
                          each={query.data?.pages
                            ?.map((page) => page.relatedStreams ?? [])
                            .flat()}
                        >
                          {(item) => <VideoCard v={item} />}
                        </For>
                      </Match>
                    </Switch>
                  </Show>
                </Suspense>
                <div
                  ref={(ref) => setIntersection(ref)}
                  class="w-full h-20 mt-2"
                />
              </div>
            </Tabs.Content>
            <Tabs.Content value="shorts">
              <Suspense fallback={<Spinner />}>
                <ShortsTab
                  tabData={tabs().find((tab) => tab.name == "shorts")?.data}
                />
              </Suspense>
            </Tabs.Content>
            <Tabs.Content value="playlists">
              <Suspense fallback={<Spinner />}>
                <PlaylistsTab
                  tabData={tabs().find((tab) => tab.name == "playlists")?.data}
                />
              </Suspense>
            </Tabs.Content>
            <Tabs.Content value="livestreams">
              <Suspense fallback={<Spinner />}>
                <LivestreamsTab
                  tabData={
                    tabs().find((tab) => tab.name == "livestreams")?.data
                  }
                />
              </Suspense>
            </Tabs.Content>
            <Tabs.Content value="channels">
              <Suspense fallback={<Spinner />}>
                <ChannelsTab
                  tabData={tabs().find((tab) => tab.name == "channels")?.data}
                />
              </Suspense>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </Show>
    </Suspense>
  );
}

function ChannelFallback() {
  return (
    <div class="flex flex-col justify-center gap-2 w-[95%] max-w-screen-xl mx-auto p-2">
      <div class="relative w-full min-h-[100px] h-full aspect-[6.2] rounded-2xl bg-bg2 animate-pulse" />
      <div class="flex gap-2 items-center">
        <div class="aspect-square rounded-full w-20 animate-pulse bg-bg2" />
        <div class="flex flex-col gap-1 w-full">
          <div class="rounded-full h-4 w-44 animate-pulse bg-bg2" />
          <div class="rounded-full h-4 w-20 animate-pulse bg-bg2" />
        </div>
      </div>
      <div class="flex gap-2 overflow-hidden">
        <div class="rounded-full h-6 w-20 animate-pulse bg-bg2" />
        <div class="rounded-full h-6 w-20 animate-pulse bg-bg2" />
        <div class="rounded-full h-6 w-20 animate-pulse bg-bg2" />
        <div class="rounded-full h-6 w-20 animate-pulse bg-bg2" />
      </div>

      <div class="flex flex-wrap justify-center">
        <For each={Array(10)}>
          {() => <VideoCardFallback layout="sm:grid" />}
        </For>
      </div>
    </div>
  );
}
interface CollapsibleTextProps {
  description: string;
}

const CollapsibleText = (props: CollapsibleTextProps) => {
  const [isCollapsed, setIsCollapsed] = createSignal(true);

  return (
    <div class="relative">
      {isCollapsed() ? (
        <div class="">
          {props.description.slice(0, 200)}...
          <br />
          <button
            class="underline text-text1 outline-none rounded-lg focus-visible:ring-2 ring-primary/80"
            onClick={() => setIsCollapsed(false)}
          >
            Read more
          </button>
        </div>
      ) : (
        <div class="">
          {props.description}
          <br />
          <button
            class="underline text-text1 outline-none rounded-lg focus-visible:ring-2 ring-primary/80"
            onClick={() => setIsCollapsed(true)}
          >
            Read less
          </button>
        </div>
      )}
    </div>
  );
};

const ShortsTab = (props: { tabData: string }) => {
  const [preferences] = usePreferences();
  const query = createInfiniteQuery(() => ({
    queryKey: ["shortsTab", props.tabData, preferences.instance.api_url],
    queryFn: (context) =>
      fetchTabNextPage(preferences.instance.api_url, props.tabData, context),
    getNextPageParam: (lastPage) => lastPage.nextpage,
    enabled: props.tabData && preferences?.instance?.api_url ? true : false,
    initialPageParam: undefined,
  }));
  const isIntersecting = useIntersectionObserver({
    setTarget: () => intersection(),
    threshold: 0.1,
  });
  const [intersection, setIntersection] = createSignal<
    HTMLDivElement | undefined
  >(undefined);

  createEffect(() => {
    if (isIntersecting()) {
      console.log("intersecting");
      if (query.isFetchingNextPage) return;
      if (!query.hasNextPage) return;

      query.fetchNextPage();
      console.log(query.data);
    }
  });
  const sync = useSyncStore();

  return (
    <Suspense fallback={<Spinner />}>
      <div class="flex flex-wrap justify-center gap-2 py-2">
        <Show when={query.data}>
          <Switch fallback={<Spinner />}>
            <Match
              when={
                query.data!.pages &&
                query.data!.pages.length > 0 &&
                !query.data!.pages[0].content?.length
              }
            >
              <EmptyState />
            </Match>
            <Match
              when={
                query.isSuccess &&
                query.data!.pages.length > 0 &&
                query.data!.pages[0].content?.length
              }
            >
              <For
                each={query.data?.pages
                  ?.map((page) => page.content ?? [])
                  .flat()}
              >
                {(item) => (
                  <Link
                    href={item.url}
                    class="relative aspect-[0.5625] w-screen max-w-full sm:w-64 rounded-lg overflow-hidden"
                  >
                    <img
                      classList={{
                        "absolute top-0 left-0 object-cover w-full h-full":
                          true,
                        "saturate-75 opacity-75":
                          !!sync.store.history[getVideoId(item)!]?.currentTime,
                      }}
                      src={item.thumbnail}
                    />
                    <Switch>
                      <Match
                        when={
                          sync.store.history[getVideoId(item)!]?.currentTime &&
                          sync.store.history[getVideoId(item)!]?.watchedAt
                        }
                      >
                        <div class="relative h-0 w-0 ">
                          <div class="absolute flex items-center left-2 top-2 bg-bg1/90 rounded px-1 py-px border border-bg2 w-max h-max text-xs">
                            <FaSolidEye
                              title="Watched"
                              class="inline-block h-3 w-3 mr-1"
                            />
                            {createTimeAgo(
                              sync.store.history[getVideoId(item)!]?.watchedAt,
                              {
                                interval: 1000 * 60,
                                relativeFormatter: formatRelativeShort,
                              }
                            )[0]()}
                          </div>
                        </div>
                      </Match>
                      <Match
                        when={
                          sync.store.history[getVideoId(item)!]?.currentTime &&
                          !sync.store.history[getVideoId(item)!]?.watchedAt
                        }
                      >
                        <div class="absolute left-2 bottom-2 bg-bg1/90 rounded px-1 py-px border border-bg2 w-max h-max text-xs">
                          Watched
                        </div>
                      </Match>
                    </Switch>
                    <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/75 flex flex-col justify-end p-2">
                      <div class="flex justify-between gap-1">
                        <div class="flex flex-col gap-1">
                          <div>{item.title}</div>
                          <div class="text-xs text-text2">
                            {numeral(item.views).format("0,0")} views
                          </div>
                        </div>
                        <VideoCardMenu
                          v={{
                            ...item,
                            uploadedDate: item.uploadedDate ?? "",
                            uploaderAvatar: item.uploaderAvatar ?? "",
                            uploaderUrl:
                              item.uploaderUrl?.replace("/shorts", "") ?? "",
                          }}
                          progress={
                            sync.store.history[getVideoId(item)!]?.currentTime
                          }
                        />
                      </div>
                    </div>
                  </Link>
                )}
              </For>
            </Match>
          </Switch>
        </Show>
        <Show when={query.error}>
          <ErrorComponent error={query.error} />
        </Show>
      </div>
      <div ref={(ref) => setIntersection(ref)} class="w-full h-20 mt-2" />
    </Suspense>
  );
};
const LivestreamsTab = (props: { tabData: string }) => {
  const [preferences] = usePreferences();
  const query = createInfiniteQuery(() => ({
    queryKey: ["livestreamsTab", props.tabData, preferences.instance.api_url],
    queryFn: (context) =>
      fetchTabNextPage(preferences.instance.api_url, props.tabData, context),
    getNextPageParam: (lastPage) => lastPage.nextpage,
    enabled: props.tabData && preferences?.instance?.api_url ? true : false,
    initialPageParam: undefined,
  }));
  const isIntersecting = useIntersectionObserver({
    setTarget: () => intersection(),
    threshold: 0.1,
  });
  const [intersection, setIntersection] = createSignal<
    HTMLDivElement | undefined
  >(undefined);

  createEffect(() => {
    if (isIntersecting()) {
      console.log("intersecting");
      if (query.isFetchingNextPage) return;
      if (!query.hasNextPage) return;

      query.fetchNextPage();
      console.log(query.data);
    }
  });

  return (
    <Suspense fallback={<Spinner />}>
      <div class="flex flex-wrap justify-center">
        <Show when={query.data}>
          <Switch fallback={<Spinner />}>
            <Match
              when={
                query.data!.pages &&
                query.data!.pages.length > 0 &&
                !query.data!.pages[0].content?.length
              }
            >
              <EmptyState />
            </Match>
            <Match
              when={
                query.isSuccess &&
                query.data!.pages.length > 0 &&
                query.data!.pages[0].content?.length
              }
            >
              <For
                each={query.data?.pages
                  ?.map((page) => page.content ?? [])
                  .flat()}
              >
                {(item) => <VideoCard v={item} />}
              </For>
            </Match>
          </Switch>
        </Show>
        <Show when={query.error}>
          <ErrorMessage error={query.error} />
        </Show>
      </div>
      <div ref={(ref) => setIntersection(ref)} class="w-full h-20 mt-2" />
    </Suspense>
  );
};
const PlaylistsTab = (props: { tabData: string }) => {
  const [preferences] = usePreferences();
  const query = createInfiniteQuery(() => ({
    queryKey: ["playlistsTab", props.tabData, preferences.instance.api_url],
    queryFn: (context) =>
      fetchTabNextPage(preferences.instance.api_url, props.tabData, context),
    getNextPageParam: (lastPage) => lastPage.nextpage,
    enabled: props.tabData && preferences?.instance?.api_url ? true : false,
    initialPageParam: undefined,
  }));
  const isIntersecting = useIntersectionObserver({
    setTarget: () => intersection(),
    threshold: 0.1,
  });
  const [intersection, setIntersection] = createSignal<
    HTMLDivElement | undefined
  >(undefined);

  createEffect(() => {
    if (isIntersecting()) {
      console.log("intersecting");
      if (query.isFetchingNextPage) return;
      if (!query.hasNextPage) return;

      query.fetchNextPage();
      console.log(query.data);
    }
  });

  return (
    <Suspense fallback={<Spinner />}>
      <div class="flex flex-wrap justify-center">
        <Show when={query.data}>
          <Switch fallback={<Spinner />}>
            <Match
              when={
                query.data!.pages &&
                query.data!.pages.length > 0 &&
                !query.data!.pages[0].content?.length
              }
            >
              <EmptyState />
            </Match>
            <Match
              when={
                query.isSuccess &&
                query.data!.pages.length > 0 &&
                query.data!.pages[0].content?.length
              }
            >
              <For
                each={query.data?.pages
                  ?.map((page) => page.content ?? [])
                  .flat()}
              >
                {(item) => <PlaylistCard item={item} />}
              </For>
            </Match>
          </Switch>
        </Show>
        <Show when={query.error}>
          <ErrorMessage error={query.error} />
        </Show>
      </div>
      <div ref={(ref) => setIntersection(ref)} class="w-full h-20 mt-2" />
    </Suspense>
  );
};
const ChannelsTab = (props: { tabData: string }) => {
  const [preferences] = usePreferences();
  const query = createInfiniteQuery(() => ({
    queryKey: ["channelsTab", props.tabData, preferences.instance.api_url],
    queryFn: (context) =>
      fetchTabNextPage(preferences.instance.api_url, props.tabData, context),
    getNextPageParam: (lastPage) => lastPage.nextpage,
    enabled: props.tabData && preferences?.instance?.api_url ? true : false,
    initialPageParam: undefined,
  }));
  const isIntersecting = useIntersectionObserver({
    setTarget: () => intersection(),
    threshold: 0.1,
  });
  const [intersection, setIntersection] = createSignal<
    HTMLDivElement | undefined
  >(undefined);

  createEffect(() => {
    if (isIntersecting()) {
      console.log("intersecting");
      if (query.isFetchingNextPage) return;
      if (!query.hasNextPage) return;

      query.fetchNextPage();
      console.log(query.data);
    }
  });

  return (
    <Suspense fallback={<Spinner />}>
      <div class="flex flex-wrap justify-center">
        <Show when={query.data}>
          <Switch fallback={<Spinner />}>
            <Match
              when={
                query.data!.pages &&
                query.data!.pages.length > 0 &&
                !query.data!.pages[0].content?.length
              }
            >
              <EmptyState />
            </Match>
            <Match
              when={
                query.isSuccess &&
                query.data!.pages.length > 0 &&
                query.data!.pages[0].content?.length
              }
            >
              <For each={query.data?.pages.map((page) => page.content).flat()}>
                {(item) => (
                  <div class="w-44 mx-1 flex flex-col gap-2 items-start">
                    <A href={item.url} class="group outline-none">
                      <div class="relative w-20 overflow-hidden rounded-full group-hover:ring-2 group-focus-visible:ring-2  ring-accent1 transition-shadow duration-300">
                        <img
                          class="w-full rounded-full transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105"
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
                  </div>
                )}
              </For>
            </Match>
          </Switch>
        </Show>
        <Show when={query.error}>
          <ErrorMessage error={query.error} />
        </Show>
      </div>
      <div ref={(ref) => setIntersection(ref)} class="w-full h-20 mt-2" />
    </Suspense>
  );
};
