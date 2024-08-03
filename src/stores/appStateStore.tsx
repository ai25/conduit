import { useLocation } from "@solidjs/router";
import { createContext, createEffect, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { MediaPlayerElement } from "vidstack/elements";
import { ProviderStatus } from "~/components/Header";
import { DownloadProgress } from "~/utils/hls";
import { useWindowEvent } from "~/utils/hooks";

const store = createStore({
  loading: false,
  touchInProgress: false,
  sync: {
    providers: {
      idb: "disconnected" as ProviderStatus,
      webrtc: "disconnected" as ProviderStatus,
      opfs: "disconnected" as ProviderStatus,
    },
    syncing: false,
    lastSync: 0,
    userId: 0,
    users: [] as { id: number; name: string }[],
    ready: false,
  },
  player: {
    instance: undefined as MediaPlayerElement | undefined,
    small: false,
    dismissed: false,
  },
  showNavbar: true,
  smallDevice: false,
  offline: false,
  downloadProgress: undefined as DownloadProgress | undefined,
});
const AppStateContext = createContext(store);
export const AppStateProvider = (props: { children: any }) => {
  useWindowEvent("offline", () => {
    store[1]("offline", navigator.onLine);
  });
  useWindowEvent("online", () => {
    store[1]("offline", navigator.onLine);
  });
  return (
    <AppStateContext.Provider value={store}>
      {props.children}
    </AppStateContext.Provider>
  );
};
export const useAppState = () => {
  const context = useContext(AppStateContext);
  return context;
};
