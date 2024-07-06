import { DropdownMenu } from "@kobalte/core";
import numeral from "numeral";
import { BsThreeDotsVertical } from "solid-icons/bs";
import { CgBlock, CgUnblock } from "solid-icons/cg";
import {
  FaSolidBan,
  FaSolidBug,
  FaSolidHeartCircleMinus,
  FaSolidHeartCirclePlus,
} from "solid-icons/fa";
import { Show, createSignal, mergeProps } from "solid-js";
import { Checkmark } from "~/components/Description";
import Link from "~/components/Link";
import Modal from "~/components/Modal";
import SubscribeButton from "~/components/SubscribeButton";
import { toast } from "~/components/Toast";
import { useAppState } from "~/stores/appStateStore";
import { useSyncStore } from "~/stores/syncStore";
import { RelatedChannel } from "~/types";

export default function ChannelCard(props: {
  item: RelatedChannel;
  layout?: "list" | "sm:grid";
}) {
  props = mergeProps({ layout: "sm:grid" as "sm:grid" }, props);

  return (
    <div
      classList={{
        "p-2 flex flex-col gap-2 items-start w-full h-full max-h-full": true,
        "sm:w-72": props.layout === "sm:grid",
      }}
    >
      <div
        classList={{
          "flex items-center gap-2 w-full h-full max-h-full": true,
          "flex-wrap": props.layout === "sm:grid",
        }}
      >
        <Link href={props.item.url} class="group outline-none">
          <div class="relative w-20 overflow-hidden rounded-full group-hover:ring-2 group-focus-visible:ring-2  ring-accent1 transition-all duration-200">
            <img
              class="w-full rounded-full group-hover:scale-105 group-focus-visible:scale-105"
              src={props.item.thumbnail}
              loading="lazy"
            />
          </div>
        </Link>
        <div class="flex items-center w-full justify-between">
          <div class="flex flex-col justify-center self-center gap-2 min-w-0 h-full max-h-20 text-text2 text-xs self-end">
            <div class="flex items-center gap-1">
              <Link class="link text-sm" href={props.item.url}>
                <div class="flex items-center gap-1">
                  <span>{props.item.name}</span>
                  <Show when={props.item.verified}>
                    <Checkmark />
                  </Show>
                </div>
              </Link>
            </div>
            <Show when={props.item.description}>
              <p class="two-line-ellipsis ">{props.item.description}</p>
            </Show>
            <Show when={props.item.subscribers >= 0} fallback={<p />}>
              <p>
                {numeral(props.item.subscribers).format("0a").toUpperCase()}{" "}
                subscribers
              </p>
            </Show>
            <SubscribeButton
              class="w-fit"
              id={props.item.url.split("/").pop()!}
              name={props.item.name}
            />
          </div>
          <div
            classList={{
              "self-start": true,
            }}
          >
            <Dropdown item={props.item} />
          </div>
        </div>
      </div>
    </div>
  );
}

const Dropdown = (props: { item: RelatedChannel }) => {
  const [dropdownOpen, setDropdownOpen] = createSignal(false);
  const [modalOpen, setModalOpen] = createSignal(false);
  const sync = useSyncStore();
  const [appState, setAppState] = useAppState();
  const channelId = props.item.url.split("/channel/")[1];
  const isBlocked = !!sync.store.blocklist[channelId];
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
              class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
              onTouchStart={() => {
                setAppState("touchInProgress", true);
              }}
              onSelect={() => {
                if (!channelId) {
                  toast.error("No channel ID found.");
                  return;
                }
                try {
                  if (isBlocked) {
                    sync.setStore("blocklist", channelId, undefined!);
                    toast.success(`Unblocked ${props.item.name}.`);
                  } else {
                    sync.setStore("blocklist", channelId, {
                      name: props.item.name,
                    });
                    toast.success(`Blocked ${props.item.name}.`);
                  }
                } catch (e) {
                  toast.error(
                    `Failed to ${
                      isBlocked ? "unblock" : "block"
                    } channel. ${(e as any).message}`
                  );
                  console.error(e);
                }
              }}
            >
              <div class="flex items-center gap-2">
                <Show when={isBlocked}>
                  <CgUnblock class="w-5 h-5" />
                  <div class="text-text1">Unblock</div>
                </Show>
                <Show when={!isBlocked}>
                  <CgBlock class="w-6 h-6" />
                  <div class="text-text1">Block</div>
                </Show>
              </div>
            </DropdownMenu.Item>

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
          {JSON.stringify(props.item, null, 2)}
        </pre>
      </Modal>
    </>
  );
};
