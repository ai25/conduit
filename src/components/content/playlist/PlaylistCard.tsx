import type { RelatedPlaylist } from "~/types";
import { Match, Show, Switch, createSignal } from "solid-js";
import { useSyncStore, HistoryItem } from "~/stores/syncStore";
import { mergeProps } from "solid-js";
import { Tooltip } from "~/components/Tooltip";
import PlaylistMenu from "./PlaylistCardMenu";
import Link from "~/components/Link";

const PlaylistCard = (props: {
  item?: RelatedPlaylist;
  layout?: "list" | "grid" | "sm:grid";
}) => {
  props = mergeProps({ layout: "sm:grid" as "sm:grid" }, props);

  return (
    <div
      classList={{
        "flex flex-row gap-2 overflow-hidden items-start h-max rounded-xl bg-bg1 p-2 ":
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
          "aspect-video overflow-hidden rounded h-full": true,
          "max-h-96": props.layout === "list",
          "max-h-44 min-w-min sm:max-h-full sm:w-full sm:h-full":
            props.layout === "sm:grid",
        }}
      >
        <Show
          when={props.item?.thumbnail}
          fallback={
            <ImageContainer
              url={props.item?.url ?? ""}
              src="/img/placeholder.webp"
              videos={props.item?.videos ?? 0}
            />
          }
        >
          <ImageContainer
            url={props.item!.url}
            src={props.item!.thumbnail}
            videos={props.item!.videos}
          />
        </Show>
      </div>
      <div
        classList={{
          "flex w-full min-w-0 justify-between h-full  sm:mt-2 max-h-20": true,
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
          <Show
            when={props.item}
            fallback={
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
            }
          >
            <Tooltip
              as="div"
              placement="top"
              openDelay={1000}
              triggerSlot={
                <Link
                  href={props.item!.url}
                  class="rounded text-start two-line-ellipsis min-w-0 py-1 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {props.item!.name}
                </Link>
              }
              contentSlot={props.item!.name}
            />
          </Show>

          <Show when={props.item} fallback={<InfoContainerFallback />}>
            <InfoContainer
              url={props.item!.url}
              title={props.item!.name}
              uploaderName={props.item!.uploaderName}
              uploaderUrl={props.item!.uploaderUrl}
            />
          </Show>
        </div>

        <div class="flex flex-col justify-start min-w-[32px]">
          <Show when={props.item}>
            <PlaylistMenu item={props.item!} />
          </Show>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;

const ImageContainer = (props: {
  url: string;
  src: string;
  videos: number;
}) => {
  return (
    <Link
      href={props.url}
      class="relative min-w-[10rem] flex aspect-video sm:w-full flex-col overflow-hidden rounded sm:min-w-min text-text1 outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <img
        classList={{
          "cursor-pointer w-full sm:min-w-[10rem] aspect-video max-w-md break-words ":
            true,
        }}
        src={props.src}
        width={2560}
        height={1440}
        alt=""
        loading="lazy"
      />
      <div class="relative h-0 w-12 place-self-end lg:w-16 ">
        <div class="absolute w-max bottom-2 right-2 bg-bg1/90 rounded px-1 py-px border border-bg2 text-xs">
          <Show when={props.videos < 1}>Mix</Show>
          <Show when={props.videos >= 1}>{props.videos} videos</Show>
        </div>
      </div>
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
}) => {
  return (
    <div class="flex gap-1 text-text2 w-full max-w-full ">
      <div class="flex w-full flex-col text-xs ">
        <Switch>
          <Match when={props.uploaderName && props.uploaderUrl}>
            <Link
              href={props.uploaderUrl || ""}
              class="rounded outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div class="peer w-fit truncate max-w-[10rem]">
                {props.uploaderName}
              </div>
            </Link>
          </Match>
          <Match when={props.uploaderName && !props.uploaderUrl}>
            <div class="peer w-fit truncate max-w-[10rem]">
              {props.uploaderName}
            </div>
          </Match>
        </Switch>
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
