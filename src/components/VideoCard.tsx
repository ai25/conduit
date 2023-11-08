import type { RelatedStream } from "~/types";
import numeral from "numeral";
// import { DBContext } from "~/routes/layout";
import { A, useSearchParams } from "solid-start";
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
import { FaSolidEye } from "solid-icons/fa";
import { Tooltip } from "./Tooltip";

function formatRelativeShort(now: Date, past: Date): string {
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const secondsInAMinute = 60;
  const secondsInAnHour = secondsInAMinute * 60;
  const secondsInADay = secondsInAnHour * 24;
  const secondsInAMonth = secondsInADay * 30; // rough average
  const secondsInAYear = secondsInADay * 365; // ignoring leap years for simplicity

  if (diffInSeconds >= secondsInAYear) {
    return `${Math.floor(diffInSeconds / secondsInAYear)}Y`;
  } else if (diffInSeconds >= secondsInAMonth) {
    return `${Math.floor(diffInSeconds / secondsInAMonth)}M`;
  } else if (diffInSeconds >= secondsInADay) {
    return `${Math.floor(diffInSeconds / secondsInADay)}d`;
  } else if (diffInSeconds >= secondsInAnHour) {
    return `${Math.floor(diffInSeconds / secondsInAnHour)}h`;
  } else if (diffInSeconds >= secondsInAMinute) {
    return `${Math.floor(diffInSeconds / secondsInAMinute)}m`;
  } else {
    return `now`;
  }
}

