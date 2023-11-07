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
import { Portal, isServer } from "solid-js/web";
import { SetStoreFunction, createStore, unwrap } from "solid-js/store";
import { PipedInstance, PipedVideo, Preferences } from "./types";
import { IDBPDatabase, openDB } from "idb";
import Header from "./components/Header";
import { Transition } from "solid-headless";
import { PlaylistProvider } from "./stores/playlistStore";
import { PlayerStateProvider } from "./stores/playerStateStore";
import { SyncedStoreProvider, useSyncStore } from "./stores/syncStore";
import { AppStateProvider, useAppState } from "./stores/appStateStore";
import BottomNav from "./components/BottomNav";
import { TiHome } from "solid-icons/ti";
import { AiOutlineFire, AiOutlineMenu } from "solid-icons/ai";
import { Toast } from "@kobalte/core";
import { createQuery, QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { getStorageValue } from "./utils/storage";
import { PreferencesProvider, usePreferences } from "./stores/preferencesStore";
import Watch from "./routes/watch";
import Playlists from "./routes/library/playlists";
import History from "./routes/library/history";
import Playlist from "./routes/playlist";
import Trending from "./routes/trending";
import Import from "./routes/import";
import { splitProps } from "solid-js";
import { TransitionGroup } from "solid-transition-group";
import { useSearchParams } from "solid-start";
import Player from "./components/Player";
import { QueueProvider } from "./stores/queueStore";
import api from "./utils/api";
import { PlayerLoading } from "./components/PlayerContainer";
const ReloadPrompt = lazy(() => import("./components/ReloadPrompt"));

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

type CacheItem = {
  component: JSX.Element;
  data: any;
};

class RouteCacheStore {
  private cache: Map<string, CacheItem> = new Map();

  set(key: string, component: JSX.Element, data: any): void {
    this.cache.set(key, { component, data });
  }

  get(key: string): CacheItem | null {
    return this.cache.get(key) ?? null;
  }

  clear(): void {
    this.cache.clear();
  }

  remove(key: string): void {
    this.cache.delete(key);
  }
}

export const routeCacheStore = new RouteCacheStore();

export default function Root() {
  console.time("feed root");
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
        cacheTime: 1000 * 60 * 60 * 24, // 24 hours
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
  const CachedFeed = lazy(() => import("./routes/feed"));

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
      <QueryClientProvider client={queryClient}>
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
                            <Suspense fallback={<div>Loading...</div>}>
                              <ErrorBoundary>
                                <Header />
                              </ErrorBoundary>
                            </Suspense>

                            <div aria-hidden="true" class="h-10" />
                            <Suspense fallback={<PlayerLoading />}>
                              <PlayerContainer />
                            </Suspense>
                            <Suspense>
                              <ErrorBoundary>
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
                                  <Suspense fallback={<div>Loading...</div>}>
                                    <ErrorBoundary>
                                      <Show when={!isServer}>
                                        <ReloadPrompt />
                                      </Show>
                                    </ErrorBoundary>
                                  </Suspense>
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
                              </ErrorBoundary>
                            </Suspense>
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
      </QueryClientProvider>
    </Html>
  );
}
const PlayerContainer = () => {
  const [searchParams] = useSearchParams();
  const [preferences] = usePreferences();
  console.log(preferences.instance.api_url, "api url");
  const [v, setV] = createSignal<string | undefined>(undefined);
  createEffect(() => {
    if (!searchParams.v) return;
    setV(searchParams.v);
  });
  const videoQuery = createQuery(
    () => ["streams", v(), preferences.instance.api_url],
    () => api.fetchVideo(v(), preferences.instance.api_url),
    {
      get enabled() {
        return preferences.instance?.api_url &&
          !isServer &&
          v()
          ? true
          : false;
      },
      refetchOnReconnect: false,
      refetchOnMount: false,
      cacheTime: Infinity,
      staleTime: 100 * 60 * 1000,
    }
  );
  const location = useLocation();

  return (
    <Show when={videoQuery.data} fallback={ location.pathname === "/watch"
      ? <PlayerLoading /> : null}
    >
      <Player
        onReload={() => videoQuery.refetch()}
      />

    </Show>
  )

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
      >Current page: {location.pathname} </div>
    </Portal>
  )
}

// const PipContainer = () => {
//   const [userIdle, setUserIdle] = createSignal(true);
//   const [playing, setPlaying] = createSignal(false);
//   const [outlet, setOutlet] = createSignal<MediaOutletElement | null>();
//   const [player, setPlayer] = createSignal<MediaPlayerElement | null>();
//   const [muted, setMuted] = createSignal(false);
//   let timeout: any;
//   const handlePointerEvent = () => {
//     clearTimeout(timeout);
//     setUserIdle(false);
//     timeout = setTimeout(() => {
//       setUserIdle(true);
//     }, 2000);
//   };
//   let pipContainer: HTMLDivElement | undefined = undefined;

