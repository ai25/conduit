import numeral from "numeral";
import type { PipedVideo } from "../types";
import { createEffect, createSignal } from "solid-js";
import { A } from "solid-start";
import { MediaPlayerElement } from "vidstack";
import { getStorageValue, setStorageValue } from "~/utils/storage";
import dayjs from "dayjs";

function handleTimestamp(videoId: string, t: string) {
  console.log(t);
  const player = document.querySelector("media-player") as MediaPlayerElement;
  player.currentTime = parseInt(t);
  // push state to history
  history.pushState({}, "", `/watch?v=${videoId}&t=${t}`);
}
(globalThis as any).handleTimestamp = handleTimestamp;

export default ({ video }: { video: PipedVideo }) => {
  const [isSubscribed, setIsSubscribed] = createSignal(false);

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
        class="text-primary hover:text-highlight hover:underline" onclick="handleTimestamp('$1','$2')">$3</button>`
      )
      // add a class to all <a> tags
      .replaceAll(
        /<a href/gm,
        '<a class="text-primary hover:text-highlight hover:underline" href'
      );
    return t;
  }
  const [expanded, setExpanded] = createSignal(false);
  createEffect(() => {
    const channels = getStorageValue(
      "localSubscriptions",
      [],
      "json",
      "localStorage"
    ) as string[];
    setIsSubscribed(
      channels.find(
        (channel) => channel === video.uploaderUrl.split("/channel/")[1]
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
        JSON.stringify([...channels, video.uploaderUrl.split("/channel/")[1]]),
        "localStorage"
      );
      setIsSubscribed(true);
    } else {
      setStorageValue(
        "localSubscriptions",
        JSON.stringify(
          channels.filter(
            (channel) => channel !== video.uploaderUrl.split("/channel/")[1]
          )
        ),
        "localStorage"
      );
      setIsSubscribed(false);
    }
  };

  return (
    <div class="mb-2 w-full break-before-auto overflow-hidden bg-bg1 p-4">
      <div class="flex flex-col justify-between gap-2 lg:flex-row">
        <div class="flex flex-col gap-2 ">
          <h1 class="text-xl font-bold sm:text-2xl ">{video.title}</h1>
          <div class="mb-1  flex justify-between gap-4 sm:justify-start ">
            <div class="flex max-w-max items-center gap-2 text-sm sm:text-base">
              <A href={`${video.uploaderUrl}`}>
                <img
                  src={video.uploaderAvatar}
                  width={42}
                  height={42}
                  alt={video.uploader}
                  class="rounded-full"
                />
              </A>
              <div class="flex flex-col items-center justify-start">
                <A
                  href={`${video.uploaderUrl}`}
                  class="flex w-fit items-center gap-2">
                  {video.uploader}{" "}
                  {video.uploaderVerified && (
                    <svg
                      class="h-4 w-4 "
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.25 17.292l-4.5-4.364 1.857-1.858 2.643 2.506 5.643-5.784 1.857 1.857-7.5 7.643z" />
                    </svg>
                  )}
                </A>
                <div class="flex w-full items-center text-start text-xs text-text2 sm:text-sm">
                  {numeral(video.uploaderSubscriberCount)
                    .format("0a")
                    .toUpperCase()}{" "}
                  subscribers
                </div>
              </div>
            </div>
            <button
              onClick={toggleSubscribed}
              class={`btn ${isSubscribed() ? "!bg-bg3 !text-text1" : ""} `}>
              Subscribe{isSubscribed() && "d"}
            </button>
          </div>
        </div>
        <div class="flex items-center justify-between lg:flex-col lg:items-start lg:justify-start">
          <p class="break-words">
            Published{" "}
            {(() => {
              const substr = dayjs(video.uploadDate).toString().split(":")[0];
              return substr.slice(0, substr.length - 3);
            })()}
          </p>
          <p class="">
            {numeral(video.views).format("0,0")} views
          </p>
        </div>
      </div>
      <div class="mt-1 flex flex-col rounded-lg bg-bg2 p-2">
        <div
          tabIndex={0}
          id="description"
          aria-expanded={expanded()}
          class={`min-w-0 max-w-full truncate break-words ${
            expanded() ? "" : "max-h-20"
          }`}
          innerHTML={rewriteDescription(video.description)}
        />
        <button
          aria-controls="description"
          onClick={() => {
            setExpanded(!expanded());
          }}
          class="text-center text-sm text-accent1 hover:underline shadow shadow-[22px]">
          Show {expanded() ? "less" : "more"}
        </button>
      </div>
    </div>
  );
};