const VideoCard = (props: {
  v?: (RelatedStream),
}) => {

  const sync = useSyncStore();

  const watchedAtDate = () => sync.store.history[getVideoId(props.v)!]?.watchedAt;

  const [watchedAt, setWatchedAt] = createSignal<string | undefined>(undefined);
  createEffect(() => {
    const [watchedAt] = createTimeAgo(watchedAtDate() ?? new Date(), {
      interval: 1000 * 60,
      relativeFormatter: formatRelativeShort,
    });
    setWatchedAt(watchedAt());
  });

  const [uploaded] = props.v ? createTimeAgo(props.v.uploaded, { interval: 0 }) : [() => ""];
  const id = () => getVideoId(props.v);
  const thumbnailUrl = () => generateThumbnailUrl(
    sync.store!.preferences?.instance?.image_proxy_url ??
    "https://pipedproxy.kavin.rocks",
    getVideoId(props.v)!
  )

  const historyItem = () => id() ? sync.store.history[id()!] : undefined;
  const [searchParams] = useSearchParams()

  return (
    <div
      classList={{
        "flex w-full sm:max-w-max mx-1 items-start rounded-xl bg-bg1 p-2 sm:flex-col sm:w-72 flex-row gap-2 sm:gap-0 min-w-full sm:min-w-0": true,
      }}
    >
      <div classList={{
        "max-w-sm max-h-44 aspect-video sm:max-h-full overflow-hidden min-w-min sm:w-full": true

      }}>
        <Show when={props.v} fallback={<ImageContainerFallback />}>
          <ImageContainer
            url={`/watch?v=${id()}${searchParams.fullscreen? `&fullscreen=${searchParams.fullscreen}` : ""}`}
            src={thumbnailUrl()}
            duration={props.v!.duration}
            watched={!!historyItem()}
            watchedAt={watchedAt()}
            currentTime={historyItem()?.currentTime}
          />
        </Show>
      </div>
      <div classList={{
        "flex w-full min-w-0 max-w-full justify-between h-full sm:mt-2 sm:max-h-20": true,
      }}>
        <div classList={{
          "flex flex-col flex-1 gap-2 pr-2 h-full": true,
        }}
        >
          <Show when={props.v}
            fallback={<div class="flex flex-col gap-1"><div aria-hidden="true"
              class="animate-pulse bg-bg2 w-full rounded-lg h-4 text-transparent">
              placeholder placeholder placeholder placeholder pla
            </div>
              <div aria-hidden="true"
                class="animate-pulse bg-bg2 w-1/2 h-4 rounded-lg " />

            </div>}

          >
            <Tooltip
              as="div"
              placement="top"
              openDelay={1000}
              triggerSlot={
                <A
                  href={`/watch?v=${id()}${searchParams.fullscreen? `&fullscreen=${searchParams.fullscreen}` : ""}`}
                  class="text-start two-line-ellipsis min-w-0 py-1 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {props.v!.title}
                </A>
              }
              contentSlot={props.v!.title}
            />
          </Show>

          <Show when={props.v} fallback={<InfoContainerFallback />}>
            <InfoContainer
              url={props.v!.url}
              title={props.v!.title}
              uploaderName={props.v!.uploaderName}
              uploaderUrl={props.v!.uploaderUrl}
              uploaderAvatar={props.v!.uploaderAvatar}
              views={props.v!.views}
              uploaded={uploaded()}
              live={props.v!.uploaded === -1}
            />
          </Show>
        </div>

        <div class="flex flex-col justify-between">
          <Show when={props.v}>
            <VideoCardMenu v={props.v!} progress={historyItem()?.currentTime} />
          </Show>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;

const ImageContainer = (props: {
  url: string;
  src: string;
  duration: number;
  watched?: boolean;
  watchedAt?: string | undefined;
  currentTime?: number;
}) => {

  return (
    <A
      href={props.url}
      class="relative flex aspect-video w-full flex-col overflow-hidden rounded min-w-min text-text1 outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <img
        classList={{
          "cursor-pointer w-full min-w-[10rem] aspect-video max-w-md break-words ": true,
          "saturate-[0.35] opacity-75": props.watched,
        }}
        src={props.src}
        width={2560}
        height={1440}
        alt=""
        loading="lazy"
      />
      <Switch>
        <Match when={props.watched && props.watchedAt}>
          <div
            class="relative h-0 w-0 ">
            <div class="absolute flex items-center left-2 bottom-2 bg-bg1/90 rounded px-1 py-px border border-bg2 w-max h-max text-xs">
              <FaSolidEye title="Watched" class="inline-block h-3 w-3 mr-1" />
              {props.watchedAt}
            </div>
          </div>
        </Match>
        <Match
          when={
            props.watched &&
            !props.watchedAt
          }
        >
          <div class="absolute left-2 bottom-2 bg-bg1/90 rounded px-1 py-px border border-bg2 w-max h-max text-xs">
            Watched
          </div>
        </Match>
      </Switch>
      <div class="relative h-0 w-12 place-self-end lg:w-16 ">
        <div class="absolute bottom-2 right-2 bg-bg1/90 rounded px-1 py-px border border-bg2 text-xs">
          <Show when={props.duration === -1}>Live</Show>
          <Show when={props.duration !== -1}>
            {numeral(props.duration).format("00:00:00").replace(/^0:/, "")}
          </Show>
        </div>
      </div>
      <Show when={props.currentTime}>
        <div class="relative h-0 w-full">
          <div
            style={{
              width: `clamp(0%, ${(props.currentTime! / props.duration) * 100
                }%, 100%`,
            }}
            class="absolute bottom-0 h-1 bg-highlight"
          ></div>
        </div>
      </Show>
    </A>
  )
}

const ImageContainerFallback = () => {
  return (
    <div class="relative flex aspect-video w-full flex-col rounded-lg overflow-hidden max-w-md">
      <div class="animate-pulse bg-bg2 aspect-video h-full max-w-max w-full">
        <div class="bg-bg2 animate-pulse aspect-auto h-96 max-w-fit w-full invisible"
          // src=""
          // width={2560}
          // height={1440}
          aria-hidden="true"
          // alt=""
          // loading="lazy"
        > 
        placeholder placeholder placeholder placeh
        placeholder placeholder placeholder placeh
        placeholder placeholder placeholder placeh
        placeholder placeholder placeholder placeh
        </div> 
      </div>
    </div>
  );
}

const InfoContainer = (props: {
  url: string;
  title: string;
  uploaderName: string;
  uploaderUrl: string;
  uploaderAvatar: string | null
  views: number;
  uploaded: string;
  live: boolean;

}) => {
  return (
    <div class="flex gap-2 text-text2">
      <Show when={props.uploaderAvatar}>
        <div class="group mb-1 w-max underline ">
          <A
            tabindex={-1}
            aria-hidden="true"
            href={props.uploaderUrl || ""}
            class="flex max-w-max items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <img
              src={props.uploaderAvatar!}
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
          href={props.uploaderUrl || ""}
          class="outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div class="peer w-fit ">{props.uploaderName}</div>
        </A>
        <div class="flex flex-wrap">
          <Show when={props.views}>
            <div
              class="w-fit"
              title={`${numeral(props.views).format("0,0")} views`}
            >
              {" "}
              {numeral(props.views).format("0a").toUpperCase()} views
            </div>
          </Show>

          <Show when={!props.live}>
            <div class="mx-1">•</div>
          </Show>
          <Show when={!props.live}>
            <div
              title={new Date(props.uploaded).toLocaleString()}
              class=""
            >{props.uploaded}{" "}
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}

const InfoContainerFallback = () => {
  return (
    <div class="flex flex-col gap-2 pr-2 w-full ">
      <div class="flex gap-2 text-text2">
        <div class="animate-pulse bg-bg2 w-8 h-8 aspect-square rounded-full"></div>
        <div class="flex w-full flex-col gap-2 justify-center">
          <div class="animate-pulse bg-bg2 w-32 h-4 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
