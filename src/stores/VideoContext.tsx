import { useSearchParams } from "@solidjs/router";
import {
  CreateQueryResult,
  createQuery,
  notifyManager,
} from "@tanstack/solid-query";
import {
  createContext,
  createEffect,
  createSignal,
  useContext,
} from "solid-js";
import { usePreferences } from "./preferencesStore";
import api from "~/utils/api";
import { PipedVideo } from "~/types";
import { useAppState } from "./appStateStore";
import { isServer } from "solid-js/web";
import { getHlsManifest, getStreams } from "~/utils/hls";

const VideoContext = createContext<CreateQueryResult<PipedVideo, Error>>();
export const VideoContextProvider = (props: { children: any }) => {
  const [videoId, setVideoId] = createSignal<string | undefined>(undefined);
  const [searchParams] = useSearchParams();
  const [preferences] = usePreferences();
  const [appState] = useAppState();
  createEffect(() => {
    notifyManager.setScheduler(requestAnimationFrame);
    if (!searchParams.v) return;
    setVideoId(searchParams.v);
  });

  const getOfflineVideo = async () => {
    if (!searchParams.v) throw new Error("no video id");

    const downloaded = await getStreams(searchParams.v);
    if (downloaded) {
      const manifest = await getHlsManifest(searchParams.v);
      return { ...downloaded, hls: manifest, relatedStreams: [] };
    }
  };

  const videoQuery = createQuery(() => ({
    queryKey: ["streams", videoId(), preferences.instance.api_url],
    queryFn: searchParams.offline
      ? getOfflineVideo
      : () => api.fetchVideo(videoId(), preferences.instance.api_url),
    enabled:
      !isServer &&
      videoId() &&
      !appState.player.dismissed &&
      (searchParams.offline || preferences.instance.api_url)
        ? true
        : false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    cacheTime: Infinity,
    staleTime: 100 * 60 * 1000,
    suspense: false,
  }));

  return (
    <VideoContext.Provider value={videoQuery}>
      {props.children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error(
      "useVideoContext must be used within a VideoContextProvider"
    );
  }
  return context;
};