//   createEffect(() => {
//     if (!video[0].value) return;
//     console.log("setting player and outlet", getVideoId(video[0].value));
//     setPlayer(document.querySelector("media-player"));
//     setOutlet(document.querySelector("media-outlet"));
//     if (player()) {
//       player()!.addEventListener("play", () => {
//         console.log("playing");
//         setPlaying(true);
//       });
//       player()!.addEventListener("pause", () => {
//         setPlaying(false);
//       });
//     }
//   });

//   const hideContainer = () => {
//     pipContainer?.classList.add("hidden");
//   };
//   const navigate = useNavigate();

//   return (
//     <div
//       ref={pipContainer}
//       id="pip-container"
//       style={{
//         "aspect-ratio": video[0].value
//           ? video[0].value.videoStreams[0]?.width /
//             video[0].value.videoStreams[0]?.height
//           : "16/9",
//       }}
//       class="w-full sm:w-96 z-[999] hidden justify-center items-center aspect-video sticky top-12 inset-x-0 sm:left-2 rounded-lg overflow-hidden bg-black">
//       <div
//         onPointerDown={handlePointerEvent}
//         onPointerUp={handlePointerEvent}
//         onMouseOver={handlePointerEvent}
//         onMouseMove={handlePointerEvent}
//         onFocusIn={handlePointerEvent}
//         classList={{ "opacity-0": userIdle() }}
//         class="absolute bg-black/50 flex flex-col items-center justify-between inset-0 w-full h-full p-2 z-[9999] transition-opacity duration-200">
//         <div class="flex items-center justify-between w-full">
//           <button
//             onClick={() => {
//               if (player() && outlet()) {
//                 player()!.prepend(outlet()!);
//                 player()!.pause();
//                 hideContainer();
//               } else {
//                 console.log("no player or outlet");
//               }
//             }}
//             class=" w-10 h-10 z-10 text-white hover:text-gray-200">
//             <svg
//               // class="h-6 w-6"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor">
//               <path
//                 stroke-linecap="round"
//                 stroke-linejoin="round"
//                 stroke-width="2"
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>
//           <button
//             onClick={() => {
//               if (player() && outlet()) {
//                 player()!.prepend(outlet()!);
//                 hideContainer();
//                 const id = getVideoId(video[0].value);
//                 if (!id) {
//                   console.log("no id", id);
//                   return;
//                 }
//                 navigate(`/watch?v=${id}`);
//               } else {
//                 console.log("no player or outlet");
//               }
//             }}
//             class=" w-10 h-10 z-10 text-white hover:text-gray-200">
//             <svg
//               // class="h-6 w-6"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor">
//               <path
//                 stroke-linecap="round"
//                 stroke-linejoin="round"
//                 stroke-width="2"
//                 d="M15 19l-7-7 7-7"
//               />
//             </svg>
//           </button>
//         </div>
//         <div class="absolute inset-0 flex justify-center items-center">
//           <button
//             class="m-auto"
//             onClick={() => {
//               console.log("play", player());
//               if (player()) {
//                 if (playing()) {
//                   player()!.pause();
//                 } else {
//                   player()!.play();
//                 }
//               }
//             }}>
//             <media-icon
//               type="play"
//               class="h-12 w-12"
//               classList={{ hidden: playing() }}></media-icon>
//             <media-icon
//               type="pause"
//               class="h-12 w-12"
//               classList={{ hidden: !playing() }}></media-icon>
//           </button>
//         </div>
//         <div class="flex items-center justify-between w-full">
//           <button
//             onClick={() => {
//               if (player()) {
//                 player()!.muted = !player()!.muted;
//                 setMuted(player()!.muted);
//               }
//             }}
//             class=" w-10 h-10 z-10 text-white hover:text-gray-200">
//             <media-icon type="volume-high" classList={{ hidden: muted() }} />
//             <media-icon type="mute" classList={{ hidden: !muted() }} />
//           </button>
//           {/* <button
//             onClick={() => {
//               if (player()) {
//                 player()!.requestFullscreen();
//               }
//             }}
//             class="bg-white z-10 text-black rounded-full p-2 hover:bg-gray-200">
//             <svg
//               class="h-6 w-6"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor">
//               <path
//                 classList={{ hidden: document.fullscreenElement }}
//                 stroke-linecap="round"
//                 stroke-linejoin="round"
//                 stroke-width="2"
//                 d="M9 11l3-3 3 3m-3 3v6m0 0H6m0 0h12M6 5h12m-6 6V5m0 0H6m0 0h12"
//               />
//               <path
//                 classList={{ hidden: !document.fullscreenElement }}
//                 stroke-linecap="round"
//                 stroke-linejoin="round"
//                 stroke-width="2"
//                 d="M13 7H7v6h6V7z"
//               />
//             </svg>
//           </button> */}
//         </div>
//       </div>
//     </div>
//   );
// };
