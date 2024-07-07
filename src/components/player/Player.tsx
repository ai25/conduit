import "vidstack/player/styles/base.css";
import "vidstack/player";
import "vidstack/player/ui";
import "vidstack/player/layouts";
import "vidstack/solid";
import "vidstack/icons";
import "vidstack/player/styles/default/theme.css";
import "vidstack/player/styles/default/layouts/audio.css";
import "vidstack/player/styles/default/layouts/video.css";
import styles from "./player.module.css";

import {
  HLSErrorEvent,
  HLSProvider,
  MediaProviderChangeEvent,
  isHLSProvider,
} from "vidstack";
import {
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  For,
  untrack,
  on,
  createRenderEffect,
  Suspense,
  ErrorBoundary,
} from "solid-js";
import { Chapter, PipedVideo, RelatedStream, Subtitle } from "~/types";
import { chaptersVtt } from "~/lib/chapters";
import { ttml2srt } from "~/lib/ttml";
import { useQueue, VideoQueue } from "~/stores/queueStore";
import { usePlaylist } from "~/stores/playlistStore";
import { useSyncStore } from "~/stores/syncStore";
import { isServer } from "solid-js/web";
import { MediaPlayerElement, defineCustomElement } from "vidstack/elements";
import { usePreferences } from "~/stores/preferencesStore";
import {
  exponentialBackoff,
  generateStoryboard,
  getVideoId,
  isMobile,
} from "~/utils/helpers";
import {
  initMediaSession,
  MediaMetadataProps,
  updateProgress,
} from "~/utils/player-helpers";
import { PiPLayout } from "../player/layouts/PiPLayout";
import { useAppState } from "~/stores/appStateStore";
import VideoCard from "../content/stream/VideoCard";
import Button from "../Button";
import { createStore } from "solid-js/store";
import {
  useIsRouting,
  useLocation,
  useNavigate,
  useSearchParams,
} from "@solidjs/router";
import { useVideoContext } from "~/stores/VideoContext";
import { toast } from "../Toast";
import { FullscreenButton } from "./buttons/FullscreenButton";
import { Tooltip } from "../Tooltip";
import { RecommendedVideosMenu } from "./menus/RecommendedVideosMenu";
import { PrevButton } from "./buttons/PrevButton";
import { NextButton } from "./buttons/NextButton";
import { FaSolidArrowLeft } from "solid-icons/fa";
import { usePlayerState } from "~/stores/playerStateStore";
import { Spinner } from "../Spinner";
import { createQuery } from "@tanstack/solid-query";
import numeral from "numeral";
export interface SponsorSegment {
  category: string;
  actionType: string;
  segment: number[];
  UUID: string;
  videoDuration: number;
  locked: number;
  votes: number;
  description: string;
}

