// TODO: Integrate offline playback
import Description, { DescriptionFallback } from "~/components/Description";
import {
  Show,
  createEffect,
  createSignal,
  onMount,
  onCleanup,
  createMemo,
  Setter,
  untrack,
} from "solid-js";
import { For } from "solid-js";
import { getHlsManifest, getStreams } from "~/utils/hls";
import { usePlaylist } from "~/stores/playlistStore";
import { useSyncStore } from "~/stores/syncStore";
import { useAppState } from "~/stores/appStateStore";
import { createQuery } from "@tanstack/solid-query";
import { Chapter, Playlist, RelatedStream } from "~/types";
import { usePreferences } from "~/stores/preferencesStore";
import { Suspense } from "solid-js";
import numeral from "numeral";
import { isServer } from "solid-js/web";
import RelatedVideos, {
  RelatedVideosFallback,
} from "~/components/RelatedVideos";
import Comments from "~/components/Comments";
import { getVideoId, isMobile } from "~/utils/helpers";
import PlaylistItem from "~/components/content/playlist/PlaylistItem";
import { useLocation, useNavigate, useSearchParams } from "@solidjs/router";
import { useVideoContext } from "~/stores/VideoContext";
import Player, { PlayerLoading } from "./player/Player";
import { useCookie } from "~/utils/hooks";
import {
  FaSolidChevronUp,
  FaSolidList,
  FaSolidPause,
  FaSolidPlay,
  FaSolidX,
} from "solid-icons/fa";
import { BsSkipEndFill, BsSkipStartFill } from "solid-icons/bs";
import { RiMediaPlayList2Fill } from "solid-icons/ri";
import { usePlayerState } from "~/stores/playerStateStore";
import { MediaPlayerElement } from "vidstack/elements";
import Button from "./Button";

export async function fetchWithTimeout(
  resource: string,
  options: RequestInit & { timeout: number } = { timeout: 800 }
) {
  const { timeout } = options;

  const controller = new AbortController();
  const id = setTimeout(() => {
    console.log("aborting");
    controller.abort(`Request exceeded timeout of ${timeout}ms.`);
  }, timeout);
  console.log("fetching", controller.signal);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}

