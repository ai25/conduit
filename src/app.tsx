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
import { PreferencesProvider } from "./stores/preferencesStore";
import { QueueProvider } from "./stores/queueStore";
import Header from "./components/Header";
import { MetaProvider } from "@solidjs/meta";
import { VideoContextProvider } from "./stores/VideoContext";
import { clientOnly } from "@solidjs/start";
import { parseCookie } from "./utils/helpers";
import { BiSolidCog } from "solid-icons/bi";
import Player from "./components/player/Player";
const ReloadPrompt = clientOnly(() => import("./components/ReloadPrompt"));

const [theme, setTheme] = createSignal("");
export const ThemeContext = createContext<Signal<string>>([theme, setTheme]);

export default function App() {
  const event = getRequestEvent();
  createRenderEffect(() => {
    const cookie = () => {
      return parseCookie(
        isServer ? event?.request.headers.get("cookie") ?? "" : document.cookie
      );
    };
    const theme = cookie().theme ?? "monokai";
    setTheme(theme);
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

  return (
    <Router
      root={(props) => (
        <>
          <MetaProvider tags={[]}>
            <QueryClientProvider client={queryClient}>
              <VideoContextProvider>
                <ThemeContext.Provider value={[theme, setTheme]}>
                  <PreferencesProvider>
                    <AppStateProvider>
                      <PlaylistProvider>
                        <QueueProvider>
                          <PlayerStateProvider>
                            <SyncedStoreProvider>
                              <div
                                class={`${theme()} bg-bg1 min-h-screen font-manrope text-sm scrollbar text-text1 selection:bg-accent2 selection:text-text3`}
                              >
                                <Suspense>
                                  <Header />
                                </Suspense>

                                <div aria-hidden="true" class="h-10" />
                                <Player />
                                <Show when={appState.loading}>
                                  <div class="fixed h-1 w-full -mx-2 top-0 z-[9999999]">
                                    <div
                                      class={`h-1 bg-gradient-to-r from-accent1 via-primary to-accent1 bg-repeat-x w-full animate-stripe`}
                                    />
                                  </div>
                                </Show>
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
                </ThemeContext.Provider>
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
