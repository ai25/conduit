import { DropdownMenu } from "@kobalte/core";
import { BsChevronRight, BsThreeDotsVertical } from "solid-icons/bs";
import { BiSolidAddToQueue } from "solid-icons/bi";
import {
  FaRegularEye,
  FaRegularEyeSlash,
  FaSolidBan,
  FaSolidBug,
  FaSolidHeartCircleMinus,
  FaSolidHeartCirclePlus,
  FaSolidPlus,
  FaSolidShare,
} from "solid-icons/fa";
import { TbClockMinus, TbClockPlus } from "solid-icons/tb";
import {
  createEffect,
  createSignal,
  For,
  Match,
  onCleanup,
  onMount,
  Show,
  Switch,
} from "solid-js";
import { HistoryItem, useSyncStore } from "~/stores/syncStore";
import { ConduitPlaylist, Playlist, RelatedStream } from "~/types";
import { getVideoId, yieldToMain } from "~/utils/helpers";
import Button from "~/components/Button";
import Modal from "~/components/Modal";
import Select from "~/components/Select";
import { toast } from "~/components/Toast";
import AddToPlaylistModal from "../AddToPlaylistModal";
import { useAppState } from "~/stores/appStateStore";
import { useQueue } from "~/stores/queueStore";
import { AiFillMinusSquare } from "solid-icons/ai";
import ShareModal from "~/components/ShareModal";
import { CgBlock, CgUnblock } from "solid-icons/cg";

