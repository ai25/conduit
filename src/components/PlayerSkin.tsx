import type { Chapter, PipedVideo, RelatedStream } from "~/types";
import "vidstack/icons";
import {
  For,
  createEffect,
  createSignal,
  on,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";
import { A } from "solid-start";
import { MediaGestureElement, MediaPlayerElement, MediaRemoteControl } from "vidstack";
import { MediaIconElement } from "vidstack/icons";
import { PreferencesContext } from "~/root";
import { usePlaylist } from "~/stores/playlistStore";
import { useQueue } from "~/stores/queueStore";
import PlaylistItem from "./PlaylistItem";
import { usePlayerState } from "~/stores/playerStateStore";

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      "media-gesture": MediaGestureElement;
      "media-mute-button": any;
      "media-icon": MediaIconElement;
      "media-tooltip": any;
      "media-control-group": any;
      "media-control": any;
      "media-slider": any;
      "media-slider-thumb": any;
      "media-slider-track": any;
      "media-slider-fill": any;
      "media-time-slider": any;
      "media-slider-value": any;
      "media-slider-video": any;
      "media-live-indicator": any;
      "media-volume-slider": any;
      "media-play-button": any;
      "media-time": any;
      "media-fullscreen-button": any;
      "media-pip-button": any;
      "media-menu": any;
      "media-menu-items": any;
      "media-menu-button": any;
      "media-captions-menu-items": any;
      "media-chapters-menu-items": any;
      "media-settings-menu-items": any;
      "media-quality-menu-items": any;
      "media-playback-rate-menu-items": any;
      "media-caption-button": any;
      "media-audio-menu-button": any;
      "media-audio-menu-items": any;
      "media-toggle-button": any;
      "media-slider-thumbnail": any;
    }
  }
}

