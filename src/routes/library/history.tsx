import {
  For,
  Show,
  createEffect,
  createSignal,
  onMount,
  useContext,
  batch,
  untrack,
} from "solid-js";
import { RelatedStream } from "~/types";
import { HistoryItem, useSyncStore } from "~/stores/syncStore";
import { BsInfoCircleFill, BsXCircle } from "solid-icons/bs";
import Button from "~/components/Button";
import { toaster, Toast } from "@kobalte/core";
import { Portal } from "solid-js/web";
import useIntersectionObserver from "~/hooks/useIntersectionObserver";
import ImportHistoryModal from "~/components/ImportHistoryModal";
import uFuzzy from "@leeoniya/ufuzzy";
import Modal from "~/components/Modal";
import Field from "~/components/Field";
import { debounce, getVideoId } from "~/utils/helpers";
import VideoCard from "~/components/content/stream/VideoCard";
import { Title } from "@solidjs/meta";

export default function History() {
  const [limit, setLimit] = createSignal(50);
  const [items, setItems] = createSignal([]);
  const sync = useSyncStore();
  function deleteHistory() {
    batch(() => {
      Object.keys(sync.store.history).forEach((item) => {
        sync.setStore("history", item, undefined as any);
      });
    });
  }

  createEffect(() => {
    if (!sync.store.history) return;
    console.log(Object.keys(sync.store.history)?.length);
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
    const getTime = (date: number) => new Date(date).getTime();

    if (!a.watchedAt) return 1;
    if (!b.watchedAt) return -1;

    const aTime = getTime(a.watchedAt);
    const bTime = getTime(b.watchedAt);

    // Check for invalid dates
    if (isNaN(aTime)) return 1;
    if (isNaN(bTime)) return -1;

    // Check for dates before epoch time
    if (aTime <= 0) return 1;
    if (bTime <= 0) return -1;

    return bTime - aTime;
  };

  const [history, setHistory] = createSignal<HistoryItem[]>([]);
  const [importModalOpen, setImportModalOpen] = createSignal(false);
  const [search, setSearch] = createSignal("");

  const setSearchDebounced = debounce((input: string) => {
    setSearch(input);
  }, 500);
  const uf = new uFuzzy({
    intraMode: 1,
    intraChars: "[w-]",
    intraSub: 1,
    intraTrn: 1,
    intraDel: 1,
    intraIns: 1,
  });

  createEffect(() => {
    if (search()) {
      const strings = Object.values(sync.store.history).map(
        (item) => `${item.title} ${item.uploaderName}`
      );
      const [idxs, info, sort] = uf.search(strings, search(), false);
      const history = Object.values(sync.store.history);
      const results = idxs?.map((idx) => history[idx])?.slice(0, limit()) ?? [];
      setHistory(results);
    } else {
      if (!sync.store.history) return;
      setHistory(
        Object.values(sync.store.history).sort(sort).slice(0, limit())
      );
    }
  });

  const exportHistory = () => {
    const history = Object.values(sync.store.history);
    const toExport = JSON.stringify(
      {
        platform: "Conduit",
        version: 1,
        history,
      },
      null,
      2
    );
    const blob = new Blob([toExport], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fileName = `conduit-history-${new Date().toISOString()}.json`;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };
  const [deleteModalOpen, setDeleteModalOpen] = createSignal(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = createSignal("");
  const [touched, setTouched] = createSignal(false);
  const [isLoading, setLoading] = createSignal(false);

  return (
    <div class="">
      <Title>History | Conduit</Title>
      <Button label="Import" onClick={() => setImportModalOpen(true)} />
      <ImportHistoryModal
        isOpen={importModalOpen()}
        setIsOpen={(isOpen) => {
          console.log(isOpen, "setIsOpen");
          setImportModalOpen(isOpen);
        }}
      />
      <Button label="Export" onClick={exportHistory} />
      <Button label="Clear" onClick={() => setDeleteModalOpen(true)} />
      <Modal
        title="Delete history?"
        isOpen={deleteModalOpen()}
        setIsOpen={setDeleteModalOpen}
      >
        <div class="flex flex-col items-center justify-center">
          <div class="text-sm text-text1">This operation cannot be undone.</div>
          <div class="flex mt-4 flex-col gap-2 items-center">
            <Field
              class="ml-2"
              value={deleteConfirmInput()}
              onInput={(v) => {
                setTouched(false);
                setDeleteConfirmInput(v);
              }}
              type="text"
              errorMessage={
                deleteConfirmInput() !== "DELETE" && touched()
                  ? "Must type DELETE to confirm"
                  : ""
              }
              placeholder="DELETE"
              name="Type DELETE to confirm"
              validationState={
                deleteConfirmInput() !== "DELETE" ? "invalid" : "valid"
              }
            />
            <div class="flex gap-2">
              <Button
                label="Cancel"
                onClick={() => setDeleteModalOpen(false)}
              />
              <Button
                label="Delete"
                class="ml-2"
                onClick={() => {
                  setTouched(true);
                  if (deleteConfirmInput() === "DELETE") {
                    deleteHistory();
                    setDeleteModalOpen(false);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </Modal>
      <Field
        onInput={(e) => setSearchDebounced(e)}
        class="my-2 mx-auto"
        placeholder="Search..."
      />
      <div class="flex flex-wrap justify-center h-full min-h-[80vh]">
        <Show when={history()}>
          <For each={history()}>
            {(item) => (
              <VideoCard
                v={{
                  ...item,
                  url: `/watch?v=${getVideoId(item)}`,
                }}
              />
            )}
          </For>
          <div
            ref={(ref) => setIntersectionRef(ref)}
            class="w-full h-20 mt-2"
          />
        </Show>
      </div>
    </div>
  );
}
