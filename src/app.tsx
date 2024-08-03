//@refresh reload
import { Router, useLocation } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import "./app.css";
import {
  Show,
  Signal,
  Suspense,
  createContext,
  createRenderEffect,
  createSignal,
  createEffect,
  onMount,
  on,
} from "solid-js";
import { Portal, getRequestEvent } from "solid-js/web";
import { PlaylistProvider } from "./stores/playlistStore";
import { SyncedStoreProvider, useSyncStore } from "./stores/syncStore";
import { AppStateProvider, useAppState } from "./stores/appStateStore";
import BottomNav from "./components/BottomNav";
import { TiHome } from "solid-icons/ti";
import { AiOutlineFire, AiOutlineMenu } from "solid-icons/ai";
import { Toast } from "@kobalte/core";
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/solid-query";
import { PreferencesProvider, usePreferences } from "./stores/preferencesStore";
import { QueueProvider } from "./stores/queueStore";
import Header from "./components/Header";
import { MetaProvider } from "@solidjs/meta";
import { VideoContextProvider, useVideoContext } from "./stores/VideoContext";
import { clientOnly } from "@solidjs/start";
import { parseCookie } from "./utils/helpers";
import { BiSolidCog } from "solid-icons/bi";
import Player, { PlayerLoading } from "./components/player/Player";
import { SolidNProgress } from "solid-progressbar";
import NProgress from "nprogress";
import Watch, { WatchFallback } from "./components/Watch";
import { getStorageValue, setStorageValue } from "./utils/storage";
import { toast } from "./components/Toast";
import { DialogContextProvider } from "./stores/DialogContext";

const ReloadPrompt = clientOnly(() => import("./components/ReloadPrompt"));
NProgress.configure({
  showSpinner: false,
});

export default function App() {
  const [preferences, setPreferences] = usePreferences();
  createRenderEffect(() => {
    if (!isServer) return;
    const event = getRequestEvent();

    const cookie = parseCookie(event?.request.headers.get("cookie") ?? "");
    const theatreMode = !!JSON.parse(cookie.theatreMode ?? "false");
    setPreferences("theatreMode", theatreMode);
  });
  createEffect(() => {
    const cookie = parseCookie(document.cookie);
    const theme = cookie.theme ?? "monokai";
    const theatreMode = !!JSON.parse(cookie.theatreMode ?? "false");
    setPreferences("theme", theme);
    setPreferences("theatreMode", theatreMode);
  });

  createEffect(() => {
    document.documentElement.classList.forEach((className) =>
      document.documentElement.classList.remove(className)
    );
    document.documentElement.classList.add(preferences.theme);
  });

  const [appState] = useAppState();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: false,
      },
    },
  });

  const sync = useSyncStore();
  createEffect(() => {
    console.log(sync.store, "sync store");
  });
  createEffect(() => {
    if (appState.loading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  });

  const [alphaWarningDismissed, setAlphaWarningDismissed] = createSignal(true);

  const isDev = () =>
    isServer
      ? process.env.NODE_ENV === "development"
      : import.meta.env.DEV === true;
  const swUrl = isDev() ? "/dev-sw.js?dev-sw" : "/sw";
  onMount(() => {
    setAlphaWarningDismissed(
      getStorageValue("alphaWarningDismissed", false, "boolean", "localStorage")
    );
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register(swUrl, {
          type: "module",
          scope: "/",
        })
        .then((registration) => {
          console.log("SW registered: ", registration);
          registration.update();
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    }
  });

  return (
    <Router
      root={(props) => (
        <>
          <MetaProvider tags={[]}>
            <QueryClientProvider client={queryClient}>
              <DialogContextProvider>
                <VideoContextProvider>
                  <PreferencesProvider>
                    <AppStateProvider>
                      <PlaylistProvider>
                        <QueueProvider>
                          <SyncedStoreProvider>
                            <div
                              class={` bg-bg1 min-h-screen font-manrope text-sm text-text1 selection:bg-accent2 selection:text-text3`}
                            >
                              <Header />
                              <Show when={!alphaWarningDismissed()}>
                                <div class="w-full h-14 " />
                                <div class="fixed top-14 w-full z-[9999] bg-amber-600 flex justify-evenly items-center p-2">
                                  <div>
                                    This website is in Alpha stage, meaning
                                    things{" "}
                                    <span class="font-bold italic mr-0.5">
                                      will
                                    </span>{" "}
                                    break, and your data{" "}
                                    <span class="font-bold italic mr-0.5">
                                      might
                                    </span>{" "}
                                    be lost. Proceed with caution!
                                  </div>
                                  <button
                                    class="py-2 px-4 rounded-full bg-amber-100 text-amber-900"
                                    onClick={() => {
                                      setStorageValue(
                                        "alphaWarningDismissed",
                                        true,
                                        "localStorage"
                                      );
                                      setAlphaWarningDismissed(true);
                                    }}
                                  >
                                    I Understand
                                  </button>
                                </div>
                              </Show>

                              <SolidNProgress
                                color="rgb(var(--colors-primary))"
                                options={{
                                  showSpinner: false,
                                  speed: 150,
                                  easing: "ease-in",
                                }}
                              />
                              <div aria-hidden="true" class="h-14" />
                              <Suspense fallback={<WatchFallback />}>
                                <Watch />
                              </Suspense>
                              <Portal>
                                <Toast.Region pauseOnPageIdle={false}>
                                  <Toast.List class="fixed bottom-0 right-0 p-4 flex flex-col gap-2 z-[999999] w-[400px] max-w-[100vw] outline-none" />
                                </Toast.Region>
                              </Portal>
                              <main>
                                <Suspense>{props.children}</Suspense>
                                {/* <Show when={isDev()}> */}
                                {/*   <ReloadPrompt /> */}
                                {/* </Show> */}
                              </main>
                              <div class="h-20 md:h-0" />
                              <Show when={appState.player.small}>
                                <div class="h-32" />
                              </Show>
                              <RouteAnnouncer />
                            </div>
                          </SyncedStoreProvider>
                        </QueueProvider>
                      </PlaylistProvider>
                    </AppStateProvider>
                  </PreferencesProvider>
                </VideoContextProvider>
              </DialogContextProvider>
            </QueryClientProvider>
          </MetaProvider>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}

const RouteAnnouncer = () => {
  const location = useLocation();
  return (
    <Portal>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        class="sr-only"
      >
        Current page: {location.pathname}{" "}
      </div>
    </Portal>
  );
};