interface PlayerSkinProps {
  video: PipedVideo | null | undefined;
  nextVideo?: { url: string; info: RelatedStream } | null;
}
export default function PlayerSkin({ video, nextVideo }: PlayerSkinProps) {
  const [currentChapter, setCurrentChapter] = createSignal("");
  const [player, setPlayer] = createSignal<MediaPlayerElement | null>();
  const [preferences, setPreferences] = useContext(PreferencesContext);

  let interval: any;
  createEffect(() => {
    if (!video?.chapters) return;
    setPlayer(document.querySelector("media-player"));
    if (!player()) return;
    interval = setInterval(() => {
      const currentTime = player()!.state.currentTime;
      const chapter = video.chapters.find((chapter, index) => {
        if (
          chapter.start <= currentTime &&
          currentTime <= video.chapters[index + 1]?.start
        ) {
          return true;
        }
      });
      if (chapter) {
        setCurrentChapter(chapter.title);
      }
    }, 1000);
  });

  onCleanup(() => {
    clearInterval(interval);
  });

  const [currentAction, setCurrentAction] = createSignal({
    name: "",
    value: "",
  });

  const [playlist] = usePlaylist();
  const queueStore = useQueue();

  const videos = () => {
    if (playlist()) {
      if (Array.isArray(playlist()!.videos)) return playlist()!.videos;
      else return playlist()!.relatedStreams;
    } else if (queueStore.queue()) {
      return queueStore.queue();
    } else return [];
  };

  const playerState = usePlayerState()
  const remote = new MediaRemoteControl()

  return (
    <div
      tabIndex={0}
      class="pointer-events-none absolute inset-0 z-10 h-full "
      role="group"
      aria-label="Media Controls">
      <div class="absolute top-0 left-0 z-0 pointer-events-auto w-full h-full">
        <CenterGesture
          onDblClick={() => {
            if (!player()) return;
            player()!.paused = !player()!.paused;
            setCurrentAction({
              name: player()!.paused ? "play" : "pause",
              value: "",
            });
          }}
          onPointerDown={() => {
            if (!player()) return;
            // console.log("pointer down attac", remote.resumeUserIdle());
            // remote.resumeUserIdle()
          }}
        />
        <BufferingIndicator />
        <LeftGesture
          onDblClick={() => {
            if (!player()) return;
            if (Math.floor(player()!.currentTime) === 0) return;
            player()!.currentTime -= 10;
            setCurrentAction({ name: "seek-", value: "-10" });
          }}
        />
        <RightGesture
          playerHeight={
            parseInt(
              player()?.style.getPropertyValue("--media-height") ?? ""
            ) || 0
          }
          volume={player()?.volume || 0}
          setVolume={(v: number) => {
            if (!player()) return;
            player()!.volume = v;
            setCurrentAction({
              name: "volume",
              value: Math.floor(v * 100).toString() + "%",
            });
          }}
          onDblClick={() => {
            if (!player() || !video) return;
            if (player()!.currentTime + 1 > video.duration) return;
            player()!.currentTime += 10;
            setCurrentAction({ name: "seek+", value: "10" });
          }}
        />
        <ActionDisplay action={currentAction()} />
      </div>

      <div class="pointer-events-none absolute inset-0 z-10 flex h-full flex-col justify-between text-text1 opacity-0 transition-opacity duration-200 ease-linear not-can-play:opacity-100 can-control:opacity-100">
        <div class="pointer-events-none absolute inset-0 z-0 h-full w-full bg-gradient-to-t from-black/50 from-5% via-transparent via-50% to-black/20 to-100%" />

        {/* Top Controls */}
        <MediaControlGroup>
          <div class="z-10 flex w-36 justify-center rounded-full bg-bg1/50 items-center font-sans text-lg font-normal text-white not-can-play:opacity-0">
            <div class="group flex items-center">
              <RecommendedVideosMenu videos={videos()} />
              <div class="relative w-0 h-1 opacity-0 self-end group-hover:opacity-100 transition-all scale-0 group-hover:scale-100 origin-top-left">
                <div class="absolute top-2 -left-10 bg-bg1/50 h-max w-max rounded-lg py-2 px-3">
                  <div class="text-sm text-text1 mb-1">
                    Playing from {playlist() ? playlist()!.name : "queue."}
                  </div>
                </div>
              </div>
            </div>
            <div class="w-24 flex items-center justify-between">
              <div class="h-10 w-10 ">
                <button
                  role="button"
                  aria-label="Previous Video"
                  onClick={() => {
                    history.back();
                  }}
                  disabled={
                    !playlist() ||
                    queueStore.isEmpty() ||
                    queueStore.isCurrentLast()
                  }
                  class="disabled:text-text1/50">
                  <media-icon type="chevron-left" />
                </button>
              </div>
              <div class="w-px h-6 bg-text1/50" />
              <div class="h-10 w-10 ">
                <A
                  aria-disabled={!nextVideo}
                  href={`${nextVideo?.url ?? ""}`}
                  role="button"
                  aria-label="Next Video"
                  class="disabled:text-text1/50 text-text1 peer">
                  <media-icon type="chevron-right" />
                </A>
                <div class="relative w-0 h-1 opacity-0 peer-hover:opacity-100 transition-all scale-0 peer-hover:scale-100 origin-top-left">
                  <div class="absolute top-2 left-0 bg-bg1/50 h-max w-max rounded-lg py-2 px-3">
                    <div class="text-sm text-text1 mb-1">Next (Shift + N):</div>
                    <div class="flex gap-2 items-center">
                      <img
                        class="h-18 w-32 shrink-0 rounded-md bg-bg1"
                        src={video?.relatedStreams[0]?.thumbnail}
                      />
                      <div class="ml-2 flex grow flex-col">
                        <div class="text-sm text-text1 truncate">
                          {video?.relatedStreams[0]?.title}
                        </div>
                        <div class="text-xs text-text1/50">
                          {video?.relatedStreams[0]?.uploaderName}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex w-max items-center justify-end">
            <media-mute-button class="group peer flex h-10 w-10 items-center justify-center rounded-sm text-white outline-none sm:hidden">
              <media-icon
                type="mute"
                class="hidden group-data-[volume=muted]:block group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
              />
              <media-icon
                type="volume-low"
                class="hidden group-data-[volume=low]:block group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
              />
              <media-icon
                type="volume-high"
                class="hidden group-data-[volume=high]:block group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
              />
              <media-tooltip
                position="bottom center"
                class="bg-bg1/90 rounded-md text-text1">
                <span class="hidden not-muted:inline">Mute</span>
                <span class="hidden muted:inline">Unmute</span>
              </media-tooltip>
            </media-mute-button>
            <ChaptersMenu chapters={video?.chapters} />
            <SettingsMenu />
          </div>
        </MediaControlGroup>

        {/* Centre Controls */}
        <div class="flex min-h-[48px] w-full p-2 items-center justify-center">
          <media-play-button
            aria-keyshortcuts="k Space"
            class="group pointer-events-auto buffering:opacity-0 duration-500 text-white rounded-full bg-black/30 outline-none flex sm:hidden justify-center items-center transition-all relative h-20 w-20"
            aria-label="Play">
            <media-icon
              type="play"
              class="hidden ring-0 paused:block group-data-[focus]:ring-4 group-data-[focus]:ring-primary  "
            />
            <media-icon
              type="pause"
              class="hidden ring-0 not-paused:block group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
            />
          </media-play-button>
        </div>

        {/* Bottom Controls */}
        <div class="pointer-events-none z-10 flex w-full max-w-full shrink flex-col px-2 pb-2 can-control:pointer-events-auto not-can-play:opacity-0 transition-all">
          <div class="flex items-center">
            <media-live-indicator class="flex group h-4 w-10 rounded-sm py-px px-1 tracking-widest text-sm uppercase items-center justify-center text-white not-live:hidden bg-gray-400 live-edge:bg-red-500 live-edge:text-white">
              live
            </media-live-indicator>
            <media-time-slider
              class="group peer flex h-8 w-full z-10 items-center"
              track-class="group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
              track-fill-class="z-20 bg-primary "
              track-progress-class="z-10"
              thumb-container-class="z-20"
              thumb-class="bg-primary"
              chapters-class=""
              chapter-container-class=""
              chapter-class="">
              <div class="" slot="preview">
                {/* <media-slider-video
                  src={video?.videoStreams.find((s) => s.bitrate < 400000)?.url}
                  onError={console.error}
                  class="rounded-lg border-black -mb-1"
                /> */}
                <media-slider-thumbnail class="rounded-lg border-2 ring-inset border-bg1 -mb-1 " />
                <media-slider-value
                  type="pointer"
                  format="time"
                  class="z-50 bg-bg1/90 rounded-md text-text1"
                />
                <div class="bg-bg1/90 rounded-md  px-3 mt-1">
                  <span class="text-text1" part="chapter-title" />
                </div>
              </div>
            </media-time-slider>
          </div>

          <div class="flex items-center px-2 w-full z-10">
            <media-play-button
              aria-keyshortcuts="k Space"
              class="group hidden sm:inline-flex"
              aria-label="Play">
              <media-icon
                type="play"
                class="hidden paused:block group-data-[focus]:ring-4 group-data-[focus]:ring-primary  "
              />
              <media-icon
                type="pause"
                class="hidden not-paused:block group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
              />
              {/* <media-icon
                  type="replay"
                  class="hidden ring-0 ended:block group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
                /> */}
              <media-tooltip class="bg-bg1/90 rounded-md text-text1">
                <span class="hidden paused:inline">Play (k)</span>
                <span class="hidden not-paused:inline">Pause (k)</span>
              </media-tooltip>
            </media-play-button>
            <media-mute-button
              aria-keyshortcuts="m"
              class="group peer hidden sm:flex">
              <media-icon
                type="mute"
                class="hidden group-data-[volume=muted]:block group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
              />
              <media-icon
                type="volume-low"
                class="hidden group-data-[volume=low]:block group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
              />
              <media-icon
                type="volume-high"
                class="hidden group-data-[volume=high]:block group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
              />
              <media-tooltip class="bg-bg1/90 rounded-md text-text1">
                <span class="hidden not-muted:inline">Mute (m)</span>
                <span class="hidden muted:inline">Unmute (m)</span>
              </media-tooltip>
            </media-mute-button>
            <media-volume-slider
              aria-keyshortcuts="ArrowUp ArrowDown"
              key-step="5"
              shift-key-multiplier="2"
              class="group hidden sm:inline-block transition-all duration-200 max-w-0 hover:max-w-[5rem] peer-hover:max-w-[5rem] data-[hocus]:max-w-[5rem] peer-data-[hocus]:max-w-[5rem] "
              track-class="hidden group-data-[hocus]:block group-data-[hocus]:ring-4 group-data-[hocus]:ring-primary"
              track-fill-class="z-20"
              thumb-container-class="z-20"
              thumb-class="bg-primary">
              <div class="" slot="preview">
                <media-slider-value
                  class="bg-bg1/90 rounded-md text-text1"
                  type="pointer"
                  format="percent"
                />
              </div>
            </media-volume-slider>
            <div class="flex items-center">
              <media-time
                type="current"
                class="items-center px-1 text-sm text-white"
              />
              /
              <media-time
                type="duration"
                class="items-center px-1 text-sm text-white"
              />
            </div>

            <div class="inline-flex flex-1 truncate items-center">
              <div
                class="text-white z-10"
                classList={{ hidden: !currentChapter() }}>
                •{" "}
                <span
                  part="chapter-title"
                  class="z-10 truncate pl-1 font-sans text-sm font-normal text-white ">
                  {currentChapter() ?? video?.title}
                </span>
              </div>
            </div>
            <media-caption-button
              aria-keyshortcuts="c"
              aria-label="Captions"
              class="group z-10 inline-flex h-10 w-10 items-center justify-center rounded-sm text-white outline-none ">
              <media-icon
                class="not-captions:block hidden group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
                type="closed-captions"></media-icon>
              <media-icon
                class="captions:block hidden group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
                type="closed-captions-on"></media-icon>
              <media-tooltip
                class="bg-bg1/90 rounded-md text-text1"
                position="top center">
                <span slot="on">Closed-Captions On</span>
                <span slot="off">Closed-Captions Off</span>
              </media-tooltip>
            </media-caption-button>
            <media-toggle-button
              onClick={() => {
                console.log("toggle", preferences.theatreMode);
                setPreferences((state) => ({
                  theatreMode: !state.theatreMode,
                }));
              }}
              aria-keyshortcuts="t"
              aria-label="Theatre Mode"
              class="group z-10 hidden lg:inline-flex fullscreen:hidden h-10 w-10 items-center justify-center rounded-sm text-white outline-none ">
              <media-icon
                classList={{
                  hidden: preferences.theatreMode,
                  block: !preferences.theatreMode,
                }}
                class="group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
                type="theatre-mode"></media-icon>
              <media-icon
                classList={{
                  hidden: !preferences.theatreMode,
                  block: preferences.theatreMode,
                }}
                class="group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
                type="theatre-mode-exit"></media-icon>
              <media-tooltip
                class="bg-bg1/90 rounded-md text-text1"
                position="top center">
                <span slot="on">Theatre Mode On</span>
                <span slot="off">Theatre Mode Off</span>
              </media-tooltip>
            </media-toggle-button>
            <FullscreenButton />
          </div>
        </div>
      </div>
    </div>
  );
}

