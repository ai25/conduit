import numeral from "numeral";
import type { PipedVideo } from "../types";
import {
  For,
  Match,
  Show,
  Suspense,
  Switch,
  createEffect,
  createSignal,
} from "solid-js";
import { usePreferences } from "~/stores/preferencesStore";
import {
  FaSolidArrowsRotate,
  FaSolidBookmark,
  FaSolidBug,
  FaSolidChevronDown,
  FaSolidChevronRight,
  FaSolidCopy,
  FaSolidDownload,
  FaSolidEye,
  FaSolidShare,
  FaSolidThumbsDown,
  FaSolidThumbsUp,
  FaSolidTrashCan,
} from "solid-icons/fa";
import Modal from "./Modal";
import { createQuery } from "@tanstack/solid-query";
import { MediaPlayerElement } from "vidstack/elements";
import { createDate, createTimeAgo } from "@solid-primitives/date";
import DownloadModal from "./DownloadModal";
import { getVideoId, isMobile, sanitizeText } from "~/utils/helpers";
import api from "~/utils/api";
import { isServer } from "solid-js/web";
import SubscribeButton from "./SubscribeButton";
import { Tooltip } from "./Tooltip";
import Button from "./Button";
import {
  TbLicense,
  TbThumbDown,
  TbThumbDownFilled,
  TbThumbUp,
  TbThumbUpFilled,
} from "solid-icons/tb";
import { toast } from "./Toast";
import { useSearchParams } from "@solidjs/router";
import Link from "./Link";
import { useVideoContext } from "~/stores/VideoContext";
import ShareModal from "./ShareModal";
import { BsAspectRatio, BsAspectRatioFill } from "solid-icons/bs";
import { useCookie } from "~/utils/hooks";
import { RiSystemThumbDownFill, RiSystemThumbUpFill } from "solid-icons/ri";
import { BiSolidCategoryAlt } from "solid-icons/bi";
import { useAppState } from "~/stores/appStateStore";

function handleTimestamp(videoId: string, t: string, extraQueryParams: string) {
  const player = document.querySelector("media-player") as MediaPlayerElement;
  player.currentTime = parseInt(t, 10);
  player.focus();

  const newUrl = new URL(`/watch?v=${videoId}`, window.location.origin);
  const searchParams = new URLSearchParams(extraQueryParams);

  searchParams.set("t", t);

  newUrl.search = searchParams.toString();

  history.pushState({}, "", newUrl.toString());
}

(globalThis as any).handleTimestamp = handleTimestamp;

