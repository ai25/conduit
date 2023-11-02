import { DropdownMenu } from "@kobalte/core";
import { BsChevronRight, BsThreeDotsVertical } from "solid-icons/bs";
import { FaRegularEye, FaRegularEyeSlash, FaSolidBug } from "solid-icons/fa";
import { createEffect, createSignal, createUniqueId, For, Match, Show, Switch } from "solid-js";
import { HistoryItem, useSyncStore } from "~/stores/syncStore";
import { RelatedStream } from "~/types";
import { getVideoId } from "~/utils/helpers";
import Button from "./Button";
import Modal from "./Modal";

export default function VideoCardMenu(props: { v: RelatedStream, progress: number | undefined }) {

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
    >
      <DropdownMenu.Trigger class="p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
        <BsThreeDotsVertical
          fill="currentColor"
          class="text-text2 w-6 h-6 group-hover:text-text1"
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content class="bg-bg2 p-2 rounded-md z-50
                -translate-y-4
                animate-in
                fade-in
                slide-in-from-top-10
                duration-200
                ">
          <DropdownMenu.Arrow />
          <DropdownMenu.Item
            onClick={(e) => {
              e.stopPropagation();
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
            }}
            onSelect={() => {
              setPlaylistModalOpen(true);
            }}

            class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none">
            <div class="flex items-center w-full justify-between">
              <div class="text-text1">Add to playlist</div>
              <BsChevronRight
                class="justify-self-end"
                fill="currentColor"
              />
            </div>
          </DropdownMenu.Item>
          <Show when={props.progress === undefined}>
            <DropdownMenu.Item
              class="cursor-pointer z-50 w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
              onClick={(e) => {
                e.stopPropagation();
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
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
              onClick={(e) => {
                e.stopPropagation();
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
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
    <PlaylistModal isOpen={playlistModalOpen()} setIsOpen={setPlaylistModalOpen} />
  </>
  )
}

const PlaylistModal = (props: {
  isOpen: boolean, setIsOpen: (isOpen: boolean) => void, v: RelatedStream
}) => {
  const sync = useSyncStore();
  const createPlaylist = () => {
    const name = prompt("Playlist name");
    if (!name) return;
    const id = `conduit-${createUniqueId()}`;
    sync.setStore("playlists", {
      [id]: {
        name,
        videos: [props.v],
      },
    });
  }
  return (
    <Modal
      isOpen={props.isOpen}
      setIsOpen={props.setIsOpen}
      title="Add to playlist"
    >
      <div class="flex flex-col gap-2">
        <Switch>
          <Match when={Object.keys(useSyncStore().store.playlists).length === 0}>
            <div class="flex items-center gap-2">
              <div class="text-text1">You don't have any playlists yet.</div>
            </div>
          </Match>
          <Match when={Object.keys(useSyncStore().store.playlists).length > 0}>
            <div class="text-text1">Select a playlist to add this video to:</div>
            <For each={Object.entries(useSyncStore().store.playlists)}>
              {([id, playlist]) => (
                <div class="flex items-center gap-2">
                  <div class="text-text1">{playlist.name}</div>
                </div>
              )}
            </For>
          </Match>
        </Switch>
      </div>
      <div class="flex items-center gap-2">
        <Button label="Create a playlist" onClick={() => createPlaylist()} />
      </div>

    </Modal>
  )
}