const ActionDisplay = (props: { action: { name: string; value: string } }) => {
  const [name, setName] = createSignal("");
  const [value, setValue] = createSignal("");

  let timeout: any;
  let acc = 0;
  createEffect(() => {
    let v = () => {
      if (props.action.name === "seek+") {
        acc += parseInt(props.action.value);
        return `${acc}s`;
      } else if (props.action.name === "seek-") {
        console.log(props.action.value, parseInt(props.action.value));
        acc -= parseInt(props.action.value);
        return `-${acc}s`;
      } else return props.action.value;
    };
    clearTimeout(timeout);
    setName(props.action.name);
    setValue(v());
    timeout = setTimeout(() => {
      setName("");
      setValue("");
      acc = 0;
    }, 350);
  });
  onCleanup(() => {
    clearTimeout(timeout);
  });

  return (
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        classList={{
          "opacity-0 scale-50": name() == "",
          "opacity-100 scale-100": !!name(),
        }}
        class="flex items-center flex-col justify-center transition-all ease-in-out w-28 h-28 bg-bg1/50 rounded-full ">
        <div class="w-16 h-16 font-bold text-text1">
          <media-icon
            class="absolute w-16 h-16"
            type="mute"
            classList={{
              "opacity-0": !(name() === "volume" && parseInt(value()) === 0),
            }}></media-icon>
          <media-icon
            class="absolute w-16 h-16"
            type="volume-low"
            classList={{
              "opacity-0": !(
                name() === "volume" &&
                parseInt(value()) < 50 &&
                parseInt(value()) > 0
              ),
            }}></media-icon>
          <media-icon
            class="absolute w-16 h-16"
            type="volume-high"
            classList={{
              "opacity-0": !(name() === "volume" && parseInt(value()) >= 50),
            }}></media-icon>
          <media-icon
            class="absolute w-16 h-16"
            type="fast-forward"
            classList={{ "opacity-0": name() !== "seek+" }}></media-icon>
          <media-icon
            class="absolute w-16 h-16"
            type="fast-backward"
            classList={{ "opacity-0": name() !== "seek-" }}></media-icon>
          <media-icon
            class="absolute w-16 h-16"
            type="play"
            classList={{ "opacity-0": name() !== "play" }}></media-icon>
          <media-icon
            class="absolute w-16 h-16"
            type="pause"
            classList={{ "opacity-0": name() !== "pause" }}></media-icon>
        </div>

        <div class="text-lg font-bold text-text1">{value()}</div>
      </div>
    </div>
  );
};