const Description = (props: { downloaded: boolean }) => {
  const [expanded, setExpanded] = createSignal(false);
  const video = useVideoContext();

  const [downloadModalOpen, setDownloadModalOpen] = createSignal(false);

  async function deleteVideo(id: string) {
    try {
      const root = await navigator.storage.getDirectory();
      await root.removeEntry(id, { recursive: true });
    } catch (e) {
      console.error(`Failed to delete ${id}`, e);
    }
  }
  const [debugInfoOpen, setDebugInfoOpen] = createSignal(false);
  const [date, setDate] = createDate(video.data?.uploadDate ?? new Date());

  const [shareModalOpen, setShareModalOpen] = createSignal(false);

  createEffect(() => {
    setDate(video.data?.uploadDate ?? new Date());
  });

  const [sanitizedDescription, setSanitizedDescription] = createSignal<
    string | undefined
  >(undefined);

  async function handleSetSanitizedDescription() {
    setSanitizedDescription(await sanitizeText(video.data!.description));
  }
  createEffect(() => {
    if (!video.data) return;
    handleSetSanitizedDescription();
  });
  const [currentTime, setCurrentTime] = createSignal<number | undefined>(
    undefined
  );
  const [appState] = useAppState()
  function handleSetShareModalOpen(open: boolean) {
    if (open) {
      const player = appState.player.instance;
      if (player) {
        setCurrentTime(player.currentTime);
      }
      setShareModalOpen(true);
    } else {
      setShareModalOpen(false);
    }
  }

  return (
    <>
      <Modal
        isOpen={debugInfoOpen()}
        setIsOpen={setDebugInfoOpen}
        title="Debug info"
      >
        <Tooltip
          contentSlot="Copy to clipboard"
          triggerSlot={
            <Button
              class="[&>span]:whitespace-nowrap"
              as="div"
              appearance="ghost"
              icon={<FaSolidCopy class="w-4 h-4" />}
            />
          }
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(video.data, null, 2));
          }}
        />
        <div class="max-w-screen-sm max-h-[80vh] overflow-auto">
          <JSONViewer data={video.data} folded={false} />
        </div>
      </Modal>
      <Suspense>
        <DownloadModal
          id={getVideoId(video.data)!}
          isOpen={downloadModalOpen()}
          setIsOpen={setDownloadModalOpen}
        />
      </Suspense>
      <ShareModal
        isOpen={shareModalOpen()}
        setIsOpen={handleSetShareModalOpen}
        thumbnail={video.data!.thumbnailUrl}
        id={getVideoId(video.data)!}
        title={video.data!.title}
        t={currentTime()}
      />
      <div class="bg-bg1 w-[clamp(250px,100%,98vw)] mx-auto p-3 @container">
        <div class="flex flex-col gap-2">
          <div class="flex flex-col gap-2 ">
            <div class="flex items-start justify-between h-full">
              <h1 class="text-lg leading-tight font-bold sm:text-xl ">
                {video.data!.title}
              </h1>
            </div>
            <div class="my-1 flex justify-between items-center gap-4 sm:justify-start ">
              <div class="flex max-w-max items-center gap-2 text-sm sm:text-base">
                <Link class="link" href={`${video.data!.uploaderUrl}`}>
                  <img
                    src={video.data!.uploaderAvatar}
                    width={42}
                    height={42}
                    alt={video.data!.uploader}
                    class="rounded-full"
                  />
                </Link>
                <div class="flex flex-col items-start justify-start">
                  <Link
                    href={`${video.data!.uploaderUrl}`}
                    class="link flex w-fit items-center gap-2"
                  >
                    {video.data!.uploader}{" "}
                    {video.data!.uploaderVerified && <Checkmark />}
                  </Link>
                  <div
                    title={`${video.data!.uploaderSubscriberCount} subscribers`}
                    class="flex w-full items-center text-start text-xs text-text2 sm:text-sm"
                  >
                    {numeral(video.data!.uploaderSubscriberCount)
                      .format("0a")
                      .toUpperCase()}{" "}
                    subscribers
                  </div>
                </div>
              </div>

              <SubscribeButton
                name={video.data!.uploader}
                id={
                  (() => video.data?.uploaderUrl?.split("/channel/")[1])() ?? ""
                }
              />
            </div>
          </div>
          <ActionsContainer
            downloaded={props.downloaded}
            deleteVideo={() => deleteVideo(getVideoId(video.data)!)}
            setDownloadModalOpen={() => setDownloadModalOpen(true)}
            refetch={() => {
              console.dir(window);
            }}
            setDebugInfoOpen={() => setDebugInfoOpen(true)}
            setShareModalOpen={() => handleSetShareModalOpen(true)}
          />
          <div
            title={`Published ${(() => {
              const substr = date().toString().split(":")[0];
              return substr.slice(0, substr.length - 3);
            })()} • ${numeral(video.data!.views).format("0,0")} views`}
            class="flex flex-col @sm:flex-row items-start @sm:items-center justify-between gap-1 my-1 text-sm "
          >
            <div class="flex items-center gap-1 @sm:max-w-[16rem] @md:max-w-full">
              <p class="truncate">
                {(() => {
                  const substr = date().toString().split(":")[0];
                  const time = date().toString().split(" ")[4];
                  return `${substr.slice(0, substr.length - 3)} ${time.slice(0, time.length - 3)}`;
                })()}
              </p>
              •
              <p class="truncate">
                {video.data!.views > 10000
                  ? numeral(video.data!.views).format("0.00a").toUpperCase()
                  : numeral(video.data!.views).format("0,0").toUpperCase()}{" "}
                views
              </p>
            </div>
            <div class="flex flex-col w-full @sm:w-36 ">
              <div class="flex items-center justify-between gap-1 p-2 rounded-full relative shadow-md">
                <span
                  title={`${numeral(video.data!.likes).format("0,0")} likes`}
                  class="flex items-center gap-1 relative z-1"
                >
                  <RiSystemThumbUpFill class="w-5 h-5 text-text1" />
                  {video.data!.likes > 1000
                    ? numeral(video.data!.likes).format("0.0a").toUpperCase()
                    : numeral(video.data!.likes).format("0,0").toUpperCase()}
                </span>
                <span
                  title={`${numeral(video.data!.dislikes).format("0,0")} likes`}
                  class="flex items-center gap-1 relative z-1"
                >
                  <RiSystemThumbDownFill
                    class="h-5 w-5 text-text1 "
                    fill="currentColor"
                  />
                  {video.data!.dislikes > 1000
                    ? numeral(video.data!.dislikes).format("0.0a").toUpperCase()
                    : numeral(video.data!.dislikes).format("0,0").toUpperCase()}
                </span>
              </div>
              <div
                class="w-full h-1 rounded-full"
                style={{
                  "background-image": `linear-gradient(90deg, 
                    rgba(var(--colors-primary),1) 0%, 
                    rgba(var(--colors-primary),1) ${
                      (video.data!.likes /
                        (video.data!.likes + video.data!.dislikes)) *
                        100 -
                      10
                    }%, 
                    rgba(var(--colors-bg2),1) ${
                      (video.data!.likes /
                        (video.data!.likes + video.data!.dislikes)) *
                        100 +
                      10
                    }%,
                    rgba(var(--colors-bg2),1) 100%`,
                }}
              />
            </div>
          </div>
        </div>
        <div class="mt-1 flex flex-col rounded-xl bg-bg2 p-2">
          <div
            tabIndex={0}
            id="description"
            aria-expanded={expanded()}
            class={`min-w-0 max-w-full overflow-hidden py-2 flex flex-col gap-2 ${
              expanded() ? "" : "max-h-20"
            }`}
          >
            <div innerHTML={sanitizedDescription()!} />
            <div class="flex items-center gap-1">
              <BiSolidCategoryAlt class="h-5 w-5" />
              <div class="font-semibold">Category:</div>
              {video.data?.category}
            </div>
            <div class="flex items-center gap-1">
              <TbLicense class="h-5 w-5" />
              <div class="font-semibold">License:</div>
              {video.data?.license}
            </div>
            <div class="flex items-center gap-1">
              <FaSolidEye class="h-5 w-5" />
              <div class="font-semibold">Visibility:</div>
              {video.data?.visibility}
            </div>
            <div class="flex flex-wrap gap-2">
              <For each={video.data?.tags}>
                {(tag) => (
                  <div class="bg-bg1 px-2 py-1 rounded-full">{tag}</div>
                )}
              </For>
            </div>
          </div>
          <div classList={{ hidden: expanded() }} class="w-full h-0 relative">
            <div class="absolute bottom-full w-full h-5 bg-gradient-to-t from-bg2 to-transparent pointer-events-none" />
          </div>
          <button
            aria-controls="description"
            onClick={() => {
              setExpanded(!expanded());
            }}
            class="text-center text-sm text-accent1 hover:underline "
          >
            Show {expanded() ? "less" : "more"}
          </button>
        </div>
      </div>
    </>
  );
};

