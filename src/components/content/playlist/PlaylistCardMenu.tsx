
import { DropdownMenu } from "@kobalte/core";
import { BsThreeDotsVertical } from "solid-icons/bs";
import { FaRegularEye, FaRegularEyeSlash, FaSolidBan, FaSolidBug, FaSolidHeartCircleMinus, FaSolidHeartCirclePlus, FaSolidPlus, FaSolidShare } from "solid-icons/fa";
import { TbClockPlus } from "solid-icons/tb";
import { yieldToMain } from "~/utils/helpers";
import Modal from "~/components/Modal";
import { toast } from "~/components/Toast"
import { RelatedPlaylist } from "~/types";
import { Show, createSignal } from "solid-js";
import { useSyncStore } from "~/stores/syncStore";

export default function PlaylistMenu(props: { item: RelatedPlaylist }) {

  const [dropdownOpen, setDropdownOpen] = createSignal(false);
  const [modalOpen, setModalOpen] = createSignal(false);
  const sync = useSyncStore();

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
          <Show when={props.item.uploaderName && props.item.uploaderUrl}>
            <DropdownMenu.Group class="mt-2">
              <DropdownMenu.GroupLabel class="flex items-center gap-2">
                <span class="text-text2 max-w-xs truncate">{props.item.uploaderName}</span>
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
                  const id = props.item.uploaderUrl.split("/channel/")[1];
                  const isSubscribed = sync.store.subscriptions[id];
                  if (isSubscribed) {
                    sync.setStore("subscriptions", id, undefined!);
                    toast.success(`Unsubscribed from ${props.item.uploaderName}.`);
                  } else {
                    sync.setStore("subscriptions", id, { subscribedAt: Date.now() });
                    toast.success(`Subscribed to ${props.item.uploaderName}.`);
                  }
                }}
              >
                <div class="flex items-center gap-2">
                  <Show when={sync.store.subscriptions[props.item.uploaderUrl.split("/channel/")[1]]}>
                    <FaSolidHeartCircleMinus />
                  </Show>
                  <Show when={!sync.store.subscriptions[props.item.uploaderUrl.split("/channel/")[1]]}>
                    <FaSolidHeartCirclePlus />
                  </Show>
                  <div class="text-text1">
                    {sync.store.subscriptions[props.item.uploaderUrl.split("/channel/")[1]] ? "Unsubscribe" : "Subscribe"}
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
        {JSON.stringify(props.item, null, 2)}
      </pre>
    </Modal>
  </>
  )
}

