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
import { BsChevronRight, BsThreeDotsVertical } from "solid-icons/bs";
import { generateThumbnailUrl, getVideoId } from "~/utils/helpers";
import { FaRegularEye, FaRegularEyeSlash, FaSolidBug } from "solid-icons/fa";
import Modal from "./Modal";
import { mergeProps } from "solid-js";
import { DropdownMenu } from "@kobalte/core";
import { createTimeAgo } from "@solid-primitives/date";

const VideoCard = (props: {
  v?: (RelatedStream & { progress?: number }) | undefined;
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
  const [progress, setProgress] = createSignal<number | undefined>(undefined);
  const sync = useSyncStore();

  createEffect(() => {
    const id = getVideoId(props.v);
    if (!id) return;
    const val = sync.store.history?.[id];
    if (val?.watchedAt) {
      setWatchedAtDate(new Date(val.watchedAt));
    }
    props = mergeProps(props, { v: { ...props.v, ...val } });
    setProgress(val?.currentTime ?? undefined);
  });

  const [dropdownOpen, setDropdownOpen] = createSignal(false);
  const [modalOpen, setModalOpen] = createSignal(false);

  const [watchedAtDate, setWatchedAtDate] = createSignal<Date | undefined>(
    undefined
  );
  const [watchedAt, setWatchedAt] = createSignal<string | undefined>(undefined);
  createEffect(() => {
    const [watchedAt] = createTimeAgo(watchedAtDate() ?? new Date(), {
      interval: 1000 * 60,
    });
    setWatchedAt(watchedAt());
  });

  const [uploaded] = createTimeAgo(props.v.uploaded, { interval: 1000 * 60 });

  return (
    <div
      class={` flex w-full max-w-md mx-1 sm:w-72 flex-col items-start rounded-xl bg-bg1 p-2`}
    >
      <A
        href={`/watch?v=${getVideoId(props.v)}`}
        class="flex aspect-video w-full flex-col overflow-hidden rounded text-text1 outline-none focus-visible:ring-2 focus-visible:ring-primary"
        title={props.v.title}
      >
        <img
          class={`cursor-pointer w-full aspect-video max-w-md break-words ${
            progress() !== undefined ? "saturate-[0.35] opacity-75" : ""
          } `}
          src={generateThumbnailUrl(
            sync.store!.preferences?.instance?.image_proxy_url ??
              "https://pipedproxy.kavin.rocks",
            getVideoId(props.v)
          )}
          // placeholder="blur"
          width={2560}
          height={1440}
          alt=""
          loading="lazy"
        />
        <Switch>
          <Match when={(props.v as HistoryItem)?.watchedAt}>
            <div class="relative h-0 w-0 ">
              <div class="absolute left-2 bottom-2 bg-bg1/90 rounded px-1 py-px border border-bg2 w-max h-max text-xs">
                Watched {watchedAt()}
              </div>
            </div>
          </Match>
          <Match
            when={
              (props.v as HistoryItem) &&
              !(props.v as HistoryItem).watchedAt &&
              progress() !== undefined
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
        {!!progress() && (
          <div class="relative h-0 w-full">
            <div
              style={{
                width: `clamp(0%, ${
                  (progress()! / props.v.duration) * 100
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
                animate-in
                fade-in
                slide-in-from-top-10
                duration-200
                ">
                <DropdownMenu.Arrow />
                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none">
                    <div class="flex items-center w-full justify-between">
                      <div class="text-text1">Add to playlist</div>
                      <BsChevronRight
                        class="justify-self-end"
                        fill="currentColor"
                      />
                    </div>
                  </DropdownMenu.SubTrigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent class="bg-bg2 p-2 rounded-md shadow">
                      <For each={Object.entries(sync.store.playlists)}>
                        {([id, playlist]) => (
                          <DropdownMenu.Item
                            class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
                            onSelect={() => {
                              console.log(playlist.relatedStreams, props.v);
                              // sync.setStore("playlists", id, "relatedStreams", [
                              //   props.v as RelatedStream,
                              //   ...playlist.relatedStreams,
                              // ]);
                            }}
                          >
                            <div class="flex items-center gap">
                              <div class="text-text1">{playlist.name}</div>
                            </div>
                          </DropdownMenu.Item>
                        )}
                      </For>
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>
                <Show when={progress() === undefined}>
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
                <Show when={progress() !== undefined}>
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
                        [getVideoId(props.v)]: undefined,
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
            <pre class="break-all text-text1 max-w-full min-w-0 overflow-auto">
              {JSON.stringify(props.v, null, 2)}
            </pre>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