export const DescriptionFallback = () => {
  return (
    <div class="flex flex-col gap-2 p-3 w-full">
      <div class="w-3/4 h-6 rounded-full animate-pulse bg-bg2" />
      <div class="w-1/2 h-6 rounded-full animate-pulse bg-bg2" />
      <div class="flex gap-2 w-1/2 items-center">
        <div class="w-16 h-16 aspect-square rounded-full animate-pulse bg-bg2" />
        <div class="flex flex-col w-full gap-2">
          <div class="w-44 h-4 rounded-full animate-pulse bg-bg2" />
          <div class="w-32 h-4 rounded-full animate-pulse bg-bg2" />
        </div>
      </div>
      <div class="w-full h-12 rounded-full animate-pulse bg-bg2" />
      <div class="w-1/3 h-4 rounded-full animate-pulse bg-bg2" />
      <div class="w-full h-32 rounded-lg animate-pulse bg-bg2" />
      <For each={Array(5)}>
        {() => (
          <div class="flex gap-2 w-full items-center">
            <div class="w-16 h-16 aspect-square rounded-full animate-pulse bg-bg2" />
            <div class="flex flex-col w-full gap-2">
              <div class="w-1/2 h-4 rounded-full animate-pulse bg-bg2" />
              <div class="w-1/3 h-4 rounded-full animate-pulse bg-bg2" />
            </div>
          </div>
        )}
      </For>
    </div>
  );
};

