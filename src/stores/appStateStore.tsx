import { useLocation } from "@solidjs/router";
import { createContext, createEffect, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { MediaPlayerElement } from "vidstack/elements";
import { ProviderStatus } from "~/components/Header";
import { DownloadProgress } from "~/utils/hls";
import { useWindowEvent } from "~/utils/hooks";
import { getStorageValue } from "~/utils/storage";
import { WebrtcUser } from "./syncStore";

const store = createStore({
  loading: false,
  touchInProgress: false,
  sync: {
    providers: {
      webrtc: "disconnected" as ProviderStatus,
      opfs: "disconnected" as ProviderStatus,
    },
    users: [] as WebrtcUser[],
    ready: false,
    room: {
      id: "",
      name: "",
      password: "",
    },
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
  createEffect(() => {
    if (!store[0].sync.room.id) {
      const room = getStorageValue("room", { id: "" }, "json", "localStorage");
      if (room.id) {
        store[1]("sync", "room", room);
      }
    }
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
