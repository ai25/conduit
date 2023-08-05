import VideoCard from "~/components/VideoCard";

import { For, createEffect, createSignal, onCleanup, onMount, useContext } from "solid-js";
import { useLocation } from "solid-start";
import { getStorageValue } from "~/utils/storage";
import { InstanceContext } from "~/root";
import { Channel as PipedChannel } from "~/types";

export default function Channel() {
  const [channel, setChannel] = createSignal<PipedChannel | undefined>();
  const [error, setError] = createSignal<Error | undefined>();
  const [isSubscribed, setIsSubscribed] = createSignal(false);
  const [tabs, setTabs] = createSignal<any[]>([]);
  let selectedTab = 0;
  let [contentItems, setContentItems] = createSignal<any[]>([]);
  const [instance] = useContext(InstanceContext);
  const route = useLocation();
  onMount(() => {
    getChannelData();
  });
  createEffect(() => {
    if (error()) return;
    if (channel()) document.title = channel()!.name + " - Piped";
    window.addEventListener("scroll", handleScroll);
  });
  onCleanup(() => {
    window.removeEventListener("scroll", handleScroll);
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
        if (data.error) {
          setError(data)
        } else {
          setChannel(data)
        }})
      .then(() => {
        if (!error()) {
          document.title = channel()!.name + " - Piped";
          setContentItems(channel()!.relatedStreams)
          fetchSubscribedStatus();
          setTabs([{ translatedName: "videos" }]);
          const tabQuery = route.query.tab;
          for (let i = 0; i < channel()!.tabs.length; i++) {
            let tab = channel()!.tabs[i];
            tab.translatedName = tab.name;
            setTabs((tabs) => [...tabs, tab]);
            if (tab.name === tabQuery) loadTab(i + 1);
          }
        }
      });
  }
  function handleScroll() {
    // if (
    //     this.loading ||
    //     !this.channel ||
    //     !this.channel.nextpage ||
    //     (this.selectedTab != 0 && !this.tabs[this.selectedTab].tabNextPage)
    // )
    //     return;
    // if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
    //     this.loading = true;
    //     if (this.selectedTab == 0) {
    //         this.fetchChannelNextPage();
    //     } else {
    //         this.fetchChannelTabNextPage();
    //     }
    // }
  }
  function fetchChannelNextPage() {
    // this.fetchJson(this.apiUrl() + "/nextpage/channel/" + this.channel.id, {
    //     nextpage: this.channel.nextpage,
    // }).then(json => {
    //     this.channel.nextpage = json.nextpage;
    //     this.loading = false;
    //     this.updateWatched(json.relatedStreams);
    //     json.relatedStreams.map(stream => this.contentItems.push(stream));
    // });
  }
  function fetchChannelTabNextPage() {
    // this.fetchJson(this.apiUrl() + "/channels/tabs", {
    //     data: this.tabs[this.selectedTab].data,
    //     nextpage: this.tabs[this.selectedTab].tabNextPage,
    // }).then(json => {
    //     this.tabs[this.selectedTab].tabNextPage = json.nextpage;
    //     this.loading = false;
    //     json.content.map(item => this.contentItems.push(item));
    //     this.tabs[this.selectedTab].content = this.contentItems;
    // });
  }
  function subscribeHandler() {
    // if (this.authenticated) {
    //     this.fetchJson(this.authApiUrl() + (this.subscribed ? "/unsubscribe" : "/subscribe"), null, {
    //         method: "POST",
    //         body: JSON.stringify({
    //             channelId: this.channel.id,
    //         }),
    //         headers: {
    //             Authorization: this.getAuthToken(),
    //             "Content-Type": "application/json",
    //         },
    //     });
    // } else {
    //     if (!this.handleLocalSubscriptions(this.channel.id)) return;
    // }
    // this.subscribed = !this.subscribed;
  }
  // function getTranslatedTabName(tabName) {
  //     let translatedTabName = tabName;
  //     switch (tabName) {
  //         case "livestreams":
  //             translatedTabName = this.$t("titles.livestreams");
  //             break;
  //         case "playlists":
  //             translatedTabName = this.$t("titles.playlists");
  //             break;
  //         case "channels":
  //             translatedTabName = this.$t("titles.channels");
  //             break;
  //         case "shorts":
  //             translatedTabName = this.$t("video.shorts");
  //             break;
  //         default:
  //             console.error(`Tab name "${tabName}" is not translated yet!`);
  //             break;
  //     }
  //     return translatedTabName;
  // },
  function loadTab(index: number) {
    selectedTab = index;

    // update the tab query in the url path
    const url = new URL(route.pathname);
    url.searchParams.set("tab", tabs()[index].name ?? "videos");
    history.replaceState(window.history.state, "", url);

    if (index == 0) {
      setContentItems(channel()!.relatedStreams)
      return;
    }

    if (tabs()[index].content) {
      contentItems = tabs()[index].content;
      return;
    }
    // fetchJson(this.apiUrl() + "/channels/tabs", {
    //     data: this.tabs[index].data,
    // }).then(tab => {
    //     this.contentItems = this.tabs[index].content = tab.content;
    //     this.tabs[this.selectedTab].tabNextPage = tab.nextpage;
    // });
  }

  return (
    <div>
      {/* <div class="flex justify-center place-items-center">
        <img
          height="48"
          width="48"
          class="rounded-full m-1"
          src="channel.avatarUrl"
        />
        <h1 v-text="channel.name" /> */}
        {/* <font-awesome-icon class="ml-1.5 !text-3xl" v-if="channel.verified" icon="check" /> */}
      {/* </div>
      <img
        v-if="channel.bannerUrl"
        src="channel.bannerUrl"
        class="w-full pb-1.5"
        loading="lazy"
      />
      <p class="whitespace-pre-wrap">
        <span v-html="purifyHTML(rewriteDescription(channel.description))" />
      </p> */}

      {/* <button
        class="btn"
        click="subscribeHandler"
        v-t="{
                path: `actions.${subscribed ? 'unsubscribe' : 'subscribe'}`,
                args: { count: numberFormat(channel.subscriberCount) },
            }"></button> */}

      {/* <a
        aria-label="RSS feed"
        title="RSS feed"
        role="button"
        v-if="channel.id"
        href="`${apiUrl()}/feed/unauthenticated/rss?channels=${channel.id}`"
        target="_blank"
        class="btn flex-col mx-3">
      </a> */}

      {/* <button link="`https://youtube.com/channel/${this.channel.id}`" /> */}

      {/* <div class="flex mt-4 mb-2">
        <button
          v-for="(tab, index) in tabs"
          class="btn mr-2"
          click="loadTab(index)"
          class="{ active: selectedTab == index }">
          <span v-text="tab.translatedName"></span>
        </button>
      </div> */}

      <hr />

      <div class="flex flex-wrap">
        <For each={contentItems()}>{(item) => <VideoCard v={item} />}</For>
      </div>

    </div>
  );
}