const LeftGesture = (props: { onDblClick: (e: MouseEvent) => void }) => {
  return (
    <div
      class="left-0 z-0 absolute top-0 h-full w-1/5"
      onDblClick={props.onDblClick}
    />
  );
};

const RightGesture = (props: {
  onDblClick: (e: MouseEvent) => void;
  volume: number;
  setVolume: (v: number) => void;
  playerHeight: number;
}) => {
  let startY = 0;
  let startVolume = 0;

  return (
    <div
      class="right-0 z-0 absolute top-0 h-full w-1/5"
      onDblClick={props.onDblClick}
      onTouchStart={(e) => {
        console.log("touch start");
        if (e.touches.length == 1) {
          startY = e.touches[0].clientY;
          startVolume = props.volume;
        }
      }}
      onTouchMove={(e) => {
        console.log(props.playerHeight);
        if (e.touches.length == 1) {
          const deltaY = startY - e.touches[0].clientY;
          let newVolume = startVolume + deltaY / props.playerHeight;
          newVolume = Math.min(Math.max(newVolume, 0), 1);
          props.setVolume(newVolume);
        }
      }}
      onPointerUp={(e) => {}}
    />
  );
};
const CenterGesture = (props: {
  onDblClick: (e: MouseEvent) => void;
  onPointerDown: (e: PointerEvent) => void;
}) => {
  return (
    <div
      class="z-0 absolute top-0 h-full w-full"
      onDblClick={props.onDblClick}
      onPointerDown={props.onPointerDown}
    />
  );
};

