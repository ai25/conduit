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

const VideoContext = createContext<CreateQueryResult<PipedVideo, Error>>();
export const VideoContextProvider = (props: { children: any }) => {
  const [videoId, setVideoId] = createSignal<string | undefined>(undefined);
  const [searchParams] = useSearchParams();
  const [preferences] = usePreferences();
  createEffect(() => {
    notifyManager.setScheduler(requestAnimationFrame);
    if (!searchParams.v) return;
    setVideoId(searchParams.v);
  });
  const videoQuery = createQuery(() => ({
    queryKey: ["streams", videoId(), preferences.instance.api_url],
    queryFn: () => api.fetchVideo(videoId(), preferences.instance.api_url),
    enabled: videoId() && preferences.instance.api_url ? true : false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    cacheTime: Infinity,
    staleTime: 100 * 60 * 1000,
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
