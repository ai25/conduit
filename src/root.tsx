// @refresh reload
import {
  Accessor,
  Match,
  Show,
  Signal,
  Suspense,
  Switch,
  createContext,
  createEffect,
  createRenderEffect,
  createSignal,
  from,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";
import {
  useLocation,
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
  APIEvent,
  useIsRouting,
  useServerContext,
  parseCookie,
  Link,
  useNavigate,
  Route,
} from "solid-start";
import "./root.css";
import { isServer } from "solid-js/web";
import Select from "./components/Select";
import Player from "./components/Player";
import { SetStoreFunction, createStore } from "solid-js/store";
import { PipedVideo } from "./types";
import { defineCustomElements } from "vidstack/elements";
import { IDBPDatabase, openDB } from "idb";
import Header from "./components/Header";
import PlayerSkin from "./components/PlayerSkin";
import { MediaOutletElement, MediaPlayerElement } from "vidstack";
import History, { videoId } from "./routes/history";
import { getStorageValue, setStorageValue } from "./utils/storage";
import PlayerContainer from "./components/PlayerContainer";
import { registerSW } from "virtual:pwa-register";
import Modal from "./components/Modal";
import { Transition } from "solid-headless";
import Watch from "./routes/watch";
import Feed from "./routes/feed";
import Playlists from "./routes/playlists";
import Playlist from "./routes/playlist";
import Search from "./routes/search";
import Trending from "./routes/trending";
import Import from "./routes/import";
import { PlaylistProvider } from "./stores/playlistStore";
import { QueueProvider } from "./stores/queueStore";
import { PlayerStateProvider } from "./stores/playerStateStore";
import { Store, clone } from "./stores/syncedStore";
import syncedStore, { getYjsDoc, observeDeep } from "@syncedstore/core";
import { WebrtcProvider } from "y-webrtc";
import { IndexeddbPersistence } from "y-indexeddb";
import { AppStateProvider, useAppState } from "./stores/appStateStore";

if (!isServer) {
  registerSW({
    onOfflineReady() {},
  });
}
const theme = createSignal("monokai");
export const ThemeContext = createContext(theme);

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

const db = createSignal<IDBPDatabase<unknown> | undefined>(undefined);
export const DBContext =
  createContext<Signal<IDBPDatabase<unknown> | undefined>>(db);

const instance = createSignal("https://pipedapi.kavin.rocks");
export const InstanceContext = createContext(instance);

const preferences = createStore({
  autoplay: false,
  pip: false,
  muted: false,
  volume: 1,
  speed: 1,
  quality: "auto",
  theatreMode: false,
});
const initialStore: Store = {
  playlists: [],
  history: [],
  subscriptions: [],
};
export const PreferencesContext = createContext(preferences);
const [store, setStore] = createSignal<Store | null>(null);
const [solidStore, setSolidStore] = createSignal<Store | null>(null);
export const SyncContext = createContext(store);
export const SolidStoreContext = createContext(solidStore);

defineCustomElements();

export default function Root() {
  const location = useLocation();
  const isRouting = useIsRouting();
  const event = useServerContext();
  createRenderEffect(() => {
    const cookie = () => {
      return parseCookie(
        isServer ? event.request.headers.get("cookie") ?? "" : document.cookie
      );
    };
    const t = cookie().theme ?? "monokai";
    const i = cookie().instance ?? "https://pipedapi.kavin.rocks";
    theme[1](t);
    instance[1](i);
  });
  createEffect(async () => {
    console.log(
      new Date().toISOString().split("T")[1],
      "visible task waiting for db"
    );
    console.time("db");
    const odb = await openDB("conduit", 2, {
      upgrade(db) {
        console.log("upgrading");
        try {
          db.createObjectStore("watch_history");
        } catch (e) {}
        try {
          db.createObjectStore("playlists");
        } catch (e) {}
      },
    });
    console.log("setting db visible");
    db[1](odb);
    console.timeEnd("db");
  });
  const [progress, setProgress] = createSignal(0);

  createEffect(() => {
    console.log(isRouting(), "isRouting");
    setProgress(0);
    if (isRouting()) {
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 5, 90));
      }, 100);
      return () => clearInterval(interval);
    }
  });

  onMount(() => {
    console.log(
      "render effect setting context, theatre is:",
      preferences[0].theatreMode
    );
    preferences[1](
      getStorageValue(
        "preferences",
        {
          autoplay: false,
          pip: false,
          muted: false,
          volume: 1,
          speed: 1,
          quality: "auto",
          theatreMode: false,
        },
        "json",
        "localStorage"
      )
    );
  });

  createEffect(() => {
    console.log(
      preferences[0],
      "setting theater prefs in root, theatre mode is set to: ",
      preferences[0].theatreMode
    );
    setStorageValue(
      "preferences",
      JSON.stringify(preferences[0]),
      "localStorage"
    );
  });

  const doc = () => (store() ? getYjsDoc(store()) : null);
  const [room, setRoom] = createSignal(
    "localStorage" in globalThis
      ? (JSON.parse(localStorage.getItem("room") || "{}") as {
          id?: string;
          password?: string;
        })
      : {}
  );
  createEffect(() => {
    if (room().id) {
      setStore(syncedStore(initialStore));
    }
  });
  createEffect(() => {
    if (!isServer) {
      console.log(clone(store()), "store");

      observeDeep(store(), () => {
        console.log("store changed");
        setSolidStore(clone(store()));
      });
    }
  });
  let webrtcProvider: WebrtcProvider | null = null;
  let idbProvider: IndexeddbPersistence | null = null;
  createEffect(() => {
    if (!doc() || !room().id) return;
    console.log(room().id, "setting webrtc provider");
    webrtcProvider = new WebrtcProvider(room().id!, doc()!, {
      signaling: ["wss://signaling.fly.dev"],
      ...(room()!.password && { password: room().password }),
    });
    console.log(webrtcProvider, "webrtc provider");
    webrtcProvider.connect();
    idbProvider =
      doc() && room().id ? new IndexeddbPersistence(room().id!, doc()!) : null;
    console.log(idbProvider, "provider");
  });
  onCleanup(() => {
    webrtcProvider?.disconnect();
  });
  const [appState] = useAppState();

  return (
    <Html lang="en">
      <Head>
        <Title>SolidStart - With TailwindCSS</Title>
        <Meta charset="utf-8" />
        <Meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />

        <Link rel="manifest" href="manifest.webmanifest" />
      </Head>
      <ThemeContext.Provider value={theme}>
        <DBContext.Provider value={db}>
          <InstanceContext.Provider value={instance}>
            <QueueProvider>
              <AppStateProvider>
                <PlaylistProvider>
                  <PlayerContext.Provider value={video}>
                    <PlayerStateProvider>
                      <SyncContext.Provider value={store}>
                        <Body
                          class={`${theme[0]()} bg-bg1 font-poppins text-sm scrollbar text-text1 selection:bg-accent2 selection:text-text3 mx-2 overflow-x-hidden`}>
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
                              <div class="bg-bg2 py-2"></div>
                              <Show when={!isServer}>
                                <StatusBar />
                              </Show>
                              <PlayerContainer />
                              {/* <PipContainer />{" "} */}
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
                            </ErrorBoundary>
                          </Suspense>
                          <Scripts />
                        </Body>
                      </SyncContext.Provider>
                    </PlayerStateProvider>
                  </PlayerContext.Provider>
                </PlaylistProvider>
              </AppStateProvider>
            </QueueProvider>
          </InstanceContext.Provider>
        </DBContext.Provider>
      </ThemeContext.Provider>
    </Html>
  );
}

