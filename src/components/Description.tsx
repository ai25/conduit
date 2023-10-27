import numeral from "numeral";
import type { PipedVideo } from "../types";
import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
  useContext,
  JSX,
} from "solid-js";
import { A, useSearchParams } from "solid-start";
import { getStorageValue, setStorageValue } from "~/utils/storage";
import Comment, { PipedCommentResponse } from "./Comment";
import { downloadVideo } from "~/utils/hls";
import Button from "./Button";
import { Toaster } from "solid-headless";
import { usePreferences } from "~/stores/preferencesStore";
import {
  FaSolidArrowsRotate,
  FaSolidBookmark,
  FaSolidBug,
  FaSolidChevronDown,
  FaSolidChevronRight,
  FaSolidCopy,
  FaSolidDownload,
  FaSolidShare,
  FaSolidThumbsDown,
  FaSolidThumbsUp,
  FaSolidTrashCan,
} from "solid-icons/fa";
import { Tooltip } from "@kobalte/core";
import "solid-bottomsheet/styles.css";
import { SolidBottomsheet } from "solid-bottomsheet";
import Modal from "./Modal";
import { createQuery } from "@tanstack/solid-query";
import Comments from "./Comments";
import { Bottomsheet } from "./Bottomsheet";
import { Suspense } from "solid-js";
import { MediaPlayerElement } from "vidstack/elements";
import { createDate, createTimeAgo } from "@solid-primitives/date";
import DownloadModal from "./DownloadModal";
import { getVideoId } from "~/utils/helpers";
import api from "~/utils/api";
import { isServer } from "solid-js/web";
import SubscribeButton from "./SubscribeButton";

function handleTimestamp(videoId: string, t: string, extraQueryParams: string) {
  const player = document.querySelector("media-player") as MediaPlayerElement;
  player.currentTime = parseInt(t, 10);
  
  const newUrl = new URL(`/watch?v=${videoId}`, window.location.origin);
  const searchParams = new URLSearchParams(extraQueryParams);

  searchParams.set('t', t);
  
  newUrl.search = searchParams.toString();

  history.pushState({}, "", newUrl.toString());
}

(globalThis as any).handleTimestamp = handleTimestamp;

export async function sanitizeText(text: string) {
  const dompurify = await import("dompurify");
  const sanitize = dompurify.default().sanitize;
  const t = sanitize(text)
    .replaceAll(/(?:http(?:s)?:\/\/)?(?:www\.)?youtube\.com(\/[/a-zA-Z0-9_?=&-]*)/gm, "$1")
    .replaceAll(/(?:http(?:s)?:\/\/)?(?:www\.)?youtu\.be\/(?:watch\?v=)?([/a-zA-Z0-9_?=&-]*)/gm, "/watch?v=$1")
    .replaceAll("\n", "<br>")
    .replace(
      /<a href="\/watch\?v=([a-zA-Z0-9_?=&-]*)&amp;([^"]*)">([a-zA-Z0-9_?=&-:]*)<\/a>/gm,
      (_, videoId, params, textContent) => {
        const url = new URL(`https://youtube.com/watch?v=${videoId}`);
        const searchParams = new URLSearchParams(params);
        const existingParams = new URLSearchParams(window.location.search);
        
        const timestamp = searchParams.get('t') || '0';
        
        const allParams = new URLSearchParams();
        searchParams.forEach((value, key) => {
          allParams.set(key, value);
        });
        existingParams.forEach((value, key) => {
          allParams.set(key, value);
        });
        
        allParams.forEach((value, key) => {
          url.searchParams.set(key, value);
        });
        
        return `<button class="link" onclick="handleTimestamp('${videoId}','${timestamp}', '${url.search}')">${textContent}</button>`;
      }
    )
    .replaceAll(/<a href/gm, '<a class="link" href');
  return t;
}


