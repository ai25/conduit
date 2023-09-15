import numeral from "numeral";
import { createRenderEffect, For } from "solid-js";
import {
  createEffect,
  createSignal,
  onMount,
  Show,
  useContext,
} from "solid-js";
import { Title, useLocation } from "solid-start";
import VideoCard from "~/components/VideoCard";
import { Playlist as PlaylistType, RelatedStream } from "~/types";
import PlaylistItem from "~/components/PlaylistItem";
import { fetchJson } from "~/utils/helpers";
import { SyncedDB, useSyncedStore } from "~/stores/syncedStore";
import { createQuery } from "@tanstack/solid-query";
import { usePreferences } from "~/stores/preferencesStore";

export default function Playlist() {
  const [list, setList] = createSignal<PlaylistType>();
  const route = useLocation();
  const isLocal = () => route.query.list?.startsWith("conduit-");
  const id = route.query.list;
  const sync = useSyncedStore();
  const [preferences] = usePreferences();

  createEffect(async () => {
    if (!id) return;
    if (!isLocal()) return;
    await new Promise((r) => setTimeout(r, 100));
    const l = sync.store.playlists[id];
    setList(l);
  });
  const query = createQuery(
    () => ["playlist"],
    async (): Promise<PlaylistType> =>
      (await fetch(preferences.instance.api_url + "/playlists/" + id)).json(),
    {
      get enabled() {
        return preferences.instance.api_url && !isLocal() && id ? true : false;
      },
    }
  );

  createEffect(() => {
    if (!query.data) return;
    setList(query.data);
  });

  onMount(() => {
    // this.getPlaylistData();
    // const playlistId = this.$route.query.list;
    // if (this.authenticated && playlistId?.length == 36)
    //     this.fetchJson(this.authApiUrl() + "/user/playlists", null, {
    //         headers: {
    //             Authorization: this.getAuthToken(),
    //         },
    //     }).then(json => {
    //         if (json.error) alert(json.error);
    //         else if (json.filter(playlist => playlist.id === playlistId).length > 0) this.admin = true;
    //     });
    // this.isPlaylistBookmarked();
    // window.addEventListener("scroll", this.handleScroll);
    // if (this.playlist) this.updateTitle();
  });
  // deactivated() {
  //     window.removeEventListener("scroll", this.handleScroll);
  // }
  //     async fetchPlaylist() {
  //         return await await this.fetchJson(this.authApiUrl() + "/playlists/" + this.$route.query.list);
  //     }
  //     async getPlaylistData() {
  //         this.fetchPlaylist()
  //             .then(data => (this.playlist = data))
  //             .then(() => this.updateTitle());
  //     }
  //     async updateTitle() {
  //         document.title = this.playlist.name + " - Piped";
  //     }
  //     handleScroll() {
  //         if (this.loading || !this.playlist || !this.playlist.nextpage) return;
  //         if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
  //             this.loading = true;
  //             this.fetchJson(this.authApiUrl() + "/nextpage/playlists/" + this.$route.query.list, {
  //                 nextpage: this.playlist.nextpage,
  //             }).then(json => {
  //                 this.playlist.relatedStreams.concat(json.relatedStreams);
  //                 this.playlist.nextpage = json.nextpage;
  //                 this.loading = false;
  //                 json.relatedStreams.map(stream => this.playlist.relatedStreams.push(stream));
  //             });
  //         }
  //     }
  //     removeVideo(index) {
  //         this.playlist.relatedStreams.splice(index, 1);
  //     }
  //     async clonePlaylist() {
  //         this.fetchJson(this.authApiUrl() + "/import/playlist", null, {
  //             method: "POST",
  //             headers: {
  //                 Authorization: this.getAuthToken(),
  //             },
  //             body: JSON.stringify({
  //                 playlistId: this.$route.query.list,
  //             }),
  //         }).then(resp => {
  //             if (!resp.error) {
  //                 alert(this.$t("actions.clone_playlist_success"));
  //             } else alert(resp.error);
  //         });
  //     }
  //     downloadPlaylistAsTxt() {
  //         var data = "";
  //         this.playlist.relatedStreams.forEach(element => {
  //             data += "https://piped.video" + element.url + "\n";
  //         });
  //         this.download(data, this.playlist.name + ".txt", "text/plain");
  //     }
  //     async bookmarkPlaylist() {
  //         if (!this.playlist) return;

  //         if (this.isBookmarked) {
  //             this.removePlaylistBookmark();
  //             return;
  //         }

  //         if (window.db) {
  //             const playlistId = this.$route.query.list;
  //             var tx = window.db.transaction("playlist_bookmarks", "readwrite");
  //             var store = tx.objectStore("playlist_bookmarks");
  //             store.put({
  //                 playlistId: playlistId,
  //                 name: this.playlist.name,
  //                 uploader: this.playlist.uploader,
  //                 uploaderUrl: this.playlist.uploaderUrl,
  //                 thumbnail: this.playlist.thumbnailUrl,
  //                 uploaderAvatar: this.playlist.uploaderAvatar,
  //                 videos: this.playlist.videos,
  //             });
  //             this.isBookmarked = true;
  //         }
  //     }
  //     async removePlaylistBookmark() {
  //         var tx = window.db.transaction("playlist_bookmarks", "readwrite");
  //         var store = tx.objectStore("playlist_bookmarks");
  //         store.delete(this.$route.query.list);
  //         this.isBookmarked = false;
  //     }
  //     async isPlaylistBookmarked() {
  //         // needed in order to change the is bookmarked var later
  //         const App = this;
  //         const playlistId = this.$route.query.list;
  //         var tx = window.db.transaction("playlist_bookmarks", "readwrite");
  //         var store = tx.objectStore("playlist_bookmarks");
  //         var req = store.openCursor(playlistId);
  //         req.onsuccess = function (e) {
  //             var cursor = e.target.result;
  //             App.isBookmarked = cursor ? true : false;
  //         };
  //     }
  // }

  return (
    <>
      <Title>{list() ? list()!.name : "Playlist"}</Title>
      <Show when={list()} keyed>
        {(l) => {
          return (
            <div class="max-w-5xl mx-auto">
              <h1 class="text-2xl font-bold mb-4">{list()!.name}</h1>

              <div class="grid grid-cols-1 gap-4 ">
                <Show when={l.relatedStreams.length > 0}>
                  <For each={l.relatedStreams}>
                    {(video, index) => (
                      <PlaylistItem
                        active=""
                        v={video}
                        index={index() + 1}
                        list={id}
                      />
                    )}
                  </For>
                </Show>
                {/* <For each={Array(20).fill(0)}>{() => <PlaylistCard />}</For> */}
              </div>
            </div>
          );
        }}
      </Show>
      {/*  <ErrorHandler v-if="playlist && playlist.error" :message="playlist.message" :error="playlist.error" />

     <div v-if="playlist" v-show="!playlist.error">
         <h1 class="text-center my-4" v-text="playlist.name" />

         <div class="flex justify-between items-center">
             <div>
                 <router-link class="link" :to="playlist.uploaderUrl || '/'">
                     <img :src="playlist.uploaderAvatar" loading="lazy" class="rounded-full" />
                     <strong v-text="playlist.uploader" />
                 </router-link>
             </div>
             <div>
                 <strong v-text="`${playlist.videos} ${$t('video.videos')}`" />
                 <br />
                 <button class="btn mr-1" v-if="!isPipedPlaylist" @click="bookmarkPlaylist">
                     {{ $t(`actions.${isBookmarked ? "playlist_bookmarked" : "bookmark_playlist"}`)
                     }}<font-awesome-icon class="ml-3" icon="bookmark" />
                 </button>
                 <button class="btn mr-1" v-if="authenticated && !isPipedPlaylist" @click="clonePlaylist">
                     {{ $t("actions.clone_playlist") }}<font-awesome-icon class="ml-3" icon="clone" />
                 </button>
                 <button class="btn mr-1" @click="downloadPlaylistAsTxt">
                     {{ $t("actions.download_as_txt") }}
                 </button>
                 <a class="btn mr-1" :href="getRssUrl">
                     <font-awesome-icon icon="rss" />
                 </a>
                 <WatchOnYouTubeButton :link="`https://www.youtube.com/playlist?list=${this.$route.query.list}`" />
             </div>
         </div>

         <hr />

         <div class="video-grid">
             <VideoItem
                 v-for="(video, index) in playlist.relatedStreams"
                 :key="video.url"
                 :item="video"
                 :index="index"
                 :playlist-id="$route.query.list"
                 :admin="admin"
                 @remove="removeVideo(index)"
                 height="94"
                 width="168"
             />
         </div>
     </div> */}
    </>
  );
}