const StatusBar = () => {
  const [roomId, setRoomId] = createSignal("");
  const [password, setPassword] = createSignal("");

  createEffect(() => {
    const room = JSON.parse(localStorage.getItem("room") || "{}");
    setRoomId(room.id || "");
    setPassword(room.password || "");
  });

  if (roomId()) return <div class="py-2">Connected: {roomId()}</div>;

  return (
    <div class="fixed bottom-0 left-0 right-0 bg-bg2 p-2 flex items-center justify-between">
      <div class="flex items-center">
        <label class="text-text1 mr-2">Room ID</label>
        <input
          type="text"
          value={roomId()}
          onInput={(e) => setRoomId(e.currentTarget.value)}
          class="bg-bg1 text-text1 p-2 rounded-lg"
        />
      </div>
      <div class="flex items-center">
        <label class="text-text1 mr-2">Password</label>
        <input
          type="text"
          value={password()}
          onInput={(e) => setPassword(e.currentTarget.value)}
          class="bg-bg1 text-text1 p-2 rounded-lg"
        />
      </div>
      <button
        onClick={() => {
          localStorage.setItem(
            "room",
            JSON.stringify({ id: roomId(), password: password() })
          );
          location.reload();
        }}
        class="bg-primary text-text1 p-2 rounded-lg">
        Join
      </button>
    </div>
  );
};
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