export default function VideoCardMenu(props: {
  v: RelatedStream;
  progress: number | undefined;
}) {
  const [dropdownOpen, setDropdownOpen] = createSignal(false);
  const [modalOpen, setModalOpen] = createSignal(false);
  const sync = useSyncStore();
  const [playlistModalOpen, setPlaylistModalOpen] = createSignal(false);
  const [appState, setAppState] = useAppState();
  const queue = useQueue();
  const [shareModalOpen, setShareModalOpen] = createSignal(false);
  const channelId = props.v?.uploaderUrl?.split("/channel/")[1];
  const isSubscribed = () => !!sync.store.subscriptions[channelId];
  const isBlocked = () => !!sync.store.blocklist[channelId];

  return (
    <>
      <DropdownMenu.Root
        // overlap={true}
        open={dropdownOpen()}
        onOpenChange={setDropdownOpen}
        // gutter={0}
        modal={false}
        // hideWhenDetached={true}
      >
        <DropdownMenu.Trigger
          onClick={(e) => {
            e.stopPropagation();
          }}
          class="p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          <BsThreeDotsVertical
            fill="currentColor"
            class="text-text2 w-6 h-6 group-hover:text-text1"
          />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            class="bg-bg1 border border-bg2 shadow p-2 rounded-md z-[999999]
                -translate-y-4
                animate-in
                fade-in
                slide-in-from-top-10
                duration-200
                "
          >
            <DropdownMenu.Arrow />
            <DropdownMenu.Item
              onTouchStart={() => {
                setAppState("touchInProgress", true);
              }}
              onSelect={() => {
                setPlaylistModalOpen(true);
              }}
              class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
            >
              <div class="flex items-center gap-2">
                <FaSolidPlus class="" />
                <div class="text-text1">Add to playlist</div>
              </div>
            </DropdownMenu.Item>
            <Show when={!queue.has(getVideoId(props.v)!)}>
              <DropdownMenu.Item
                onTouchStart={() => {
                  setAppState("touchInProgress", true);
                }}
                onSelect={() => {
                  queue.enqueue(props.v);
                  toast.success(
                    `Added "${props.v.title.length > 20 ? props.v.title.slice(0, 20) + "..." : props.v.title}" to the queue.`
                  );
                }}
                class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
              >
                <div class="flex items-center gap-2">
                  <BiSolidAddToQueue class="" />
                  <div class="text-text1">Add to queue</div>
                </div>
              </DropdownMenu.Item>
            </Show>
            <Show when={queue.has(getVideoId(props.v)!)}>
              <DropdownMenu.Item
                onTouchStart={() => {
                  setAppState("touchInProgress", true);
                }}
                onSelect={() => {
                  queue.remove(getVideoId(props.v)!);
                  toast.success(
                    `Removed "${props.v.title.length > 20 ? props.v.title.slice(0, 20) + "..." : props.v.title}" from the queue.`
                  );
                }}
                class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
              >
                <div class="flex items-center gap-2">
                  <AiFillMinusSquare class="" />
                  <div class="text-text1">Remove from queue</div>
                </div>
              </DropdownMenu.Item>
            </Show>
            <Show when={!queue.has(getVideoId(props.v)!)}>
              <DropdownMenu.Item
                onTouchStart={() => {
                  setAppState("touchInProgress", true);
                }}
                onSelect={() => {
                  queue.enqueueNext(props.v);
                  toast.success(
                    `Enqueued "${props.v.title.length > 20 ? props.v.title.slice(0, 20) + "..." : props.v.title}" next.`
                  );
                }}
                class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
              >
                <div class="flex items-center gap-2">
                  <BiSolidAddToQueue class="" />
                  <div class="text-text1">Enqueue next</div>
                </div>
              </DropdownMenu.Item>
            </Show>
            <Show when={!!sync.store.watchLater[getVideoId(props.v as any)!]}>
              <DropdownMenu.Item
                onTouchStart={() => {
                  setAppState("touchInProgress", true);
                }}
                onSelect={() => {
                  try {
                    sync.setStore("watchLater", {
                      [getVideoId(props.v) as string]: undefined!,
                    } as Record<string, RelatedStream>);
                    toast.success(
                      `Removed "${props.v.title.length > 20 ? props.v.title.slice(0, 20) + "..." : props.v.title}" from watch later.`
                    );
                  } catch (e) {
                    toast.error(
                      "Failed to remove from watch later. " + (e as any).message
                    );
                    console.error(e);
                  }
                }}
                class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
              >
                <div class="flex items-center gap-2">
                  <TbClockMinus class="" />
                  <div class="text-text1">Remove from "Watch later"</div>
                </div>
              </DropdownMenu.Item>
            </Show>
            <Show when={!sync.store.watchLater[getVideoId(props.v as any)!]}>
              <DropdownMenu.Item
                onTouchStart={() => {
                  setAppState("touchInProgress", true);
                }}
                onSelect={() => {
                  try {
                    sync.setStore("watchLater", {
                      [getVideoId(props.v) as string]: {
                        title: props.v.title,
                        url: props.v.url,
                        duration: props.v.duration,
                        uploaderName: props.v.uploaderName,
                        uploaderUrl: props.v.uploaderUrl,
                        uploaderAvatar: props.v.uploaderAvatar,
                        views: props.v.views,
                        uploaded: props.v.uploaded,
                        thumbnail: props.v.thumbnail,
                        uploaderVerified: props.v.uploaderVerified,
                      },
                    } as Record<string, RelatedStream>);
                    toast.success(
                      `Added "${props.v.title.length > 20 ? props.v.title.slice(0, 20) + "..." : props.v.title}" to watch later.`
                    );
                  } catch (e) {
                    toast.error(
                      "Failed to add to watch later. " + (e as any).message
                    );
                    console.error(e);
                  }
                }}
                class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
              >
                <div class="flex items-center gap-2">
                  <TbClockPlus class="" />
                  <div class="text-text1">Watch later</div>
                </div>
              </DropdownMenu.Item>
            </Show>
            <Show when={props.progress === undefined}>
              <DropdownMenu.Item
                class="cursor-pointer z-50 w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
                onTouchStart={() => {
                  setAppState("touchInProgress", true);
                }}
                as="button"
                onSelect={() => {
                  if (!props.v) return;
                  const item = {
                    [getVideoId(props.v) as string]: {
                      title: props.v.title,
                      url: props.v.url,
                      duration: props.v.duration,
                      uploaderName: props.v.uploaderName,
                      uploaderUrl: props.v.uploaderUrl,
                      uploaderAvatar: props.v.uploaderAvatar,
                      views: props.v.views,
                      uploaded: props.v.uploaded,
                      thumbnail: props.v.thumbnail,
                      uploaderVerified: props.v.uploaderVerified,
                      currentTime: props.v!.duration,
                      watchedAt: Date.now(),
                    },
                  } as Record<string, HistoryItem>;
                  sync.setStore("history", item);
                  console.log("added to history");
                }}
              >
                <div class="flex items-center gap-2">
                  <FaRegularEye fill="currentColor" />
                  <div class="text-text1">Mark as watched</div>
                </div>
              </DropdownMenu.Item>
            </Show>
            <Show when={props.progress !== undefined}>
              <DropdownMenu.Item
                class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
                onTouchStart={() => {
                  setAppState("touchInProgress", true);
                }}
                onSelect={() => {
                  sync.setStore("history", {
                    [getVideoId(props.v)!]: undefined,
                  });
                }}
              >
                <div class="flex items-center gap-2">
                  <FaRegularEyeSlash fill="currentColor" />
                  <div class="text-text1">Remove from history</div>
                </div>
              </DropdownMenu.Item>
            </Show>
            <DropdownMenu.Item
              class="cursor-pointer touch-action-none w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
              onTouchStart={() => {
                setAppState("touchInProgress", true);
              }}
              onSelect={() => {
                setShareModalOpen(true);
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
                  <img
                    src={props.v.uploaderAvatar ?? ""}
                    class="w-6 h-6 rounded-full"
                  />
                  <span class="text-text2 max-w-xs truncate">
                    {props.v.uploaderName}
                  </span>
                </DropdownMenu.GroupLabel>
                <DropdownMenu.Item
                  class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border- hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
                  onTouchStart={() => {
                    setAppState("touchInProgress", true);
                  }}
                  onSelect={() => {
                    if (isSubscribed()) {
                      sync.setStore("subscriptions", channelId, undefined!);
                      toast.success(
                        `Unsubscribed from ${props.v.uploaderName}.`
                      );
                    } else {
                      sync.setStore("subscriptions", channelId, {
                        subscribedAt: Date.now(),
                        name: props.v.uploaderName,
                      });
                      toast.success(`Subscribed to ${props.v.uploaderName}.`);
                    }
                  }}
                >
                  <div class="flex items-center gap-2">
                    <Show when={isSubscribed()}>
                      <FaSolidHeartCircleMinus />
                    </Show>
                    <Show when={!isSubscribed()}>
                      <FaSolidHeartCirclePlus />
                    </Show>
                    <div class="text-text1">
                      {isSubscribed() ? "Unsubscribe" : "Subscribe"}
                    </div>
                  </div>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
                  onTouchStart={() => {
                    setAppState("touchInProgress", true);
                  }}
                  onSelect={() => {
                    try {
                      if (isBlocked()) {
                        sync.setStore("blocklist", channelId, undefined!);
                        toast.success(`Unblocked ${props.v.uploaderName}.`, ()=>{
                        sync.setStore("blocklist", channelId, {
                          name: props.v.uploaderName,
                        });

                        });
                      } else {
                        sync.setStore("blocklist", channelId, {
                          name: props.v.uploaderName,
                        });
                        toast.success(`Blocked ${props.v.uploaderName}.`,()=>{
                        sync.setStore("blocklist", channelId, undefined!);
                        });
                      }
                    } catch (e) {
                      toast.error(
                        `Failed to ${
                          isBlocked() ? "unblock" : "block"
                        } channel. ${(e as any).message}`
                      );
                      console.error(e);
                    }
                  }}
                >
                  <div class="flex items-center gap-2">
                    <Show when={isBlocked()}>
                      <CgUnblock class="w-5 h-5" />
                      <div class="text-text1">Unblock</div>
                    </Show>
                    <Show when={!isBlocked()}>
                      <CgBlock class="w-6 h-6" />
                      <div class="text-text1">Block</div>
                    </Show>
                  </div>
                </DropdownMenu.Item>
              </DropdownMenu.Group>
            </Show>

            <DropdownMenu.Item
              onTouchStart={() => {
                setAppState("touchInProgress", true);
              }}
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
      <Modal isOpen={modalOpen()} setIsOpen={setModalOpen} title="Debug info">
        <pre class="break-all text-text1 max-w-full min-w-0 overflow-auto z-[9999999]">
          {JSON.stringify(props.v, null, 2)}
        </pre>
      </Modal>
      <AddToPlaylistModal
        isOpen={playlistModalOpen()}
        setIsOpen={setPlaylistModalOpen}
        v={props.v}
      />
      <ShareModal
        isOpen={shareModalOpen()}
        setIsOpen={setShareModalOpen}
        thumbnail={props.v.thumbnail}
        id={getVideoId(props.v)!}
        title={props.v.title}
      />
    </>
  );
}