export const Checkmark = () => (
  <svg
    class="h-4 w-4 aspect-square min-w-[1rem] text-text1"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.25 17.292l-4.5-4.364 1.857-1.858 2.643 2.506 5.643-5.784 1.857 1.857-7.5 7.643z" />
  </svg>
);

type JSONViewerProps = {
  data: any;
  folded: boolean;
  level?: number;
};

const JSONViewer: any = (props: JSONViewerProps) => {
  const [folded, setFolded] = createSignal(props.folded);
  const isObject = typeof props.data === "object" && props.data !== null;

  return (
    <div class={`pl-${props.level || 1} flex text-xs font-mono`}>
      {isObject ? (
        <div class="flex gap-2 justify-between">
          <span class="cursor-pointer" onClick={() => setFolded(!folded())}>
            {folded() ? <FaSolidChevronRight /> : <FaSolidChevronDown />}
          </span>
          <span>{Array.isArray(props.data) ? "[" : "{"}</span>
          {!folded() ? (
            <pre>
              {Object.entries(props.data).map(([key, value], index) => (
                <pre class="flex gap-2">
                  <span class="font-bold">{key}:</span>{" "}
                  <JSONViewer
                    data={value}
                    level={(props.level || 0) + 1}
                    folded={true}
                  />
                </pre>
              ))}
            </pre>
          ) : (
            "..."
          )}
          <span>{Array.isArray(props.data) ? "]" : "}"}</span>
        </div>
      ) : (
        <span>{props.data}</span>
      )}
    </div>
  );
};

export default Description;

const ActionsContainer = (props: {
  downloaded: boolean;
  deleteVideo: () => void;
  setDownloadModalOpen: () => void;
  refetch: () => void;
  setDebugInfoOpen: () => void;
  setShareModalOpen: () => void;
}) => {
  const [, setTheatreMode] = useCookie("theatreMode", "false");
  const [preferences, setPreferences] = usePreferences();
  const [searchParams] = useSearchParams();
  return (
    <div class="flex items-center gap-2 p-2 overflow-auto scrollbar-horizontal">
      <Switch>
        <Match when={props.downloaded}>
          <Button
            class="[&>span]:whitespace-nowrap"
            icon={<FaSolidTrashCan class="h-4 w-4" />}
            label="Delete"
            appearance="ghost"
            onClick={props.deleteVideo}
          />
        </Match>
        <Match when={!props.downloaded}>
          <Button
            class="[&>span]:whitespace-nowrap"
            label="Download"
            icon={<FaSolidDownload class="h-4 w-4" />}
            appearance="ghost"
            onClick={props.setDownloadModalOpen}
          />
        </Match>
      </Switch>
      <Button
        class="[&>span]:whitespace-nowrap"
        label="Share"
        icon={<FaSolidShare class="h-4 w-4" />}
        appearance="ghost"
        onClick={props.setShareModalOpen}
      />
      <Button
        class="[&>span]:whitespace-nowrap"
        icon={<FaSolidBookmark class="h-4 w-4" />}
        appearance="ghost"
        onClick={() => {
          toast.show("Not implemented");
        }}
        label="Save"
      />
      <Button
        class="[&>span]:whitespace-nowrap"
        icon={<FaSolidBug class="h-4 w-4" />}
        appearance="ghost"
        onClick={props.setDebugInfoOpen}
        label="Debug info"
      />
      <Button
        class="[&>span]:whitespace-nowrap hidden lg:flex"
        icon={
          preferences.theatreMode ? (
            <BsAspectRatioFill class="h-4 w-4" />
          ) : (
            <BsAspectRatio class="h-4 w-4" />
          )
        }
        label="Theatre mode"
        appearance="ghost"
        onClick={() => {
          setTheatreMode(JSON.stringify(!preferences.theatreMode));
          setPreferences("theatreMode", !preferences.theatreMode);
        }}
      />
    </div>
  );
};
