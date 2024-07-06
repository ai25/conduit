import type { RelatedStream } from "~/types";
import numeral from "numeral";
// import { DBContext } from "~/routes/layout";
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
import {
  formatRelativeShort,
  generateThumbnailUrl,
  getVideoId,
} from "~/utils/helpers";
import { mergeProps } from "solid-js";
import { createTimeAgo } from "@solid-primitives/date";
import VideoCardMenu from "./VideoCardMenu";
import { FaSolidEye } from "solid-icons/fa";
import { Tooltip } from "~/components/Tooltip";
import Link from "~/components/Link";
import { useSearchParams } from "@solidjs/router";

const VideoCard = (props: {
  v?: RelatedStream;
  layout?: "list" | "grid" | "sm:grid";
}) => {
  props = mergeProps({ layout: "sm:grid" as "sm:grid" }, props);

  const sync = useSyncStore();
  const [searchParams] = useSearchParams();

  const watchedAtDate = () =>
    sync.store.history[getVideoId(props.v)!]?.watchedAt;
  const [watchedAt, setWatchedAt] = createSignal<string | undefined>(undefined);

  createEffect(() => {
    const [watchedAt] = createTimeAgo(watchedAtDate() ?? new Date(), {
      interval: 1000 * 60,
      relativeFormatter: formatRelativeShort,
    });
    setWatchedAt(watchedAt());
  });

  const id = () => getVideoId(props.v);
  const historyItem = () => (id() ? sync.store.history[id()!] : undefined);

  return (
    <Show
      when={props.v}
      fallback={<VideoCardFallback layout={props.layout!} />}
    >
      <div
        classList={{
          "flex flex-row gap-2 items-start rounded-xl bg-bg1 p-2 overflow-hidden":
            true,
          "min-w-full": props.layout === "list",
          "sm:max-w-max  sm:flex-col sm:w-72 sm:gap-0 min-w-full sm:min-w-0":
            props.layout === "sm:grid",
          "h-max max-h-max max-w-max flex-col w-full gap-2 sm:w-72":
            props.layout === "grid",
        }}
      >
        <div
          classList={{
            "aspect-video overflow-hidden rounded": true,
            "max-h-96": props.layout === "list",
            "max-h-44 min-w-min sm:max-h-full sm:w-full":
              props.layout === "sm:grid",
          }}
        >
          <ImageContainer
            url={`/watch?v=${id()}${searchParams.fullscreen ? `&fullscreen=${searchParams.fullscreen}` : ""}`}
            src={props.v!.thumbnail}
            duration={props.v!.duration}
            watched={!!historyItem()}
            watchedAt={watchedAt()}
            currentTime={historyItem()?.currentTime}
          />
        </div>
        <div
          classList={{
            "flex w-full min-w-0 max-w-full justify-between h-full  sm:mt-2 max-h-20":
              true,
            "max-w-[22rem]": props.layout === "grid",
          }}
        >
          <div
            classList={{
              "flex flex-col min-w-0 gap-2 pr-2 h-full w-full": true,
              "max-w-[10rem] [@media(min-width:380px)]:max-w-[11rem] [@media(min-width:400px)]:max-w-full":
                props.layout === "sm:grid" || props.layout === "list",
              "max-w-full": props.layout === "grid",
            }}
          >
            <Tooltip
              as="div"
              placement="top"
              openDelay={1000}
              triggerSlot={
                <Link
                  href={`/watch?v=${id()}`}
                  class="rounded text-start two-line-ellipsis min-w-0 py-1 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {props.v!.title}
                </Link>
              }
              contentSlot={props.v!.title}
            />

            <InfoContainer
              url={props.v!.url}
              title={props.v!.title}
              uploaderName={props.v!.uploaderName}
              uploaderUrl={props.v!.uploaderUrl}
              uploaderAvatar={props.v!.uploaderAvatar}
              views={props.v!.views}
              uploaded={createTimeAgo(props.v!.uploaded, {
                interval: 3600 * 1000,
              })[0]()}
              uploadedDate={new Date(props.v!.uploaded)}
              live={props.v!.uploaded === -1}
            />
          </div>

          <div class="flex flex-col justify-start min-w-[32px]">
            <VideoCardMenu v={props.v!} progress={historyItem()?.currentTime} />
          </div>
        </div>
      </div>
    </Show>
  );
};

