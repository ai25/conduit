import { Show, createSignal, useContext } from "solid-js";
import { DBContext } from "~/root";
import { extractVideoId } from "./watch";
        export const videoId = (item:any) => {
            if (!item) return undefined;
            if (item.videoId) return item.videoId;
            else if (item.id) return item.id;
            else if (item.url) return extractVideoId(item.url);
            else if (item.thumbnailUrl) return extractVideoId(item.proxyUrl);
            else if (item.thumbnail) return extractVideoId(item.thumbnail);
            else return undefined;
        }

export default function History() {
  const [items, setItems] = createSignal([]);
  const [index, setIndex] = createSignal(0);
  const [success, setSuccess] = createSignal(0);
  const [error, setError] = createSignal(0);
  const [skipped, setSkipped] = createSignal(0);
  let fileSelector: HTMLInputElement | undefined = undefined;
  const itemsLength = () => items().length;
  const [db] = useContext(DBContext);
  function fileChange() {
    if (!fileSelector?.files?.[0]) return;
    const file = fileSelector.files[0];
    file.text().then((text) => {
      setItems([]);
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
          };
        });
        setItems(iv);
      }
      console.log(items());
    });
  }
  async function handleImport() {
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
  return (
    <div class="text-center">
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
      <br />
      <strong>Importing Subscriptions from YouTube</strong>
      <br />
      <div>
        Open
        <a href="https://takeout.google.com/takeout/custom/youtube">
          takeout.google.com/takeout/custom/youtube
        </a>
        <br />
        In "Select data to include", click on "All YouTube data included" and
        select only "subscriptions".
        <br />
        Create the export and download the zip file.
        <br />
        Extract subscriptions.csv from the zip file.
        <br />
        Select and import the file above.
      </div>
      <br />
      <strong>Importing Subscriptions from Invidious</strong>
      <br />
      <div>
        Open
        <a href="https://invidio.us/data_control">invidiou.us/data_control</a>
        <br />
        Click on any of the export options.
        <br />
        Select and import the file above.
      </div>
      <br />
      <strong>Importing Subscriptions from NewPipe</strong>
      <br />
      <div>
        Go to the Feed tab.
        <br />
        Click on the arrow on where it says "Subscriptions".
        <br />
        Save the file somewhere.
        <br />
        Select and import the file above.
      </div>
    </div>
  );
}
