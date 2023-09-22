import { DocTypeDescription } from "@syncedstore/core/types/doc";
import {
  createContext,
  createEffect,
  createSignal,
  from,
  onCleanup,
  useContext,
} from "solid-js";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebrtcProvider } from "y-webrtc";
import { videoId } from "~/routes/library/history";
import { Playlist, Preferences, RelatedStream } from "~/types";
import * as Y from "yjs";
import { createStore } from "solid-js/store";
import createYjsStore from "~/lib/createYjsStore";
import { useAppState } from "./appStateStore";

enum ProviderStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
}

export type HistoryItem = RelatedStream & {
  id: string;
  watchedAt: number;
  currentTime: number;
};

export interface Store extends DocTypeDescription {
  playlists: Record<string, Playlist>;
  history: Record<string, HistoryItem>;
  subscriptions: string[];
  preferences: Preferences;
}
const storeShape: Store = {
  playlists: {},
  history: {},
  subscriptions: [],
  preferences: {} as Preferences,
};
const defaultPreferences = {
  autoplay: false,
  pip: false,
  muted: false,
  volume: 1,
  speed: 1,
  quality: "auto",
  theatreMode: false,
  instance: {
    name: "Piped",
    api_url: "https://pipedapi.kavin.rocks",
    cache: true,
    cdn: true,
    last_checked: new Date().getTime(),
    locations: "",
    version: "0.0.0",
    registered: 0,
    s3_enabled: false,
    up_to_date: false,
    image_proxy_url: "https://pipedproxy.kavin.rocks",
  },
};

const [initialStore] = createStore<Store>({
  playlists: {},
  history: {},
  subscriptions: [],
  preferences: {} as Preferences,
});

const doc = new Y.Doc({
  guid: "test",
});
const [store, setStore] = createYjsStore<Store>(doc, initialStore, true);
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
  let idbProvider: IndexeddbPersistence | null = null;

  const initWebrtc = async () => {
    if (!room().id) {
      setAppState("sync", "providers", "webrtc", ProviderStatus.DISCONNECTED);
      return;
    }
    if (webrtcProvider) {
      console.log("disconnecting");
      webrtcProvider.disconnect();
    }
    setAppState("sync", "providers", "webrtc", ProviderStatus.CONNECTING);
    webrtcProvider = new WebrtcProvider(room().id!, doc, {
      signaling: ["wss://signaling.fly.dev"],
      ...(room()!.password && { password: room().password }),
    });
    console.log(webrtcProvider, "webrtc provider");
    webrtcProvider.connect();
  };

  createEffect(async () => {
    await initWebrtc();

    if (!webrtcProvider) return;
    // setAppState("sync", "providers", "webrtc", ProviderStatus.CONNECTED);
    webrtcProvider?.connect();
    webrtcProvider?.awareness.setLocalStateField("user", {
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
    setAppState("sync", "providers", "idb", ProviderStatus.CONNECTING);
    console.time("indexeddb");
    idbProvider = new IndexeddbPersistence(room().id!, doc);
    idbProvider.whenSynced
      .then(() => {
        console.timeEnd("indexeddb");
        console.log("synced");

        setTimeout(() => {
          setAppState("sync", "providers", "idb", ProviderStatus.CONNECTED);
        }, 0);
      })
      .catch(() => {
        setAppState("sync", "providers", "idb", ProviderStatus.DISCONNECTED);
      });
  });
  onCleanup(() => {
    webrtcProvider?.disconnect();
  });

  return (
    <SyncContext.Provider value={{ store, setStore }}>
      {props.children}
    </SyncContext.Provider>
  );
};

export const useSyncedStore = () => useContext(SyncContext);

export function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function jsonClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