export default VideoCard;
export const VideoCardFallback = (props: {
  layout: "list" | "grid" | "sm:grid";
}) => {
  return (
    <Switch>
      <Match when={props.layout === "list"}>
        <div class="flex p-2 gap-2 w-full">
          <ImageContainerFallback layout={props.layout} />
          <div class="flex flex-col gap-2 w-[60%]">
            <div class="flex flex-col gap-1">
              <div
                aria-hidden="true"
                class="animate-pulse bg-bg2 w-full rounded-lg h-4 "
              />
              <div
                aria-hidden="true"
                class="animate-pulse bg-bg2 w-1/2 h-4 rounded-lg "
              />
            </div>
            <InfoContainerFallback />
          </div>
        </div>
      </Match>
      <Match when={props.layout === "grid"}>
        <div class="flex flex-col p-2 gap-2">
          <ImageContainerFallback layout={props.layout} />
          <div class="flex flex-col gap-2">
            <div class="flex flex-col gap-1">
              <div
                aria-hidden="true"
                class="animate-pulse bg-bg2 w-full rounded-lg h-4 "
              />
              <div
                aria-hidden="true"
                class="animate-pulse bg-bg2 w-1/2 h-4 rounded-lg "
              />
            </div>
            <InfoContainerFallback />
          </div>
        </div>
      </Match>
      <Match when={props.layout === "sm:grid"}>
        <div class="flex sm:flex-col p-2 gap-2 w-full sm:w-auto">
          <ImageContainerFallback layout={props.layout} />
          <div class="flex flex-col gap-2 w-[60%] sm:w-auto">
            <div class="flex flex-col gap-1">
              <div
                aria-hidden="true"
                class="animate-pulse bg-bg2 w-full rounded-lg h-4 "
              />
              <div
                aria-hidden="true"
                class="animate-pulse bg-bg2 w-1/2 h-4 rounded-lg "
              />
            </div>
            <InfoContainerFallback />
          </div>
        </div>
      </Match>
    </Switch>
  );
};

const ImageContainer = (props: {
  url: string;
  src: string;
  duration: number;
  watched?: boolean;
  watchedAt?: string | undefined;
  currentTime?: number;
}) => {
  const [src, setSrc] = createSignal(props.src);

  return (
    <Link
      href={props.url}
      class="relative min-w-[10rem] flex aspect-video sm:w-full flex-col overflow-hidden rounded sm:min-w-min text-text1 outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <img
        classList={{
          "cursor-pointer w-full aspect-video max-w-md break-words ": true,
          "saturate-[0.35] opacity-75": props.watched,
        }}
        src={src()}
        onError={() => {
          setSrc("/img/error.png");
        }}
        width={2560}
        height={1440}
        alt=""
        loading="lazy"
      />
      <Switch>
        <Match when={props.watched && props.watchedAt}>
          <div class="relative h-0 w-0 ">
            <div class="absolute flex items-center left-2 bottom-2 bg-bg1/90 rounded px-1 py-px border border-bg2 w-max h-max text-xs">
              <FaSolidEye title="Watched" class="inline-block h-3 w-3 mr-1" />
              {props.watchedAt}
            </div>
          </div>
        </Match>
        <Match when={props.watched && !props.watchedAt}>
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
              width: `clamp(0%, ${
                (props.currentTime! / props.duration) * 100
              }%, 100%`,
            }}
            class="absolute bottom-0 h-1 bg-highlight"
          />
        </div>
      </Show>
    </Link>
  );
};

const ImageContainerFallback = (props: {
  layout: "list" | "grid" | "sm:grid";
}) => {
  return (
    <div
      classList={{
        "relative flex aspect-video min-w-0 flex-col rounded-lg overflow-hidden":
          true,
        "w-full": props.layout === "grid",
        "w-[10rem] sm:w-full sm:max-w-[18rem]": props.layout === "sm:grid",
        "w-[10rem]": props.layout === "list",
      }}
    >
      <div class="animate-pulse bg-bg2 aspect-video h-full overflow-hidden max-w-fit w-full">
        <div class="w-96 h-full" />
      </div>
    </div>
  );
};

const InfoContainer = (props: {
  url: string;
  title: string;
  uploaderName: string;
  uploaderUrl: string;
  uploaderAvatar: string | null;
  views: number;
  uploaded: string;
  uploadedDate: Date;
  live: boolean;
}) => {
  const uploaderUrl = () => {
    let url = "";
    if (!props.uploaderUrl) return url;
    console.log(props.uploaderUrl, "uploaderUrl");
    if (props.uploaderUrl?.startsWith("UC")) {
      url = `/channel/${props.uploaderUrl}`;
    } else if (props.uploaderUrl?.startsWith("/")) {
      url = props.uploaderUrl;
    }
    return url;
  };

  return (
    <div class="flex gap-1 text-text2 w-full sm:max-w-full ">
      <Show when={props.uploaderAvatar}>
        <div class="group mb-1 w-max">
          <Link
            // tabindex={-1}
            // aria-hidden="true"
            href={uploaderUrl()}
            class="flex max-w-max min-w-min items-center outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <img
              src={props.uploaderAvatar!}
              class="rounded-full w-6 h-6 aspect-square min-w-[24px] min-h-[24px]"
              alt=""
            />
          </Link>
        </div>
      </Show>

      <div class="flex w-full flex-col text-xs ">
        <Link
          href={uploaderUrl()}
          class="outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div class="peer w-fit truncate max-w-[10rem]">
            {props.uploaderName}
          </div>
        </Link>
        <div class="flex flex-wrap w-full">
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
            <div title={props.uploadedDate.toLocaleString()} class="">
              {props.uploaded}{" "}
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};

const InfoContainerFallback = () => {
  return (
    <div class="flex flex-col gap-2 pr-2 w-full ">
      <div class="flex gap-2 text-text2">
        <div class="animate-pulse bg-bg2 w-8 h-8 aspect-square rounded-full" />
        <div class="flex w-full flex-col gap-2 justify-center">
          <div class="animate-pulse bg-bg2 w-32 h-4 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
