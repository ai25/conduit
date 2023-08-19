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
} from "solid-js";
import { useLocation } from "solid-start";
import { getStorageValue, setStorageValue } from "~/utils/storage";
import { InstanceContext } from "~/root";
import { ContentItem, Channel as PipedChannel, RelatedChannel, RelatedPlaylist, RelatedStream } from "~/types";
import Button from "~/components/Button";
import { Spinner } from "~/components/PlayerContainer";
import { fetchJson } from "~/utils/helpers";
import { A } from "@solidjs/router";
import { Checkmark } from "~/components/Description";
import PlaylistCard from "~/components/PlaylistCard";

export default function Channel() {
  const [channel, setChannel] = createSignal<PipedChannel | undefined>();
  const [error, setError] = createSignal<Error | undefined>();
  const [isSubscribed, setIsSubscribed] = createSignal(false);
  const [tabs, setTabs] = createSignal<any[]>([]);
  const [selectedTab, setSelectedTab] = createSignal(0);
  const [contentItems, setContentItems] = createSignal<ContentItem[]>([]);
  const [instance] = useContext(InstanceContext);
  const [loading, setLoading] = createSignal(true);
  const route = useLocation();
  onMount(() => {
    getChannelData();
  });

  async function fetchSubscribedStatus() {
    if (!channel()?.id) return;
    const channels = getStorageValue(
      "localSubscriptions",
      [],
      "json",
      "localStorage"
    ) as string[];
    setIsSubscribed(channels.find((id) => id === channel()!.id) ? true : false);
  }

  async function fetchChannel() {
    console.log(route, "fetching channel");
    const url = instance() + route.pathname + "/";
    return await fetch(url).then((res) => res.json());
  }

  async function getChannelData() {
    fetchChannel()
      .then((data) => {
        console.log(data, "data");
        setLoading(false);
        if (data.error) {
          setError(data);
        } else {
          setChannel(data);
        }
      })
      .then(() => {
        if (!error()) {
          document.title = channel()!.name + " - Conduit";
          setContentItems(channel()!.relatedStreams);
          fetchSubscribedStatus();
          setTabs([{ name: "videos" }]);
          const tabQuery = route.query.tab;
          for (let i = 0; i < channel()!.tabs.length; i++) {
            let tab = channel()!.tabs[i];
            setTabs((tabs) => [...tabs, tab]);
            if (tab.name === tabQuery) loadTab(i + 1);
          }
        }
      });
  }
  function handleScroll(e: any) {
    console.log(e[0], selectedTab(), tabs()[selectedTab()]);
    const entry = e[0];
    if (
      !channel() ||
      !channel()!.nextpage ||
      (selectedTab() != 0 && !tabs()[selectedTab()!]?.tabNextPage)
    )
      return;
    if (entry?.isIntersecting) {
      // this.loading = true;
      if (selectedTab() == 0) {
        fetchChannelNextPage();
      } else {
        fetchChannelTabNextPage();
      }
    }
  }

  async function fetchChannelNextPage() {
    setLoading(true);
    const json = await fetchJson(
      `${instance()}/nextpage/channel/${channel()!.id}`,
      {
        nextpage: channel()!.nextpage,
      }
    );
    setLoading(false);
    console.log(json.relatedStreams);
    if (json.error) return;
    setChannel((c) => ({ ...c, nextpage: json.nextpage }));
    if (!json.relatedStreams) return;
    setContentItems((items) => [...items, ...json.relatedStreams]);
  }
  async function fetchChannelTabNextPage() {
    setLoading(true);
    const json = await fetchJson(`${instance()}/channels/tabs`, {
      data: tabs()[selectedTab()].data,
      nextpage: tabs()[selectedTab()].tabNextPage,
    });
    setLoading(false);
    const newTabs = tabs();
    newTabs[selectedTab()].tabNextPage = json.nextpage;
    newTabs[selectedTab()].content = [...contentItems(), ...json.content];
    setTabs(newTabs);
  }
  const toggleSubscribed = () => {
    const channels = getStorageValue(
      "localSubscriptions",
      [],
      "json",
      "localStorage"
    ) as string[];
    if (!isSubscribed()) {
      setStorageValue(
        "localSubscriptions",
        JSON.stringify([...channels, channel()!.id]),
        "localStorage"
      );
      setIsSubscribed(true);
    } else {
      setStorageValue(
        "localSubscriptions",
        JSON.stringify(channels.filter((c) => c !== channel()!.id)),
        "localStorage"
      );
      setIsSubscribed(false);
    }
  };

  function loadTab(index: number) {
    setSelectedTab(index);
    console.log(route.pathname, "route", new URL(window.location.href));

    // update the tab query in the url path
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tabs()[index].name ?? "videos");
    history.replaceState(window.history.state, "", url);

    if (index == 0) {
      setContentItems(channel()!.relatedStreams as RelatedStream[]);
      return;
    }

    if (tabs()[index].content) {
      setContentItems(tabs()[index].content);
      return;
    }

    let u = new URL(`${instance()}/channels/tabs?data=${tabs()[index].data}`);
    fetch(u)
      .then((res) => res.json())
      .then((tab) => {
        console.log(tab, "tab");
        const newTabs = tabs();
        newTabs[index].tabNextPage = tab.nextpage;
        newTabs[index].content = tab.content;
        setTabs(newTabs);
        setContentItems(tab.content);
      });
  }

  let intersection: HTMLDivElement | undefined = undefined;

  onMount(() => {
    console.log(intersection, "intersection");
    if (!intersection) return;

    const intersectionObserver = new IntersectionObserver(handleScroll, {
      threshold: 0.1,
    });

    intersectionObserver.observe(intersection);
  });
  function assertType<T>(item: any, property: string, value: string) {
    if (item[property] === value){
      return item as T;
    } 
}


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

      <Button
        onClick={toggleSubscribed}
        activated={isSubscribed()}
        label={`Subscribe${isSubscribed() ? "d" : ""}`}
      />

      <div class="flex mt-4 mb-2">
        <For each={tabs()}>
          {(tab, index) => {
            console.log(selectedTab(), index(), tab.name);
            return(
            <Button
              label={tab.name}
              activated={selectedTab() === index()}
              onClick={() => loadTab(index())}
            />
          )}}
        </For>
      </div>

      <hr />

      <div class="flex flex-wrap justify-center">
        <For
          each={
            contentItems()
          }>
          {(item) =>{
             return (
            <Switch>
              <Match when={assertType<RelatedStream>(item, "type", "stream")} keyed>
                {(item)=><VideoCard v={item} />}
              </Match>
              <Match when={assertType<RelatedChannel>(item, "type", "channel")} keyed>
                {(item)=>
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
                  </div>}
              </Match>
              <Match when={assertType<RelatedPlaylist>(item, "type", "playlist")} keyed>
                {(item)=> <PlaylistCard item={item} />}
              </Match>

            </Switch>
          )}}
        </For>
        <Show when={loading()}>
          <div class="w-full flex justify-center">
            <Spinner />
          </div>
        </Show>
        <Show when={(!channel()?.nextpage || !tabs()?.[selectedTab()]?.tabNextPage) && !loading()}>no more items</Show>
        <div
          ref={intersection}
          class="w-full h-10 mt-2"
        />
      </div>
    </div>
  );
}
