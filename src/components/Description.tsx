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
import { A } from "solid-start";
import { MediaPlayerElement } from "vidstack";
import { getStorageValue, setStorageValue } from "~/utils/storage";
import dayjs from "dayjs";
import Comment, { PipedCommentResponse } from "./Comment";
import { videoId } from "~/routes/library/history";
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
import Modal from "./Modal";

function handleTimestamp(videoId: string, t: string) {
  console.log(t);
  const player = document.querySelector("media-player") as MediaPlayerElement;
  player.currentTime = parseInt(t);
  // push state to history
  history.pushState({}, "", `/watch?v=${videoId}&t=${t}`);
}
(globalThis as any).handleTimestamp = handleTimestamp;

const Description = (props: {
  video: PipedVideo | null | undefined;
  downloaded: boolean;
  onRefetch: () => void;
}) => {
  const [isSubscribed, setIsSubscribed] = createSignal(false);
  const [preferences] = usePreferences();

  const [comments, setComments] = createSignal<PipedCommentResponse>();

  function rewriteDescription(text: string) {
    const t = text
      .replaceAll(
        /(?:http(?:s)?:\/\/)?(?:www\.)?youtube\.com(\/[/a-zA-Z0-9_?=&-]*)/gm,
        "$1"
      )
      .replaceAll(
        /(?:http(?:s)?:\/\/)?(?:www\.)?youtu\.be\/(?:watch\?v=)?([/a-zA-Z0-9_?=&-]*)/gm,
        "/watch?v=$1"
      )
      .replaceAll("\n", "<br>")
      // replace all <a> tags that contain a timestamp with a button
      .replaceAll(
        /<a href="\/watch\?v=([a-zA-Z0-9_?=&-]*)&amp;t=([0-9]*)">([a-zA-Z0-9_?=&-:]*)<\/a>/gm,
        `<button
        class="link" onclick="handleTimestamp('$1','$2')">$3</button>`
      )
      // add a class to all <a> tags
      .replaceAll(/<a href/gm, '<a class="link" href');
    return t;
  }
  const [expanded, setExpanded] = createSignal(false);
  createEffect(() => {
    if (!props.video) return;
    let channels = getStorageValue(
      "localSubscriptions",
      [],
      "json",
      "localStorage"
    ) as string[];
    console.log(typeof channels);
    if (typeof channels === "string") channels = JSON.parse(channels);
    setIsSubscribed(
      channels.find(
        (channel) => channel === props.video!.uploaderUrl.split("/channel/")[1]
      )
        ? true
        : false
    );
  });
  const toggleSubscribed = () => {
    const channels = getStorageValue(
      "localSubscriptions",
      [],
      "json",
      "localStorage"
    ) as string[];
    if (!isSubscribed()) {
      setStorageValue(
        "localSubscriptions",
        JSON.stringify([
          ...channels,
          props.video!.uploaderUrl.split("/channel/")[1],
        ]),
        "localStorage"
      );
      setIsSubscribed(true);
    } else {
      setStorageValue(
        "localSubscriptions",
        JSON.stringify(
          channels.filter(
            (channel) =>
              channel !== props.video!.uploaderUrl.split("/channel/")[1]
          )
        ),
        "localStorage"
      );
      setIsSubscribed(false);
    }
  };

  async function loadComments() {
    // const res = await fetch(`${instance().api_url}/comments/${videoId(props.video)}`);
    // const data = await res.json();
    // console.log(data, "comments");
    // setComments(data);
  }
  async function loadMoreComments() {
    // if (!comments()?.nextpage) return;
    // const res = await fetch(
    //   `${instance().api_url}/nextpage/comments/${videoId(props.video)}?nextpage=${
    //     comments()!.nextpage
    //   }`
    // );
    // const data = await res.json();
    // console.log(data, "comments");
    // setComments({
    //   ...data,
    //   comments: [...comments()!.comments, ...data.comments],
    // });
  }

  async function handleDownload() {
    if (!(await navigator.storage.persist())) return;
    downloadVideo(videoId(props.video), preferences.instance.api_url);
  }

  async function deleteVideo(id: string) {
    try {
      const root = await navigator.storage.getDirectory();
      await root.removeEntry(id, { recursive: true });
    } catch (e) {
      console.error(`Failed to delete ${id}`, e);
    }
  }
  const [debugInfoOpen, setDebugInfoOpen] = createSignal(false);

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
    <Show when={props.video} fallback={<Placeholder />}>
      <Modal
        isOpen={debugInfoOpen()}
        setIsOpen={setDebugInfoOpen}
        title="Debug info"
      >
        <IconButton
          icon={<FaSolidCopy class="w-4 h-4" />}
          title="Copy to clipboard"
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(props.video, null, 2));
          }}
        />
        <div class="max-w-screen-sm max-h-[80vh] overflow-auto">
          <JSONViewer data={props.video} folded={false} />
        </div>
      </Modal>
      <div class="mb-2 bg-bg1 p-4 ">
        <div class="flex flex-col gap-2">
          <div class="flex flex-col gap-2 ">
            <div class="flex items-start justify-between">
              <h1 class="text-lg font-bold sm:text-xl ">
                {props.video!.title}
              </h1>
            </div>
            <div class="mb-1  flex justify-between gap-4 sm:justify-start ">
              <div class="flex max-w-max items-center gap-2 text-sm sm:text-base">
                <A class="link" href={`${props.video!.uploaderUrl}`}>
                  <img
                    src={props.video!.uploaderAvatar}
                    width={42}
                    height={42}
                    alt={props.video!.uploader}
                    class="rounded-full"
                  />
                </A>
                <div class="flex flex-col items-start justify-start">
                  <A
                    href={`${props.video!.uploaderUrl}`}
                    class="link flex w-fit items-center gap-2"
                  >
                    {props.video!.uploader}{" "}
                    {props.video!.uploaderVerified && <Checkmark />}
                  </A>
                  <div
                    title={`${
                      props.video!.uploaderSubscriberCount
                    } subscribers`}
                    class="flex w-full items-center text-start text-xs text-text2 sm:text-sm"
                  >
                    {numeral(props.video!.uploaderSubscriberCount)
                      .format("0a")
                      .toUpperCase()}{" "}
                    subscribers
                  </div>
                </div>
              </div>

              <Button
                onClick={toggleSubscribed}
                activated={isSubscribed()}
                label={`Subscribe${isSubscribed() ? "d" : ""}`}
              />
            </div>
          </div>
          <div
            title={`Published ${(() => {
              const substr = dayjs(props.video!.uploadDate)
                .toString()
                .split(":")[0];
              return substr.slice(0, substr.length - 3);
            })()} • ${numeral(props.video!.views).format("0,0")} views`}
            class="flex items-center gap-2 text-sm"
          >
            <p class="">{dayjs(props.video?.uploadDate).fromNow()}</p>•
            <p class="">
              {numeral(props.video!.views).format("0a").toUpperCase()} views
            </p>
            <div class="flex flex-col w-36 ml-auto">
              <div class="flex items-center justify-between ">
                <span
                  title={`${numeral(props.video!.likes).format("0,0")} likes`}
                  class="flex items-center gap-2 "
                >
                  <FaSolidThumbsUp class="w-5 h-5" fill="currentColor" />
                  {numeral(props.video!.likes).format("0a").toUpperCase()}{" "}
                </span>
                <span
                  title={`${numeral(props.video!.dislikes).format(
                    "0,0"
                  )} likes`}
                  class="flex items-center gap-2"
                >
                  <FaSolidThumbsDown class="h-5 w-5" fill="currentColor" />
                  {numeral(props.video!.dislikes)
                    .format("0a")
                    .toUpperCase()}{" "}
                </span>
              </div>
              <div class="w-full h-1 bg-primary rounded mt-2 flex justify-end">
                <div
                  class="h-full bg-accent1 rounded-r"
                  style={{
                    width: `${
                      (props.video!.dislikes /
                        (props.video!.likes + props.video!.dislikes)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-evenly rounded p-2 bg-bg2">
            <Switch>
              <Match when={props.downloaded}>
                <IconButton
                  title="Delete"
                  icon={<FaSolidTrashCan class="h-6 w-6" />}
                  onClick={() => deleteVideo(videoId(props.video))}
                />
              </Match>
              <Match when={!props.downloaded}>
                <IconButton
                  title="Download"
                  icon={<FaSolidDownload class="h-6 w-6" />}
                  onClick={handleDownload}
                />
              </Match>
            </Switch>
            <IconButton
              title="Share"
              icon={<FaSolidShare class="h-6 w-6" />}
              onClick={() => {}}
            />
            <IconButton
              title="Save"
              icon={<FaSolidBookmark class="h-6 w-6" />}
              onClick={() => {}}
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
              onClick={props.onRefetch}
            />
          </div>
          <div></div>
        </div>
        <div class="mt-1 flex flex-col rounded-lg bg-bg2 p-2">
          <div
            tabIndex={0}
            id="description"
            aria-expanded={expanded()}
            class={`min-w-0 max-w-full overflow-hidden ${
              expanded() ? "" : "max-h-20"
            }`}
            innerHTML={rewriteDescription(props.video!.description)}
          />
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
        <Show
          when={comments()}
          fallback={
            <button onClick={loadComments} class="btn">
              Load Comments
            </button>
          }
          keyed
        >
          {(c) => (
            <Switch>
              <Match when={c.comments.length === 0}>
                <div class="text-center text-text2">No comments</div>
              </Match>
              <Match when={c.disabled}>
                <div class="text-center text-text2">Comments disabled</div>
              </Match>
              <Match when={c.comments.length > 0}>
                <For each={c.comments}>
                  {(comment) => (
                    <Comment
                      comment={comment}
                      nextpage={c.nextpage}
                      uploader={props.video!.uploader}
                      videoId={videoId(props.video)}
                    />
                  )}
                </For>
                <Show when={c.nextpage}>
                  <button class="btn" onClick={loadMoreComments}>
                    Load More
                  </button>
                </Show>
              </Match>
            </Switch>
          )}
        </Show>
      </div>
    </Show>
  );
};

export const Checkmark = () => (
  <svg
    class="h-4 w-4 "
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
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
      class="aspect-square w-12 h-12 transition duration-300 flex items-center justify-center rounded-full  hover:bg-bg1/80 outline-none active:scale-110 focus-visible:bg-bg2 focus-visible:ring-2 focus-visible:ring-primary"
    >
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
