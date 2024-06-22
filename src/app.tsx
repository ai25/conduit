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
} from "solid-js";
import { Portal, getRequestEvent } from "solid-js/web";
import { PlaylistProvider } from "./stores/playlistStore";
import { PlayerStateProvider } from "./stores/playerStateStore";
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

const ReloadPrompt = clientOnly(() => import("./components/ReloadPrompt"));
NProgress.configure({
  showSpinner: false,
});

export default function App() {
  const [preferences, setPreferences] = usePreferences();
  createEffect(() => {
    const cookie = parseCookie(document.cookie);
    const theme = cookie.theme ?? "monokai";
    setPreferences("theme", theme);
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

  return (
    <Router
      root={(props) => (
        <>
          <MetaProvider tags={[]}>
            <QueryClientProvider client={queryClient}>
              <VideoContextProvider>
                <PreferencesProvider>
                  <AppStateProvider>
                    <PlaylistProvider>
                      <QueueProvider>
                        <PlayerStateProvider>
                          <SyncedStoreProvider>
                            <div
                              class={` bg-bg1 min-h-screen font-manrope text-sm scrollbar text-text1 selection:bg-accent2 selection:text-text3`}
                            >
                              <Header />

                              <SolidNProgress
                                color="rgb(var(--colors-primary))"
                                options={{
                                  showSpinner: false,
                                  speed: 150,
                                  easing: "ease-in",
                                }}
                              />
                              <div aria-hidden="true" class="h-10" />

                              <Suspense fallback={<PlayerLoading />}>
                                <Player />
                              </Suspense>
                              {/* <Watch /> */}
                              <Portal>
                                <Toast.Region>
                                  <Toast.List class="fixed bottom-0 right-0 p-4 flex flex-col gap-2 z-[999999] w-[400px] max-w-[100vw] outline-none" />
                                </Toast.Region>
                              </Portal>
                              <main>
                                <Suspense>{props.children}</Suspense>
                                <ReloadPrompt />
                              </main>
                              <div class="fixed bottom-0 left-0 w-full md:hidden pb-2 sm:pb-5 bg-bg2 z-50">
                                <BottomNav
                                  items={[
                                    {
                                      href: "/feed",
                                      label: "Feed",
                                      icon: (
                                        <TiHome
                                          fill="currentColor"
                                          class="w-6 h-6 "
                                        />
                                      ),
                                    },
                                    {
                                      href: "/trending",
                                      label: "Trending",
                                      icon: (
                                        <AiOutlineFire
                                          fill="currentColor"
                                          class="w-6 h-6 "
                                        />
                                      ),
                                    },
                                    {
                                      href: "/library",
                                      label: "Library",
                                      icon: (
                                        <AiOutlineMenu
                                          fill="currentColor"
                                          class="w-6 h-6 "
                                        />
                                      ),
                                    },
                                    {
                                      href: "/preferences",
                                      label: "Preferences",
                                      icon: <BiSolidCog class="w-6 h-6 " />,
                                    },
                                  ]}
                                />
                              </div>
                              <div class="h-20 md:h-0" />
                              <RouteAnnouncer />
                            </div>
                          </SyncedStoreProvider>
                        </PlayerStateProvider>
                      </QueueProvider>
                    </PlaylistProvider>
                  </AppStateProvider>
                </PreferencesProvider>
              </VideoContextProvider>
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
