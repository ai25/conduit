import { For, Show, createEffect, createSignal, useContext } from "solid-js";
import { DBContext, InstanceContext, SolidStoreContext } from "~/root";
import { extractVideoId } from "./watch";
import VideoCard from "~/components/VideoCard";
import { RelatedStream } from "~/types";
import dayjs from "dayjs";
import { SyncedDB } from "~/stores/syncedStore";
import { BsInfoCircleFill } from "solid-icons/bs";
export const videoId = (item: any) => {
  if (!item) return undefined;
  if (item.videoId) return item.videoId;
  else if (item.id) return item.id;
  else if (item.url) return extractVideoId(item.url);
  else if (item.thumbnailUrl) return extractVideoId(item.thumbnailUrl);
  else if (item.thumbnail) return extractVideoId(item.thumbnail);
  else return undefined;
};

export default function History() {
  const [items, setItems] = createSignal([]);
  const [index, setIndex] = createSignal(0);
  const [success, setSuccess] = createSignal(0);
  const [error, setError] = createSignal(0);
  const [skipped, setSkipped] = createSignal(0);
  let fileSelector: HTMLInputElement | undefined = undefined;
  const itemsLength = () => items().length;
  const [db] = useContext(DBContext);
  const [all, setAll] = createSignal<RelatedStream[]>([]);
  const [historyItems, setHistoryItems] = createSignal<RelatedStream[]>([]);
  const [limit, setLimit] = createSignal(100);
  const [instance] = useContext(InstanceContext);
  function fileChange() {
    if (!fileSelector?.files?.[0]) return;
    const file = fileSelector.files[0];
    file.text().then((text) => {
      setItems([]);
      // Piped

      if (text.includes("watchHistory")) {
        const json = JSON.parse(text);
        const items = json.watchHistory.map((video: any) => {
          return {
            ...video,
            watchedAt: video.watchedAt ?? 0,
            currentTime: video.currentTime ?? 0,
          };
        });
        setItems(items.sort((a: any, b: any) => b.watchedAt - a.watchedAt));
      }

      // LibreTube
      if (text.includes("watchPositions")) {
        const json = JSON.parse(text);
        const lt = json.watchHistory.map((video: any) => {
          return {
            duration: video.duration,
            thumbnail: video.thumbnailUrl,
            title: video.title,
            uploaderName: video.uploader,
            uploaderUrl: video.uploaderUrl,
            videoId: video.videoId,
            watchedAt: parseInt(video.watchedAt),
            currentTime:
              json.watchPositions.find((i: any) => i.videoId === video.videoId)
                ?.position ?? 0,
          };
        });
        setItems(lt.sort((a: any, b: any) => b.watchedAt - a.watchedAt));
      }
      // const json = JSON.parse(text);
      // const items = json.watchHistory.map(video => {
      //     return {
      //         duration: video.duration,
      //         thumbnail: video.thumbnailUrl,
      //         title: video.title,
      //         uploaderName: video.uploader,
      //         uploaderUrl: video.uploaderUrl,
      //         videoId: video.videoId,
      //         watchedAt: video.watchedAt,
      //         currentTime: video.currentTime,
      //     };
      // });
      // FreeTube
      if (text.startsWith(`{"videoId:`)) {
        text = `[${text.replace(/\n/g, ", ").slice(0, -2)}]`;
        let json = JSON.parse(text);
        console.log(json);
        const ft = json
          .map((video: any) => {
            return {
              duration: video.duration,
              thumbnail: video.thumbnail,
              title: video.title,
              uploaderName: video.author,
              uploaderUrl: video.authorUrl,
              videoId: video.videoId,
              watchedAt: video.watchedDate,
              currentTime: video.currentTime,
            };
          })
          .sort((a: any, b: any) => b.watchedAt - a.watchedAt);
        setItems(ft);
      }
      // NewPipe
      // if (text.startsWith("SQLite Format 3")) {
      //     const db = new SQL.Database(text);
      //     const results = db.exec("SELECT * FROM subscriptions");
      //     this.items = results[0].values.map(video => {
      //         return {
      //             duration: video[3],
      //             thumbnail: video[4],
      //             title: video[5],
      //             uploaderName: video[6],
      //             uploaderUrl: video[7],
      //             videoId: video[8],
      //             watchedAt: video[9],
      //             currentTime: video[10],
      //         };
      //     });
      // }
      // Invidious
      if (text.startsWith(`{"subscriptions":`)) {
        const json = JSON.parse(text);
        console.log(json);
        const iv = json.watch_history.map((video: any) => {
          return {
            videoId: video,
            watchedAt: 0,
            currentTime: 0,
          };
        });
        setItems(iv);
      }
      console.log(items());
    });
  }
  async function handleImport(e: any) {
    e.preventDefault();
    if (db()) {
      console.log("Importing");
      const tx = db()?.transaction("watch_history", "readwrite");
      const store = tx?.objectStore("watch_history");
      console.log(store);
      if (!store) return;
      items().forEach(async (item: any) => {
        console.log(item);
        // Don't override invidious items since they don't have all the data
        const dbItem = await store.get(videoId(item));
        if (dbItem && dbItem.videoId === videoId(item)) {
          console.log("Skipping", videoId(item));
          setIndex(index() + 1);
          setSkipped(skipped() + 1);
          return;
        }
        try {
          const request = await store
            .put(JSON.parse(JSON.stringify(item)), videoId(item))
            .then(() => {
              console.log("success");
              setIndex(index() + 1);
              setSuccess(success() + 1);
            })
            .catch(() => {
              setIndex(index() + 1);
              setError(error() + 1);
            });
        } catch (err) {
          console.error(err);
          setIndex(index() + 1);
          setError(error() + 1);
        }
      });
    }
  }
  const solidStore = useContext(SolidStoreContext);

  createEffect(async () => {
    if (solidStore()) {
      const items = SyncedDB.history.findMany(solidStore()!) || [];
      if (!items || items.length === 0) return;
      setAll(items);
      setHistoryItems(all().slice(0, limit()));
      console.log(all().length);
    }
  });
  createEffect(() => {
    setHistoryItems(
      all()
        .slice(0, limit())
        .sort((a: any, b: any) => {
          if (!a.watchedAt && !b.watchedAt) return 0;
          if (!a.watchedAt) return 1;
          if (!b.watchedAt) return -1;
          return b.watchedAt - a.watchedAt;
        })
    );
    console.log(historyItems()[0]);
  });

  return (
    <div class="">
      <form>
        <br />
        <div>
          <input ref={fileSelector} type="file" onInput={fileChange} />
        </div>
        <br />
        <div>
          <Show when={itemsLength() > 0}>
            <strong>{`Found ${itemsLength()} items`}</strong>
          </Show>
        </div>
        <div>
          <progress value={index()} max={itemsLength()} />
          <div>{`Success: ${success()} Error: ${error()} Skipped: ${skipped()}`}</div>
        </div>
        <div>
          <button class="btn w-auto" onClick={handleImport}>
            Import
          </button>
        </div>
      </form>
      <div class="flex flex-wrap justify-center">
        <Show when={solidStore()}>
          <For
            each={SyncedDB.history.findMany(solidStore()!, {
              sort: (a, b) => {
                if (!a.watchedAt && !b.watchedAt) return 0;
                if (!a.watchedAt) return 1;
                if (!b.watchedAt) return -1;
                return b.watchedAt - a.watchedAt;
              },
            })}>
            {(item) => (
              <div class="flex flex-col max-w-xs w-72 sm:max-w-72">
                <VideoCard
                  v={{
                    ...item,
                    url: `/watch?v=${videoId(item)}}`,
                    thumbnail: `${instance().replace(
                      "api",
                      "proxy"
                    )}/vi/${videoId(item)}/mqdefault.jpg?host=i.ytimg.com`,
                  }}
                />
              </div>
            )}
          </For>
          {/* <button class="btn" onClick={() => setLimit(limit() + 10)}>
            Load More
          </button> */}
        </Show>
      </div>
    </div>
  );
}
