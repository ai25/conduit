
import styles from "./VideoLayout.module.css";

import { CaptionButton } from "../buttons/CaptionButton";
import { FullscreenButton } from "../buttons/FullscreenButton";
import { MuteButton } from "../buttons/MuteButton";
import { PIPButton } from "../buttons/PipButton";
import { PlayButton } from "../buttons/PlayButton";
import { Captions } from "../Captions";
import { ChapterTitle } from "../ChapterTitle";
import { Gestures } from "../Gestures";
import { SettingsMenu } from "../menus/SettingsMenu";
import { TimeSlider } from "../sliders/TimeSlider";
import { VolumeSlider } from "../sliders/VolumeSlider";
import { TimeGroup } from "../TimeGroup";
import Button from "~/components/Button";
import { TbArrowUpLeft, TbCrosshair, TbX } from "solid-icons/tb";
import { useAppState } from "~/stores/appStateStore";
import { useNavigate, useSearchParams } from "solid-start";
import { createQuery, isServer } from "@tanstack/solid-query";
import { createEffect, createSignal } from "solid-js";
import { usePreferences } from "~/stores/preferencesStore";
import api from "~/utils/api";

export function PiPLayout() {
  const [appState, setAppState] = useAppState();
  const navigate = useNavigate()
  const [v, setV] = createSignal<string | undefined>(undefined);
  const [searchParams] = useSearchParams() 
  const [preferences] = usePreferences();
  createEffect(() => {
    console.log(searchParams.v, "searchParams.v")
    if (!searchParams.v) return;
    setV(searchParams.v);
  });

  return (
    <div classList={{
      "hidden": appState.player.dismissed || !appState.player.small
    }}
    >
      
      <media-gesture
        class="absolute inset-0 z-0 block h-full w-full"
        event="pointerup"
        action="toggle:controls"
      />
      <div class="lg:flex">
        <Captions />
      </div>
      <media-controls
        class={`${styles.controls} font-sans media-controls:opacity-100 invisible media-controls:visible  absolute inset-0 z-10 flex h-full w-full flex-col bg-black/10 to-transparent opacity-0 transition-opacity`}
      >
        <media-controls-group class="flex w-full items-center px-2 my-2 justify-between h-[30px]">
          <div class="flex items-center justify-between">
            <Button appearance="subtle"
              class="hover:bg-white/20 rounded-md p-0 w-10 h-10 flex items-center justify-center"
              icon={<TbX class="h-8 w-8 text-white " />}
              onClick={() => {
                const mediaPlayer = document.querySelector("media-player");
                mediaPlayer?.pause();
                setAppState("player", "dismissed", true);
              }}
            />
          </div>
          <div class="flex items-center justify-between h-4">
            <Button appearance="subtle"
              class="hover:bg-white/20 rounded-md p-0 h-10 w-10 flex items-center justify-center"
              icon={<TbArrowUpLeft class="text-white w-8 h-8 min-w-max" />}
              onClick={() => {
                if (!v()) return;
                navigate(`/watch?v=${v()}`);
              }
              }
            />

          </div>
        </media-controls-group>
        <media-controls-group >
          <div class="absolute inset-0 pointer-events-none flex items-center justify-center">

          <media-play-button class="ring-primary relative pointer-events-auto inline-flex h-16 w-16 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4">
            <media-icon class="media-paused:block hidden h-12 w-12" type="play" />
            <media-icon class="media-paused:hidden h-12 w-12" type="pause" />
          </media-play-button>
          </div>
        </media-controls-group>

        <div class="flex-1" />
        <media-controls-group class="lg:flex w-full items-center px-2 hidden ">
          <TimeSlider />
        </media-controls-group>
        <media-controls-group class="-mt-0.5 flex w-full justify-between lg:justify-center gap-1 items-center px-2 pb-2">
          <MuteButton tooltipPlacement="top" />
          <div class="hidden lg:inline-flex">
            <TimeGroup />
          </div>
          <CaptionButton tooltipPlacement="top" />
        </media-controls-group>
      </media-controls>
    </div>
  );
}