const FullscreenButton = () => {
  return (
    <media-fullscreen-button
      aria-keyshortcuts="f"
      aria-label="Fullscreen"
      class="group z-10 h-10 w-10 ">
      <media-icon
        type="fullscreen"
        class="hidden ring-0 not-fullscreen:block group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
      />
      <media-icon
        type="fullscreen-exit"
        class="hidden ring-0 fullscreen:block group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
      />
      <media-tooltip class="bg-bg1/90 rounded-md text-text1">
        <span class="hidden not-fullscreen:inline">Enter Fullscreen</span>
        <span class="hidden fullscreen:inline">Exit Fullscreen</span>
      </media-tooltip>
    </media-fullscreen-button>
  );
};

const MediaControlGroup = ({ children }: { children: any }) => {
  return (
    <div class="pointer-events-none z-10 flex min-h-[48px] w-full items-center justify-between p-2 can-control:pointer-events-auto">
      {children}
    </div>
  );
};

function SettingsMenu() {
  return (
    <media-menu position="bottom right" class="">
      <media-menu-button class="group z-10" aria-label="Settings">
        <media-tooltip
          class="bg-bg1/90 rounded-md text-text1"
          position="bottom center">
          <span class="">Settings</span>
        </media-tooltip>
        <media-icon
          type="settings"
          class="h-8 w-8 rounded-sm transition-transform duration-200 ease-out group-aria-expanded:rotate-90 group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
        />
      </media-menu-button>
      <media-menu-items class="scrollbar bg-bg1/95 text-text1">
        <CaptionsMenu />
        <QualityMenu />
        <PlaybackRateMenu />
        <AudioMenu />
      </media-menu-items>
    </media-menu>
  );
}
function AudioMenu() {
  return (
    <media-menu>
      <media-menu-button
        class="group z-10 text-text1 bg-bg1/95 data-[hocus]:bg-bg3/50 data-[focus]:ring-2 data-[focus]:ring-primary"
        label="Audio">
        <media-icon
          type="arrow-left"
          class="hidden h-4 w-4 group-aria-expanded:inline"
        />
        <media-icon type="music" class="h-6 w-6 group-aria-expanded:hidden" />
        <span class="ml-1.5">Audio</span>
        <span class="ml-auto text-text1/50" slot="hint"></span>
        <media-icon
          type="chevron-right"
          class="ml-0.5 h-4 w-4 text-text1/50 group-aria-disabled:opacity-0 group-aria-expanded:hidden"
        />
      </media-menu-button>
      <media-audio-menu-items
        class=""
        radio-group-class=""
        radio-class="group text-text1 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:ring-primary"
        radio-check-class="border-bg2 group-aria-checked:border-primary after:content-[''] after:border-2 after:border-primary after:hidden group-aria-checked:after:inline-block after:rounded-full after:w-1 after:h-1"
        empty-label="Default"></media-audio-menu-items>
    </media-menu>
  );
}
function ChaptersMenu({ chapters }: { chapters?: Chapter[] | null }) {
  if (!chapters || chapters.length === 0) return <></>;
  return (
    <media-menu position="bottom right">
      {/* Menu Button */}
      <media-menu-button class="group z-10" aria-label="Chapters">
        <media-icon
          type="chapters"
          class="group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
        />
        <media-tooltip
          class="bg-bg1/90 rounded-md text-text1"
          position="bottom center">
          <span class="inline">Chapters</span>
        </media-tooltip>
      </media-menu-button>
      {/* Menu Items */}
      <media-chapters-menu-items
        class=" bg-bg1/95 scrollbar"
        container-class=""
        chapter-class="group data-[hocus]:bg-primary/10 data-[focus]:ring-2 data-[focus]:m-1 data-[focus]:ring-primary border-b border-b-text1/20 last:border-b-0 aria-checked:border-l-4 aria-checked:border-l-primary"
        thumbnail-class=""
        title-class="text-text1"
        start-time-class="text-text1 bg-bg2"
        duration-class="text-text1/50"
      />
    </media-menu>
  );
}

