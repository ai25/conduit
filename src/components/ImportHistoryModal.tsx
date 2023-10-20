import { toaster } from "@kobalte/core";
import { batch, createSignal, Show } from "solid-js";
import { videoId } from "~/routes/library/history";
import { HistoryItem, useSyncStore } from "~/stores/syncStore";
import Button from "./Button";
import Modal from "./Modal";
import { toast } from "./Toast";

export default function ImportHistoryModal(props: {
  isOpen: () => boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [items, setItems] = createSignal([]);
  const [index, setIndex] = createSignal(0);
  const [success, setSuccess] = createSignal(0);
  const [error, setError] = createSignal(0);
  const [skipped, setSkipped] = createSignal(0);
  let fileSelector: HTMLInputElement | undefined = undefined;
  const itemsLength = () => items()?.length || 0;

  function fileChange() {
    if (!fileSelector?.files?.[0]) return;
    const file = fileSelector.files[0];
    file.text().then((text) => {
      console.log(text);
      setItems([]);
      // Conduit
      if (text.includes("conduit")) {
        const json = JSON.parse(text);
        console.log(json);
        const history = json.history;
        console.log(history);
        setItems(history);
      }
      // YouTube
      else if (text.includes("products") && text.includes("YouTube")) {
        const json = JSON.parse(text);
        console.log(json);
        const items = json.map((video: any) => {
          const item = {
            id: video.titleUrl.split("v=")[1],
            url: video.titleUrl.split("https://www.youtube.com")[1],
            title: video.title,
            uploaderName: video.subtitles[0].name,
            uploaderUrl: video.subtitles[0].url.split(
              "https://www.youtube.com"
            )[1],
            watchedAt: new Date(video.time).getTime(),
          };
          console.log(item);
          return item;
        });
        console.log(items);
        setItems(
          items.sort((a: any, b: any) => {
            return b.watchedAt - a.watchedAt;
          })
        );
      }

      // Piped
      else if (text.includes("watchHistory")) {
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
      else if (text.includes("watchPositions")) {
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
      // FreeTube
      else if (text.startsWith(`{"videoId:`)) {
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
      // Invidious
      else if (text.startsWith(`{"subscriptions":`)) {
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
        alert("Unsupported file");
      }
      console.log(items());
    });
  }
  const sync = useSyncStore();
  async function handleImport(e: any) {
    e.preventDefault();
    e.stopPropagation();

    const newItems: Record<string, HistoryItem>[] = [];
    if (!sync.store) return;
    for (const item of items() as HistoryItem[]) {
      const id = videoId(item);
      const existing = sync.store.history[id];
      if (existing) {
        setIndex(index() + 1);
        setSkipped(skipped() + 1);
        continue;
      }
      newItems.push({ [id]: item });
      setIndex(index() + 1);
      setSuccess(success() + 1);
    }
    newItems.sort((a, b) => {
      if (!a[Object.keys(a)[0]].watchedAt) return 1;
      if (!b[Object.keys(b)[0]].watchedAt) return -1;
      if (a[Object.keys(a)[0]].watchedAt > b[Object.keys(b)[0]].watchedAt)
        return -1;
      if (a[Object.keys(a)[0]].watchedAt < b[Object.keys(b)[0]].watchedAt)
        return 1;
      return 0;
    });

    const importHistory =async()=> new Promise<string>( (resolve) => {
      batch(() => {
        newItems.forEach((item) => {
          sync.setStore("history", item);
        });
      });
      resolve("done");
    });
    toast.promise(importHistory, {
      loading: "Importing history",
      success: (data) => {
        return data;
      },
      error: () => {
        return "Error importing history";
      }
    });
    await importHistory()
  }

  return (
    <Modal
      title="Import History"
      isOpen={props.isOpen()}
      setIsOpen={props.setIsOpen}
    >
      <form>
        <br />
        <div>
          <input ref={fileSelector} type="file" onInput={fileChange} />
        </div>
        <textarea
          class="text-black"
          onInput={(e) => {
            // setV(e.currentTarget.value)
            console.log(e.currentTarget.value);
            setItems(JSON.parse(e.currentTarget.value).history);
            console.log(items());
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
          {/* <button class="btn w-auto" onClick={deleteHistory}> */}
          {/*   Delete */}
          {/* </button> */}
        </div>
      </form>
    </Modal>
  );
}