const Description = (props: {
  downloaded: boolean;
}) => {
  const [preferences] = usePreferences();

  const [searchParams] = useSearchParams();
  const [v, setV] = createSignal<string | undefined>(undefined);
  createEffect(() => {
    if (!searchParams.v) return;
    setV(searchParams.v);
  });

  const videoQuery = createQuery(
    () => ["streams", v(), preferences.instance.api_url],
    () => api.fetchVideo(v(), preferences.instance.api_url),
    {
      get enabled() {
        return preferences.instance?.api_url &&
          !isServer &&
          v()
          ? true
          : false;
      },
      refetchOnReconnect: false,
      refetchOnMount: false,
      staleTime: 100 * 60 * 1000,
      cacheTime: Infinity,
    }
  );


  const [expanded, setExpanded] = createSignal(false);

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
  const [date, setDate] = createDate(videoQuery.data?.uploadDate ?? new Date());
  createEffect(() => {
    setDate(videoQuery.data?.uploadDate ?? new Date());
  });
  const [timeAgo] = createTimeAgo(date, { interval: 1000 * 60 });
  const [sanitizedDescription, setSanitizedDescription] = createSignal<string | undefined>(undefined);
  createEffect(async () => {
    if (!videoQuery.data) return;
    setSanitizedDescription(
      await sanitizeText(videoQuery.data.description));
  }
  );

  const Placeholder = () => (
    <div class="mb-2 w-full grow min-w-0 max-w-5xl p-4 bg-bg1">
      <div class="w-full h-4 bg-bg2 rounded animate-pulse mb-2"></div>
      <div class="w-[75%] h-4 bg-bg2 rounded animate-pulse"></div>
      <div class="flex justify-between gap-4 mt-2">
        <div class="flex gap-2">
          <div class="w-10 h-10 bg-bg2 rounded-full animate-pulse"></div>
          <div class="flex flex-col justify-center gap-1">
            <div class="w-32 h-3 bg-bg2 rounded animate-pulse"></div>
            <div class="w-16 h-2 bg-bg2 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
      <div class="h-32 w-full mt-2 bg-bg2 rounded-md animate-pulse"></div>
    </div>
  );

  return (
    <Suspense fallback={<Placeholder />}>
      <Show when={videoQuery.data} fallback={<Placeholder />}>
        <Modal
          isOpen={debugInfoOpen()}
          setIsOpen={setDebugInfoOpen}
          title="Debug info">
          <IconButton
            icon={<FaSolidCopy class="w-4 h-4" />}
            title="Copy to clipboard"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(videoQuery.data, null, 2));
            }}
          />
          <div class="max-w-screen-sm max-h-[80vh] overflow-auto">
            <JSONViewer data={videoQuery.data} folded={false} />
          </div>
        </Modal>
        <DownloadModal id={getVideoId(videoQuery.data)!} isOpen={downloadModalOpen()} setIsOpen={setDownloadModalOpen} />
        <div class="mb-2 bg-bg1 p-4 ">
          <div class="flex flex-col gap-2">
            <div class="flex flex-col gap-2 ">
              <div class="flex items-start justify-between">
                <h1 class="text-lg leading-tight font-bold sm:text-xl ">
                  {videoQuery.data!.title}
                </h1>
              </div>
              <div class="my-1 flex justify-between items-center gap-4 sm:justify-start ">
                <div class="flex max-w-max items-center gap-2 text-sm sm:text-base">
                  <A class="link" href={`${videoQuery.data!.uploaderUrl}`}>
                    <img
                      src={videoQuery.data!.uploaderAvatar}
                      width={42}
                      height={42}
                      alt={videoQuery.data!.uploader}
                      class="rounded-full"
                    />
                  </A>
                  <div class="flex flex-col items-start justify-start">
                    <A
                      href={`${videoQuery.data!.uploaderUrl}`}
                      class="link flex w-fit items-center gap-2">
                      {videoQuery.data!.uploader}{" "}
                      {videoQuery.data!.uploaderVerified && <Checkmark />}
                    </A>
                    <div
                      title={`${videoQuery.data!.uploaderSubscriberCount
                        } subscribers`}
                      class="flex w-full items-center text-start text-xs text-text2 sm:text-sm">
                      {numeral(videoQuery.data!.uploaderSubscriberCount)
                        .format("0a")
                        .toUpperCase()}{" "}
                      subscribers
                    </div>
                  </div>
                </div>

                <SubscribeButton id={getVideoId(videoQuery.data)!} />
              </div>
            </div>
            <div class="flex items-center justify-evenly rounded p-2 bg-bg2">
              <Switch>
                <Match when={props.downloaded}>
                  <IconButton
                    title="Delete"
                    icon={<FaSolidTrashCan class="h-6 w-6" />}
                    onClick={() => deleteVideo(getVideoId(videoQuery.data)!)}
                  />
                </Match>
                <Match when={!props.downloaded}>
                  <IconButton
                    title="Download"
                    icon={<FaSolidDownload class="h-6 w-6" />}
                    onClick={() => setDownloadModalOpen(true)}
                  />
                </Match>
              </Switch>
              <IconButton
                title="Share"
                icon={<FaSolidShare class="h-6 w-6" />}
                onClick={() => { }}
              />
              <IconButton
                title="Save"
                icon={<FaSolidBookmark class="h-6 w-6" />}
                onClick={() => { }}
              />
              <IconButton
                title="Debug info"
                icon={<FaSolidBug class="h-6 w-6" />}
                onClick={() => {
                  setDebugInfoOpen(true);
                }}
              />
              <IconButton
                title="Soft Refresh (Shift+R)"
                icon={<FaSolidArrowsRotate class="h-6 w-6" />}
                onClick={() => videoQuery.refetch()}
              />
            </div>
            <div
              title={`Published ${(() => {
                const substr = date()
                  .toString()
                  .split(":")[0];
                return substr.slice(0, substr.length - 3);
              })()} • ${numeral(videoQuery.data!.views).format("0,0")} views`}
              class="flex items-center gap-1 my-1 text-sm truncate max-w-full">
              <p class="">{timeAgo()}</p>•
              <p class="">
                {numeral(videoQuery.data!.views).format("0a").toUpperCase()} views
              </p>
              <div class="flex flex-col w-32 ml-auto ">
                <div class="flex items-center justify-between ">
                  <span
                    title={`${numeral(videoQuery.data!.likes).format("0,0")} likes`}
                    class="flex items-center gap-2 ">
                    <FaSolidThumbsUp class="w-5 h-5" fill="currentColor" />
                    {numeral(videoQuery.data!.likes).format("0a").toUpperCase()}{" "}
                  </span>
                  <span
                    title={`${numeral(videoQuery.data!.dislikes).format(
                      "0,0"
                    )} likes`}
                    class="flex items-center gap-2">
                    <FaSolidThumbsDown class="h-5 w-5" fill="currentColor" />
                    {numeral(videoQuery.data!.dislikes)
                      .format("0a")
                      .toUpperCase()}{" "}
                  </span>
                </div>
                <div class="w-full h-1 bg-primary rounded mt-2 flex justify-end">
                  <div
                    class="h-full bg-accent1 rounded-r"
                    style={{
                      width: `${(videoQuery.data!.dislikes /
                          (videoQuery.data!.likes + videoQuery.data!.dislikes)) *
                        100
                        }%`,
                    }}></div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-1 flex flex-col rounded-lg bg-bg2 p-2">
            <Suspense fallback={<p>Desc Loading...</p>}>
            <div
              tabIndex={0}
              id="description"
              aria-expanded={expanded()}
              class={`min-w-0 max-w-full overflow-hidden ${expanded() ? "" : "max-h-20"
                }`}
              innerHTML={sanitizedDescription()!}
            />
            </Suspense>
            <div classList={{ hidden: expanded() }} class="w-full h-0 relative">
              <div class="absolute bottom-full w-full h-5 bg-gradient-to-t from-bg2 to-transparent pointer-events-none" />
            </div>
            <button
              aria-controls="description"
              onClick={() => {
                setExpanded(!expanded());
              }}
              class="text-center text-sm text-accent1 hover:underline ">
              Show {expanded() ? "less" : "more"}
            </button>
          </div>
          <Comments
            videoId={getVideoId(videoQuery.data)!}
            uploader={videoQuery.data!.uploader}
          />
        </div>
      </Show>
    </Suspense>
  );
};

export const Checkmark = () => (
  <svg
    class="h-4 w-4 "
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24">
    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.25 17.292l-4.5-4.364 1.857-1.858 2.643 2.506 5.643-5.784 1.857 1.857-7.5 7.643z" />
  </svg>
);

const IconButton = (props: {
  icon: JSX.Element;
  title?: string;
  onClick: () => void;
}) => (
  <Tooltip.Root>
    <Tooltip.Trigger
      onClick={props.onClick}
      class="aspect-square w-12 h-12 transition duration-300 flex items-center justify-center rounded-full hover:bg-bg1/80 outline-none active:scale-110 focus-visible:bg-bg2 focus-visible:ring-2 focus-visible:ring-primary">
      {props.icon}
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content class="p-2 z-50 bg-bg2 rounded max-w-[min(calc(100vw-16px),380px)] animate-[contentHide] data-[expanded]:animate-[contentShow]">
        <Tooltip.Arrow />
        <p>{props.title}</p>
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
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
    <div class={`pl-${props.level || 1} flex`}>
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
