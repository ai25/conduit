
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
import { TbX } from "solid-icons/tb";
import { useAppState } from "~/stores/appStateStore";

export function PiPLayout() {
  const [appState, setAppState] = useAppState();
  return (
    <>
      <div class="lg:flex">
      <Captions />
      </div>
      <media-controls
        class={`${styles.controls} font-sans media-controls:opacity-100 invisible media-controls:visible  absolute inset-0 z-10 flex h-full w-full flex-col bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity`}
      >
        <media-controls-group class="flex w-full items-center px-2 my-2 justify-between h-[30px]">
          <div class="flex items-center justify-between">
            <Button appearance="subtle"
              class="hover:bg-white/20 rounded-md p-0"
              icon={<TbX class="h-8 w-8 text-white " />}
              onClick={() => {
                setAppState("player", "dismissed", true);
              }}
            />
          </div>
          <div class="flex items-center justify-between">
          </div>
        </media-controls-group>

        <div class="flex-1" />
        <media-controls-group class="lg:flex w-full items-center px-2 hidden ">
          <TimeSlider />
        </media-controls-group>
        <media-controls-group class="-mt-0.5 flex w-full items-center px-2 pb-2">
          <PlayButton tooltipPlacement="top start" />
          <MuteButton tooltipPlacement="top" />
          <VolumeSlider />
          <TimeGroup />
          <ChapterTitle />
          <CaptionButton tooltipPlacement="top" />
          <FullscreenButton tooltipPlacement="top-end" />
        </media-controls-group>
      </media-controls>
    </>
  );
}

