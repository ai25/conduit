import { useLocation } from "@solidjs/router";
import { createContext, createEffect, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { ProviderStatus } from "~/components/Header";

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
  },
  player: {
    small: false,
    dismissed: false,
    lastVideoUrl: "",
  },
  lastBrowseUrl: undefined as string | undefined,
  lastWatchUrl: undefined as string | undefined,
  smallDevice: false,
});
const AppStateContext = createContext(store);
export const AppStateProvider = (props: { children: any }) => {
  const location = useLocation();
  createEffect(() => {
    console.log("location", location.pathname, location.query, location.search);
    if (location.pathname === "/watch") {
      store[1]("lastWatchUrl", `${location.pathname}${location.search}`);
    } else {
      store[1]("lastBrowseUrl", `${location.pathname}${location.search}`);
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
