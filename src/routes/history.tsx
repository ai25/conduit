import {
  For,
  Show,
  createEffect,
  createSignal,
  onMount,
  useContext,
} from "solid-js";
import {
  DBContext,
  InstanceContext,
  SolidStoreContext,
  SyncContext,
} from "~/root";
import { extractVideoId } from "./watch";
import VideoCard from "~/components/VideoCard";
import { RelatedStream } from "~/types";
import dayjs from "dayjs";
import { SyncedDB } from "~/stores/syncedStore";
import { BsInfoCircleFill, BsXCircle } from "solid-icons/bs";
import Button from "~/components/Button";
import { toaster, Toast } from "@kobalte/core";
import { Portal } from "solid-js/web";
import { Title } from "solid-start";

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
  const writeStore = useContext(SyncContext);

  // createEffect(async () => {
  //   if (solidStore()) {
  //     const items = SyncedDB.history.findMany(solidStore()!) || [];
  //     if (!items || items.length === 0) return;
  //     setAll(items);
  //     setHistoryItems(all().slice(0, limit()));
  //     console.log(all().length);
  //   }
  // });
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
  const [errorMessage, setErrorMessage] = createSignal("");
  const [statusMessage, setStatusMessage] = createSignal("Status:\n");
  const [importing, setImporting] = createSignal(false);
  const [importProgress, setImportProgress] = createSignal(0);
  let preRef: HTMLPreElement | undefined = undefined;
  async function importFromDb() {
    setImporting(true);
    setStatusMessage((s) => s + "\nImporting from db");
    if (!("indexedDB" in globalThis)) {
      setErrorMessage("No indexedDB found");
      return;
    }
    setStatusMessage((s) => s + "\nIndexedDB found");
    if (!db()) {
      setErrorMessage("No database found");
      return;
    }
    setStatusMessage((s) => s + "\nDatabase found");
    const tx = db()!.transaction("watch_history", "readwrite");
    if (!tx) {
      setErrorMessage("No transaction found");
      return;
    }
    setStatusMessage((s) => s + "\nTransaction found");
    const store = tx.objectStore("watch_history");
    if (!store) {
      setErrorMessage("No store found");
      return;
    }
    setStatusMessage((s) => s + "\nStore found");
    const data = await store?.getAll();
    if (!data) {
      setErrorMessage("No data found");
      return;
    }
    setStatusMessage((s) => s + `\nFound ${data.length} items`);
    const items = data?.map((item: any) => {
      return {
        ...item,
        watchedAt: item.watchedAt ?? 0,
        currentTime: item.currentTime ?? 0,
        id: videoId(item),
      };
    });
    console.log(items);
    if (!writeStore()) {
      setErrorMessage("No write store found");
      return;
    }
    setStatusMessage((s) => s + "\nWrite store found, writing\n\n");
    let toastId: number | undefined = undefined;
    try {
      SyncedDB.history
        .upsertMany(
          writeStore()!,
          data,
          (processed, title, updated) => {
            let total = data.length;
            const newItems = processed - updated;
            setImportProgress((processed / total) * 100);
            // add new status message "importing 1/100" or replace the last one if it exists
            // setStatusMessage((s) => {
            //   const lines = s.split("\n");
            //   if (lines[lines.length - 1].includes("importing")) {
            //     lines[lines.length - 1] = `Importing ${processed}/${total}`;
            //   } else {
            //     lines.push(`Importing ${processed}/${total}`);
            //   }
            //   //scroll to end
            //   preRef?.scrollTo(0, preRef?.scrollHeight);
            //   return lines.join("\n");
            // });
            const toast = (props: any) => (
              <Toast.Root toastId={props.toastId} class="toast">
                <div class="toast__content">
                  <div>
                    <Toast.Title class="toast__title">
                      Processing: {processed} / {total}
                    </Toast.Title>
                    <Toast.Description class="toast__description">
                      Importing: {title}
                      <br />
                      {newItems} new
                      <br />
                      {updated} updated
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
            );
            if (toastId) {
              toaster.update(toastId, (props) => {
                return toast(props);
              });
            } else
              toastId = toaster.show((props) => {
                return toast(props);
              });
          },
          {
            skipExisting: true,
          }
        )
        .then(() => {
          setStatusMessage((s) => s + "\nDone");
        })
        .catch((err) => {
          setStatusMessage((s) => s + "\nError: " + err.message);
        })
        .finally(() => {
          setImporting(false);
        });
    } catch (err) {
      console.error(err);
      setErrorMessage((err as any).message);
    } finally {
      setImporting(false);
    }
  }
  const [intersectionRef, setIntersectionRef] = createSignal<
    HTMLDivElement | undefined
  >(undefined);
  function handleScroll(e: any) {
    const entry = e[0];
    if (entry?.isIntersecting) {
      setLimit((l) => l + 10);
    }
  }

  createEffect(() => {
    console.log(intersectionRef(), "intersection");
    if (!intersectionRef()) return;

    const intersectionObserver = new IntersectionObserver(handleScroll, {
      threshold: 0.1,
    });

    intersectionObserver.observe(intersectionRef()!);
  });

  return (
    <div class="">
      <Title>History | Conduit</Title>
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
      <div class="text-red-500">{errorMessage()}</div>
      <Button label="Import from db" onClick={() => importFromDb()} />
      <Button
        label="Remove duplicates"
        onClick={() =>
          console.log(
            `removed ${SyncedDB.history.removeDuplicates(writeStore()!)} items`
          )
        }
      />
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
      <Portal>
        <Toast.Region>
          <Toast.List class="toast__list" />
        </Toast.Region>
      </Portal>
      <pre
        class="text-start overflow-y-auto h-96 bg-bg2 rounded-md p-2"
        ref={preRef}>
        {statusMessage()}
      </pre>
      <div class="flex flex-wrap justify-center">
        <Show when={solidStore()}>
          <For
            each={SyncedDB.history
              .findMany(solidStore()!, {
                sort: (a, b) => {
                  if (!a.watchedAt && !b.watchedAt) return 0;
                  if (!a.watchedAt) return 1;
                  if (!b.watchedAt) return -1;
                  return b.watchedAt - a.watchedAt;
                },
              })
              ?.slice(0, limit())}>
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
          <div
            ref={(ref) => setIntersectionRef(ref)}
            class="w-full h-20 mt-2 bg-primary"
          />
        </Show>
      </div>
    </div>
  );
}
