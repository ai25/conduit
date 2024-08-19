import {
  createContext,
  createEffect,
  createSignal,
  from,
  onCleanup,
  useContext,
} from "solid-js";
import { WebrtcProvider } from "y-webrtc";
import { ConduitPlaylist, RelatedStream } from "~/types";
import * as Y from "yjs";
import { createStore } from "solid-js/store";
import createYjsStore from "~/lib/createYjsStore";
import { useAppState } from "./appStateStore";
import OpfsPersistence from "~/utils/y-opfs";
import { toast } from "~/components/Toast";
import { DEFAULT_PREFERENCES, usePreferences } from "./preferencesStore";
import { useSearchParams } from "@solidjs/router";
import { getRoomInfo } from "~/utils/opfs-helpers";
import { parseUserAgent } from "~/utils/helpers";

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

export interface WebrtcUser {
  id: string;
}
const [store, setStore] = createYjsStore<Store>(doc, initialStore, false);
const [preferences] = usePreferences();
const SyncContext = createContext({ store, setStore });

export const SyncedStoreProvider = (props: { children: any }) => {
  const [appState, setAppState] = useAppState();

  let webrtcProvider: WebrtcProvider | null = null;
  let opfsProvider: OpfsPersistence | null = null;

  const initWebrtc = async (roomId?: string): Promise<WebrtcProvider> => {
    if (!roomId) {
      setAppState("sync", "providers", "webrtc", ProviderStatus.DISCONNECTED);
      setAppState("sync", "ready", true);
      throw new Error("No room ID");
    }
    const roomInfo = await getRoomInfo(roomId);
    if (!roomInfo) {
      setAppState("sync", "providers", "webrtc", ProviderStatus.DISCONNECTED);
      setAppState("sync", "ready", true);
      throw new Error("Room not found");
    }
    if (webrtcProvider) {
      console.log("disconnecting");
      webrtcProvider.disconnect();
    }
    setAppState("sync", "providers", "webrtc", ProviderStatus.CONNECTING);
    webrtcProvider = new WebrtcProvider(roomInfo.id, doc, {
      signaling: ["wss://signaling.fly.dev"],
      ...(roomInfo.password && { password: roomInfo.password }),
    });
    console.log(webrtcProvider, "webrtc provider");
    webrtcProvider.connect();
    return webrtcProvider;
  };
  function generateBrowserId() {
    return `${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  }
  const getBrowserId = () => {
    let browserId = localStorage.getItem("browserId");
    if (!browserId) {
      browserId = generateBrowserId();
      localStorage.setItem("browserId", browserId);
    }
    return browserId;
  };

  const [searchParams] = useSearchParams();

  createEffect(() => {
    if (!searchParams.offline && preferences.sync.enabled) {
      setTimeout(() => {
        initWebrtc(appState.sync.room.id).then((webrtcProvider) => {
          setAppState(
            "sync",
            "providers",
            "webrtc",
            webrtcProvider!.connected
              ? ProviderStatus.CONNECTED
              : ProviderStatus.DISCONNECTED
          );
          webrtcProvider.awareness.setLocalStateField("user", {
            browserId: getBrowserId(),
          });

          const updateUsers = () => {
            const uniqueUsers = new Map<string, WebrtcUser>();
            webrtcProvider!.awareness.states.forEach((state, key) => {
              console.log("Awareness state", webrtcProvider);
              if (state.user && state.user.browserId) {
                uniqueUsers.set(state.user.browserId, {
                  id: state.user.browserId,
                });
              }
            });
            const users = Array.from(uniqueUsers.values());
            setAppState("sync", "users", users);
          };

          updateUsers();

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
              updateUsers();
              setAppState(
                "sync",
                "providers",
                "webrtc",
                webrtcProvider!.connected
                  ? ProviderStatus.CONNECTED
                  : ProviderStatus.DISCONNECTED
              );
              console.log("Awareness changed", added, updated, removed);
            }
          );
        });
      }, 100);
    }
  });

  createEffect(() => {
    if (!appState.sync.room.id) {
      setAppState("sync", "providers", "opfs", ProviderStatus.DISCONNECTED);
      return;
    }
    opfsProvider = new OpfsPersistence(appState.sync.room.id, doc, true);
    setAppState("sync", "providers", "opfs", ProviderStatus.CONNECTING);
    opfsProvider
      .sync()
      .then(() => {
        setAppState("sync", "providers", "opfs", ProviderStatus.CONNECTED);
        setAppState("sync", "ready", true);
      })
      .catch((e) => {
        console.error("Error syncing with OPFS", e);
        setAppState("sync", "providers", "opfs", ProviderStatus.DISCONNECTED);
        setAppState("sync", "ready", true);
        toast.error(`Error syncing with OPFS. ${e.message}`);
      });
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
