import { Toaster } from "solid-headless";
import {
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";
import { A, Navigate } from "solid-start";
import {} from "~/types";
import { Playlist, RelatedStream } from "~/types";
import { Store, SyncedDB, clone } from "~/stores/syncedStore";

const [error, setError] = createSignal();

export default function Home() {
  async function getIndexedDbEntries() {
    // store.playlists.pop();
    const tx = db()!.transaction("playlists", "readonly");
    const idbStore = tx.objectStore("playlists");
    const request = await idbStore.getAll();
    console.log(request);
    if (!request) return;
    // SyncedDB.playlists.create(store, {...playlists[0], id: playlists[0].id});
    // // wait 3 seconds between each related stream
    // playlists[0].relatedStreams.forEach((stream, index) => {
    //   setTimeout(() => {
    //     store.playlists[0].relatedStreams.push(stream);
    //   }, index * 3000);
    // });
    // request.forEach((item: HistoryItem, index: number) => {
    //   item = {
    //     currentTime: item.currentTime,
    //     duration: item.duration,
    //     title: item.title,
    //     url: item.url,
    //     uploaded: item.uploaded,
    //     watchedAt: item.watchedAt,
    //     uploaderName: item.uploaderName,
    //     uploaderUrl: item.uploaderUrl,
    //     views: item.views,
    //   };
    //   setTimeout(() => {
    //     store.history.push(item);
    //   }, index * 300);
    // });
  }

  return (
    <>
      <Navigate href="/trending" />
    </>
    // <main class="text-center mx-auto text-gray-700 p-4">
    //   <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">
    //     Hello world from Index!
    //   </h1>
    //   {/* {error() && <pre>{JSON.stringify(error(), undefined, 2)}</pre>} */}
    //   <Button
    //     // disabled={!db()}
    //     label="push"
    //     // onClick={() => {
    //     //   store().history.forEach((e) => store().history.pop());
    //     //   // store().playlists.forEach(e=>store().playlists.pop())
    //     // }}
    //     onClick={() => getIndexedDbEntries()}
    //     // onClick={() => {
    //     //   Array(4).forEach(() => store().history.pop());
    //     // }}
    //     // onClick={() => {
    //     //   SyncedDB.playlists.deleteMany(store)
    //     //   console.log(
    //     //     clone(
    //     //       SyncedDB.history.findMany(store, {
    //     //         filter: (item) => item.title?.includes("chu"),
    //     //         sort: () => 1,
    //     //       })
    //     //     )
    //     //   );
    //     // }}
    //   />
    //   <pre class="text-start">{JSON.stringify(solidStore(), undefined, 2)}</pre>

    //   <Toaster />
    //   {/* <Counter /> */}
    //   <media-player
    //     title="Sprite Fight"
    //     src="https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/low.mp4"
    //     poster="https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/thumbnail.webp?time=268&width=980"
    //     thumbnails="https://media-files.vidstack.io/sprite-fight/thumbnails.vtt"
    //     aspect-ratio="16/9"
    //     crossorigin>
    //     <media-outlet>
    //       <media-poster alt="Girl walks into sprite gnomes around her friend on a campfire in danger!"></media-poster>
    //       <track
    //         src="https://media-files.vidstack.io/sprite-fight/subs/english.vtt"
    //         label="English"
    //         srclang="en-US"
    //         kind="subtitles"
    //         default
    //       />
    //       <track
    //         src="https://media-files.vidstack.io/sprite-fight/chapters.vtt"
    //         srclang="en-US"
    //         kind="chapters"
    //         default
    //       />
    //     </media-outlet>
    //     <media-community-skin></media-community-skin>
    //   </media-player>
    // </main>
  );
}
