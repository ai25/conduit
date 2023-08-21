// type PlayerStateContextType = PlayerSto

import { createContext, createEffect, createSignal, onCleanup, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { MediaPlayerElement, MediaState } from "vidstack";
import { Dispose } from 'maverick.js';

const PlayerStateContext = createContext<Readonly<MediaState>|Partial<MediaState>>({});

export const PlayerStateProvider = (props: { children: any }) => {
  const [playerState, setPlayerState] = createStore<Readonly<MediaState>| Partial<MediaState>>({});
  const [player, setPlayer] = createSignal<MediaPlayerElement | null>();

  createEffect(() => {
    if (!player()) {
      setPlayer(document.querySelector("media-player"));
    }
  });
  let unsubscribe: Dispose | undefined;

  createEffect(() => {
    console.log( "attac")
    if (!player()) return;
    player()!.onAttach(() => {
        console.log("Attached");
      unsubscribe = player()!.subscribe(({paused}) => {
        // console.log("Paused:", paused);
        // console.log("Playing:", state.);
        setPlayerState({paused});
        console.log("setting player state attac",paused)
      });

    });
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
}
