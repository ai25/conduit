// @refresh reload
import {
  Show,
  Signal,
  Suspense,
  createContext,
  createRenderEffect,
  createSignal,
  createEffect,
  useContext,
  Component,
  JSX,
  createMemo,
  lazy,
  onMount,
} from "solid-js";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
  useServerContext,
  parseCookie,
  Link,
  Route,
  useIsRouting,
  useLocation,
} from "solid-start";
import "./root.css";
import { Portal } from "solid-js/web";
import { SetStoreFunction, createStore, unwrap } from "solid-js/store";
import { PipedInstance, PipedVideo, Preferences } from "./types";
import { PlaylistProvider } from "./stores/playlistStore";
import { PlayerStateProvider } from "./stores/playerStateStore";
import { SyncedStoreProvider, useSyncStore } from "./stores/syncStore";
import { AppStateProvider, useAppState } from "./stores/appStateStore";
import BottomNav from "./components/BottomNav";
import { TiHome } from "solid-icons/ti";
import { AiOutlineFire, AiOutlineMenu } from "solid-icons/ai";
import { Toast } from "@kobalte/core";
import {
  createQuery,
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/solid-query";
import { PreferencesProvider, usePreferences } from "./stores/preferencesStore";
import { QueueProvider } from "./stores/queueStore";
import api from "./utils/api";
import PlayerContainer, {
  PlayerLoading,
  Spinner,
} from "./components/PlayerContainer";
// import { PlayerLoading } from "./components/PlayerContainer";
const ReloadPrompt = clientOnly(() => import("./components/ReloadPrompt"));
import Header from "./components/Header";
import { MetaProvider } from "@solidjs/meta";
import { clientOnly } from "solid-start/islands";

const [theme, setTheme] = createSignal("");
export const ThemeContext = createContext<Signal<string>>([theme, setTheme]);
const [theater, setTheater] = createSignal(false);
export const TheaterContext = createContext<Signal<boolean>>([
  theater,
  setTheater,
]);
export const useTheater = () => {
  const theater = useContext(TheaterContext);
  if (!theater) throw new Error("TheaterContext not found");
  return theater;
};

const video = createStore<{
  value: PipedVideo | undefined;
  error: Error | undefined;
}>({
  value: undefined,
  error: undefined,
});
export const PlayerContext = createContext<
  [
    get: {
      value: PipedVideo | undefined;
      error: Error | undefined;
    },
    set: SetStoreFunction<{
      value: PipedVideo | undefined;
      error: Error | undefined;
    }>
  ]
>(video);

export default function Root() {
  const event = useServerContext();
  createRenderEffect(() => {
    const cookie = () => {
      return parseCookie(
        isServer ? event.request.headers.get("cookie") ?? "" : document.cookie
      );
    };
    const theme = cookie().theme ?? "monokai";
    setTheme(theme);
    const theater = cookie().theater ?? "false";
    setTheater(theater === "true");
  });

  const [appState] = useAppState();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
        retry: (failureCount) => {
          return failureCount < 3;
        },
        suspense: true,
      },
    },
  });

  const sync = useSyncStore();
  createEffect(() => {
    console.log(sync.store, "sync store");
  });

  return (
    <Html lang="en">
      <Head>
          <Title>Conduit</Title>
          <Meta charset="utf-8" />
          <Meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
          />

        <Link rel="manifest" href="manifest.webmanifest" />
      </Head>
      <ThemeContext.Provider value={[theme, setTheme]}>
        <TheaterContext.Provider value={[theater, setTheater]}>
          <PreferencesProvider>
            <AppStateProvider>
              <PlaylistProvider>
                <QueueProvider>
                  <PlayerContext.Provider value={video}>
                    <PlayerStateProvider>
                      <SyncedStoreProvider>
                        <Body
                          class={`${theme()} bg-bg1 font-manrope text-sm scrollbar text-text1 selection:bg-accent2 selection:text-text3 overflow-x-hidden`}
                        >
                          <QueryClientProvider client={queryClient}>
                            <ErrorBoundary>
                              <Suspense fallback={<div>Header Loading...</div>}>
                                <Header />
                              </Suspense>
                            </ErrorBoundary>

                            <div aria-hidden="true" class="h-10" />
                            <PlayerContainer />
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
                                  <Routes>
                                    <FileRoutes />
                                  </Routes>
                                  <ErrorBoundary>
                                    <Suspense fallback={<div>Loading...</div>}>
                                      <ReloadPrompt />
                                    </Suspense>
                                  </ErrorBoundary>
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
                                    ]}
                                  />
                                </div>
                                <div class="h-20 md:h-0" />
                                <RouteAnnouncer />
                          </QueryClientProvider>
                          <Scripts />
                        </Body>
                      </SyncedStoreProvider>
                    </PlayerStateProvider>
                  </PlayerContext.Provider>
                </QueueProvider>
              </PlaylistProvider>
            </AppStateProvider>
          </PreferencesProvider>
        </TheaterContext.Provider>
      </ThemeContext.Provider>
    </Html>
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
