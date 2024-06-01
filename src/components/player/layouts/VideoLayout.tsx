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
import { NextButton } from "../buttons/NextButton";
import { PrevButton } from "../buttons/PrevButton";
import { ChaptersMenu } from "../menus/ChaptersMenu";
import { Show, createEffect, createSignal } from "solid-js";
import { RecommendedVideosMenu } from "../menus/RecommendedVideosMenu";
import { RelatedStream } from "~/types";
import { FaSolidChevronLeft } from "solid-icons/fa";
import { Tooltip } from "~/components/Tooltip";
import { useSearchParams } from "@solidjs/router";

export function VideoLayout(props: VideoLayoutProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <div
      hidden={props.hidden}
      classList={{
        hidden: props.hidden,
      }}
    >
      <Gestures />
      <Captions />
      <media-controls
        class={`${styles.controls} font-sans media-controls:opacity-100 invisible media-controls:visible  absolute inset-0 z-10 flex h-full w-full flex-col bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity`}
      >
        <media-controls-group class="flex w-full items-center px-2 my-2 justify-between h-[30px]">
          <div class="flex items-center justify-between">
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
                placement="bottom"
                openDelay={500}
                class="ring-primary relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 focus-visible:ring-4 disabled:text-gray-300 disabled:cursor-not-allowed"
                triggerSlot={
                  <media-icon
                    aria-label="Prev"
                    class="h-10 w-10"
                    type="chevron-left"
                  />
                }
                contentSlot={
                  <>
                    <span>Back</span>
                  </>
                }
              />
            </Show>
            <RecommendedVideosMenu
              tooltipPlacement="bottom"
              placement="bottom start"
              videos={props.playlist}
              currentVideoId={props.currentVideoId}
            />
            <div class="w-24 flex items-center justify-between">
              <PrevButton
                tooltipPlacement="bottom"
                onClick={props.navigatePrev}
                disabled={!props.navigatePrev}
              />
              <div class="w-px h-6 bg-text1/50" />
              <NextButton
                tooltipPlacement="bottom"
                onClick={props.navigateNext}
                disabled={!props.navigateNext}
              />
            </div>
          </div>
          <div class="flex items-center justify-between">
            <Show when={props.hasChapters}>
              <ChaptersMenu
                placement="bottom end"
                tooltipPlacement="bottom"
                thumbnails={props.thumbnails}
              />
            </Show>
            <SettingsMenu placement="bottom end" tooltipPlacement="bottom" />
          </div>
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
          <ChapterTitle
            hasChapters={props.hasChapters ? true : false}
            title={props.title}
          />
          <LoopButton
            tooltipPlacement="top"
            loop={props.loop}
            onChange={props.onLoopChange}
          />
          <CaptionButton tooltipPlacement="top" />
          <PIPButton tooltipPlacement="top" />
          <FullscreenButton tooltipPlacement="top-end" />
        </media-controls-group>
      </media-controls>
    </div>
  );
}

export interface VideoLayoutProps {
  thumbnails: string;
  loop: boolean;
  onLoopChange: (loop: boolean) => void;
  hasChapters?: boolean;
  navigatePrev?: () => void;
  navigateNext?: () => void;
  playlist?: RelatedStream[];
  title?: string;
  hidden?: boolean;
  currentVideoId: string;
}
