import { createContext, createEffect, on, onMount, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { getStorageValue, setStorageValue } from "~/utils/storage";

const preferences = createStore({
  autoplay: false,
  pip: false,
  muted: false,
  volume: 1,
  speed: 1,
  quality: "auto",
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
});
const PreferencesContext = createContext(preferences);
export const PreferencesProvider = (props: { children: any }) => {
  onMount(() => {
    preferences[1](
      getStorageValue("preferences", preferences[0], "json", "localStorage")
    );
  });
  createEffect(() => {
    console.log(preferences[0], "preferences changed");
    setStorageValue("preferences", preferences[0], "localStorage");
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
