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
  Suspense,
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
import { Collapsible, Tabs } from "@kobalte/core";
import { Transition, TransitionGroup } from "solid-transition-group";
import { FaSolidCheck } from "solid-icons/fa";
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

  const query = createInfiniteQuery(
    () => ["channelData", route.pathname, preferences.instance.api_url],
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
  const [isNavigatingLeft, setIsNavigatingLeft] = createSignal(false);

  function loadTab(name: string) {
    console.log("loadTab", name);
    let prevIndex = currentIndex();
    setCurrentIndex(
      tabs().findIndex((tab) => tab.name === name) ?? currentIndex()
    );
    setIsNavigatingLeft(prevIndex > currentIndex());
    console.log(
      "navigating ",
      isNavigatingLeft() ? "left" : "right",
      prevIndex,
      currentIndex()
    );
    setSelectedTab(name);

    // update the tab query in the url path
    const url = new URL(window.location.href);
    url.searchParams.set("tab", name ?? "videos");
    history.replaceState(window.history.state, "", url);
  }

  return (
    <Suspense fallback={<Spinner />}>
      <Show when={query.data} fallback={<Spinner />}>
        <Show when={query.data?.pages?.[0]?.bannerUrl}>
          <img
            src={query.data?.pages[0].bannerUrl}
            class="w-full pb-1.5"
            loading="lazy"
          />
        </Show>
        <div class="flex items-center">
          <img
            height="48"
            width="48"
            class="rounded-full m-1"
            src={query.data?.pages?.[0]?.avatarUrl}
          />
          <h1 class="text-xl font-bold mr-2">{query.data?.pages?.[0]?.name}</h1>
          <Show when={query.data?.pages?.[0]?.verified}>
            <Checkmark />
          </Show>
          <Show when={query.data?.pages?.[0]?.id}>
            <div class="ml-auto">
              <SubscribeButton id={query.data?.pages[0].id!} />
            </div>
          </Show>
        </div>
        <CollapsibleText
          description={query.data?.pages?.[0]?.description ?? ""}
        />

        <Tabs.Root
          class="w-full min-h-screen"
          value={selectedTab()}
          onChange={(value) => loadTab(value)}
          activationMode="manual"
        >
          <Tabs.List class="relative flex items-center border-b overflow-x-auto scrollbar [&::-webkit-scrollbar]:!h-1">
            <For
              each={[
                "videos",
                "shorts",
                "livestreams",
                "playlists",
                "channels",
              ]}
            >
              {(tab) => {
                return (
                  <Tabs.Trigger
                    class="inline-block pl-1 pt-2 pr-4 outline-none hover:bg-primary/20 focus-visible:bg-primary/20 first-letter:uppercase"
                    value={tab}
                  >
                    {tab}
                  </Tabs.Trigger>
                );
              }}
            </For>
            <Tabs.Indicator class="absolute -bottom-px w-full h-[2px] bg-primary transition-all duration-250" />
          </Tabs.List>
          <TransitionGroup
            appear
            enterActiveClass="transition-all ease-in-out duration-250 transform"
            enterClass={
              isNavigatingLeft() ? "-translate-x-full" : "translate-x-full"
            }
            enterToClass="translate-x-0"
            exitActiveClass="transition-all ease-in-out duration-250 transform"
            exitClass="translate-x-0"
            exitToClass={
              isNavigatingLeft() ? "translate-x-full" : "-translate-x-full"
            }
          >
            <Tabs.Content value="videos">
              <div class="flex flex-wrap justify-center">
                <Show when={query.error}>
                  <ErrorMessage error={query.error} />
                </Show>
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
          </TransitionGroup>
        </Tabs.Root>
      </Show>
    </Suspense>
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
        <span class="">
          {props.description.slice(0, 200)}...
          <br />
          <button class="underline" onClick={() => setIsCollapsed(false)}>
            Read more
          </button>
        </span>
      ) : (
        <span class="">
          {props.description}
          <br />
          <button class="underline" onClick={() => setIsCollapsed(true)}>
            Read less
          </button>
        </span>
      )}
    </div>
  );
};

const ShortsTab = (props: { tabData: string }) => {
  const [preferences] = usePreferences();
  const query = createInfiniteQuery(
    () => ["shortsTab", props.tabData, preferences.instance.api_url],
    (context) =>
      fetchTabNextPage(preferences.instance.api_url, props.tabData, context),
    {
      getNextPageParam: (lastPage) => lastPage.nextpage,
      get enabled() {
        return props.tabData && preferences?.instance?.api_url ? true : false;
      },
    }
  );
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
const LivestreamsTab = (props: { tabData: string }) => {
  const [preferences] = usePreferences();
  const query = createInfiniteQuery(
    () => ["livestreamsTab", props.tabData, preferences.instance.api_url],
    (context) =>
      fetchTabNextPage(preferences.instance.api_url, props.tabData, context),
    {
      getNextPageParam: (lastPage) => lastPage.nextpage,
      get enabled() {
        return props.tabData && preferences?.instance?.api_url ? true : false;
      },
    }
  );
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
  const query = createInfiniteQuery(
    () => ["playlistsTab", props.tabData, preferences.instance.api_url],
    (context) =>
      fetchTabNextPage(preferences.instance.api_url, props.tabData, context),
    {
      getNextPageParam: (lastPage) => lastPage.nextpage,
      get enabled() {
        return props.tabData && preferences?.instance?.api_url ? true : false;
      },
    }
  );
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
  const query = createInfiniteQuery(
    () => ["channelsTab", props.tabData, preferences.instance.api_url],
    (context) =>
      fetchTabNextPage(preferences.instance.api_url, props.tabData, context),
    {
      getNextPageParam: (lastPage) => lastPage.nextpage,
      get enabled() {
        return props.tabData && preferences?.instance?.api_url ? true : false;
      },
    }
  );
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
