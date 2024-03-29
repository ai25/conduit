// Import styles.
import "vidstack/player/styles/base.css";
// Register elements.
import "vidstack/player";
import "vidstack/player/ui";
import "vidstack/solid";
import "vidstack/icons";

import {
  HLSErrorEvent,
  MediaProviderChangeEvent,
  isHLSProvider,
} from "vidstack";
import {
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  useContext,
  untrack,
  on,
} from "solid-js";
import {
  Chapter,
  PipedVideo,
  PreviewFrame,
  RelatedStream,
  Subtitle,
} from "~/types";
import { chaptersVtt } from "~/lib/chapters";
import { useIsRouting, useLocation, useNavigate, useSearchParams } from "solid-start";
import { ttml2srt } from "~/lib/ttml";
import { useQueue, VideoQueue } from "~/stores/queueStore";
import { usePlaylist } from "~/stores/playlistStore";
import { HistoryItem, useSyncStore } from "~/stores/syncStore";
import { Suspense } from "solid-js";
import { isServer } from "solid-js/web";
import { MediaPlayerElement } from "vidstack/elements";
import { VideoLayout } from "../player/layouts/VideoLayout";
import { usePreferences } from "~/stores/preferencesStore";
import { createQuery } from "@tanstack/solid-query";
import { generateStoryboard, getVideoId, isMobile, yieldToMain } from "~/utils/helpers";
import { ActionHandlers, initMediaSession, MediaMetadataProps, updateProgress } from "~/utils/player-helpers";
import api from "~/utils/api";
import { PiPLayout } from "../player/layouts/PiPLayout";
import { useAppState } from "~/stores/appStateStore";
import VideoCard from "../content/stream/VideoCard";
import Button from "../Button";

