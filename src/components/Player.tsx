import "vidstack/styles/defaults.css";
import "vidstack/styles/community-skin/video.css";
import { defineCustomElements } from "vidstack/elements";

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      "media-player": any;
      "media-outlet": any;
      "media-poster": any;
      "media-captions": any;
      "media-community-skin": any;
    }
  }
}

import {
  HLSErrorEvent,
  MediaCanPlayEvent,
  MediaOutletElement,
  MediaPlayerElement,
  MediaPosterElement,
  MediaProviderChangeEvent,
  VideoProvider,
  isHLSProvider,
  // MediaPlayerConnectEvent,
} from "vidstack";
import {
  For,
  ParentProps,
  Show,
  children,
  createEffect,
  createMemo,
  createSignal,
  lazy,
  on,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";
import { PlayerContext, PreferencesContext, SyncContext } from "~/root";
import { PipedVideo, PreviewFrame, RelatedStream, Subtitle } from "~/types";
import { chaptersVtt } from "~/utils/chapters";
import { useIsRouting, useLocation, useNavigate } from "solid-start";
// import { extractVideoId } from "~/routes/watch";
// import { RouteLocation, useLocation } from "@builder.io/qwik-city";
// import { IDBPDatabase } from "idb";
// import PlayerSkin from "./player-skin/player-skin";
import { extractVideoId } from "~/routes/watch";
import { DBContext } from "~/root";
//@ts-ignore
import { ttml2srt } from "~/utils/ttml";
import PlayerSkin from "./PlayerSkin";
import VideoCard from "./VideoCard";
import { videoId } from "~/routes/history";
import numeral from "numeral";
import { useQueue } from "~/stores/queueStore";
import { usePlaylist } from "~/stores/playlistStore";
import dayjs from "dayjs";
import { SyncedDB } from "~/stores/syncedStore";
import { usePlayerState } from "../stores/playerStateStore";
import { MediaRemoteControl } from "vidstack";

const BUFFER_LIMIT = 3;
const BUFFER_TIME = 15000;
const TIME_SPAN = 300000;
export default function Player() {
  console.log(new Date().toISOString().split("T")[1], "rendering player");
  console.time("rendering player");
  const [video] = useContext(PlayerContext);
  //   const db = useContext(DBContext);
  const route = useLocation();
  let mediaPlayer: MediaPlayerElement | undefined = undefined;
  const [db] = useContext(DBContext);
  const store = useContext(SyncContext);
  const updateProgress = () => {
    console.log("updating progress");
    if (!video.value) return;
    if (!started()) {
      return;
    }
    let currentTime = mediaPlayer?.currentTime;
    if (video.value.category === "Music") {
      currentTime = 0;
    }
    if (!store()) return;
    const id = videoId(video.value);
    if (!id) return;

    let isShort = false;
    let width = video.value.videoStreams?.[0]?.width;
    let height = video.value.videoStreams?.[0]?.height;
    if (width && height) {
      isShort = height > width;
    }

    const val = {
      id,
      title: video.value.title,
      duration: video.value.duration,
      thumbnail: video.value.thumbnailUrl,
      uploaderName: video.value.uploader,
      uploaderAvatar: video.value.uploaderAvatar,
      uploaderUrl: video.value.uploaderUrl,
      url: `/watch?v=${id}`,
      isShort,
      currentTime,
      watchedAt: new Date().getTime(),
      type: "stream",
      uploaded: new Date(video.value.uploadDate).getTime(),
      uploaderVerified: video.value.uploaderVerified,
      views: video.value.views,
    };
    console.log("updating progress", val);
    SyncedDB.history.upsert(store()!, { where: { id }, data: val });
    console.log(
      `updated progress for ${video.value.title}. ${id} to ${currentTime}`
    );
  };
  const state = usePlayerState();

  // let interval: any;

  // createEffect(() => {
  //   if (!video.value) return;
  //   if (!mediaPlayer) return;
  //   if (!started()) return;
  //   if (video.value.category === "Music") return
  //   if (!state.playing) return
  //   if (interval) clearInterval(interval);
  //   interval = setInterval(() => {
  //     updateProgress();
  //   }, 1000);
  // });
  // onCleanup(() => {
  //   clearInterval(interval);
  // });

  const [playlist] = usePlaylist();

  const queueStore = useQueue();

  const [vtt, setVtt] = createSignal<string | undefined>(undefined);

  const [error, setError] = createSignal<{
    name: string;
    details: string;
    fatal: boolean;
    message: string;
    code: number | undefined;
  }>();

  const [tracks, setTracks] = createSignal<
    {
      id: string;
      key: string;
      kind: string;
      src: string;
      srcLang: string;
      label: string;
      dataType: string;
    }[]
  >([]);

  const [subtitles, setSubtitles] = createSignal<Map<string, string>>();

  const fetchSubtitles = async (subtitles: Subtitle[]) => {
    console.time("fetching subtitles");
    const newTracks = await Promise.all(
      subtitles.map(async (subtitle) => {
        if (!subtitle.url) return null;
        if (subtitle.mimeType !== "application/ttml+xml")
          return {
            id: `track-${subtitle.code}`,
            key: subtitle.url,
            kind: "subtitles",
            src: subtitle.url,
            srcLang: subtitle.code,
            label: `${subtitle.name} - ${subtitle.autoGenerated ? "Auto" : ""}`,
            dataType: subtitle.mimeType,
          };
        const { srtUrl, srtText } = await ttml2srt(subtitle.url);
        // remove empty subtitles
        if (srtText.trim() === "") return null;
        return {
          id: `track-${subtitle.code}`,
          key: subtitle.url,
          kind: "subtitles",
          src: srtUrl,
          srcLang: subtitle.code,
          label: `${subtitle.name} - ${subtitle.autoGenerated ? "Auto" : ""}`,
          dataType: "srt",
        };
      })
    );
    console.timeEnd("fetching subtitles");
    setTracks(newTracks.filter((track) => track !== null) as any);
  };

  const initMediaSession = () => {
    if (!navigator.mediaSession) return;
    if (!video.value) return;
    if (!mediaPlayer) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: video.value.title,
      artist: video.value.uploader,
      artwork: [
        {
          src: video.value?.thumbnailUrl,
          sizes: "128x128",
          type: "image/png",
        },
      ],
    });
    navigator.mediaSession.setActionHandler("play", () => {
      mediaPlayer?.play();
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      mediaPlayer?.pause();
    });
    navigator.mediaSession.setActionHandler("seekbackward", () => {
      mediaPlayer!.currentTime -= 10;
    });
    navigator.mediaSession.setActionHandler("seekforward", () => {
      mediaPlayer!.currentTime += 10;
    });
    navigator.mediaSession.setActionHandler("previoustrack", () => {
      mediaPlayer!.currentTime -= 10;
    });
    navigator.mediaSession.setActionHandler("nexttrack", () => {
      mediaPlayer!.currentTime += 10;
    });
    navigator.mediaSession.setActionHandler("stop", () => {
      console.log("stop");
    });
  };

  const setMediaState = () => {
    navigator.mediaSession.setPositionState({
      duration: video.value!.duration,
      playbackRate: mediaPlayer!.playbackRate,
      position: mediaPlayer!.currentTime,
    });
  };

  const init = () => {
    if (!video.value) return;
    console.time("init");
    initMediaSession();
    fetchSubtitles(video.value.subtitles);
    if (!video.value?.subtitles) return;
    const subs = new Map<string, string>();
    video.value.subtitles.forEach((subtitle) => {
      if (!subtitle.url) return;
      subs.set(subtitle.code, subtitle.url);
    });
    setSubtitles(subs);
  };

  const [currentTime, setCurrentTime] = createSignal(0);
  const time = route.query.t;
  const [started, setStarted] = createSignal(false);

  const onCanPlay = (event: Event) => {
    console.log("can play", route.search.match("fullscreen"));
    console.log(event);
    setError(undefined);
    init();
    if (!video.value?.chapters) return;
    if (!mediaPlayer) return;
    if (route.search.match("fullscreen")) {
      if (navigator.userActivation.isActive) {
        mediaPlayer?.requestFullscreen();
      }
    }
    let chapters = [];
    for (let i = 0; i < video.value.chapters.length; i++) {
      const chapter = video.value.chapters[i];
      const name = chapter.title;
      // seconds to 00:00:00
      const timestamp = new Date(chapter.start * 1000)
        .toISOString()
        .slice(11, 22);
      const seconds =
        video.value.chapters[i + 1]?.start - chapter.start ??
        video.value.duration - chapter.start;
      chapters.push({ name, timestamp, seconds });
    }

    setVtt(chaptersVtt(chapters, video.value.duration));
    if (vtt()) {
      mediaPlayer.textTracks.add({
        kind: "chapters",
        default: true,
        content: vtt(),
        type: "vtt",
      });
    }

    if (time) {
      let start = 0;
      if (/^[\d]*$/g.test(time)) {
        start = parseInt(time);
      } else {
        const hours = /([\d]*)h/gi.exec(time)?.[1];
        const minutes = /([\d]*)m/gi.exec(time)?.[1];
        const seconds = /([\d]*)s/gi.exec(time)?.[1];
        if (hours) {
          start += parseInt(hours) * 60 * 60;
        }
        if (minutes) {
          start += parseInt(minutes) * 60;
        }
        if (seconds) {
          start += parseInt(seconds);
        }
      }
      setCurrentTime(start);
      // this.initialSeekComplete = true;
    }
  };

  createEffect(() => {
    if (!video.value) return;
    if (!mediaPlayer) return;
    mediaPlayer.thumbnails = generateStoryboard(video.value.previewFrames[1]);
    console.log(mediaPlayer.thumbnails);
  });

  createEffect(() => {
    if (!video.value) return;
    if (!mediaPlayer) return;
    if (!store()) return;
    if (time) return;
    const id = videoId(video.value);
    if (!id) return;
    const val = SyncedDB.history.findUnique(store()!, id);
    const progress = val?.currentTime;
    if (progress) {
      if (progress < video.value.duration * 0.9) {
        setCurrentTime(progress);
      }
    }
  });

  createEffect(() => {
    const nextVideo = video.value?.relatedStreams?.[0];
    if (!nextVideo) return;
    if (!mediaPlayer) return;
    if (!video.value) return;
    if (route.query.list) return;
    queueStore.setCurrentVideo({
      url: `/watch?v=${videoId(video.value)}`,
      title: video.value.title,
      thumbnail: video.value.thumbnailUrl,
      duration: video.value.duration,
      uploaderName: video.value.uploader,
      uploaderAvatar: video.value.uploaderAvatar,
      uploaderUrl: video.value.uploaderUrl,
      isShort: false,
      shortDescription: "",
      type: "video",
      uploaded: dayjs(video.value.uploadDate).unix(),
      views: video.value.views,
      uploadedDate: video.value.uploadDate,
      uploaderVerified: video.value.uploaderVerified,
    });
    if (queueStore.isCurrentLast()) {
      queueStore.addToQueue(nextVideo);
    }
  });

  const playNext = () => {
    console.log("playing next", nextVideo());
    if (!nextVideo()) return;

    navigate(nextVideo()!.url, { replace: false });
    setEnded(false);
  };

  function handleSetNextVideo() {
    console.log("setting next video");
    let url = `/watch?v=`;
    if (playlist()) {
      const local = "videos" in playlist()!;
      const listId =
        route.query.list ?? (playlist() as unknown as { id: string })!.id;
      let index; // index starts from 1
      if (route.query.index) {
        index = parseInt(route.query.index);
      } else if (local) {
        index = (playlist() as unknown as {
          videos: RelatedStream[];
        })!.videos!.findIndex((v) => videoId(v) === videoId(video.value));
        if (index !== -1) index++;
      } else {
        index = playlist()!.relatedStreams!.findIndex(
          (v) => videoId(v) === videoId(video.value)
        );
        if (index !== -1) index++;
      }

      if (index < playlist()!.relatedStreams?.length) {
        const next = playlist()!.relatedStreams[index]; // index is already +1
        url += `${videoId(next)}&list=${listId}&index=${index + 1}`;
        setNextVideo({ url: url, info: next });
      } else if (
        index <
        (playlist() as unknown as { videos: RelatedStream[] })!.videos?.length
      ) {
        const next = (playlist() as unknown as {
          videos: RelatedStream[];
        })!.videos[index]; // index is already +1
        url += `${videoId(next)}&list=${listId}&index=${index + 1}`;
        setNextVideo({
          url: url,
          info: next,
        });
      }
      return;
    }
    const next = queueStore.next();
    if (!next) return;

    setNextVideo({
      url: `/watch?v=${videoId(next)}`,
      info: next,
    });
  }

  createEffect(() => {
    if (!video.value) return;
    if (!mediaPlayer) return;
    handleSetNextVideo();
  });

  const [ended, setEnded] = createSignal(false);
  const [nextVideo, setNextVideo] = createSignal<{
    url: string;
    info: RelatedStream;
  } | null>(null);

  const handleEnded = () => {
    console.log("ended");
    if (!mediaPlayer) return;
    if (!video.value) return;
    setEnded(true);
    showToast();
    updateProgress();
  };

  const [showEndScreen, setShowEndScreen] = createSignal(false);
  const defaultCounter = 5;
  const [counter, setCounter] = createSignal(defaultCounter);
  let timeoutCounter: any;

  createEffect(() => {
    console.log("ended effect", ended());
    if (!ended()) return;
    if (!mediaPlayer) return;
    if (!video.value) return;
  });

  function showToast() {
    console.log("showing toast");
    setCounter(defaultCounter);
    if (counter() < 1) {
      console.log("counter less than 1");
      playNext();
      return;
    }
    if (timeoutCounter) clearInterval(timeoutCounter);
    timeoutCounter = setInterval(() => {
      console.log("counting", counter());
      setCounter((c) => c - 1);
      if (counter() === 0) {
        dismiss();
        playNext();
      }
    }, 1000);
    console.log("showing end screen");
    setShowEndScreen(true);
  }

  function dismiss() {
    console.log("dismiss");
    clearInterval(timeoutCounter);
    setShowEndScreen(false);
  }

  onCleanup(() => {
    clearInterval(timeoutCounter);
    document.removeEventListener("keydown", handleKeyDown);
  });

  const onProviderChange = (event: MediaProviderChangeEvent) => {
    console.log(event, "provider change");
    const provider = event.detail;
    if (isHLSProvider(provider)) {
      provider.library = () => import("hls.js");
      console.log(provider);
      provider.config = {
        startLevel: 0,
      };
    }
  };

  const handleHlsError = (err: HLSErrorEvent) => {
    console.dir(err.detail);
    setError({
      name: err.detail.error.name,
      code: err.detail.response?.code,
      details: err.detail.details,
      fatal: err.detail.fatal,
      message: err.detail.error.message,
    });
    console.log(error());
  };

  function selectDefaultQuality() {
    let preferredQuality = 1080; // TODO: get from user settings
    if (!mediaPlayer) return;
    console.log(mediaPlayer.qualities);
    const q = mediaPlayer.qualities
      .toArray()
      .find((q) => q.height >= preferredQuality);
    console.log(q);
    if (q) {
      q.selected = true;
    }
  }
  createEffect(() => {
    if (!mediaPlayer) return;
    if (!video.value) return;
    selectDefaultQuality();
  });

  onMount(() => {
    console.log("mount", mediaPlayer);
    document.addEventListener("beforeunload", updateProgress);
    document.addEventListener("visibilitychange", updateProgress);
  });

  onCleanup(() => {
    document.removeEventListener("beforeunload", updateProgress);
    document.removeEventListener("visibilitychange", updateProgress);
  });

  const isRouting = useIsRouting();
  const navigate = useNavigate();
  createEffect(() => {
    if (isRouting()) {
      console.log("routing");
      // if ("window" in globalThis) {
      //   // add fullscreen parameter
      //   const url = new URL(window.location.href);
      //   url.searchParams.set("fullscreen", "true");
      //   navigate(url.href.replace(url.origin, "").toString(), { replace: false});
      // }
      updateProgress();
    }
  });

  const generateStoryboard = (
    previewFrames: PreviewFrame | undefined
  ): string | null => {
    if (!previewFrames) return null;
    let output = "WEBVTT\n\n";
    let currentTime = 0;

    for (let url of previewFrames.urls) {
      for (let y = 0; y < previewFrames.framesPerPageY; y++) {
        for (let x = 0; x < previewFrames.framesPerPageX; x++) {
          if (
            currentTime >=
            previewFrames.totalCount * previewFrames.durationPerFrame
          ) {
            break;
          }

          let startX = x * previewFrames.frameWidth;
          let startY = y * previewFrames.frameHeight;

          output += `${formatTime(currentTime)} --> ${formatTime(
            currentTime + previewFrames.durationPerFrame
          )}\n`;
          output += `${url}#xywh=${startX},${startY},${previewFrames.frameWidth},${previewFrames.frameHeight}\n\n`;

          currentTime += previewFrames.durationPerFrame;
        }
      }
    }

    function formatTime(ms: number): string {
      let hours = Math.floor(ms / 3600000);
      ms -= hours * 3600000;
      let minutes = Math.floor(ms / 60000);
      ms -= minutes * 60000;
      let seconds = Math.floor(ms / 1000);
      ms -= seconds * 1000;

      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${ms
        .toString()
        .padStart(3, "0")}`;
    }

    const blob = new Blob([output], { type: "text/vtt" });
    return URL.createObjectURL(blob);
  };
  const [mediaPlayerConnected, setMediaPlayerConnected] = createSignal(false);

  createEffect(() => {
    if (!mediaPlayerConnected()) return;
    if (!video.value) return;
    document.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  const remote = new MediaRemoteControl();

  const handleKeyDown = (e: KeyboardEvent) => {
    console.log(e.key);
    // if an input is focused
    if (document.activeElement?.tagName === "INPUT") return;
    switch (e.key) {
      case "f":
        if (document.fullscreenElement) {
          mediaPlayer?.exitFullscreen();
        } else {
          mediaPlayer?.requestFullscreen();
        }
        e.preventDefault();
        break;
      case "m":
        mediaPlayer!.muted = !mediaPlayer!.muted;
        e.preventDefault();
        break;
      case "j":
        mediaPlayer!.currentTime = Math.max(mediaPlayer!.currentTime - 10, 0);
        e.preventDefault();
        break;
      case "l":
        mediaPlayer!.currentTime = Math.min(
          mediaPlayer!.currentTime + 10,
          video.value!.duration
        );
        e.preventDefault();
        break;
      case "c":
        remote.toggleCaptions();
        e.preventDefault();
        break;
      case "k":
      case " ":
        if (document.activeElement?.tagName === "BUTTON") return;
        if (document.activeElement?.tagName.startsWith("MEDIA-")) return;
        if (mediaPlayer!.paused) mediaPlayer!.play();
        else mediaPlayer!.pause();
        e.preventDefault();
        break;
      case "up":
        mediaPlayer!.volume = Math.min(mediaPlayer!.volume + 0.05, 1);
        e.preventDefault();
        break;
      case "down":
        mediaPlayer!.volume = Math.max(mediaPlayer!.volume - 0.05, 0);
        e.preventDefault();
        break;
      case "ArrowLeft":
        mediaPlayer!.currentTime = Math.max(mediaPlayer!.currentTime - 5, 0);
        remote.toggleUserIdle();
        e.preventDefault();
        break;
      case "ArrowRight":
        mediaPlayer!.currentTime = mediaPlayer!.currentTime + 5;
        e.preventDefault();
        break;
      case "0":
        mediaPlayer!.currentTime = 0;
        e.preventDefault();
        break;
      case "1":
        mediaPlayer!.currentTime = video.value!.duration * 0.1;
        e.preventDefault();
        break;
      case "2":
        mediaPlayer!.currentTime = video.value!.duration * 0.2;
        e.preventDefault();
        break;
      case "3":
        mediaPlayer!.currentTime = video.value!.duration * 0.3;
        e.preventDefault();
        break;
      case "4":
        mediaPlayer!.currentTime = video.value!.duration * 0.4;
        e.preventDefault();
        break;
      case "5":
        mediaPlayer!.currentTime = video.value!.duration * 0.5;
        e.preventDefault();
        break;
      case "6":
        mediaPlayer!.currentTime = video.value!.duration * 0.6;
        e.preventDefault();
        break;
      case "7":
        mediaPlayer!.currentTime = video.value!.duration * 0.7;
        e.preventDefault();
        break;
      case "8":
        mediaPlayer!.currentTime = video.value!.duration * 0.8;
        e.preventDefault();
        break;
      case "9":
        mediaPlayer!.currentTime = video.value!.duration * 0.9;
        e.preventDefault();
        break;
      case "N":
        if (e.shiftKey) {
          playNext();
          e.preventDefault();
        }
        break;
      case "Escape":
        if (showEndScreen() && nextVideo()) {
          dismiss();
          e.preventDefault();
        } else if (document.fullscreenElement) {
          // mediaPlayer?.exitFullscreen();
          e.preventDefault();
        }
        break;

      case ",":
        mediaPlayer!.currentTime -= 0.04;
        break;
      case ".":
        mediaPlayer!.currentTime += 0.04;
        break;
      // case "return":
      //   self.skipSegment(mediaPlayer!);
      //   break;
    }
  };

  return (
    <media-player
      id="player"
      class={`peer pointer-events-auto`}
      current-time={currentTime()}
      // onTextTrackChange={handleTextTrackChange}
      load="eager"
      // key-shortcuts={{
      //   togglePaused: "k Space",
      //   toggleMuted: "m",
      //   toggleFullscreen: "f",
      //   togglePictureInPicture: "i",
      //   toggleCaptions: "c",
      //   seekBackward: "ArrowLeft h",
      //   seekForward: "ArrowRight l",
      //   volumeUp: "ArrowUp",
      //   volumeDown: "ArrowDown",
      // }}
      key-disabled
      on:can-play={onCanPlay}
      on:provider-change={onProviderChange}
      on:hls-error={handleHlsError}
      on:pause={updateProgress}
      on:seeked={updateProgress}
      on:ended={handleEnded}
      on:play={() => setStarted(true)}
      on:media-player-connect={() => setMediaPlayerConnected(true)}
      autoplay
      ref={mediaPlayer}
      title={video.value?.title ?? ""}
      // src={video.value?.hls ?? ""}
      poster={video.value?.thumbnailUrl ?? ""}
      //       aspect-ratio={video.value?.videoStreams?.[0]
      //           ? video.value.videoStreams[0]?.width /
      //             video.value.videoStreams[0]?.height
      //           :
      // 16 / 9}
      aspect-ratio={16 / 9}
      thumbnails={generateStoryboard(video.value?.previewFrames[1])}
      crossorigin="anonymous">
      <media-outlet
      // classList={{"relative min-h-0 max-h-16 pb-0 h-full": preferences.pip}}
      >
        <media-poster alt={video.value?.title ?? ""} />
        {tracks().map((track) => {
          return (
            <track
              id={track.id}
              kind={track.kind as any}
              src={track.src}
              srclang={track.srcLang}
              label={track.label}
              data-type={track.dataType}
            />
          );
        })}
        <media-captions class="transition-[bottom] not-can-control:opacity-100 user-idle:opacity-100 not-user-idle:bottom-[80px]" />
        <source src={video.value!.hls} type="application/x-mpegurl" />
      </media-outlet>
      <Show when={error()}>
        {(err) => (
          <Show when={err().fatal}>
            <div
              // classList={{hidden: preferences.pip}}
              class="absolute top-0 right-0 w-full h-full opacity-100 pointer-events-auto bg-black/50">
              <div class="flex flex-col items-center justify-center w-full h-full gap-3">
                <div class="text-2xl font-bold text-white">
                  {error()?.name} {error()?.details}
                </div>
                <div class="flex flex-col">
                  <div class="text-lg text-white">{error()?.message}</div>
                  <div class="text-lg text-white">
                    Please try switching to a different instance or refresh the
                    page.
                  </div>
                </div>
                <div class="flex justify-center gap-2">
                  <button
                    class="px-4 py-2 text-lg text-white border border-white rounded-md"
                    // onClick={() => window.location.reload()}
                  >
                    Refresh
                  </button>
                  <button
                    class="px-4 py-2 text-lg text-white border border-white rounded-md"
                    onClick={() => {
                      setError(undefined);
                    }}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </Show>
        )}
      </Show>
      <Show when={showEndScreen() && nextVideo()}>
        <div class="absolute z-50 top-0 right-0 w-full h-full opacity-100 pointer-events-auto bg-black/50">
          <div class="flex flex-col items-center justify-center w-full h-full gap-3">
            <div class="text-2xl font-bold text-white">
              Playing next in {counter()} seconds
            </div>
            <div class="flex flex-col">
              <div class="text-lg text-white w-72">
                <VideoCard v={nextVideo()?.info ?? undefined} />
              </div>
            </div>
            <div class="flex justify-center gap-2">
              <button
                class="px-4 py-2 text-lg text-white border border-white rounded-md"
                onClick={() => {
                  dismiss();
                  playNext();
                }}>
                Play now (Shift + N)
              </button>
              <button
                class="px-4 py-2 text-lg text-white border border-white rounded-md"
                onClick={() => {
                  dismiss();
                }}>
                Dismiss (Esc)
              </button>
            </div>
          </div>
        </div>
      </Show>
      <PlayerSkin video={video.value} nextVideo={nextVideo()} />
      {/* <media-community-skin></media-community-skin> */}
    </media-player>
  );
}
