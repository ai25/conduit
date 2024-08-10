import {
  createContext,
  createEffect,
  createRenderEffect,
  on,
  onMount,
  useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import { LANGUAGES, VIDEO_RESOLUTIONS } from "~/config/constants";
import { getStorageValue, setStorageValue } from "~/utils/storage";

export const DEFAULT_PREFERENCES = {
  __init: true,
  theme: "monokai",
  pip: false,
  loop: false,
  theatreMode: false,
  instance: {
    name: "Piped",
    api_url: "https://pipedapi.kavin.rocks",
    cache: true,
    cdn: true,
    last_checked: new Date().getTime(),
    locations: "",
    version: "0.0.0",
    registered: 0,
    s3_enabled: false,
    up_to_date: false,
    image_proxy_url: "https://pipedproxy.kavin.rocks",
  },
  sync: {
    enabled: true,
    history: true,
    subscriptions: true,
    playlists: true,
    watchLater: true,
    blocklist: true,
    preferences: false,
  },
  content: {
    defaultHomePage: "Trending" as "Feed" | "Trending",
    displayShorts: true,
    trendingRegion: "US",
    hideRelated: false,
    hideComments: false,
  },
  history: {
    saveWatchHistory: true,
    saveSearchHistory: true,
    maxSearchHistory: 10,
  },
  playback: {
    autoplay: false,
    autoplayMuted: false,
    preferedQuality: "Auto",
    defaultCaptionsEnabled: false,
    defaultCaptionsLanguage: "en",
    secondaryCaptionsLanguage: undefined as string | undefined,
  },
  customInstances: [] as CustomInstance[],
  dearrow: false,
};
interface CustomInstance {
  name: string;
  api_url: string;
  image_proxy_url: string;
}
const preferences = createStore(DEFAULT_PREFERENCES);
const PreferencesContext = createContext(preferences);
export const PreferencesProvider = (props: { children: any }) => {
  onMount(() => {
    const prefs = {
      ...DEFAULT_PREFERENCES,
      ...getStorageValue(
        "preferences",
        DEFAULT_PREFERENCES,
        "json",
        "localStorage"
      ),
      __init: false,
    };
    preferences[1](prefs);
  });
  createEffect(() => {
    console.log(preferences[0], "preferences changed");
    setStorageValue(
      "preferences",
      { ...preferences[0], __init: false },
      "localStorage"
    );
  });

  return (
    <PreferencesContext.Provider value={preferences}>
      {props.children}
    </PreferencesContext.Provider>
  );
};
export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  return context;
};
