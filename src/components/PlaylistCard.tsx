import type { RelatedPlaylist, } from "~/types";
import {
  Match,
  Show,
  Switch,
  createSignal,
} from "solid-js";
import { useSyncStore, HistoryItem } from "~/stores/syncStore";
import { mergeProps } from "solid-js";
import { Tooltip } from "./Tooltip";
import { A } from "@solidjs/router";

const PlaylistCard = (props: {
  item?: (RelatedPlaylist),
  layout?: "list" | "grid" | "sm:grid"
}) => {
  props = mergeProps({ layout: "sm:grid" as "sm:grid" }, props);

  return (
    <div
      classList={{
        "flex flex-row gap-2 mx-1 items-start rounded-xl bg-bg1 p-2 ": true,
        "min-w-full": props.layout === "list",
        "sm:max-w-max  sm:flex-col sm:w-72 sm:gap-0 min-w-full sm:min-w-0": props.layout === "sm:grid",
        "h-max max-h-max max-w-max flex-col w-full gap-2 sm:w-72": props.layout === "grid",

      }}
    >
      <div classList={{
        "aspect-video overflow-hidden rounded": true,
        "max-h-96": props.layout === "list",
        "max-h-44 min-w-min sm:max-h-full sm:w-full": props.layout === "sm:grid",

      }}>
        <Show when={props.item} fallback={<ImageContainerFallback layout={props.layout as any}
        />}>
          <ImageContainer
            url={props.item!.url}
            src={props.item!.thumbnail}
            videos={props.item!.videos}
          />
        </Show>
      </div>
      <div classList={{
        "flex w-full min-w-0 justify-between h-full  sm:mt-2 max-h-20": true,
        "max-w-[22rem]": props.layout === "grid",
      }}>
        <div classList={{
          "flex flex-col min-w-0 gap-2 pr-2 h-full w-full": true,
          "max-w-[10rem] [@media(min-width:380px)]:max-w-[11rem] [@media(min-width:400px)]:max-w-full": props.layout === "sm:grid" || props.layout === "list",
          "max-w-full": props.layout === "grid",
        }}
        >
          <Show when={props.item}
            fallback={<div class="flex flex-col gap-1"><div aria-hidden="true"
              class="animate-pulse bg-bg2 w-full rounded-lg h-4 ">
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
                  href={props.item!.url}
                  class="rounded text-start two-line-ellipsis min-w-0 py-1 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {props.item!.name}
                </A>
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
            <PlaylistMenu v={props.item!} />
          </Show>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard

const ImageContainer = (props: {
  url: string;
  src: string;
  videos: number;
}) => {

  return (
    <A
      href={props.url}
      class="relative w-[10rem] flex aspect-video sm:w-full flex-col overflow-hidden rounded sm:min-w-min text-text1 outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <img
        classList={{
          "cursor-pointer w-full sm:min-w-[10rem] aspect-video max-w-md break-words ": true,
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
          <Show when={props.videos >= 1}>
            {props.videos} videos
          </Show>
        </div>
      </div>
    </A>
  )
}

const ImageContainerFallback = (props: { layout: "list" | "grid" | "sm:grid" }
) => {
  return (
    <div classList={{
      "relative flex aspect-video w-full min-w-0 flex-col rounded-lg overflow-hidden": true,
      "w-[10rem] sm:w-full sm:max-w-[18rem]": props.layout === "sm:grid",
      "w-[10rem]": props.layout === "list",
    }}>

      <div class="animate-pulse bg-bg2 aspect-video h-full overflow-hidden max-w-fit w-full">
        <div class="w-96 h-full" />
      </div>
    </div >
  );
}

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
            <A
              href={props.uploaderUrl || ""}
              class="rounded outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div class="peer w-fit truncate max-w-[10rem]">{props.uploaderName}</div>
            </A>
          </Match>
          <Match when={props.uploaderName && !props.uploaderUrl}>
            <div class="peer w-fit truncate max-w-[10rem]">{props.uploaderName}</div>
          </Match>
        </Switch>
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


import { DropdownMenu } from "@kobalte/core";
import { BsChevronRight, BsThreeDotsVertical } from "solid-icons/bs";
import { FaRegularEye, FaRegularEyeSlash, FaSolidBan, FaSolidBug, FaSolidHeartCircleMinus, FaSolidHeartCirclePlus, FaSolidPlus, FaSolidShare } from "solid-icons/fa";
import { TbClockPlus } from "solid-icons/tb";
import { ConduitPlaylist, Playlist, RelatedStream } from "~/types";
import { yieldToMain } from "~/utils/helpers";
import Button from "./Button";
import Modal from "./Modal";
import Select from "./Select";
import { toast } from "./Toast";

function PlaylistMenu(props: { v: RelatedPlaylist }) {

  const [dropdownOpen, setDropdownOpen] = createSignal(false);
  const [modalOpen, setModalOpen] = createSignal(false);
  const sync = useSyncStore();
  const [playlistModalOpen, setPlaylistModalOpen] = createSignal(false);

  return (<>
    <DropdownMenu.Root
      overlap={true}
      open={dropdownOpen()}
      onOpenChange={setDropdownOpen}
      gutter={0}
      modal={true}
      hideWhenDetached={true}
    >
      <DropdownMenu.Trigger class="p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
        <BsThreeDotsVertical
          fill="currentColor"
          class="text-text2 w-6 h-6 group-hover:text-text1"
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          onTouchEnd={async (e) => { await yieldToMain(); e.preventDefault(); e.stopPropagation(); }}

          class="bg-bg1 border border-bg2 shadow p-2 rounded-md z-50
                -translate-y-4
                animate-in
                fade-in
                slide-in-from-top-10
                duration-200
                ">
          <DropdownMenu.Arrow />
          <DropdownMenu.Item
            class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
            onClick={(e) => {
              e.stopPropagation();
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
            }}
            onSelect={() => {
            }}
          >
            <div class="flex items-center gap-2">
              <FaSolidShare />
              <div class="text-text1">Share</div>
            </div>
          </DropdownMenu.Item>
          <Show when={props.v.uploaderName && props.v.uploaderUrl}>
            <DropdownMenu.Group class="mt-2">
              <DropdownMenu.GroupLabel class="flex items-center gap-2">
                <span class="text-text2 max-w-xs truncate">{props.v.uploaderName}</span>
              </DropdownMenu.GroupLabel>
              <DropdownMenu.Item
                class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border- hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                }}
                onSelect={() => {
                  const id = props.v.uploaderUrl.split("/channel/")[1];
                  const isSubscribed = sync.store.subscriptions[id];
                  if (isSubscribed) {
                    sync.setStore("subscriptions", id, undefined!);
                    toast.success(`Unsubscribed from ${props.v.uploaderName}.`);
                  } else {
                    sync.setStore("subscriptions", id, { subscribedAt: Date.now() });
                    toast.success(`Subscribed to ${props.v.uploaderName}.`);
                  }
                }}
              >
                <div class="flex items-center gap-2">
                  <Show when={sync.store.subscriptions[props.v.uploaderUrl.split("/channel/")[1]]}>
                    <FaSolidHeartCircleMinus />
                  </Show>
                  <Show when={!sync.store.subscriptions[props.v.uploaderUrl.split("/channel/")[1]]}>
                    <FaSolidHeartCirclePlus />
                  </Show>
                  <div class="text-text1">
                    {sync.store.subscriptions[props.v.uploaderUrl.split("/channel/")[1]] ? "Unsubscribe" : "Subscribe"}
                  </div>

                </div>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                }}
                onSelect={() => { }}
              >
                <div class="flex items-center gap-2">
                  <FaSolidBan />
                  <div class="text-text1">Block</div>
                </div>
              </DropdownMenu.Item>
            </DropdownMenu.Group>
          </Show>

          <DropdownMenu.Item
            class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded  hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
            onSelect={() => setModalOpen(true)}
          >
            <div class="flex items-center gap-2">
              <FaSolidBug fill="currentColor" />
              <div class="text-text1">Debug info</div>
            </div>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
    <Modal
      isOpen={modalOpen()}
      setIsOpen={setModalOpen}
      title="Debug info"
    >
      <pre class="break-all text-text1 max-w-full min-w-0 overflow-auto z-[9999999]">
        {JSON.stringify(props.v, null, 2)}
      </pre>
    </Modal>
  </>
  )
}