export default function Watch() {
  console.log(new Date().toISOString().split("T")[1], "rendering watch page");

  const route = useLocation();
  const [preferences, setPreferences] = usePreferences();
  const [playlist, setPlaylist] = usePlaylist();
  const [videoDownloaded, setVideoDownloaded] = createSignal(false);
  const [_, setAppState] = useAppState();
  const sync = useSyncStore();
  const video = useVideoContext();

  const [playlistScrollContainer, setPlaylistScrollContainer] = createSignal<
    HTMLDivElement | undefined
  >();

  const [searchParams, setSearchParams] = useSearchParams();

  const [windowWidth, setWindowWidth] = createSignal(1000);
  const [windowHeight, setWindowHeight] = createSignal(1000);

  onMount(() => {
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);
    window.addEventListener("resize", (e) => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    });

    onCleanup(() => {
      window.removeEventListener("resize", (e) => {
        setWindowWidth(window.innerWidth);
        setWindowHeight(window.innerHeight);
      });
    });
  });

  async function checkDownloaded() {
    if (!("getDirectory" in navigator.storage)) {
      setVideoDownloaded(false);
      return;
    }
    try {
      const downloaded = await getStreams(route.query.v);
      if (downloaded) {
        const manifest = await getHlsManifest(route.query.v);
        // setVideo({
        //   value: {
        //     ...downloaded,
        //     hls: manifest,
        //   },
        // });
        // console.log(video.value, "previewFrames");
        return;
      } else {
        setVideoDownloaded(false);
      }
    } catch (e) {
      setVideoDownloaded(false);
      return;
    }
  }

  function init() {
    setAppState("player", "dismissed", false);
    if (route.pathname === "/watch") {
      setAppState("player", "small", false);
    }
    checkDownloaded();
  }

  createEffect(() => {
    if (route.query.v) {
      init();
    }
  });

  createEffect(() => {
    if (!video.data) return;
    document.title = `${video.data.title} - Conduit`;
  });

  const isLocalPlaylist = createMemo(() =>
    route.query.list?.startsWith("conduit-")
  );
  const isWatchLater = createMemo(() => route.query.list === "watchLater");

  const playlistQuery = createQuery(() => ({
    queryKey: ["playlist", route.query.list, preferences.instance.api_url],
    queryFn: async () => {
      const res = await fetch(
        `${preferences.instance.api_url}/playlists/${route.query.list}`
      );
      if (!res.ok) {
        // throw new Error("Failed to fetch playlist");
        return;
      }
      return await res.json();
    },
    enabled:
      preferences.instance?.api_url &&
      route.query.list &&
      !isLocalPlaylist() &&
      !isWatchLater()
        ? true
        : false,
    refetchOnReconnect: false,
  }));

  createEffect(() => {
    if (playlistQuery.isSuccess) {
      setPlaylist({
        ...playlistQuery.data,
        id: route.query.list,
        index: route.query.index || "1",
      });
    } else {
      if (route.pathname === "/watch") setPlaylist(undefined);
    }
  });

  createEffect(() => {
    console.log("route pathname", route.pathname);
    if (route.pathname === "/watch") {
      if (!route.query.list) {
        console.log("route pathname undef", route.pathname);
        setPlaylist(undefined);
        return;
      }
    }
    if (isLocalPlaylist()) {
      const list = sync.store.playlists?.[route.query.list];
      setPlaylist({
        ...list,
        id: route.query.list,
        index: route.query.index || "1",
      });
    } else if (isWatchLater()) {
      setPlaylist({
        name: "Watch Later",
        thumbnailUrl: "",
        description: "",
        uploader: "",
        bannerUrl: "",
        nextpage: null,
        uploaderUrl: "",
        uploaderAvatar: "",
        videos: 0,
        relatedStreams: Object.values(sync.store.watchLater),
        id: "WL",
        index: route.query.index || "1",
      });
    }
    setTimeout(() => {
      playlistScrollContainer()?.scrollTo({
        top: route.query.index ? Number(route.query.index) * 80 : 0,
        behavior: "smooth",
      });
    }, 100);
  });

  const [appState] = useAppState();
  createEffect(() => {
    setAppState("smallDevice", windowWidth() < 640 || windowHeight() < 640);
  });

  const [playerRef, setPlayerRef] = createSignal<
    MediaPlayerElement | undefined
  >();
  const [paused, setPaused] = createSignal(true);
  let unsubscribe: () => void | undefined;
  createEffect(() => {
    unsubscribe?.();
    playerRef()?.subscribe(({ paused }) => {
      setPaused(paused);
    });
  });
  const [playNext, setPlayNext] = createSignal(() => {});
  const [playPrev, setPlayPrev] = createSignal(() => {});
  const [nextVideo, setNextVideo] = createSignal<RelatedStream | null>();
  const [prevVideo, setPrevVideo] = createSignal<RelatedStream | null>();
  const navigate = useNavigate();

  const [showEndScreen, setShowEndScreen] = createSignal(false);
  const [endScreenCounter, setEndScreenCounter] = createSignal(5);
  const [dismissEndScreen, setDismissEndScreen] = createSignal(() => {});

  return (
    <Show
      when={video.data && !appState.player.dismissed}
      fallback={<WatchFallback />}
    >
      <div
        classList={{
          "mx-auto w-full flex flex-col": true,
          "!fixed bottom-0 left-0 sm:bottom-2 sm:left-1 z-[9999] bg-transparent pointer-events-none":
            appState.player.small,
          "sm:items-start": appState.player.small && !appState.smallDevice,
          "items-center": appState.player.small && appState.smallDevice,
          "max-w-screen-2xl": !preferences.theatreMode,
        }}
      >
        <div
          classList={{
            "flex flex-col w-full pointer-events-auto": true,
            "lg:flex-row": !preferences.theatreMode && !searchParams.fullscreen,
            " rounded backdrop-blur-sm bg-bg2/70 w-[96vw] ":
              appState.player.small,
            "sm:w-[400px]": appState.player.small && !appState.smallDevice,
          }}
        >
          <div class="flex flex-col w-full">
            <div
              classList={{
                "w-full transition-[height]": true,
                "h-0 ": !showEndScreen() || route.pathname === "/watch",
                "h-24 p-3":
                  showEndScreen() &&
                  appState.smallDevice &&
                  route.pathname !== "/watch",
                "h-44 p-3":
                  showEndScreen() &&
                  !appState.smallDevice &&
                  route.pathname !== "/watch",
              }}
            >
              <Show when={showEndScreen()}>
                <div class="flex flex-col items-start justify-center w-full h-full gap-1 py-2">
                  <div class="text-sm font-bold text-white">
                    Playing next in {endScreenCounter()} seconds
                  </div>
                  <div
                    classList={{
                      "flex ": true,
                      "flex-col gap-4": !appState.smallDevice,
                    }}
                  >
                    <div class="flex gap-2 text-sm min-h-0 max-h-full mr-4">
                      <div class="h-16 rounded min-h-0 max-w-full max-h-full aspect-video relative bg-red-500">
                        <img
                          class="absolute w-full h-full object-contain rounded"
                          src={nextVideo()?.thumbnail}
                        />
                      </div>
                      <div class="self-center two-line-ellipsis">
                        {nextVideo()?.title}
                      </div>
                    </div>
                    <div class="flex justify-center gap-2">
                      <Button
                        class="w-max h-min self-center"
                        onClick={() => {
                          dismissEndScreen()();
                          playNext();
                        }}
                        label="Play now"
                      />
                      <button
                        onClick={() => {
                          dismissEndScreen()();
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </Show>
            </div>

            <div
              classList={{
                "flex w-full transition-[top] duration-300": true,
                "sticky p-1 sm:relative z-[999] top-0 ":
                  !searchParams.fullscreen &&
                  !appState.player.small &&
                  !appState.showNavbar,
                "sticky p-1 sm:relative z-[999] top-14 sm:top-0 ":
                  !searchParams.fullscreen &&
                  !appState.player.small &&
                  appState.showNavbar,
                "sm:flex-col ": !appState.smallDevice,
              }}
            >
              <div
                classList={{
                  "w-full": !appState.player.small,
                  "w-[240px] sm:w-full":
                    appState.player.small && !appState.smallDevice,
                  "w-full max-w-[140px] flex":
                    appState.player.small && appState.smallDevice,
                }}
              >
                <Show when={video.data} fallback={<PlayerLoading />}>
                  <Player
                    forwardRef={setPlayerRef}
                    playNext={(playNext) => setPlayNext(() => playNext)}
                    playPrev={(playPrev) => setPlayPrev(() => playPrev)}
                    nextVideo={setNextVideo}
                    prevVideo={setPrevVideo}
                    showEndScreen={setShowEndScreen}
                    endScreenCounter={setEndScreenCounter}
                    dismissEndScreen={(dismissEndScreen) =>
                      setDismissEndScreen(() => dismissEndScreen)
                    }
                  />
                </Show>
                <Show when={searchParams.fullscreen && !appState.player.small}>
                  <div class="h-[calc(100vh-40px)]" />
                </Show>
              </div>
              <Show when={appState.player.small}>
                <div class="flex flex-col p-2 sm:max-w-[400px] truncate">
                  <div class="truncate ">{video.data?.title}</div>
                  <div
                    classList={{
                      "flex gap-2 justify-center": true,
                      "sm:hidden": !appState.smallDevice,
                    }}
                  >
                    <button
                      disabled={!prevVideo()}
                      onClick={() => {
                        playPrev()();
                      }}
                      class="p-3 outline-none focus-visible:ring-2 ring-primary/80 rounded-lg disabled:text-neutral-500"
                    >
                      <BsSkipStartFill class="w-5 h-5" />{" "}
                    </button>
                    <button
                      onClick={() => {
                        if (!playerRef()) return;
                        if (paused()) {
                          playerRef()!.play();
                        } else if (!paused()) {
                          playerRef()!.pause();
                        }
                      }}
                      class="p-3 outline-none focus-visible:ring-2 ring-primary/80 rounded-lg"
                    >
                      <Show when={!paused()}>
                        <FaSolidPause class="w-5 h-5" />{" "}
                      </Show>

                      <Show when={paused()}>
                        <FaSolidPlay class="w-5 h-5" />{" "}
                      </Show>
                    </button>
                    <button
                      disabled={!nextVideo()}
                      onClick={() => {
                        playNext()();
                      }}
                      class="p-3 outline-none focus-visible:ring-2 ring-primary/80 rounded-lg disabled:text-neutral-500"
                    >
                      <BsSkipEndFill class="w-5 h-5" />{" "}
                    </button>
                  </div>
                </div>
                <div
                  classList={{
                    "flex gap-2 justify-center ml-auto": true,
                    "sm:hidden": !appState.smallDevice,
                  }}
                >
                  <button
                    onClick={() => {
                      navigate(`/watch${location.search}`);
                    }}
                    class="p-3 outline-none focus-visible:ring-2 ring-primary/80 rounded-lg"
                  >
                    <FaSolidChevronUp class="w-4 h-4" />{" "}
                  </button>
                  <button
                    onClick={() => {
                      playerRef()?.pause();
                      if (location.pathname !== "/playlist") {
                        setSearchParams({ list: undefined });
                      }
                      setSearchParams({
                        v: undefined,
                        index: undefined,
                        local: undefined,
                      });
                      setAppState("player", "dismissed", true);
                    }}
                    class="p-3 outline-none focus-visible:ring-2 ring-primary/80 rounded-lg"
                  >
                    <FaSolidX class="w-4 h-4" />{" "}
                  </button>
                </div>
              </Show>
            </div>
            <div
              classList={{
                "md:hidden": !appState.player.small,
              }}
            >
              <Show when={playlist()} keyed>
                {(list) => (
                  <PlaylistContainer
                    setPlaylistScrollContainer={setPlaylistScrollContainer}
                    playlist={list}
                  />
                )}
              </Show>
            </div>

            <div
              classList={{
                "flex-col md:flex-row ": true,
                flex: route.pathname === "/watch",
                hidden: route.pathname !== "/watch",
                "lg:max-w-screen-2xl w-full lg:mx-auto":
                  preferences.theatreMode,
              }}
            >
              <div class="flex flex-col w-full">
                <div
                  classList={{
                    hidden: true,
                    "md:block": !appState.player.small,
                  }}
                >
                  <Show when={playlist()} keyed>
                    {(list) => (
                      <PlaylistContainer
                        setPlaylistScrollContainer={setPlaylistScrollContainer}
                        playlist={list}
                      />
                    )}
                  </Show>
                </div>
                <Show when={video.data} fallback={<DescriptionFallback />}>
                  <Description downloaded={videoDownloaded()} />
                </Show>
                <div class="mx-4">
                  <Suspense>
                    <Show
                      when={!preferences.content.hideComments}
                      fallback={
                        <div class="px-1">Comments disabled in settings.</div>
                      }
                    >
                      <Comments
                        videoId={getVideoId(video.data)!}
                        uploader={video.data!.uploader}
                        uploaderAvatar={video.data!.uploaderAvatar}
                        display={
                          windowWidth() >= 768 ? "default" : "bottomsheet"
                        }
                      />
                    </Show>
                  </Suspense>
                </div>
              </div>
              <div
                classList={{
                  "flex-col gap-2 items-center w-full min-w-0 md:max-w-[400px]":
                    true,
                  "hidden sm:flex lg:hidden":
                    !preferences.theatreMode && !searchParams.fullscreen,
                  flex: preferences.theatreMode || !!searchParams.fullscreen,
                }}
              >
                <Show
                  when={!preferences.content.hideRelated}
                  fallback={<div>Related videos disabled in settings.</div>}
                >
                  <Show when={video.data} fallback={<RelatedVideosFallback />}>
                    <RelatedVideos />
                  </Show>
                </Show>
              </div>
            </div>
          </div>

          <Show
            when={
              !preferences.theatreMode &&
              !searchParams.fullscreen &&
              route.pathname === "/watch"
            }
          >
            <Show
              when={!preferences.content.hideRelated}
              fallback={
                <div class="px-5">Related videos disabled in settings.</div>
              }
            >
              <div
                classList={{
                  "flex-col gap-2 items-center w-full min-w-0 lg:max-w-[400px]":
                    true,
                  hidden: preferences.theatreMode || !!searchParams.fullscreen,
                  "flex sm:hidden lg:flex":
                    !preferences.theatreMode && !searchParams.fullscreen,
                }}
              >
                <Show when={video.data} fallback={<RelatedVideosFallback />}>
                  <RelatedVideos />
                </Show>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </Show>
  );
}
const PlaylistContainer = (props: {
  setPlaylistScrollContainer: () => void;
  playlist: Playlist & { id: string; index: string };
}) => {
  const [playlistExpanded, setPlaylistExpanded] = createSignal(false);
  return (
    <div
      role="group"
      aria-label="Playlist"
      class="transition-all overflow-hidden rounded-xl w-full min-w-0"
    >
      <div
        ref={props.setPlaylistScrollContainer}
        class="transition-[height] relative flex flex-col gap-2 min-w-full w-full max-h-[30rem] overflow-y-auto scrollbar"
        classList={{
          "h-10": !playlistExpanded(),
          "h-[400px] max-h-[70vh]": playlistExpanded(),
        }}
      >
        <button
          onClick={() => setPlaylistExpanded(!playlistExpanded())}
          class="sticky top-0 left-0 z-10 text-xs text-text2 bg-bg2/80 p-3 w-full rounded outline-none focus-visible:ring-2 ring-inset ring-primary/80 flex"
        >
          <RiMediaPlayList2Fill class="h-4 w-4 mr-2" />
          <div class="truncate">
            {props.playlist.name} - {props.playlist.index} /{" "}
            {props.playlist.relatedStreams?.length}
          </div>
          <FaSolidChevronUp
            classList={{
              "h-4 w-4 ml-auto transition-[transform] duration-250": true,
              "rotate-180": playlistExpanded(),
            }}
          />
        </button>
        <Show when={playlistExpanded()}>
          <For each={props.playlist.relatedStreams}>
            {(item, index) => {
              return (
                <PlaylistItem
                  list={props.playlist.id}
                  index={index() + 1}
                  v={item}
                  active={props.playlist.index ?? "1"}
                />
              );
            }}
          </For>
        </Show>
      </div>
    </div>
  );
};

export const WatchFallback = () => {
  const [preferences] = usePreferences();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [appState] = useAppState();
  return (
    <Show when={location.pathname === "/watch"}>
      <div class="max-w-screen-2xl mx-auto w-full flex">
        <div class="w-full">
          <PlayerLoading />
          <Show when={searchParams.fullscreen && !appState.player.small}>
            <div class="h-[calc(100vh-40px)]" />
          </Show>
          <div class="flex flex-col sm:flex-row">
            <DescriptionFallback />
            <div
              classList={{
                "flex-col gap-2 items-center w-full min-w-0 md:max-w-[400px]":
                  true,
                "flex lg:hidden":
                  !preferences.theatreMode && !searchParams.fullscreen,
                flex: preferences.theatreMode || !!searchParams.fullscreen,
              }}
            >
              <RelatedVideosFallback />
            </div>
          </div>
        </div>
        <div
          classList={{
            "flex-col gap-2 items-center w-full min-w-0 md:max-w-[400px]": true,
            hidden: preferences.theatreMode || !!searchParams.fullscreen,
            "hidden lg:flex":
              !preferences.theatreMode && !searchParams.fullscreen,
          }}
        >
          <RelatedVideosFallback />
        </div>
      </div>
    </Show>
  );
};
