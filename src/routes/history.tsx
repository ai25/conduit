import {
  For,
  Show,
  createEffect,
  createSignal,
  onMount,
  useContext,
  batch,
} from "solid-js";
import { DBContext } from "~/root";
import { extractVideoId } from "./watch";
import VideoCard from "~/components/VideoCard";
import { RelatedStream } from "~/types";
import dayjs from "dayjs";
import { HistoryItem, SyncedDB, useSyncedStore } from "~/stores/syncedStore";
import { BsInfoCircleFill, BsXCircle } from "solid-icons/bs";
import Button from "~/components/Button";
import { toaster, Toast } from "@kobalte/core";
import { Portal } from "solid-js/web";
import { Title } from "solid-start";
import useIntersectionObserver from "~/hooks/useIntersectionObserver";
import { clone } from "../stores/syncedStore";

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
  const [limit, setLimit] = createSignal(50);

  function fileChange() {
    if (!fileSelector?.files?.[0]) return;
    const file = fileSelector.files[0];
    file.text().then((text) => {
      console.log(text);
      setItems([]);
      // Piped

      if (text.includes("watchHistory")) {
        const json = JSON.parse(text);
        console.log(json);
        const items = json.watchHistory.map((video: any) => {
          const item = {
            id: videoId(video),
            duration: video.duration,
            url: video.url,
            title: video.title,
            uploaderName: video.uploaderName,
            uploaderUrl: video.uploaderUrl,
            watchedAt: video.watchedAt ?? 0,
            currentTime: video.currentTime ?? 0,
          };
          return item;
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
      } else {
        const json = JSON.parse(text);
        console.log(json);
        const history = json.history;
        console.log(history);
        setItems(history);
      }
      console.log(items());
    });
  }
  const sync = useSyncedStore();
  async function handleImport(e: any) {
    e.preventDefault();
    // if (db()) {
    //   console.log("Importing");
    //   const tx = db()?.transaction("watch_history", "readwrite");
    //   const store = tx?.objectStore("watch_history");
    //   console.log(store);
    //   if (!store) return;
    //   items().forEach(async (item: any) => {
    //     console.log(item);
    //     // Don't override invidious items since they don't have all the data
    //     const dbItem = await store.get(videoId(item));
    //     if (dbItem && dbItem.videoId === videoId(item)) {
    //       console.log("Skipping", videoId(item));
    //       setIndex(index() + 1);
    //       setSkipped(skipped() + 1);
    //       return;
    //     }
    //     try {
    //       const request = await store
    //         .put(JSON.parse(JSON.stringify(item)), videoId(item))
    //         .then(() => {
    //           console.log("success");
    //           setIndex(index() + 1);
    //           setSuccess(success() + 1);
    //         })
    //         .catch(() => {
    //           setIndex(index() + 1);
    //           setError(error() + 1);
    //         });
    //     } catch (err) {
    //       console.error(err);
    //       setIndex(index() + 1);
    //       setError(error() + 1);
    //     }
    //   });
    // }

    const newItems: HistoryItem[] = [];
    if (!sync.store) return;
    for (const item of items() as HistoryItem[]) {
      const existing = sync.store.history[item.id];
      if (existing) {
        setIndex(index() + 1);
        setSkipped(skipped() + 1);
        continue;
      }
      newItems.push({ [item.id]: item });
      setIndex(index() + 1);
      setSuccess(success() + 1);
    }
    newItems.sort((a, b) => b.watchedAt - a.watchedAt);

    batch(() => {
      newItems.forEach((item) => {
        sync.setStore("history", item);
      });
    });
    // sync.setStore("history", updatedHistory);
  }
  function deleteHistory() {
    batch(() => {
      Object.keys(sync.store.history).forEach((item) => {
        sync.setStore("history", item, undefined!);
      });
    });
  }

  createEffect(() => {
    console.log(
      clone(sync.store.history),
      Object.keys(sync.store.history).length
    );
  });
  const [intersectionRef, setIntersectionRef] = createSignal<
    HTMLDivElement | undefined
  >(undefined);
  const isIntersecting = useIntersectionObserver({
    setTarget: () => intersectionRef(),
  });
  createEffect(() => {
    if (isIntersecting()) {
      setLimit((l) => l + 10);
    }
  });

  const sort = (a: HistoryItem, b: HistoryItem) => {
    if (!a.watchedAt || !b.watchedAt) return 0;
    if (a.watchedAt < b.watchedAt) {
      return 1;
    }
    if (a.watchedAt > b.watchedAt) {
      return -1;
    }
    return 0;
  };
  const [history, setHistory] = createSignal<HistoryItem[]>([]);
  createEffect(() => {
    if (sync.store.history) {
      setHistory(
        Object.values(sync.store.history).sort(sort).slice(0, limit())
      );
    }
  });
  const [v, setV] = createSignal("");
  return (
    <div class="">
      <Title>History | Conduit</Title>
      <form>
        <br />
        <div>
          <input ref={fileSelector} type="file" onInput={fileChange} />
        </div>
        <textarea
          onInput={(e) => {
            // setV(e.currentTarget.value)
            setItems(JSON.parse(e.currentTarget.value));
          }}
        />
        <br />
        <div>
          <Show when={itemsLength() > 0}>
            <strong>{`Found ${itemsLength()} items`}</strong>
          </Show>
        </div>{" "}
        <div>
          <progress value={index()} max={itemsLength()} />
          <div>{`Success: ${success()} Error: ${error()} Skipped: ${skipped()}`}</div>
        </div>
        <div>
          <button class="btn w-auto" onClick={handleImport}>
            Import
          </button>
          <button class="btn w-auto" onClick={deleteHistory}>
            Delete
          </button>
        </div>
      </form>
      <Button
        label="Show toast"
        onClick={() =>
          toaster.show((props) => (
            <Toast.Root toastId={props.toastId} class="toast">
              <div class="toast__content">
                <div>
                  <Toast.Title class="toast__title">
                    Event has been created
                  </Toast.Title>
                  <Toast.Description class="toast__description">
                    Monday, January 3rd at 6:00pm
                  </Toast.Description>
                </div>
                <Toast.CloseButton class="toast__close-button">
                  <BsXCircle />
                </Toast.CloseButton>
              </div>
              <Toast.ProgressTrack class="toast__progress-track">
                <Toast.ProgressFill class="toast__progress-fill" />
              </Toast.ProgressTrack>
            </Toast.Root>
          ))
        }
      />
      <div class="flex flex-wrap justify-center h-full min-h-[80vh]">
        <Show when={history()}>
          <For each={history()}>
            {(item) => (
              <div class="flex flex-col max-w-xs w-72 sm:max-w-72">
                <VideoCard
                  v={{
                    ...item,
                    url: `/watch?v=${videoId(item)}}`,
                  }}
                />
              </div>
            )}
          </For>
          <div
            ref={(ref) => setIntersectionRef(ref)}
            class="w-full h-20 mt-2 bg-primary"
          />
        </Show>
      </div>
    </div>
  );
}