const CaptionsMenu = () => {
  return (
    <media-menu class="">
      <CaptionsMenuButton />
      <media-captions-menu-items
        class=""
        radio-group-class=""
        radio-class="group text-text1 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:ring-primary"
        radio-check-class="border-bg2 group-aria-checked:border-primary after:content-[''] after:border-2 after:border-primary after:hidden group-aria-checked:after:inline-block after:rounded-full after:w-1 after:h-1"
      />
    </media-menu>
  );
};

const CaptionsMenuButton = () => {
  return (
    <media-menu-button class="group z-10 text-text1 bg-bg1/95 data-[hocus]:bg-bg3/50 data-[focus]:ring-2 data-[focus]:ring-primary">
      <media-icon
        type="arrow-left"
        class="hidden h-4 w-4 group-aria-expanded:inline"
      />
      <media-icon
        type="closed-captions"
        class="h-6 w-6 group-aria-expanded:hidden"
      />
      <span class="ml-1.5">Captions</span>
      <span class="ml-auto text-text1/50" slot="hint"></span>
      <media-icon
        type="chevron-right"
        class="ml-0.5 h-4 w-4 text-text1/50 group-aria-disabled:opacity-0 group-aria-expanded:hidden"
      />
    </media-menu-button>
  );
};
const QualityMenu = () => {
  return (
    <media-menu class="">
      <QualityMenuButton />
      <media-quality-menu-items
        class=""
        radio-group-class=""
        radio-class="group text-text1 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:ring-primary"
        radio-check-class="border-bg2 group-aria-checked:border-primary after:content-[''] after:border-2 after:border-primary after:hidden group-aria-checked:after:inline-block after:rounded-full after:w-1 after:h-1"
      />
    </media-menu>
  );
};

