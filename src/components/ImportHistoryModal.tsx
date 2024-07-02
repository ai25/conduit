import { toaster } from "@kobalte/core";
import { batch, createEffect, createSignal, Show } from "solid-js";
import { HistoryItem, useSyncStore } from "~/stores/syncStore";
import Button from "./Button";
import Modal from "./Modal";
import { toast } from "./Toast";
import { getVideoId } from "~/utils/helpers";
import { RelatedStream } from "~/types";
import {
  processConduitHistory,
  processFreeTubeHistory,
  processInvidiousHistory,
  processLibreTubeHistory,
  processPipedHistory,
  processYouTubeHistory,
} from "~/utils/import-helpers";

export default function ImportHistoryModal(props: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [items, setItems] = createSignal<Partial<RelatedStream>[]>([]);
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

      // Order matters
      let processedItems =
        processConduitHistory(text) ||
        processYouTubeHistory(text) ||
        processLibreTubeHistory(text) ||
        processPipedHistory(text) ||
        processFreeTubeHistory(text) ||
        processInvidiousHistory(text);

      if (processedItems) {
        setItems(processedItems);
      } else {
        alert("Unsupported file");
        setItems([]);
      }

      console.log(items());
    });
  }
  const sync = useSyncStore();
  async function handleImport() {
    const newItems: Record<string, HistoryItem>[] = [];
    if (!sync.store) return;
    for (const item of items() as HistoryItem[]) {
      const id = getVideoId(item);
      if (!id) {
        setError(error() + 1);
        setIndex(index() + 1);
        continue;
      }
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

    const importHistory = async () =>
      new Promise<string>((resolve) => {
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
      },
    });
    await importHistory();
  }

  return (
    <Modal
      title="Import History"
      isOpen={props.isOpen}
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
          <button class="btn w-auto" onClick={() => handleImport()}>
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