export default function Player(props: {
  forwardRef?: (playerRef: MediaPlayerElement) => void;
  nextVideo?: (nextVideo: RelatedStream | null | undefined) => void;
  prevVideo?: (prevVideo: RelatedStream | null | undefined) => void;
  playNext?: (playNext: () => void) => void;
  playPrev?: (playPrev: () => void) => void;
  showEndScreen?: (showEndScreen: boolean) => void;
  endScreenCounter?: (counter: number) => void;
  dismissEndScreen?: (dismissEndScreen: () => void) => void;
}) {
  const route = useLocation();
  let mediaPlayer!: MediaPlayerElement;
  const sync = useSyncStore();
  onMount(() => {
    props.forwardRef?.(mediaPlayer);
  });

  const [preferences, setPreferences] = usePreferences();
  const [videoId, setVideoId] = createSignal<string | undefined>(undefined);

  const video = useVideoContext();

  const [playlist] = usePlaylist();
  const queue = useQueue();

  createEffect(() => {
    if (!route.query.v) return;
    setVideoId(route.query.v);
  });

  const [currentTime, setCurrentTime] = createSignal(0);
  const timeUrlParam = route.query.t;
  const [started, setStarted] = createSignal(false);

  const [showEndScreen, setShowEndScreen] = createSignal(false);
  const defaultCounter = 5;
  const [counter, setCounter] = createSignal(defaultCounter);
  let timeoutCounter: any;

  const sponsorsQuery = createQuery<SponsorSegment[]>(() => ({
    queryKey: ["sponsors", route.query.v, preferences.instance.api_url],
    queryFn: async (): Promise<SponsorSegment[]> => {
      const sha256Encrypted = await globalThis.crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(route.query.v)
      );
      const sha256Array = Array.from(new Uint8Array(sha256Encrypted));
      const prefix = sha256Array
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 5);
      const urlObj = new URL(
        "https://sponsor.ajay.app/api/skipSegments/" + prefix
      );
      urlObj.searchParams.set(
        "categories",
        JSON.stringify([
          "sponsor",
          "interaction",
          "selfpromo",
          "music_offtopic",
        ])
      );
      const url = urlObj.toString();
      console.log(url);
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          return Promise.reject("no sponsors found");
        } else {
          const text = await res.text();
          return Promise.reject("error fetching sponsors: " + text);
        }
      }
      const data = await res.json();
      const video = data.find((v: any) => v.videoID === route.query.v);
      if (!video) {
        return Promise.reject("no sponsors found");
      }
      return video.segments;
    },
    enabled:
      preferences.instance?.api_url && !isServer && route.query.v
        ? true
        : false,
    refetchOnReconnect: false,
    retry: false,
    suspense: false,
    useErrorBoundary: false,
  }));

  const mergeChaptersAndSponsors = (
    chapters: Chapter[],
    sponsors: SponsorSegment[]
  ): Chapter[] => {
    console.log(chapters, "chapters", sponsors, "sponsors");
    // Create a unified timeline of all events
    const timeline: Array<{
      time: number;
      type: string;
      data: Chapter | SponsorSegment;
    }> = [
      ...chapters.map((ch) => ({ time: ch.start, type: "chapter", data: ch })),
      ...sponsors.flatMap((sp) => [
        { time: sp.segment[0], type: "sponsorStart", data: sp },
        { time: sp.segment[1], type: "sponsorEnd", data: sp },
      ]),
    ];

    // Sort the timeline, ensuring stability
    timeline.sort((a, b) => a.time - b.time || (a.type < b.type ? -1 : 1));

    const result: Chapter[] = [];
    let activeSponsors: SponsorSegment[] = [];

    for (const event of timeline) {
      switch (event.type) {
        case "chapter":
          if (activeSponsors.length === 0) {
            result.push(event.data as Chapter);
          }
          break;
        case "sponsorStart":
          if (activeSponsors.length === 0) {
            result.push({
              title: `Sponsor: ${(event.data as SponsorSegment).category}`,
              start: event.time,
            } as Chapter);
          }
          activeSponsors.push(event.data as SponsorSegment);
          break;
        case "sponsorEnd":
          activeSponsors = activeSponsors.filter((sp) => sp !== event.data);
          if (activeSponsors.length === 0) {
            result.push({
              title: `End Sponsor: ${(event.data as SponsorSegment).category}`,
              start: event.time,
            } as Chapter);
          }
          break;
      }
    }

    return result;
  };
  function parseChapters(chapters: Chapter[]) {
    if (!video.data) return;
    let parsedChapters = [];
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const name = chapter.title;
      // seconds to 00:00:00
      const timestamp = new Date(chapter.start * 1000)
        .toISOString()
        .slice(11, 22);
      const seconds =
        chapters[i + 1]?.start - chapter.start ??
        video.data.duration - chapter.start;
      parsedChapters.push({ name, timestamp, seconds });
    }
    return chaptersVtt(parsedChapters, video.data.duration);
  }
  createEffect(() => {
    console.log(sponsorsQuery.data);
    if (!sponsorsQuery.data) return;
    if (!video.data?.chapters) return;
    const mergedChapters = mergeChaptersAndSponsors(
      video.data.chapters,
      sponsorsQuery.data
    );
    console.log(mergedChapters);
    const chaptersTracks = mediaPlayer.textTracks.getByKind("chapters");
    for (const chaptersTrack of chaptersTracks) {
      mediaPlayer.textTracks.remove(chaptersTrack);
    }
    const chapters = parseChapters(mergedChapters);

    if (chapters) {
      mediaPlayer.textTracks.add({
        kind: "chapters",
        default: true,
        content: chapters,
        type: "vtt",
      });
    }
  });

  const init = async () => {
    if (!video.data) throw new Error("No video");
    handleSetStartTime();

    const videoMetadata: MediaMetadataProps = {
      title: video.data?.title || "",
      artist: video.data?.uploader || "",
      thumbnailUrl: video.data?.thumbnailUrl || "",
    };
    initMediaSession(navigator.mediaSession, videoMetadata, mediaPlayer);

    selectDefaultQuality();
  };

  function selectDefaultQuality() {
    let preferredQuality = 1080; // TODO: get from user settings
    if (!mediaPlayer) return;
    const q = mediaPlayer.qualities
      ?.toArray()
      .find((q) => q.height >= preferredQuality);
    if (q) {
      q.selected = true;
    }
  }

  function handleSetStartTime() {
    if (timeUrlParam) {
      let start = 0;
      if (/^[\d]*$/g.test(timeUrlParam)) {
        start = parseInt(timeUrlParam);
      } else {
        const hours = /([\d]*)h/gi.exec(timeUrlParam)?.[1];
        const minutes = /([\d]*)m/gi.exec(timeUrlParam)?.[1];
        const seconds = /([\d]*)s/gi.exec(timeUrlParam)?.[1];
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
    } else {
      if (!video.data) return;
      const id = getVideoId(video.data);
      if (!id) return;
      const progress = sync.store.history[id]?.currentTime;
      if (progress) {
        if (progress < video.data.duration * 0.9) {
          setCurrentTime(progress);
        }
      }
    }
  }

  const [canPlay, setCanPlay] = createSignal(false);
  const onCanPlay = () => {
    setCanPlay(true);
    setHlsError();
    init();
  };

  const [queueVideos, setQueueVideos] = createSignal<
    RelatedStream[] | undefined
  >();
  const [nextVideo, setNextVideo] = createSignal<RelatedStream | null>();
  const [prevVideo, setPrevVideo] = createSignal<RelatedStream | null>();

  onMount(() => {
    const cb = () => {
      setQueueVideos(queue.list());
      setNextVideo(queue.peekNext());
      setPrevVideo(queue.peekPrev());
    };
    queue.addEventListener("change", cb);
    onCleanup(() => queue.removeEventListener("change", cb));
  });

  function pickNextVideo(
    relatedStreams: RelatedStream[],
    blacklist: string[] = []
  ) {
    let firstUnwatched: RelatedStream | null = null;
    let firstOwnUploader: RelatedStream | null = null;
    if (!video.data) return null;

    for (const stream of relatedStreams) {
      if (stream.type !== "stream") continue;
      let id = getVideoId(stream);
      if (!id || blacklist.includes(id)) continue; // Skip if no ID or blacklisted
      let watched = sync.store.history[id];
      // Priority 1: uploader matches and not watched
      if (stream.uploaderUrl === video.data.uploaderUrl && !watched) {
        return stream;
      }

      // Track the first unwatched stream for priority 2
      if (!watched && firstUnwatched === null) {
        firstUnwatched = stream;
      }

      // Track the first stream with the same uploader for priority 3
      if (
        stream.uploaderUrl === video.data.uploaderUrl &&
        firstOwnUploader === null
      ) {
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
    if (!video.data) return;
    if (!videoId()) return;
    if (playlist()) {
      // Add all playlist videos to the queue
      queue.initPlaylist(playlist()!.relatedStreams);
    } else {
      if (queue.isEmpty()) {
        queue.init([
          {
            url: `/watch?v=${videoId()}`,
            title: video.data.title,
            thumbnail: video.data.thumbnailUrl,
            duration: video.data.duration,
            uploaderName: video.data.uploader,
            uploaderAvatar: video.data.uploaderAvatar,
            uploaderUrl: video.data.uploaderUrl,
            isShort: false,
            shortDescription: "",
            type: "video",
            uploaded: new Date(video.data.uploadDate).getTime(),
            views: video.data.views,
            uploadedDate: video.data.uploadDate,
            uploaderVerified: video.data.uploaderVerified,
          },
        ]);
      } else {
        if (!queue.has(videoId()!)) {
          queue.add({
            url: `/watch?v=${videoId()}`,
            title: video.data.title,
            thumbnail: video.data.thumbnailUrl,
            duration: video.data.duration,
            uploaderName: video.data.uploader,
            uploaderAvatar: video.data.uploaderAvatar,
            uploaderUrl: video.data.uploaderUrl,
            isShort: false,
            shortDescription: "",
            type: "video",
            uploaded: new Date(video.data.uploadDate).getTime(),
            views: video.data.views,
            uploadedDate: video.data.uploadDate,
            uploaderVerified: video.data.uploaderVerified,
          });
          queue.setCurrentVideo(videoId()!);
        }
      }
      // if this is the last video, add another to the queue
      if (!queue.peekNext()) {
        const blacklist = queue.uniqueIds;
        let next = pickNextVideo(video.data.relatedStreams, blacklist);
        if (next) queue.add(next);
        setNextVideo(next);
      }
    }
    setQueueVideos(queue.list());
    setPrevVideo(queue.peekPrev());
    setNextVideo(queue.peekNext());
    queue.setCurrentVideo(videoId()!);
  });

  const [searchParams, setSearchParams] = useSearchParams();

  const playNext = () => {
    if (!nextVideo()) return;
    const params = new URLSearchParams(window.location.search);
    params.set("v", getVideoId(nextVideo())!);
    const index = params.get("index");
    if (index) {
      params.set("index", `${parseInt(index, 10) + 1}`);
    }
    const url = `${window.location.pathname}?${params.toString()}`;
    queue.next();
    navigate(url);
  };

  const playPrev = () => {
    console.log("change prev", queue);
    if (!prevVideo()) return;
    const params = new URLSearchParams(window.location.search);
    params.set("v", getVideoId(prevVideo())!);
    const index = params.get("index");
    if (index) {
      params.set("index", `${parseInt(index, 10) - 1}`);
    }
    const url = `${window.location.pathname}?${params.toString()}`;
    queue.prev();
    navigate(url);
  };

  createEffect(() => {
    props.nextVideo?.(nextVideo());
    props.prevVideo?.(prevVideo());
    props.playNext?.(playNext);
    props.playPrev?.(playPrev);
    props.showEndScreen?.(showEndScreen());
    props.endScreenCounter?.(counter());
    props.dismissEndScreen?.(dismissEndScreen);
  });

  const handleEnded = () => {
    console.log("ended");
    if (!mediaPlayer) return;
    if (!video.data) return;
    handleShowEndScreen();
    updateProgress(video.data, started(), mediaPlayer.currentTime, sync);
  };

  function handleShowEndScreen() {
    setCounter(defaultCounter);
    if (!nextVideo()) return;
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
        dismissEndScreen();
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

  function dismissEndScreen() {
    console.log("dismiss");
    clearInterval(timeoutCounter);
    setShowEndScreen(false);
  }

  onCleanup(() => {
    dismissEndScreen();
  });

  const onProviderChange = async (event: MediaProviderChangeEvent) => {
    console.log(event, "provider change");
    const provider = event.detail;
    if (isHLSProvider(provider)) {
      console.log(provider, "provider change");
      provider.config = {
        // Reduce the quality to prevent frequent buffering
        maxBufferSize: 60 * 1000 * 1000, // lower buffer size to save memory
        maxBufferLength: 30, // max buffer length in seconds
        maxMaxBufferLength: 120, // max maximum buffer length in seconds
        lowLatencyMode: false, // turn off low latency mode to buffer more
        testBandwidth: false, // don't reduce start level quality quickly
        abrEwmaDefaultEstimate: 1000000, // default bandwidth estimate
        startLevel: -1, // auto start level selection
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

  const [hlsError, setHlsError] = createSignal<{
    name?: string;
    details?: string;
    fatal: boolean;
    message?: string;
    code: number | undefined;
  }>();

  const [showErrorScreen, setShowErrorScreen] = createSignal({
    show: false,
    dismissed: false,
  });

  let errorRecoveryAttempts = 0;
  const attemptRecoverFatalError = async () => {
    console.log(
      "attempting to recover from fatal error",
      errorRecoveryAttempts
    );
    if (errorRecoveryAttempts < 3) {
      const hlsInstance = (mediaPlayer.provider as HLSProvider).instance;
      hlsInstance?.startLoad();
    } else if (errorRecoveryAttempts < 50) {
      setShowErrorScreen((prev) => ({ ...prev, show: true }));
    } else {
      mediaPlayer.destroy();
    }
    errorRecoveryAttempts++;
  };

  function handleBufferAppended() {
    errorRecoveryAttempts = 0;
  }

  const handleHlsError = async (err: HLSErrorEvent) => {
    const hlsInstance = (mediaPlayer.provider as HLSProvider).instance;
    const HLS = (mediaPlayer.provider as HLSProvider).ctor;
    if (err.detail.fatal) {
      console.error("fatal error", err.detail, "HLS", err.detail.details);
      setHlsError({
        name: err.detail.type,
        details: err.detail.details,
        fatal: err.detail.fatal,
        message: err.detail.reason,
        code: err.detail.response?.code,
      });

      switch (err.detail.type) {
        case HLS?.ErrorTypes.NETWORK_ERROR:
          if (
            err.detail.details === HLS?.ErrorDetails.MANIFEST_LOAD_ERROR ||
            err.detail.details === HLS?.ErrorDetails.MANIFEST_LOAD_TIMEOUT ||
            err.detail.details === HLS?.ErrorDetails.MANIFEST_PARSING_ERROR
          ) {
            if (video.data?.hls) {
              // limit to prevent infinite loop
              if (errorRecoveryAttempts < 15) {
                console.log("loading source", errorRecoveryAttempts);
                hlsInstance?.loadSource(video.data?.hls);
              } else {
                setShowErrorScreen((prev) => ({ ...prev, show: true }));
              }
              errorRecoveryAttempts++;
            }
          } else {
            attemptRecoverFatalError();
          }
          break;
        case HLS?.ErrorTypes.MEDIA_ERROR:
          attemptRecoverFatalError();
          break;
        default:
          attemptRecoverFatalError();
          break;
      }
    }
  };

  const updateProgressParametrized = () => {
    if (!mediaPlayer || !video.data) return;
    updateProgress(video.data, started(), mediaPlayer.currentTime, sync);
  };

  onMount(() => {
    document.addEventListener("visibilitychange", updateProgressParametrized);
    document.addEventListener("pagehide", updateProgressParametrized);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", updateProgressParametrized);
    window.addEventListener("unload", updateProgressParametrized);
    document.addEventListener(
      "media-enter-fullscreen-request",
      (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!searchParams.fullscreen) {
          console.log(`fullscreen button pressed, entering fullscreen`);
          try {
            document.documentElement.requestFullscreen();
            screen.orientation.lock("landscape").catch(() => {});
            setSearchParams({ fullscreen: true }, { replace: true });
            document.body.scroll({ top: 0, left: 0, behavior: "smooth" });
          } catch (_) {
            setSearchParams({ fullscreen: undefined }, { replace: true });
          }
        } else {
          try {
            document.exitFullscreen();
            screen.orientation.unlock();
            setSearchParams({ fullscreen: undefined }, { replace: true });
          } catch (_) {
            setSearchParams({ fullscreen: true }, { replace: true });
          }
        }
        console.log(
          "Full screen request intercepted. Element will not go full screen.",
          event
        );
      },
      { capture: true }
    );
    onCleanup(() => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener(
        "visibilitychange",
        updateProgressParametrized
      );
      document.removeEventListener("pagehide", updateProgressParametrized);
      document.removeEventListener("media-enter-fullscreen-request", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
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
        if (e.ctrlKey || e.shiftKey) break;
        if (!searchParams.fullscreen) {
          try {
            document.documentElement.requestFullscreen();
            screen.orientation.lock("landscape").catch(() => {});
            setSearchParams({ fullscreen: true }, { replace: true });
            document.body.scroll({ top: 0, left: 0, behavior: "smooth" });
          } catch (_) {
            setSearchParams({ fullscreen: undefined }, { replace: true });
          }
        } else {
          try {
            document.exitFullscreen();
            screen.orientation.unlock();
            setSearchParams({ fullscreen: undefined }, { replace: true });
          } catch (_) {
            setSearchParams({ fullscreen: true }, { replace: true });
          }
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
        if (!video.data?.duration) return;
        mediaPlayer!.currentTime = Math.min(
          mediaPlayer!.currentTime + 10,
          video.data.duration
        );
        showControls();
        e.preventDefault();
        break;
      case "c":
        if (mediaPlayer.textTracks.selected) {
          mediaPlayer.textTracks.selected.setMode("hidden");
        } else {
          enablePreferredTextTrack(true);
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
        if (!video.data?.duration) return;
        mediaPlayer!.currentTime = video.data.duration * 0.1;
        e.preventDefault();
        break;
      case "2":
        if (!video.data?.duration) return;
        mediaPlayer!.currentTime = video.data.duration * 0.2;
        e.preventDefault();
        break;
      case "3":
        if (!video.data?.duration) return;
        mediaPlayer!.currentTime = video.data.duration * 0.3;
        e.preventDefault();
        break;
      case "4":
        if (!video.data?.duration) return;
        mediaPlayer!.currentTime = video.data.duration * 0.4;
        e.preventDefault();
        break;
      case "5":
        if (!video.data?.duration) return;
        mediaPlayer!.currentTime = video.data.duration * 0.5;
        e.preventDefault();
        break;
      case "6":
        if (!video.data?.duration) return;
        mediaPlayer!.currentTime = video.data.duration * 0.6;
        e.preventDefault();
        break;
      case "7":
        if (!video.data?.duration) return;
        mediaPlayer!.currentTime = video.data.duration * 0.7;
        e.preventDefault();
        break;
      case "8":
        if (!video.data?.duration) return;
        mediaPlayer!.currentTime = video.data.duration * 0.8;
        e.preventDefault();
        break;
      case "9":
        if (!video.data?.duration) return;
        mediaPlayer!.currentTime = video.data.duration * 0.9;
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
          dismissEndScreen();
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
          video.refetch();
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
    if (!sponsorsQuery.data) return;
    const segments: Segment[] = [];

    for (let i = 0; i < sponsorsQuery.data.length; i++) {
      const sponsor = sponsorsQuery.data[i];
      if (sponsor.segment) {
        segments.push({
          start: sponsor.segment[0],
          end: sponsor.segment[1],
          manuallyNavigated: false,
          autoSkipped: false,
          title: sponsor.category,
          image: "",
        });
      }
    }
    setSponsorSegments(segments);
  });

  let lastCheckedTime = -1;
  const autoSkipHandler = () => {
    if (!mediaPlayer) return;
    if (sponsorSegments().length === 0) return;

    const currentTime = mediaPlayer.currentTime;
    if (Math.abs(currentTime - lastCheckedTime) < 1) return; // Reduce checks
    lastCheckedTime = currentTime;
    console.log("segment timeupdate");

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
        toast.show(`Skipped segment ${segment.title}`, () => {
          mediaPlayer.currentTime = currentTime;
          segment.manuallyNavigated = true;
          setSponsorSegments(segments);
        });
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
    if (!video.data?.chapters) return;
    const currentTime = mediaPlayer.currentTime;
    let currentChapter: Chapter | undefined;
    for (let i = 0; i < video.data.chapters.length; i++) {
      const chapter = video.data.chapters[i];
      if (
        currentTime >= chapter.start &&
        currentTime < video.data.chapters[i + 1]?.start
      ) {
        currentChapter = chapter;
        break;
      }
    }
    if (!currentChapter) return;
    const prevChapter = video.data.chapters
      .slice()
      .reverse()
      .find((c) => c.start < currentChapter!.start - 1);
    if (!prevChapter) return;
    mediaPlayer.currentTime = prevChapter.start;
  };

  const nextChapter = () => {
    if (!mediaPlayer) return;
    if (!video.data?.chapters) return;
    const currentTime = mediaPlayer.currentTime;
    let currentChapter: Chapter | undefined;
    for (let i = 0; i < video.data.chapters.length; i++) {
      const chapter = video.data.chapters[i];
      if (
        currentTime >= chapter.start &&
        currentTime < video.data.chapters[i + 1]?.start
      ) {
        currentChapter = chapter;
        break;
      }
    }
    if (!currentChapter) return;
    const nextChapter = video.data.chapters.find(
      (c) => c.start > currentChapter!.start
    );
    if (!nextChapter) return;
    mediaPlayer.currentTime = nextChapter.start;
  };
  const [appState, setAppState] = useAppState();

  createEffect(() => {
    if (route.pathname !== "/watch") {
      setAppState("player", "small", true);
    } else {
      setAppState("player", "small", false);
      // If returning to '/watch', the player should not be dismissed
      if (appState.player.dismissed) {
        setAppState("player", "dismissed", false);
      }
    }
  });

  const [isMobilePlayer, setIsMobilePlayer] = createSignal(false);

  const handleSetMobilePlayer = () => {
    const width = mediaPlayer.clientWidth;
    const height = mediaPlayer.clientHeight;
    let mobileHeight = 379;
    let mobileWidth = 590;
    if (searchParams.fullscreen) {
      mobileWidth = 575;
    }
    if (height > mobileHeight && width > mobileWidth) {
      setIsMobilePlayer(false);
    } else {
      setIsMobilePlayer(true);
    }
  };

  createEffect(
    // Fix size not updating when navigating from a different page
    on(
      () => route.pathname,
      () => {
        setTimeout(handleSetMobilePlayer, 0);
      }
    )
  );

  onMount(() => {
    handleSetMobilePlayer();
    const handleFullscreenChange = () => {
      handleSetMobilePlayer();
      if (document.fullscreenElement) {
        setSearchParams({ fullscreen: true }, { replace: true });
        screen.orientation.lock("landscape").catch(() => {});
      } else setSearchParams({ fullscreen: undefined }, { replace: true });
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("resize", handleSetMobilePlayer);

    onCleanup(() => {
      window.removeEventListener("resize", handleSetMobilePlayer);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    });
  });

  function enablePreferredTextTrack(force = false) {
    const playerStorage = JSON.parse(localStorage.getItem("player") ?? "{}");
    console.log("subs", force, playerStorage.captions);
    const tracks = mediaPlayer.textTracks.toArray();
    const preferredLanguages = [
      preferences.playback.defaultCaptionsLanguage,
      preferences.playback.secondaryCaptionsLanguage,
      playerStorage.lang,
      "en",
    ];

    for (const lang of preferredLanguages) {
      if (lang) {
        const track = tracks.find((t) => t.language === lang);
        if (track) {
          if (!force && !playerStorage.captions) {
            playerStorage.lang = lang;
            return;
          }
          track.mode = "showing";
          return;
        }
      }
    }
  }
  const [canAirPlay, setCanAirPlay] = createSignal(false);
  const [canGoogleCast, setCanGoogleCast] = createSignal(false);
  createEffect(() => {
    if (!canPlay()) return; // wait until player has all attributes
    console.log(
      "canGoogleCast",
      mediaPlayer.getAttribute("data-can-google-cast"),
      isMobilePlayer()
    );
    if (mediaPlayer.getAttribute("data-can-airplay") !== null) {
      setCanAirPlay(true);
    } else {
      setCanAirPlay(false);
    }
    if (mediaPlayer.getAttribute("data-can-google-cast") !== null) {
      setCanGoogleCast(true);
    } else {
      setCanGoogleCast(false);
    }
  });

  return (
    <media-player
      keep-alive
      id="player"
      classList={{
        [styles.player]: true,
        "z-[1000] block aspect-video bg-black text-white font-sans overflow-hidden ring-primary data-[focus]:ring-4":
          true,
        "!absolute top-0 left-0 w-screen h-screen":
          !!searchParams.fullscreen && !appState.player.small,
        "!sticky sm:!relative !top-0":
          !searchParams.fullscreen && !appState.player.small,
        "!hidden": !video.data || appState.player.dismissed,
      }}
      aria-hidden={
        appState.player.dismissed || (appState.player.small && !video.data)
      }
      current-time={currentTime()}
      key-disabled
      tabIndex={-1}
      storage="player"
      onMouseMove={() => {
        if (isMobile()) return;
        showControls();
      }}
      onMouseLeave={() => {
        mediaPlayer?.controls.hide(0);
      }}
      on:time-update={(e) => {
        if (e.trigger?.type === "seeked") return;
        autoSkipHandler();
      }}
      on:can-play={onCanPlay}
      on:provider-change={onProviderChange}
      on:hls-error={handleHlsError}
      on:hls-buffer-appended={handleBufferAppended}
      on:ended={handleEnded}
      on:play={() => {
        mediaPlayer.controls.hide(0);
        updateProgressParametrized();
      }}
      on:playing={() => {
        setStarted(true);
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
      on:fullscreen-change={(e) => {
        console.log(e, "fullscreen");
        if (e.detail) {
          console.log(`fullscreen button pressed, entering fullscreen`);
          screen.orientation.lock("landscape").catch(() => {});
          setSearchParams({ fullscreen: true }, { replace: true });
          document.body.scroll({ top: 0, left: 0, behavior: "smooth" });
        } else {
          screen.orientation.unlock();
          setSearchParams({ fullscreen: undefined }, { replace: true });
        }
      }}
      on:hls-subtitle-track-switch={() => enablePreferredTextTrack()}
      hideControlsOnMouseLeave={false}
      ref={mediaPlayer}
      title={video.data?.title ?? ""}
      poster={video.data?.thumbnailUrl ?? ""}
      crossOrigin
      playsInline
      autoPlay={
        appState.player.dismissed ? false : preferences.playback.autoplay
      }
      on:auto-play-fail={() => {
        if (preferences.playback.autoplayMuted) {
          mediaPlayer.muted = true;
          mediaPlayer.play();
        }
      }}
      src={video.data?.hls ?? ""}
      loop={preferences.loop}
      on:media-user-loop-change-request={(e) => {
        setPreferences("loop", e.detail);
      }}
    >
      <media-provider
        id="media-provider"
        class="max-h-screen max-w-screen [&>video]:max-h-screen [&>video]:max-w-screen [&>video]:h-full [&>video]:w-full"
      >
        <media-poster
          aria-hidden="true"
          src={video.data?.thumbnailUrl ?? ""}
          class="absolute z-[1] inset-0 block h-full w-full rounded-md opacity-0 transition-opacity data-[visible]:opacity-100 [&>img]:h-full [&>img]:w-full [&>img]:object-cover"
        />
      </media-provider>
      <Show when={showErrorScreen().show && !showErrorScreen().dismissed}>
        <div
          // classList={{hidden: preferences.pip}}
          class="absolute z-50 top-0 right-0 w-full h-full opacity-100 pointer-events-auto bg-black/50"
        >
          <div class="flex flex-col items-center justify-center w-full h-full gap-3">
            <div class="text-2xl font-bold text-white">
              {hlsError()?.name} {hlsError()?.details}
            </div>
            <div class="flex flex-col">
              <div class="text-lg text-white">{hlsError()?.message}</div>
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
      <Show when={showEndScreen() && !appState.player.small}>
        <div class="absolute z-50 top-0 right-0 w-full h-full pointer-events-auto bg-black/50">
          <div class="flex flex-col items-center justify-center w-full h-full gap-1 py-2">
            <div class="text-2xl font-bold text-white">
              Playing next in {counter()} seconds
            </div>
            <div class="text-lg min-h-0 max-h-full space-y-2">
              <div class="h-[80%] mx-auto min-h-0 max-w-full max-h-full aspect-video relative bg-red-500">
                <img
                  class="absolute w-full h-full object-contain rounded"
                  src={nextVideo()?.thumbnail}
                />
              </div>
              <div>{nextVideo()?.title}</div>
            </div>
            <div class="flex justify-center gap-2">
              <Button
                onClick={() => {
                  dismissEndScreen();
                  playNext();
                }}
                label="Play now (Shift + N)"
              />
              <Button
                appearance="subtle"
                class="bg-bg1"
                onClick={() => {
                  dismissEndScreen();
                }}
                label="Dismiss (Esc)"
              />
            </div>
          </div>
        </div>
      </Show>
      <div
        data-fullscreen={searchParams.fullscreen}
        classList={{
          hidden: route.pathname !== "/watch",
        }}
      >
        <media-video-layout
          style={{
            "--media-focus-ring-color": "rgb(var(--colors-primary))",

            "--media-brand": "rgb(var(--colors-primary))",
          }}
          thumbnails={generateStoryboard(video.data?.previewFrames?.[1])}
        />
        <media-controls
          id="controls"
          classList={{
            "text-[#f5f5f5] z-0 font-sans pointer-events-none media-controls:opacity-100 invisible media-controls:visible  absolute inset-0 flex h-full w-full flex-col bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-300":
              true,
            "z-10": !isMobilePlayer(),
          }}
        >
          <media-controls-group
            classList={{
              "!pointer-events-none -mt-0.5 flex w-full absolute -bottom-[2px] items-center px-2 pb-2 ":
                true,
              "bottom-4": isMobilePlayer(),
            }}
          >
            <div class="flex-1" />
            <FullscreenButton tooltipPlacement="top-end" />
          </media-controls-group>
          <media-controls-group
            classList={{
              "!pointer-events-none flex flex-col h-full relative items-center px-5 my-2 mt-0 justify-start w-[26px] sm:w-[30px]":
                true,
              "mt-10": isMobilePlayer() && (canAirPlay() || canGoogleCast()),
            }}
          >
            <div class="pointer-events-auto flex flex-col items-center justify-between">
              <Show when={searchParams.fullscreen}>
                <Tooltip
                  onClick={() => {
                    const fullscreen = searchParams.fullscreen;
                    const list = searchParams.list;
                    const index = searchParams.index;

                    window.addEventListener(
                      "popstate",
                      () => {
                        setSearchParams({ fullscreen, list, index });
                      },
                      { once: true }
                    );

                    history.back();
                  }}
                  placement="right"
                  openDelay={500}
                  class="ring-primary relative inline-flex h-8 w-8 sm:w-10 sm:h-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 focus-visible:ring-4 disabled:text-gray-300 disabled:cursor-not-allowed"
                  triggerSlot={
                    <FaSolidArrowLeft aria-label="Back" class="h-6 w-6" />
                  }
                  contentSlot={
                    <>
                      <span>Back</span>
                    </>
                  }
                />
              </Show>
              <RecommendedVideosMenu
                tooltipPlacement="right center"
                placement="bottom start"
                videos={queueVideos()}
                currentVideoId={getVideoId(video.data)!}
              />
              <div class="w-24 flex flex-col items-center justify-between">
                <PrevButton
                  tooltipPlacement="right"
                  onClick={playPrev}
                  disabled={!prevVideo()}
                />
                <div class="h-px w-6 bg-text1/50" />
                <NextButton
                  tooltipPlacement="right"
                  onClick={playNext}
                  disabled={!nextVideo()}
                />
              </div>
            </div>
          </media-controls-group>
        </media-controls>
      </div>
      {/* <VideoLayout */}
      {/*   thumbnails={generateStoryboard(video.data?.previewFrames?.[1])} */}
      {/* /> */}
      <Show when={video.data && appState.player.small && !appState.smallDevice}>
        <PiPLayout />
      </Show>
    </media-player>
  );
}

export const PlayerLoading = () => {
  const video = useVideoContext();
  const [appState] = useAppState();
  const [searchParams] = useSearchParams();
  const route = useLocation();
  return (
    <Show when={route.pathname === "/watch"}>
      <div
        classList={{
          "z-[1000] rounded flex aspect-video justify-center items-center bg-black text-white font-sans overflow-hidden ring-primary data-[focus]:ring-4":
            true,
          "!absolute top-0 left-0 w-full h-screen max-w-screen":
            !!searchParams.fullscreen && !appState.player.small,
          "!sticky sm:!relative !top-0": !searchParams.fullscreen,
          "!hidden": appState.player.dismissed || appState.player.small,
        }}
      >
        <Spinner class="!text-primary" />
      </div>
    </Show>
  );
};