const QualityMenuButton = () => {
  return (
    <media-menu-button class="group z-10 text-text1 bg-bg1/95 data-[hocus]:bg-bg3/50 data-[focus]:ring-2 data-[focus]:ring-primary">
      <media-icon
        type="arrow-left"
        class="hidden h-4 w-4 group-aria-expanded:inline"
      />
      <media-icon type="settings" class="h-6 w-6 group-aria-expanded:hidden" />
      <span class="ml-1.5">Quality</span>
      <span class="ml-auto text-text1/50" slot="hint"></span>
      <media-icon
        type="chevron-right"
        class="ml-0.5 h-4 w-4 text-text1/50 group-aria-disabled:opacity-0 group-aria-expanded:hidden"
      />
    </media-menu-button>
  );
};

const PlaybackRateMenu = () => {
  return (
    <media-menu class="">
      <PlaybackRateMenuButton />
      <media-playback-rate-menu-items
        class=""
        radio-group-class=""
        radio-class="group text-text1 data-[hocus]:bg-white/10 data-[focus]:ring-2 data-[focus]:ring-primary"
        radio-check-class="border-bg2 group-aria-checked:border-primary after:content-[''] after:border-2 after:border-primary after:hidden group-aria-checked:after:inline-block after:rounded-full after:w-1 after:h-1"
      />
    </media-menu>
  );
};

const PlaybackRateMenuButton = () => {
  return (
    <media-menu-button class="group z-10 text-text1 bg-bg1/95 data-[hocus]:bg-bg3/50 data-[focus]:ring-2 data-[focus]:ring-primary">
      <media-icon
        type="arrow-left"
        class="hidden h-4 w-4 group-aria-expanded:inline"
      />
      <media-icon type="odometer" class="h-6 w-6 group-aria-expanded:hidden" />
      <span class="ml-1.5">Speed</span>
      <span class="ml-auto text-text1/50" slot="hint"></span>
      <media-icon
        type="chevron-right"
        class="ml-0.5 h-4 w-4 text-text1/50 group-aria-disabled:opacity-0 group-aria-expanded:hidden"
      />
    </media-menu-button>
  );
};

const RecommendedVideosMenu = ({ videos }: { videos?: RelatedStream[] }) => {
  const [playlist] = usePlaylist();
  return (
    <media-menu position="bottom left" class="inline-block ">
      <RecommendedVideosMenuButton />
      <media-menu-items class="max-h-72 sm:max-h-96 bg-bg1/95 scrollbar">
        <For each={videos}>
          {(video) => (
            <A
              href={video.url}
              role="menuitem"
              tabIndex={-1}
              class="focus:bg-bg3/50 max-w-xs hover:bg-bg3/50 focus:ring-2 focus:ring-primary">
                <img class="h-18 w-32 shrink-0 rounded-md bg-bg1" src={video.thumbnail} />
                <div class="ml-2 flex grow flex-col overflow-hidden whitespace-pre-wrap">
                  <div class="text-sm text-text1 truncate">
                    {video.title}
                  </div>
                  <div class="text-xs text-text1/50">
                    {video.uploaderName}
                  </div>
                </div>
            </A>
          )}
        </For>
      </media-menu-items>
    </media-menu>
  );
};
function RecommendedVideosMenuButton() {
  return (
    <media-menu-button
      class="group z-10 flex h-10 w-10 items-center justify-center rounded-sm outline-none"
      aria-label="Recommended Videos">
      <media-icon
        type="playlist"
        class="h-8 w-8 rounded-sm group-data-[focus]:ring-4 group-data-[focus]:ring-primary"
      />
    </media-menu-button>
  );
}

const BufferingIndicator = () => {
  return (
    <div class="pointer-events-none absolute inset-0 z-50 flex h-full w-full items-center justify-center">
      <svg
        class="h-24 w-24 text-white opacity-0 transition-opacity duration-200 ease-linear buffering:animate-spin buffering:opacity-100"
        fill="none"
        viewBox="0 0 120 120"
        aria-hidden="true">
        <circle
          class="opacity-25"
          cx="60"
          cy="60"
          r="54"
          stroke="currentColor"
          stroke-width="8"
        />
        <circle
          class="opacity-75"
          cx="60"
          cy="60"
          r="54"
          stroke="currentColor"
          stroke-width="10"
          pathLength="100"
          style={{
            "stroke-dasharray": 100,
            "stroke-dashoffset": "50",
          }}
        />
      </svg>
    </div>
  );
};
