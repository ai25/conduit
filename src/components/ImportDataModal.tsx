import { batch, createEffect, createSignal, JSX, Show } from "solid-js";
import { HistoryItem, Store, useSyncStore } from "~/stores/syncStore";
import Modal from "./Modal";
import { toast } from "./Toast";
import { DEFAULT_PREFERENCES, usePreferences } from "~/stores/preferencesStore";
import Button from "./Button";
import FileUploadBox from "./FileUploadBox";
import {
  FaSolidBan,
  FaSolidCircleExclamation,
  FaSolidClock,
  FaSolidClockRotateLeft,
  FaSolidFile,
  FaSolidHeart,
  FaSolidList,
  FaSolidX,
} from "solid-icons/fa";
import Toggle from "./Toggle";
import { TiCog } from "solid-icons/ti";

export default function ImportDataModal(props: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [importedHistory, setImportedHistory] =
    createSignal<Store["history"]>();
  const [importedSubscriptions, setImportedSubscriptions] =
    createSignal<Store["subscriptions"]>();
  const [importedPlaylists, setImportedPlaylists] =
    createSignal<Store["playlists"]>();
  const [importedWatchLater, setImportedWatchLater] =
    createSignal<Store["watchLater"]>();
  const [importedBlocklist, setImportedBlocklist] =
    createSignal<Store["blocklist"]>();
  const [importedPreferences, setImportedPreferences] =
    createSignal<typeof DEFAULT_PREFERENCES>();

  const [shouldImport, setShouldImport] = createSignal({
    history: true,
    subscriptions: true,
    playlists: true,
    watchLater: true,
    blocklist: true,
    preferences: true,
  });
  const [override, setOverride] = createSignal({
    history: false,
    subscriptions: false,
    playlists: false,
    watchLater: false,
    blocklist: false,
    preferences: false,
  });

  const [file, setFile] = createSignal<File>();
  function fileChange(file: File | undefined) {
    setFile(file);
    console.log(file, "fileChange");

    file?.text().then((text) => {
      console.log(text);
      if (text.includes("Conduit")) {
        const store: Partial<Store> = JSON.parse(text);
        setImportedHistory(store.history);
        setImportedSubscriptions(store.subscriptions);
        setImportedPlaylists(store.playlists);
        setImportedWatchLater(store.watchLater);
        setImportedBlocklist(store.blocklist);
        setImportedPreferences(store.preferences);
      }
    });
  }
  const sync = useSyncStore();
  const [preferences, setPreferences] = usePreferences();
  async function handleImport() {
    if (importedHistory() && shouldImport().history) {
      let initialHistoryCount = Object.keys(sync.store.history).length;
      console.log("initialHistoryCount", initialHistoryCount);
      if (override().history) {
        const mergedHistory = { ...sync.store.history, ...importedHistory() };
        setTimeout(() => {
          sync.setStore("history", mergedHistory);
        }, 0);
      } else {
        setTimeout(() => {
          sync.setStore("history", importedHistory()!);
          console.log(
            "eventualHistoryCount",
            initialHistoryCount,
            Object.keys(sync.store.history).length
          );
        }, 0);
      }
    }
    if (importedSubscriptions() && shouldImport().subscriptions) {
      if (override().subscriptions) {
        const mergedSubscriptions = {
          ...sync.store.subscriptions,
          ...importedSubscriptions(),
        };
        setTimeout(() => {
          sync.setStore("subscriptions", mergedSubscriptions);
        }, 0);
      } else {
        setTimeout(() => {
          sync.setStore("subscriptions", importedSubscriptions()!);
        }, 0);
        console.log("subscriptions written", sync.store.subscriptions);
      }
    }
    if (importedPlaylists() && shouldImport().playlists) {
      if (override().playlists) {
        const mergedPlaylists = {
          ...sync.store.playlists,
          ...importedPlaylists(),
        };
        setTimeout(() => {
          sync.setStore("playlists", mergedPlaylists);
        }, 0);
      } else {
        setTimeout(() => {
          sync.setStore("playlists", importedPlaylists()!);
        }, 0);
      }
    }
    if (importedWatchLater() && shouldImport().watchLater) {
      if (override().watchLater) {
        const mergedWatchLater = {
          ...sync.store.watchLater,
          ...importedWatchLater(),
        };
        setTimeout(() => {
          sync.setStore("watchLater", mergedWatchLater);
        }, 0);
      } else {
        setTimeout(() => {
          sync.setStore("watchLater", importedWatchLater()!);
        }, 0);
      }
    }
    if (importedBlocklist() && shouldImport().blocklist) {
      if (override().blocklist) {
        const mergedBlocklist = {
          ...sync.store.blocklist,
          ...importedBlocklist(),
        };
        setTimeout(() => {
          sync.setStore("blocklist", mergedBlocklist);
        }, 0);
      } else {
        setTimeout(() => {
          sync.setStore("blocklist", importedBlocklist()!);
        }, 0);
      }
    }
    if (importedPreferences() && shouldImport().preferences) {
      if (override().preferences) {
        const mergedPreferences = { ...preferences, ...importedPreferences() };
        setPreferences(mergedPreferences);
      } else {
        setPreferences(importedPreferences()!);
      }
    }
    props.setIsOpen(false);
    toast.success("Imported data successfully");
  }

  return (
    <Modal
      title="Import Data"
      isOpen={props.isOpen}
      setIsOpen={props.setIsOpen}
    >
      <div class="p-2 sm:p-6 flex flex-col gap-6">
        <Show when={!file()}>
          <FileUploadBox onFileChange={fileChange} />
        </Show>
        <Show when={file()}>
          <div class="flex items-center gap-2">
            <button
              class="p-2 rounded outline-none focus-visible:ring-2 ring-primary/80"
              onClick={() => setFile(undefined)}
            >
              <FaSolidX class="h-4 w-4" />
            </button>
            <FaSolidFile class="h-6 w-6" /> {file()?.name}
          </div>
          <Show when={importedBlocklist()}>blocklist</Show>
          <Show when={importedHistory()}>
            <ImportToggles
              itemsLength={Object.keys(importedHistory()!).length}
              label="History"
              icon={<FaSolidClockRotateLeft class="w-5 h-5 my-1" />}
              enabled={shouldImport().history}
              setEnabled={(enabled) =>
                setShouldImport((prev) => ({ ...prev, history: enabled }))
              }
              override={override().history}
              setOverride={(override) =>
                setOverride((prev) => ({ ...prev, history: override }))
              }
            />
          </Show>
          <Show when={importedSubscriptions()}>
            <ImportToggles
              itemsLength={Object.keys(importedSubscriptions()!).length}
              label="Subscriptions"
              icon={<FaSolidHeart class="w-5 h-5 my-1" />}
              enabled={shouldImport().subscriptions}
              setEnabled={(enabled) =>
                setShouldImport((prev) => ({ ...prev, subscriptions: enabled }))
              }
              override={override().subscriptions}
              setOverride={(override) =>
                setOverride((prev) => ({ ...prev, subscriptions: override }))
              }
            />
          </Show>
          <Show when={importedPlaylists()}>
            <ImportToggles
              itemsLength={Object.keys(importedPlaylists()!).length}
              label="Playlists"
              icon={<FaSolidList class="w-5 h-5 my-1" />}
              enabled={shouldImport().playlists}
              setEnabled={(enabled) =>
                setShouldImport((prev) => ({ ...prev, playlists: enabled }))
              }
              override={override().playlists}
              setOverride={(override) =>
                setOverride((prev) => ({ ...prev, playlists: override }))
              }
            />
          </Show>
          <Show when={importedWatchLater()}>
            <ImportToggles
              itemsLength={Object.keys(importedWatchLater()!).length}
              label="Watch Later"
              icon={<FaSolidClock class="w-5 h-5 my-1" />}
              enabled={shouldImport().watchLater}
              setEnabled={(enabled) =>
                setShouldImport((prev) => ({ ...prev, watchLater: enabled }))
              }
              override={override().watchLater}
              setOverride={(override) =>
                setOverride((prev) => ({ ...prev, watchLater: override }))
              }
            />
          </Show>
          <Show when={importedBlocklist()}>
            <ImportToggles
              itemsLength={Object.keys(importedBlocklist()!).length}
              label="Blocklist"
              icon={<FaSolidBan class="w-5 h-5 my-1" />}
              enabled={shouldImport().blocklist}
              setEnabled={(enabled) =>
                setShouldImport((prev) => ({ ...prev, blocklist: enabled }))
              }
              override={override().blocklist}
              setOverride={(override) =>
                setOverride((prev) => ({ ...prev, blocklist: override }))
              }
            />
          </Show>
          <Show when={importedPreferences()}>
            <ImportToggles
              itemsLength={Object.keys(importedPreferences()!).length}
              label="Preferences"
              icon={<TiCog class="w-8 h-8 my-1" />}
              enabled={shouldImport().preferences}
              setEnabled={(enabled) =>
                setShouldImport((prev) => ({ ...prev, preferences: enabled }))
              }
              override={override().preferences}
              setOverride={(override) =>
                setOverride((prev) => ({ ...prev, preferences: override }))
              }
            />
          </Show>
          <Show
            when={
              !importedBlocklist() &&
              !importedWatchLater() &&
              !importedPreferences() &&
              !importedPlaylists() &&
              !importedSubscriptions() &&
              !importedHistory()
            }
          >
            <div class="flex gap-2 items-center">
              <FaSolidCircleExclamation class="h-6 w-6 text-red-500" />{" "}
              Unsupported file
            </div>
          </Show>
        </Show>

        <Button
          isDisabled={
            !importedBlocklist() &&
            !importedWatchLater() &&
            !importedPreferences() &&
            !importedPlaylists() &&
            !importedSubscriptions() &&
            !importedHistory()
          }
          label="Import"
          onClick={() => handleImport()}
        />
      </div>
    </Modal>
  );
}

const ImportToggles = (props: {
  itemsLength: number;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  override: boolean;
  setOverride: (override: boolean) => void;
  label: string;
  icon: JSX.Element;
}) => {
  return (
    <div class="flex items-start gap-2">
      {props.icon}
      <div class="flex flex-col gap-1">
        <div class="text-md font-semibold">{props.label}</div>
        <div>{props.itemsLength}&nbsp;item(s)</div>
        <div class="flex gap-2 items-center">
          <Toggle
            label={`Enable ${props.label.toLowerCase()}`}
            checked={props.enabled}
            onChange={props.setEnabled}
          />
          Import
        </div>
        <div class="flex gap-2 items-center">
          <Toggle
            label={`Override ${props.label.toLowerCase()}`}
            checked={props.override}
            onChange={props.setOverride}
          />
          Override current {props.label.toLowerCase()}
        </div>
      </div>
    </div>
  );
};