export default function Player(props: {
  // video: PipedVideo;
  onReload?: () => void;
}) {
  console.log("player render");
  const route = useLocation();
  let mediaPlayer!: MediaPlayerElement;
  const sync = useSyncStore();
  const [preferences, setPreferences] = usePreferences();
  const [v, setV] = createSignal<string | undefined>(undefined);
  createEffect(() => {
    if (!route.query.v) return;
    setV(route.query.v);
  });

  const videoQuery = createQuery<any,any,PipedVideo>(() => ({
    queryKey: ["streams", v(), preferences.instance.api_url],
    queryFn: () => api.fetchVideo(v(), preferences.instance.api_url),
    enabled: (v() && preferences.instance.api_url) ? true : false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    cacheTime: Infinity,
    staleTime: 100 * 60 * 1000,
    deferStream: true
  }));


  const [playlist] = usePlaylist();
  const queue = useQueue();

  createEffect(async () => {
    if (v()) {
      if (!queue.has(v()!)) {
        const awaitLoad = async () => {
          if (videoQuery.isLoading) {
            await new Promise<void>((resolve) => {
              setTimeout(() => {
                resolve();
              }, 100);
            });

            await awaitLoad();
          }
        };
        await awaitLoad();
        queue.add({
          url: `/watch?v=${v()}`,
          title: videoQuery.data!.title,
          thumbnail: videoQuery.data!.thumbnailUrl,
          duration: videoQuery.data!.duration,
          uploaderName: videoQuery.data!.uploader,
          uploaderAvatar: videoQuery.data!.uploaderAvatar,
          uploaderUrl: videoQuery.data!.uploaderUrl,
          isShort: false,
          shortDescription: "",
          type: "video",
          uploaded: new Date(videoQuery.data!.uploadDate).getTime(),
          views: videoQuery.data!.views,
          uploadedDate: videoQuery.data!.uploadDate,
          uploaderVerified: videoQuery.data!.uploaderVerified,
        });
      }
      queue.setCurrentVideo(v()!);
    }
  });

  // const queueStore = useQueue();
  createEffect(() => {
    if (!videoQuery.data) return;
    console.log(queue.isEmpty(), "queue is empty");
    if (queue.isEmpty()) {
      console.log("adding video to queue");
      queue.add({
        url: `/watch?v=${getVideoId(videoQuery.data)}`,
        title: videoQuery.data.title,
        thumbnail: videoQuery.data.thumbnailUrl,
        duration: videoQuery.data.duration,
        uploaderName: videoQuery.data.uploader,
        uploaderAvatar: videoQuery.data.uploaderAvatar,
        uploaderUrl: videoQuery.data.uploaderUrl,
        isShort: false,
        shortDescription: "",
        type: "video",
        uploaded: new Date(videoQuery.data.uploadDate).getTime(),
        views: videoQuery.data.views,
        uploadedDate: videoQuery.data.uploadDate,
        uploaderVerified: videoQuery.data.uploaderVerified,
      });
      console.log(queue, "queue 1", queue.list(), queue.isEmpty());

    }
  });

  const [vtt, setVtt] = createSignal<string | undefined>(undefined);

  const [tracks, setTracks] = createSignal<
    {
      id: string;
      key: string;
      kind: string;
      src: string;
      srcLang: string;
      label: string;
      dataType: string;
      metadata: {
        url: string;
      };
    }[]
  >([]);


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
        // const { srtUrl, srtText } = await ttml2srt(subtitle.url);
        // remove empty subtitles
        // if (srtText.trim() === "") return null;
        return {
          id: `track-${subtitle.code}`,
          key: subtitle.url,
          kind: "subtitles",
          src: "",
          srcLang: subtitle.code,
          label: `${subtitle.name} - ${subtitle.autoGenerated ? "Auto" : ""}`,
          dataType: "srt",
          metadata: {
            url: subtitle.url,
          },
        };
      })
    );
    console.timeEnd("fetching subtitles");
    setTracks(newTracks.filter((track) => track !== null) as any);
  };

  const init = async () => {
    if (!videoQuery.data) throw new Error("No video");
    console.time("init");
    const videoMetadata: MediaMetadataProps = {
      title: videoQuery.data?.title || '',
      artist: videoQuery.data?.uploader || '',
      thumbnailUrl: videoQuery.data?.thumbnailUrl || '',
    };
    console.dir(mediaPlayer, "media player");

    const actionHandlers: ActionHandlers = {
      play: () => mediaPlayer.play(),
      pause: () => mediaPlayer.pause(),
      seekbackward: () => { mediaPlayer.currentTime -= 10; },
      seekforward: () => { mediaPlayer.currentTime += 10; },
      previoustrack: () => { mediaPlayer.currentTime -= 10; },
      nexttrack: () => { mediaPlayer.currentTime += 10; },
      stop: () => console.log("stop"),
    };

    initMediaSession(
      navigator.mediaSession,
      videoMetadata,
      mediaPlayer,
      actionHandlers
    );

    fetchSubtitles(videoQuery.data.subtitles);
    let chapters = [];
    for (let i = 0; i < videoQuery.data.chapters.length; i++) {
      const chapter = videoQuery.data.chapters[i];
      const name = chapter.title;
      // seconds to 00:00:00
      const timestamp = new Date(chapter.start * 1000)
        .toISOString()
        .slice(11, 22);
      const seconds =
        videoQuery.data.chapters[i + 1]?.start - chapter.start ??
        videoQuery.data.duration - chapter.start;
      chapters.push({ name, timestamp, seconds });
    }

    console.time("chapters vtt");
    setVtt(chaptersVtt(chapters, videoQuery.data.duration));
    if (vtt()) {
      mediaPlayer.textTracks.add({
        kind: "chapters",
        default: true,
        content: vtt(),
        type: "vtt",
      });
    }
    console.timeEnd("chapters vtt");
  };


  const [currentTime, setCurrentTime] = createSignal(0);
  const time = route.query.t;
  const [started, setStarted] = createSignal(false);

  const onCanPlay = (event: Event) => {
    setErrors([]);
    init();
    if (!videoQuery.data?.chapters) return;
    if (!mediaPlayer) return;

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
    }
  };

  const [list, setList] = createSignal<RelatedStream[] | undefined>();

  createEffect(() => {
    console.log(nextVideo(), prevVideo());
    if (playlist()) {
      if (Array.isArray(playlist()!.videos)) {
        setList((playlist() as any).videos);
      } else {
        setList(playlist()!.relatedStreams);
      }
    } else {
      setList(queue.list());
      console.log(queue, "queue 2 list");
    }
  });

  createEffect(() => {
    if (!videoQuery.data) return;
    if (!mediaPlayer) return;
    if (time) return;
    const id = getVideoId(videoQuery.data);
    if (!id) return;
    const progress = sync.store.history[id]?.currentTime;
    if (progress) {
      if (progress < videoQuery.data.duration * 0.9) {
        setCurrentTime(progress);
      }
    }
  });

  const [nextVideo, setNextVideo] = createSignal<{
    url: string;
    info: RelatedStream;
  } | null>(null);

  const [prevVideo, setPrevVideo] = createSignal<{
    url: string;
    info: RelatedStream;
  } | null>(null);

  function pickNextVideo(relatedStreams: RelatedStream[], blacklist: string[] = []) {
    let firstUnwatched: RelatedStream | null = null;
    let firstOwnUploader: RelatedStream | null = null;

    for (const stream of relatedStreams) {
        let id = getVideoId(stream);
        if (!id || blacklist.includes(id)) continue; // Skip if no ID or blacklisted
        let watched = sync.store.history[id]
        // Priority 1: uploader matches and not watched
        if (stream.uploaderUrl === videoQuery.data!.uploaderUrl && !watched) {
            return stream;
        }

        // Track the first unwatched stream for priority 2
        if (!watched && firstUnwatched === null) {
            firstUnwatched = stream;
        }

        // Track the first stream with the same uploader for priority 3
        if (stream.uploaderUrl === videoQuery.data!.uploaderUrl && firstOwnUploader === null) {
            firstOwnUploader = stream;
        }
    }

    // Priority 2: return the first unwatched stream if found
    if (firstUnwatched) {
        return firstUnwatched;
    }

    // Priority 3: return the first stream with the same uploader if found
    if (firstOwnUploader) {
        return firstOwnUploader;
    }

    // Priority 4: return the first stream in the array
    return relatedStreams[0];
}


  createEffect(() => {
    const nextVideo = videoQuery.data?.relatedStreams?.[0];
    if (!nextVideo) return;
    if (!mediaPlayer) return;
    if (!videoQuery.data) return;
    console.log("adding ", nextVideo);
    if (!queue.peekNext()) {
      console.log("adding next video to queue", nextVideo);
      const blacklist = queue.uniqueIds
      let next = pickNextVideo(videoQuery.data.relatedStreams, blacklist);
      queue.add(next)
      console.log("queue 3", queue);
    }
    if (playlist()) {
      if (Array.isArray(playlist()!.videos)) {
        setList((playlist() as any).videos);
      } else {
        setList(playlist()!.relatedStreams);
      }
    } else {
      setList(queue.list());
      console.log(queue, "queue 2 list");
    }
    handleSetNextVideo();
    handleSetPrevVideo();
  });


  const [searchParams, setSearchParams] = useSearchParams();

  const playNext = () => {
    console.log("playing next", nextVideo());
    if (!nextVideo()) return;

    // setSearchParams({ "v": getVideoId(nextVideo()!.info) });
    const url = new URL(window.location.origin + nextVideo()!.url);
    if (searchParams.fullscreen) { url.searchParams.set("fullscreen", searchParams.fullscreen )}
    navigate(url.pathname + url.search.toString());
    setNextVideo(null);
  };

  function handleSetNextVideo() {
    console.log("setting next queue video");
    console.log("playlist", playlist());
    const params = new URLSearchParams(window.location.search);
    let url = new URL(window.location.href);
    const urlParams = new URLSearchParams(url.search);
    for (let key of urlParams.keys()) {
      params.set(key, urlParams.get(key)!);
    }
    console.log(params, "playing");
    // exclude timestamp
    params.delete("t");
    if (playlist()) {
      const local = "videos" in playlist()!;
      const listId = params.get("list")
        ?? (playlist() as unknown as { id: string })!.id;
      let index; // index starts from 1
      if (params.get("index")) {
        index = parseInt(params.get("index")!);
      } else if (local) {
        index = (playlist() as unknown as {
          videos: RelatedStream[];
        })!.videos!.findIndex((v) => getVideoId(v) === getVideoId(videoQuery.data));
        if (index !== -1) index++;
      } else {
        index = playlist()!.relatedStreams!.findIndex(
          (v) => getVideoId(v) === getVideoId(videoQuery.data)
        );
        if (index !== -1) index++;
      }

      if (index < playlist()!.relatedStreams?.length) {
        const next = playlist()!.relatedStreams[index]; // index is already +1
        const id = getVideoId(next);
        if (!id) return;
        params.set("v", id);
        params.set("list", listId);
        params.set("index", (index + 1).toString());
        url.search = params.toString();
        setNextVideo({ url: (url.pathname + url.search.toString()), info: next });
      } else if (
        index <
        (playlist() as unknown as { videos: RelatedStream[] })!.videos?.length
      ) {
        const next = (playlist() as unknown as {
          videos: RelatedStream[];
        })!.videos[index]; // index is already +1
        const id = getVideoId(next);
        if (!id) return;
        params.set("v", id);
        params.set("list", listId);
        params.set("index", (index + 1).toString());
        url.search = params.toString();
        setNextVideo({ url: (url.pathname + url.search.toString()), info: next });
      }
      return;
    }
    const next = queue.peekNext()
    console.log(next, "next", queue);
    if (!next) return;
    const id = getVideoId(next);
    if (!id) return;
    params.set("v", id);
    url.search = params.toString();
    console.log((url.pathname + url.search.toString()), "next video");
    setNextVideo({ url: (url.pathname + url.search.toString()), info: next });

  }

  const handleSetPrevVideo = () => {
    console.log("setting prev queue video");
    const params = new URLSearchParams(window.location.search);
    let url = new URL(window.location.href);
    const urlParams = new URLSearchParams(url.search);
    for (let key of urlParams.keys()) {
      params.set(key, urlParams.get(key)!);
    }
    // exclude timestamp
    params.delete("t");
    if (params.get("list")) {
      if (params.get("index")) {
        const index = parseInt(params.get("index")!);
        if (index > 1) {
          if (Array.isArray(playlist()!.videos)) {
            const prev = (playlist() as any).videos[index - 2];
            const id = getVideoId(prev);
            if (!id) return;
            params.set("v", id);
            params.set("index", (index - 1).toString());
            url.search = params.toString();
            setPrevVideo({ url: (url.pathname + url.search.toString()), info: prev });
          } else {
            const prev = playlist()!.relatedStreams![index - 2];
            const id = getVideoId(prev);
            if (!id) return;
            params.set("v", id);
            params.set("index", (index - 1).toString());
            url.search = params.toString();
            setPrevVideo({ url: (url.pathname + url.search.toString()), info: prev });
          }
        }
      }
      return;
    }
    const prev = queue.peekPrev();
    if (!prev) return;
    const id = getVideoId(prev);
    if (!id) return;
    params.set("v", id);
    url.search = params.toString();
    setPrevVideo({ url: (url.pathname + url.search.toString()), info: prev });
  };



  const handleEnded = () => {
    console.log("ended");
    if (!mediaPlayer) return;
    if (!videoQuery.data) return;
    showToast();
    updateProgress(videoQuery.data, started(), mediaPlayer.currentTime, sync);
  };

  const [showEndScreen, setShowEndScreen] = createSignal(false);
  const defaultCounter = 5;
  const [counter, setCounter] = createSignal(defaultCounter);
  let timeoutCounter: any;

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
    onCleanup(() => {
      if (isServer) return;
      clearInterval(timeoutCounter);
    });
  }

  function dismiss() {
    console.log("dismiss");
    clearInterval(timeoutCounter);
    setShowEndScreen(false);
  }

  onCleanup(() => {
    dismiss();
  })


  const onProviderChange = async (event: MediaProviderChangeEvent) => {
    console.log(event, "provider change");
    const provider = event.detail;
    if (isHLSProvider(provider)) {
      provider.library = async () => await import("hls.js");
      console.log(provider);
      provider.config = {
        // Reduce the quality to prevent frequent buffering
        maxBufferSize: 60 * 1000 * 1000, // lower buffer size to save memory
        maxBufferLength: 30, // max buffer length in seconds
        maxMaxBufferLength: 120, // max maximum buffer length in seconds
        lowLatencyMode: false, // turn off low latency mode to buffer more
        testBandwidth: false, // don't reduce start level quality quickly
        abrEwmaDefaultEstimate: 1000000, // default bandwidth estimate
        startLevel: -1, // auto start level selection
        // capLevelToPlayerSize: true, // restrict to player size to save bandwidth
        minAutoBitrate: 1000000, // minimum bitrate to start with
        // more aggressive ABR to quickly get to the best quality:
        abrEwmaFastLive: 3.0,
        abrEwmaSlowLive: 9.0,
        abrEwmaFastVoD: 3.0,
        abrEwmaSlowVoD: 9.0,
        abrBandWidthFactor: 0.8,
        abrBandWidthUpFactor: 0.9,
        maxStarvationDelay: 5,
        maxLoadingDelay: 15,
      };
    }
  };

  const [errors, setErrors] = createSignal<
    {
      name: string;
      details: string;
      fatal: boolean;
      message: string;
      code: number | undefined;
    }[]
  >([]);

  const [showErrorScreen, setShowErrorScreen] = createSignal({
    show: false,
    dismissed: false,
  });

  const handleHlsError = (err: HLSErrorEvent) => {
    if (err.detail.fatal) {
      setShowErrorScreen((prev) => ({ ...prev, show: true }));
      if (errors().length < 10) {
        setErrors((prev) => [
          ...prev,
          {
            name: err.detail.error.name,
            code: err.detail.response?.code,
            details: err.detail.details,
            fatal: err.detail.fatal,
            message: err.detail.error.message,
          },
        ]);
      } else {
        setErrors((prev) => [
          ...prev.slice(1),
          {
            name: err.detail.error.name,
            code: err.detail.response?.code,
            details: err.detail.details,
            fatal: err.detail.fatal,
            message: err.detail.error.message,
          },
        ]);
      }
    }

    console.log(errors());
    //   mediaPlayer?.destroy();
  };

  function selectDefaultQuality() {
    let preferredQuality = 1080; // TODO: get from user settings
    if (!mediaPlayer) return;
    console.log(mediaPlayer.qualities);
    const q = mediaPlayer.qualities
      ?.toArray()
      .find((q) => q.height >= preferredQuality);
    console.log(q);
    if (q) {
      q.selected = true;
    }
  }

  createEffect(() => {
    if (!mediaPlayer) return;
    if (!videoQuery.data) return;
    selectDefaultQuality();
  });
  const updateProgressParametrized = () => {
    if (!mediaPlayer || !videoQuery.data) return;
    updateProgress(videoQuery.data!, started(), mediaPlayer.currentTime, sync);
  };

  onMount(() => {
    document.addEventListener("visibilitychange", updateProgressParametrized);
    document.addEventListener("pagehide", updateProgressParametrized);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", updateProgressParametrized)
    window.addEventListener("unload", updateProgressParametrized)
    document.addEventListener('media-enter-fullscreen-request', (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      console.log('Full screen request intercepted. Element will not go full screen.');
    }, { capture: true });
    onCleanup(() => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", updateProgressParametrized);
      document.removeEventListener("pagehide", updateProgressParametrized);
      document.removeEventListener("media-enter-fullscreen-request", (e) => {
        e.preventDefault();
        e.stopPropagation();
      }
      );
    });
  });

  createEffect(() => {
    if (!started()) return;
    updateProgressParametrized();
  });

  const isRouting = useIsRouting();
  const navigate = useNavigate();

  createEffect(() => {
    if (isRouting()) {
      updateProgressParametrized();
    }
  });
  let showControlsTimeout: NodeJS.Timeout;

  const showControls = () => {
    if (!mediaPlayer) return;
    mediaPlayer.controls.show();
    clearTimeout(showControlsTimeout);
    showControlsTimeout = setTimeout(() => {
      mediaPlayer.controls.hide();
    }, 3000);
  };


  const handleKeyDown = (e: KeyboardEvent) => {
    // if an input is focused
    if (document.activeElement?.tagName === "INPUT") return;
    switch (e.key) {
      case "f":
        console.log(`f key pressed, fullscreen: ${document.fullscreenElement}`)
        if (document.fullscreenElement) {
          document.exitFullscreen();
          screen.orientation.unlock();
          setSearchParams({ fullscreen: undefined }, { replace: true });
        } else {
          document.documentElement.requestFullscreen();
          screen.orientation.lock("landscape").catch(() => { });
          setSearchParams({ fullscreen: true }, { replace: true });
          document.body.scroll({ top: 0, left: 0, behavior: "smooth" });
        }
        e.preventDefault();
        break;
      case "m":
        mediaPlayer!.muted = !mediaPlayer!.muted;
        e.preventDefault();
        break;
      case "j":
        mediaPlayer!.currentTime = Math.max(mediaPlayer!.currentTime - 10, 0);
        showControls();
        e.preventDefault();
        break;
      case "l":
        if (!videoQuery.data?.duration) return;
        mediaPlayer!.currentTime = Math.min(
          mediaPlayer!.currentTime + 10,
          videoQuery.data.duration
        );
        showControls();
        e.preventDefault();
        break;
      case "c":
        const captions = mediaPlayer!.textTracks
          .toArray()
          .find(
            (t: any) => ((t.id.startsWith("track-")) && (
              t.language === "en" ||
              t.language === "en_US" ||
              t.language === "en_GB")
            )
          );
        if (captions) {
          console.log(captions.id);
          const trackUrl = tracks().find((t) => t.id === captions.id)?.metadata
            .url;

          console.log(trackUrl, "track url");
          if (trackUrl)
            ttml2srt(trackUrl, null).then(({ srtUrl }: { srtUrl: string }) => {
              (captions as any).src = srtUrl;

              captions.mode =
                captions.mode === "showing" ? "hidden" : "showing";
            });
        }
        e.preventDefault();
        break;
      case "k":
        if (mediaPlayer!.paused) {
          mediaPlayer!.play();
          setTimeout(() => {
            mediaPlayer.controls.hide(0);
          }, 100);
        } else {
          mediaPlayer!.pause();
          showControls();
        }
        e.preventDefault();
        break;
      case " ":
        e.preventDefault();
        console.log(document.activeElement?.tagName);
        if (document.activeElement?.tagName === "BUTTON") {
          (document.activeElement as HTMLButtonElement).click();
          return;
        }
        if (document.activeElement?.tagName.startsWith("MEDIA-")) return;
        if (mediaPlayer!.paused) mediaPlayer!.play();
        else mediaPlayer!.pause();
        break;
      case "ArrowUp":
        if (e.shiftKey) {
          mediaPlayer!.volume = Math.min(mediaPlayer!.volume + 0.05, 1);
          e.preventDefault();
        }
        break;
      case "ArrowDown":
        if (e.shiftKey) {
          mediaPlayer!.volume = Math.max(mediaPlayer!.volume - 0.05, 0);
          e.preventDefault();
        }
        break;
      case "ArrowLeft":
        if (e.altKey) return;
        if (e.shiftKey) {
          prevChapter();
        } else {
          mediaPlayer!.currentTime = Math.max(mediaPlayer!.currentTime - 5, 0);
        }
        showControls();
        e.preventDefault();
        break;
      case "ArrowRight":
        if (e.altKey) return;
        if (e.shiftKey) {
          nextChapter();
        } else {
          mediaPlayer!.currentTime = mediaPlayer!.currentTime + 5;
        }
        showControls();
        e.preventDefault();
        break;
      case "0":
        mediaPlayer!.currentTime = 0;
        e.preventDefault();
        break;
      case "1":
        if (!videoQuery.data?.duration) return;
        mediaPlayer!.currentTime = videoQuery.data.duration * 0.1;
        e.preventDefault();
        break;
      case "2":
        if (!videoQuery.data?.duration) return;
        mediaPlayer!.currentTime = videoQuery.data.duration * 0.2;
        e.preventDefault();
        break;
      case "3":
        if (!videoQuery.data?.duration) return;
        mediaPlayer!.currentTime = videoQuery.data.duration * 0.3;
        e.preventDefault();
        break;
      case "4":
        if (!videoQuery.data?.duration) return;
        mediaPlayer!.currentTime = videoQuery.data.duration * 0.4;
        e.preventDefault();
        break;
      case "5":
        if (!videoQuery.data?.duration) return;
        mediaPlayer!.currentTime = videoQuery.data.duration * 0.5;
        e.preventDefault();
        break;
      case "6":
        if (!videoQuery.data?.duration) return;
        mediaPlayer!.currentTime = videoQuery.data.duration * 0.6;
        e.preventDefault();
        break;
      case "7":
        if (!videoQuery.data?.duration) return;
        mediaPlayer!.currentTime = videoQuery.data.duration * 0.7;
        e.preventDefault();
        break;
      case "8":
        if (!videoQuery.data?.duration) return;
        mediaPlayer!.currentTime = videoQuery.data.duration * 0.8;
        e.preventDefault();
        break;
      case "9":
        if (!videoQuery.data?.duration) return;
        mediaPlayer!.currentTime = videoQuery.data.duration * 0.9;
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
        } else if (showErrorScreen().show) {
          setShowErrorScreen({ show: false, dismissed: true });
          e.preventDefault();
          // mediaPlayer?.exitFullscreen();
        }
        break;

      case ",":
        mediaPlayer!.currentTime -= 0.04;
        break;
      case ".":
        mediaPlayer!.currentTime += 0.04;
        break;
      case "R":
        if (e.shiftKey) {
          updateProgressParametrized();
          props.onReload?.();
          e.preventDefault();
        }
        break;


      // case "return":
      //   self.skipSegment(mediaPlayer!);
      //   break;
    }
  };

  interface Segment extends Chapter {
    end: number;
    manuallyNavigated: boolean;
    autoSkipped: boolean;
  }
  const [sponsorSegments, setSponsorSegments] = createSignal<Segment[]>([]);

  createEffect(() => {
    if (!videoQuery.data?.chapters) return;
    const segments: Segment[] = [];

    for (let i = 0; i < videoQuery.data.chapters.length; i++) {
      const chapter = videoQuery.data.chapters[i];
      if (chapter.title.startsWith("Sponsor")) {
        segments.push({
          ...chapter,
          end: videoQuery.data.chapters[i + 1]?.start || videoQuery.data.duration,
          manuallyNavigated: false,
          autoSkipped: false,
        });
      }
    }
    setSponsorSegments(segments);
  });

  const autoSkipHandler = () => {
    if (!mediaPlayer) return;
    if (sponsorSegments().length === 0) return;
    const currentTime = mediaPlayer.currentTime;
    let segments = sponsorSegments();
    for (const segment of segments) {
      if (
        currentTime >= segment.start &&
        currentTime < segment.end &&
        !segment.manuallyNavigated &&
        !segment.autoSkipped
      ) {
        mediaPlayer.currentTime = segment.end;
        segment.autoSkipped = true; // Mark as automatically skipped
        break;
      }
    }
    setSponsorSegments(segments);
  };

  const userNavigationHandler = () => {
    if (!mediaPlayer) return;
    if (sponsorSegments().length === 0) return;

    const currentTime = mediaPlayer.currentTime;
    let segments = sponsorSegments();
    for (const segment of segments) {
      if (currentTime >= segment.start && currentTime < segment.end) {
        segment.manuallyNavigated = true;
        segment.autoSkipped = false; // Reset the auto-skipped flag
        break;
      } else {
        // Reset flags for segments that are not being navigated to
        segment.manuallyNavigated = false;
        segment.autoSkipped = false;
      }
    }
    setSponsorSegments(segments);
  };

  const prevChapter = () => {
    if (!mediaPlayer) return;
    if (!videoQuery.data?.chapters) return;
    const currentTime = mediaPlayer.currentTime;
    let currentChapter: Chapter | undefined;
    for (let i = 0; i < videoQuery.data.chapters.length; i++) {
      const chapter = videoQuery.data.chapters[i];
      if (
        currentTime >= chapter.start &&
        currentTime < videoQuery.data.chapters[i + 1]?.start
      ) {
        currentChapter = chapter;
        break;
      }
    }
    if (!currentChapter) return;
    const prevChapter = videoQuery.data.chapters.slice().reverse().find(
      (c) => c.start < currentChapter!.start - 1
    );
    if (!prevChapter) return;
    mediaPlayer.currentTime = prevChapter.start;
  };

  const nextChapter = () => {
    if (!mediaPlayer) return;
    if (!videoQuery.data?.chapters) return;
    const currentTime = mediaPlayer.currentTime;
    let currentChapter: Chapter | undefined;
    for (let i = 0; i < videoQuery.data.chapters.length; i++) {
      const chapter = videoQuery.data.chapters[i];
      if (
        currentTime >= chapter.start &&
        currentTime < videoQuery.data.chapters[i + 1]?.start
      ) {
        currentChapter = chapter;
        break;
      }
    }
    if (!currentChapter) return;
    const nextChapter = videoQuery.data.chapters.find(
      (c) => c.start > currentChapter!.start
    );
    if (!nextChapter) return;
    mediaPlayer.currentTime = nextChapter.start;
  };
  const [appState, setAppState] = useAppState();

  createEffect(() => {
    if (route.pathname !== '/watch') {
      setAppState("player", "small", true);
    } else {
      setAppState("player", 'small', false);
      // If returning to '/watch', the player should not be dismissed
      if (appState.player.dismissed) {
        setAppState("player", 'dismissed', false);
      }
    }
  })


  return (
    <Show when={videoQuery.data}>
      <media-player
        playsinline
        keep-alive
        id="player"
        classList={{
          " z-[99999] aspect-video bg-black text-white font-sans overflow-hidden ring-primary data-[focus]:ring-4": true,
          "!absolute inset-0 w-screen h-screen": !!searchParams.fullscreen && !appState.player.small,
          "!sticky sm:!relative !top-0": !searchParams.fullscreen,
          "!sticky sm:!sticky !top-10 !left-1 !w-56 sm:!w-72 lg:!w-96 ": appState.player.small,
          "!hidden": appState.player.dismissed,

        }}
        current-time={currentTime()}
        // onTextTrackChange={handleTextTrackChange}
        // load="eager"
        key-disabled
        tabIndex={-1}
        playbackRate={preferences.speed}
        muted={preferences.muted}
        volume={preferences.volume}

        onMouseMove={() => {
          if (isMobile()) return;
          showControls();
        }}
        onMouseLeave={() => {
          mediaPlayer?.controls.hide(0);
        }}
        on:volume-change={(e) => {
          console.log("volume change", e.detail);
          setPreferences("volume", e.detail.volume);
          setPreferences("muted", e.detail.muted);
        }}
        on:time-update={() => {
          autoSkipHandler();
        }}

        on:can-play={onCanPlay}
        on:provider-change={onProviderChange}
        on:hls-error={handleHlsError}
        on:ended={handleEnded}
        on:play={() => {
          mediaPlayer.controls.hide(0);
          setStarted(true);
          updateProgressParametrized();
        }}
        on:seeked={() => {
          updateProgressParametrized();
          userNavigationHandler();
        }}
        on:pause={() => {
          showControls();
          updateProgressParametrized();
        }}
        on:hls-manifest-loaded={(e: any) => {
          console.log(e.detail, "levels");
        }}
        autoplay={true}
        ref={mediaPlayer}
        title={videoQuery.data?.title ?? ""}
        poster={videoQuery.data?.thumbnailUrl ?? ""}
        crossorigin="anonymous"
      // on:fullscreen-change={(e) => {
      //   const urlParams = new URLSearchParams(window.location.search);
      //   if (e.detail) {
      //     urlParams.set("fullscreen", "true");
      //   } else {
      //     urlParams.delete("fullscreen");
      //   }
      //   history.replaceState(
      //     null,
      //     "",
      //     window.location.pathname + "?" + urlParams.toString()
      //   );
      // }}
      >
        <media-provider
          class="max-h-screen max-w-screen [&>video]:max-h-screen [&>video]:max-w-screen [&>video]:h-full [&>video]:w-full"
        // classList={{"relative min-h-0 max-h-16 pb-0 h-full": preferences.pip}}
        >
          <media-poster
            aria-hidden="true"
            src={videoQuery.data?.thumbnailUrl ?? ""}
            class="absolute inset-0 block h-full w-full rounded-md opacity-0 transition-opacity data-[visible]:opacity-100 [&>img]:h-full [&>img]:w-full [&>img]:object-cover"
          ></media-poster>
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
          <Show when={videoQuery.data?.hls}>
            <source src={videoQuery.data?.hls} type="application/x-mpegurl" />
          </Show>
        </media-provider>
        <Show
          when={
            errors().length > 0 &&
            showErrorScreen().show &&
            !showErrorScreen().dismissed
          }
        >
          <div
            // classList={{hidden: preferences.pip}}
            class="absolute z-50 top-0 right-0 w-full h-full opacity-100 pointer-events-auto bg-black/50"
          >
            <div class="flex flex-col items-center justify-center w-full h-full gap-3">
              <div class="text-2xl font-bold text-white">
                {errors()[errors().length - 1]?.name}{" "}
                {errors()[errors().length - 1]?.details}
              </div>
              <div class="flex flex-col">
                <div class="text-lg text-white">
                  {errors()[errors().length - 1]?.message}
                </div>
                <div class="text-lg text-white">
                  Please try switching to a different instance or refresh the
                  page.
                </div>
              </div>
              <div class="flex justify-center gap-2">
                <button
                  class="px-4 py-2 text-lg text-white border border-white rounded-md"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setShowErrorScreen({ show: false, dismissed: true });
                    }
                  }}
                  onClick={() => {
                    setShowErrorScreen({ show: false, dismissed: true });
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Show>
        <Show when={showEndScreen() && nextVideo()}>
          <div class="absolute z-50 top-0 right-0 w-full h-full pointer-events-auto">
            <div class="flex flex-col items-center justify-center w-full h-full gap-3">
              <div class="text-2xl font-bold text-white">
                Playing next in {counter()} seconds
              </div>
              <div class="flex flex-col">
                <div class="text-lg scale-75 sm:scale-100 text-white w-96 h-full my-2">
                  <VideoCard
                    layout="sm:grid"
                    v={nextVideo()?.info ?? undefined} />
                </div>
              </div>
              <div class="flex justify-center gap-2">
                <Button
                  onClick={() => {
                    dismiss();
                    playNext();
                  }}
                  label="Play now (Shift + N)"
                />
                <Button
                  appearance="subtle"
                  class="bg-bg1"
                  onClick={() => {
                    dismiss();
                  }}
                  label="Dismiss (Esc)"
                />
              </div>
            </div>
          </div>
        </Show>
        <Show when={route.pathname === "/watch"}>
          <VideoLayout
            thumbnails={generateStoryboard(videoQuery.data?.previewFrames?.[1])}
            loop={preferences.loop}
            chapters={vtt()}
            title={videoQuery.data?.title ?? ""}

            onLoopChange={(value) => {
              setPreferences("loop", value);
            }}
            navigateNext={nextVideo()?.url ? playNext : undefined}
            navigatePrev={prevVideo()?.url ? () => {
              navigate(prevVideo()!.url)
              setPrevVideo(null);
            }
              : undefined}
            playlist={list()}
          />
        </Show>
        <PiPLayout />
      </media-player>
    </Show>
  );
}
