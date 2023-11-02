import type { RelatedStream } from "~/types";
import numeral from "numeral";
// import { DBContext } from "~/routes/layout";
import { extractVideoId } from "~/routes/watch";
import { A } from "solid-start";
import {
  Match,
  Show,
  Switch,
  createEffect,
  createRenderEffect,
  createSignal,
  useContext,
  createMemo,
  For,
} from "solid-js";
import { useSyncStore, HistoryItem } from "~/stores/syncStore";
import { generateThumbnailUrl, getVideoId } from "~/utils/helpers";
import { mergeProps } from "solid-js";
import { createTimeAgo } from "@solid-primitives/date";
import VideoCardMenu from "./VideoCardMenu"

const VideoCard = (props: {
  v?: (RelatedStream) | undefined;
}) => {
  if (!props.v)
    return (
      <div
        class={` flex w-full min-w-min max-w-sm mx-2 mb-2 lg:w-72 flex-col items-start rounded-xl bg-bg1 p-1`}
      >
        <div class="animate-pulse w-96 lg:w-72 max-w-sm h-full bg-bg2 flex aspect-video flex-col overflow-hidden rounded text-text1">
          <div class="bg-bg2 w-full h-full"></div>
        </div>
        <div class="max-w-sm w-full">
          <div class="animate-pulse w-3/4 h-4 bg-bg2 rounded mt-2"></div>
          <div class="animate-pulse w-1/2 h-4 bg-bg2 rounded mt-2"></div>
        </div>
      </div>
    );

  const sync = useSyncStore();

  const watchedAtDate = () => sync.store.history[getVideoId(props.v)!]?.watchedAt;

  const [watchedAt, setWatchedAt] = createSignal<string | undefined>(undefined);
  createEffect(() => {
    const [watchedAt] = createTimeAgo(watchedAtDate() ?? new Date(), {
      interval: 1000 * 60,
    });
    setWatchedAt(watchedAt());
  });

  const [uploaded] = createTimeAgo(props.v.uploaded, { interval: 1000 * 60 });

  const historyItem = () => sync.store.history[getVideoId(props.v)!]

  return (
    <div
      class={` flex w-full max-w-md mx-1 sm:w-72 flex-col items-start rounded-xl bg-bg1 p-2`}
    >
      <A
        href={`/watch?v=${getVideoId(props.v)}`}
        class="relative flex aspect-video w-full flex-col overflow-hidden rounded text-text1 outline-none focus-visible:ring-2 focus-visible:ring-primary"
        title={props.v.title}
      >
        <img
          class={`cursor-pointer w-full aspect-video max-w-md break-words ${historyItem() ? "saturate-[0.35] opacity-75" : ""
            } `}
          src={generateThumbnailUrl(
            sync.store!.preferences?.instance?.image_proxy_url ??
            "https://pipedproxy.kavin.rocks",
            getVideoId(props.v)!
          )}
          // placeholder="blur"
          width={2560}
          height={1440}
          alt=""
          loading="lazy"
        />
        <Switch>
          <Match when={historyItem()?.watchedAt}>
            <div class="relative h-0 w-0 ">
              <div class="absolute left-2 bottom-2 bg-bg1/90 rounded px-1 py-px border border-bg2 w-max h-max text-xs">
                Watched {watchedAt()}
              </div>
            </div>
          </Match>
          <Match
            when={
              historyItem() &&
              !historyItem()?.watchedAt
            }
          >
            <div class="absolute left-2 bottom-2 bg-bg1/90 rounded px-1 py-px border border-bg2 w-max h-max text-xs">
              Watched
            </div>
          </Match>
        </Switch>
        <div class="relative h-0 w-12 place-self-end lg:w-16 ">
          <div class="absolute bottom-2 right-2 bg-bg1/90 rounded px-1 py-px border border-bg2 text-xs">
            <Show when={props.v.duration === -1}>Live</Show>
            <Show when={props.v.duration !== -1}>
              {numeral(props.v.duration).format("00:00:00").replace(/^0:/, "")}
            </Show>
          </div>
        </div>
        {!!historyItem()?.currentTime && (
          <div class="relative h-0 w-full">
            <div
              style={{
                width: `clamp(0%, ${(historyItem().currentTime! / props.v.duration) * 100
                  }%, 100%`,
              }}
              class="absolute bottom-0 h-1 bg-highlight"
            ></div>
          </div>
        )}
      </A>
      <div class="mt-2 flex w-full max-h-20 min-w-0 max-w-full justify-between ">
        <div class="flex flex-col gap-2 pr-2 ">
          <A
            href={props.v.url ?? `/watch?v=${getVideoId(props.v)}`}
            class=" two-line-ellipsis min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title={props.v.title}
          >
            {props.v.title}
          </A>

          <div class="flex gap-2 text-text2">
            <Show when={props.v.uploaderAvatar}>
              <div class="group mb-1 w-max underline ">
                <A
                  href={props.v.uploaderUrl || ""}
                  class="flex max-w-max items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <img
                    src={props.v.uploaderAvatar!}
                    width={32}
                    height={32}
                    class="rounded-full"
                    alt=""
                  />
                </A>
              </div>
            </Show>

            <div class="flex w-full flex-col text-xs">
              <A
                href={props.v.uploaderUrl || ""}
                class="outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div class="peer w-fit ">{props.v.uploaderName}</div>
              </A>
              <div class="flex ">
                <Show when={props.v.views}>
                  <div
                    class="w-fit"
                    title={`${numeral(props.v.views).format("0,0")} views`}
                  >
                    {" "}
                    {numeral(props.v.views).format("0a").toUpperCase()} views
                  </div>
                </Show>

                <div class="group w-fit pl-1">
                  <Show when={props.v.uploaded && props.v.uploaded !== -1}>
                    <div
                      title={new Date(props.v.uploaded).toLocaleString()}
                      class=""
                    >
                      {" "}
                      • {uploaded()}{" "}
                    </div>
                  </Show>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col justify-between">
          <VideoCardMenu v={props.v} progress={historyItem()?.currentTime} />
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
