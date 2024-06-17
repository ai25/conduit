// type PlayerStateContextType = PlayerSto

import {
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import { MediaState } from "vidstack";
import { MediaPlayerElement } from "vidstack/elements";

const PlayerStateContext = createContext<
  Readonly<MediaState> | Partial<MediaState>
>({});

export const PlayerStateProvider = (props: { children: any }) => {
  const [playerState, setPlayerState] = createStore<
    Readonly<MediaState> | Partial<MediaState>
  >({});
  const [player, setPlayer] = createSignal<MediaPlayerElement | null>();

  createEffect(() => {
    if (!player()) {
      setTimeout(() => {
        setPlayer(document.querySelector("media-player"));
      }, 1000);
    }
  });
  let unsubscribe: () => void | undefined;

  onMount(() => {
    document.addEventListener("canplay", () => {
      console.log(player(), "gogg", document.querySelector("media-player"));
    });
    // setTimeout(() => {
    //   console.log(player(), "gogg", document.querySelector("media-player"));
    // }, 1000);
  });
  createEffect(() => {
    if (!player()) return;
    unsubscribe = player()!.subscribe(
      ({ paused, canAirPlay, canGoogleCast }) => {
        console.log(canGoogleCast, "gogg");
        setPlayerState({ paused, canGoogleCast, canAirPlay });
      }
    );
  });

  onCleanup(() => {
    unsubscribe?.();
  });

  return (
    <PlayerStateContext.Provider value={playerState}>
      {props.children}
    </PlayerStateContext.Provider>
  );
};

export const usePlayerState = () => {
  const context = useContext(PlayerStateContext);
  return context;
};
