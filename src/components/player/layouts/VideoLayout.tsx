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
import { LoopButton } from "../buttons/LoopButton";
import { ChaptersMenu } from "../menus/ChaptersMenu";

export function VideoLayout(props: VideoLayoutProps) {
  return (
    <>
      <Gestures />
      <Captions />
      <media-controls
        class={`${styles.controls} media-controls:opacity-100 absolute inset-0 z-10 flex h-full w-full flex-col bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity`}
      >
        <media-controls-group class="flex w-full items-center px-2 justify-end h-[30px]">
          <ChaptersMenu placement="bottom" tooltipPlacement="bottom" />
        </media-controls-group>

        <div class="flex-1" />
        <media-controls-group class="flex w-full items-center px-2">
          <TimeSlider thumbnails={props.thumbnails} />
        </media-controls-group>
        <media-controls-group class="-mt-0.5 flex w-full items-center px-2 pb-2">
          <PlayButton tooltipPlacement="top start" />
          <MuteButton tooltipPlacement="top" />
          <VolumeSlider />
          <TimeGroup />
          <ChapterTitle />
          <div class="flex-1" />
          <LoopButton
            tooltipPlacement="top"
            loop={props.loop}
            onChange={props.onLoopChange}
          />
          <SettingsMenu placement="top end" tooltipPlacement="top" />
          <CaptionButton tooltipPlacement="top" />
          <PIPButton tooltipPlacement="top" />
          <FullscreenButton tooltipPlacement="top end" />
        </media-controls-group>
      </media-controls>
    </>
  );
}

export interface VideoLayoutProps {
  thumbnails: string;
  loop: boolean;
  onLoopChange: (loop: boolean) => void;
}
