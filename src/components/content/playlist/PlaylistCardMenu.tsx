import { DropdownMenu } from "@kobalte/core";
import { BsThreeDotsVertical } from "solid-icons/bs";
import {
  FaRegularEye,
  FaRegularEyeSlash,
  FaSolidBan,
  FaSolidBug,
  FaSolidHeartCircleMinus,
  FaSolidHeartCirclePlus,
  FaSolidPlus,
  FaSolidShare,
  FaSolidTrashCan,
} from "solid-icons/fa";
import { TbClockPlus } from "solid-icons/tb";
import { yieldToMain } from "~/utils/helpers";
import Modal from "~/components/Modal";
import { toast } from "~/components/Toast";
import { RelatedPlaylist } from "~/types";
import { Show, createSignal } from "solid-js";
import { useSyncStore } from "~/stores/syncStore";
import { useAppState } from "~/stores/appStateStore";
import { CgBlock, CgUnblock } from "solid-icons/cg";
import Button from "~/components/Button";

export default function PlaylistMenu(props: { item: RelatedPlaylist }) {
  const [dropdownOpen, setDropdownOpen] = createSignal(false);
  const [debugModalOpen, setDebugModalOpen] = createSignal(false);
  const [deleteModalOpen, setDeleteModalOpen] = createSignal(false);
  const sync = useSyncStore();
  const [, setAppState] = useAppState();
  const channelId = props.item?.uploaderUrl?.split("/channel/")[1];
  const isSubscribed = () => !!sync.store.subscriptions[channelId];
  const isBlocked = () => !!sync.store.blocklist[channelId];

  return (
    <>
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
            class="bg-bg1 border border-bg2 shadow p-2 rounded-md z-50
                -translate-y-4
                animate-in
                fade-in
                slide-in-from-top-10
                duration-200
                "
          >
            <DropdownMenu.Arrow />
            <Show when={props.item.uploaderName && props.item.uploaderUrl}>
              <DropdownMenu.Group class="mt-2">
                <DropdownMenu.GroupLabel class="flex items-center gap-2">
                  <span class="text-text2 max-w-xs truncate">
                    {props.item.uploaderName}
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
                        `Unsubscribed from ${props.item.uploaderName}.`
                      );
                    } else {
                      sync.setStore("subscriptions", channelId, {
                        subscribedAt: Date.now(),
                        name: props.item.uploaderName,
                      });
                      toast.success(
                        `Subscribed to ${props.item.uploaderName}.`
                      );
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
                        toast.success(`Unblocked ${props.item.uploaderName}.`, ()=>{
                        sync.setStore("blocklist", channelId, {
                          name: props.item.uploaderName,
                        });

                        });
                      } else {
                        sync.setStore("blocklist", channelId, {
                          name: props.item.uploaderName,
                        });
                        toast.success(`Blocked ${props.item.uploaderName}.`,()=>{
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
              onSelect={() => setDebugModalOpen(true)}
            >
              <div class="flex items-center gap-2">
                <FaSolidBug fill="currentColor" />
                <div class="text-text1">Debug info</div>
              </div>
            </DropdownMenu.Item>
            <Show
              when={sync.store.playlists[props.item.url?.split("list=")[1]]}
            >
              <DropdownMenu.Item
                onTouchStart={() => {
                  setAppState("touchInProgress", true);
                }}
                class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded  hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
                onSelect={() => setDeleteModalOpen(true)}
              >
                <div class="flex items-center gap-2 text-red-500">
                  <FaSolidTrashCan fill="currentColor" />
                  <div class="text-red-500">Delete</div>
                </div>
              </DropdownMenu.Item>
            </Show>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <Modal
        isOpen={debugModalOpen()}
        setIsOpen={setDebugModalOpen}
        title="Debug info"
      >
        <pre class="break-all text-text1 max-w-full min-w-0 overflow-auto z-[9999999]">
          {JSON.stringify(props.item, null, 2)}
        </pre>
      </Modal>
      <Modal
        isOpen={deleteModalOpen()}
        setIsOpen={setDeleteModalOpen}
        title="Delete playlist"
      >
        <div class="flex flex-col gap-4 p-4">
          Are you sure you want to delete {props.item.name}?
          <div class="flex items-center justify-evenly">
            <Button
              onClick={() => setDeleteModalOpen(false)}
              appearance="subtle"
              label="Cancel"
            />
            <Button
              onClick={() => {
                try {
                  sync.setStore(
                    "playlists",
                    props.item.url.split("list=")[1],
                    undefined!
                  );
                  setDeleteModalOpen(false);
                  toast.success(`${props.item.name} deleted`);
                } catch (e) {
                  console.error(e);
                  toast.error(
                    `Failed to delete ${props.item.name}. ${(e as any).message}`
                  );
                }
              }}
              appearance="danger"
              label="Delete"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
