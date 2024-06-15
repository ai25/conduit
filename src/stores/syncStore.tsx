import {
  createContext,
  createEffect,
  createSignal,
  from,
  onCleanup,
  useContext,
} from "solid-js";
// import { IndexeddbPersistence } from "y-indexeddb";
import { WebrtcProvider } from "y-webrtc";
import { ConduitPlaylist, RelatedStream } from "~/types";
import * as Y from "yjs";
import { createStore } from "solid-js/store";
import createYjsStore from "~/lib/createYjsStore";
import { useAppState } from "./appStateStore";
import OpfsPersistence from "~/utils/y-opfs";
import { toast } from "~/components/Toast";
import { DEFAULT_PREFERENCES, usePreferences } from "./preferencesStore";

enum ProviderStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
}

export type HistoryItem = RelatedStream & {
  watchedAt: number;
  currentTime: number;
};

export interface Store {
  playlists: Record<string, ConduitPlaylist>;
  history: Record<string, HistoryItem>;
  subscriptions: Record<
    string,
    {
      subscribedAt: number;
      name: string;
    }
  >;
  preferences: typeof DEFAULT_PREFERENCES;
  watchLater: Record<string, RelatedStream>;
  blocklist: Record<string, { name: string }>;
}
const [initialStore] = createStore<Store>({
  playlists: {},
  history: {},
  subscriptions: {},
  preferences: {} as typeof DEFAULT_PREFERENCES,
  watchLater: {},
  blocklist: {},
});

const doc = new Y.Doc({
  guid: "test",
});
const [store, setStore] = createYjsStore<Store>(doc, initialStore, false);
const [preferences] = usePreferences();
const SyncContext = createContext({ store, setStore });

export const SyncedStoreProvider = (props: { children: any }) => {
  const [room, setRoom] = createSignal(
    "localStorage" in globalThis
      ? (JSON.parse(localStorage.getItem("room") || "{}") as {
          id?: string;
          password?: string;
          name?: string;
        })
      : {}
  );

  let webrtcProvider: WebrtcProvider | null = null;
  // let idbProvider: IndexeddbPersistence | null = null;
  let opfsProvider: OpfsPersistence | null = null;

  const initWebrtc = async () => {
    if (!room().id) {
      setAppState("sync", "providers", "webrtc", ProviderStatus.DISCONNECTED);
      return;
    }
    if (webrtcProvider) {
      console.log("disconnecting");
      webrtcProvider.disconnect();
    }
    if (preferences.sync.enabled) {
      setAppState("sync", "providers", "webrtc", ProviderStatus.CONNECTING);
      webrtcProvider = new WebrtcProvider(room().id!, doc, {
        signaling: ["wss://signaling.fly.dev"],
        ...(room()!.password && { password: room().password }),
      });
      console.log(webrtcProvider, "webrtc provider");
      webrtcProvider.connect();
    }
  };

  createEffect(async () => {
    await initWebrtc();
    setAppState("sync", "providers", "webrtc", ProviderStatus.DISCONNECTED);

    if (!webrtcProvider) return;
    // setAppState("sync", "providers", "webrtc", ProviderStatus.CONNECTED);
    webrtcProvider.awareness.setLocalStateField("user", {
      name: room().name,
    });
    // setAppState("sync", "lastSync", webrtcProvider?.awareness.states.

    let users = [] as { id: number; name: string }[];
    webrtcProvider.awareness.states.forEach((state, key) => {
      console.log(state, key);
      users.push({ id: key, name: state.user.name });
    });
    setAppState("sync", "users", users);
    webrtcProvider?.awareness.on(
      "change",
      ({
        added,
        updated,
        removed,
      }: {
        added: number[];
        updated: number[];
        removed: number[];
      }) => {
        let users = [] as { id: number; name: string }[];
        webrtcProvider!.awareness.states.forEach((state, key) => {
          console.log(state, key);
          users.push({ id: key, name: state.user.name });
        });
        setAppState("sync", "users", users);
        setAppState("sync", "lastSync", new Date().getTime());
        setAppState(
          "sync",
          "providers",
          "webrtc",
          webrtcProvider!.connected
            ? ProviderStatus.CONNECTED
            : ProviderStatus.DISCONNECTED
        );
        console.log("Awareness changed", added, updated, removed, users);
      }
    );
  });
  const [, setAppState] = useAppState();

  createEffect(async () => {
    if (!room().id) {
      setAppState("sync", "providers", "idb", ProviderStatus.DISCONNECTED);
      return;
    }
    setAppState("sync", "providers", "idb", ProviderStatus.DISCONNECTED);
    // idbProvider = new IndexeddbPersistence(room().id!, doc);
    // idbProvider.whenSynced
    //   .then(() => {
    //     console.timeEnd("indexeddb");
    //     console.log("synced");

    //     setTimeout(() => {
    //       setAppState("sync", "providers", "idb", ProviderStatus.CONNECTED);
    //     }, 0);
    //   })
    //   .catch(() => {
    //     setAppState("sync", "providers", "idb", ProviderStatus.DISCONNECTED);
    //   });
    opfsProvider = new OpfsPersistence(room().id!, doc, true);
    setAppState("sync", "providers", "opfs", ProviderStatus.CONNECTING);
    try {
      await opfsProvider.sync();
      // await opfsProvider.whenSynced()
      setAppState("sync", "providers", "opfs", ProviderStatus.CONNECTED);
    } catch (e) {
      console.error("Error syncing with OPFSx", e);
      setAppState("sync", "providers", "opfs", ProviderStatus.DISCONNECTED);
      toast.error("Error syncing with OPFS");
    }
  });
  onCleanup(() => {
    webrtcProvider?.disconnect();
    opfsProvider?.destroy();
  });

  return (
    <SyncContext.Provider value={{ store, setStore }}>
      {props.children}
    </SyncContext.Provider>
  );
};

export const useSyncStore = () => {
  const context = useContext(SyncContext);
  if (!context) throw new Error("No SyncedStoreProvider!");
  return context;
};
