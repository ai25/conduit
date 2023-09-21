// @refresh reload
import {
  Show,
  Signal,
  Suspense,
  createContext,
  createRenderEffect,
  createSignal,
  createEffect,
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
} from "solid-start";
import "./root.css";
import { Portal, isServer } from "solid-js/web";
import { SetStoreFunction, createStore, unwrap } from "solid-js/store";
import { PipedInstance, PipedVideo, Preferences } from "./types";
import { defineCustomElements } from "vidstack/elements";
import { IDBPDatabase, openDB } from "idb";
import Header from "./components/Header";
import { Transition } from "solid-headless";
import { PlaylistProvider } from "./stores/playlistStore";
import { QueueProvider } from "./stores/queueStore";
import { PlayerStateProvider } from "./stores/playerStateStore";
import { SyncedStoreProvider, useSyncedStore } from "./stores/syncedStore";
import { AppStateProvider, useAppState } from "./stores/appStateStore";
import BottomNav from "./components/BottomNav";
import { TiHome } from "solid-icons/ti";
import { AiOutlineFire, AiOutlineMenu } from "solid-icons/ai";
import { Toast } from "@kobalte/core";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { getStorageValue } from "./utils/storage";
import { PreferencesProvider } from "./stores/preferencesStore";
import ReloadPrompt from "./components/ReloadPrompt";

const [theme, setTheme] = createSignal("");
export const ThemeContext = createContext<Signal<string>>([theme, setTheme]);

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

defineCustomElements();

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
      },
    },
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
      <QueueProvider>
        <ThemeContext.Provider value={[theme, setTheme]}>
          <PreferencesProvider>
            <AppStateProvider>
              <PlaylistProvider>
                <PlayerContext.Provider value={video}>
                  <PlayerStateProvider>
                    <SyncedStoreProvider>
                      <QueryClientProvider client={queryClient}>
                        <Body
                          class={`${theme()} bg-bg1 font-manrope text-sm scrollbar text-text1 selection:bg-accent2 selection:text-text3 mx-2 overflow-x-hidden`}
                        >
                          <Suspense>
                            <ErrorBoundary>
                              <Show when={appState.loading}>
                                <div class="fixed h-1 w-full -mx-2 top-0 z-[9999999]">
                                  <div
                                    class={`h-1 bg-gradient-to-r from-accent1 via-primary to-accent1 bg-repeat-x w-full animate-stripe`}
                                  />
                                </div>
                              </Show>
                              <Header />
                              <div aria-hidden="true" class="h-10" />
                              {/* <Portal> */}
                              {/*   <Toast.Region> */}
                              {/*     <Toast.List class="toast__list" /> */}
                              {/*   </Toast.Region> */}
                              {/* </Portal> */}
                              {/* <PlayerContainer /> */}
                              <main>
                                <Routes>
                                  <FileRoutes />
                                  {/* <Transition
                        show={!isRouting()}
                        enter="transition-opacity duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition-opacity duration-200"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1">
                        <Route path="/" element={<Feed />} />
                      </Transition>
                      <Transition
                        show={!isRouting()}
                        enter="transition-opacity duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition-opacity duration-200"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1">
                        <Route path="/watch" element={<Watch />} />
                        </Transition>
                        <Route path="/feed" element={<Feed />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/playlists" element={<Playlists />} />
                        <Route path="/playlist" element={<Playlist />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/trending" element={<Trending />} />
                        <Route path="/import" element={<Import />} /> */}
                                </Routes>
                                <Show when={!isServer}>
                                  <ReloadPrompt />
                                </Show>
                              </main>
                              <Transition
                                show={true}
                                enter="transition ease-in-out duration-300 transform"
                                enterFrom="translate-y-full"
                                enterTo="translate-y-0"
                                leave="transition ease-in-out duration-300 transform"
                                leaveFrom="translate-y-0"
                                leaveTo="translate-y-full"
                              >
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
                              </Transition>
                            </ErrorBoundary>
                          </Suspense>
                          <Scripts />
                        </Body>
                      </QueryClientProvider>
                    </SyncedStoreProvider>
                  </PlayerStateProvider>
                </PlayerContext.Provider>
              </PlaylistProvider>
            </AppStateProvider>
          </PreferencesProvider>
        </ThemeContext.Provider>
      </QueueProvider>
    </Html>
  );
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
//     console.log("setting player and outlet", videoId(video[0].value));
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
//                 const id = videoId(video[0].value);
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
