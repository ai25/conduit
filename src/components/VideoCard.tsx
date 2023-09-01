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
} from "solid-js";
import {
  DBContext,
  InstanceContext,
  SolidStoreContext,
  SyncContext,
} from "~/root";
import { videoId } from "~/routes/history";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Menu,
  MenuItem,
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "solid-headless";
import { MenuButton, MenuItems } from "vidstack";
import DropdownItem from "./DropdownItem";
import Dropdown from "./Dropdown";
import { SyncedDB } from "~/stores/syncedStore";
import { BsInfoCircleFill, BsThreeDotsVertical } from "solid-icons/bs";
import { generateThumbnailUrl } from "~/utils/helpers";

dayjs.extend(relativeTime);

export default ({
  v,
}: {
  v?: (RelatedStream & { progress?: number }) | undefined;
}) => {
  const [db] = useContext(DBContext);
  const [progress, setProgress] = createSignal<number | undefined>(undefined);
  const [instance] = useContext(InstanceContext);
  const solidStore = useContext(SolidStoreContext);
  const [imgError, setImgError] = createSignal(false);
  const writeStore = useContext(SyncContext);

  createEffect(() => {
    if (!solidStore()) return;
    const val = SyncedDB.history.findUnique(solidStore()!, videoId(v));
    setProgress(val?.currentTime ?? undefined);
  });

  if (!v)
    return (
      <div
        class={` flex w-full max-w-md mx-4 lg:w-72 flex-col items-start rounded-xl bg-bg1 p-2`}>
        <div class="animate-pulse w-full h-full bg-bg2 flex aspect-video flex-col overflow-hidden rounded text-text1">
          <div class="bg-bg2 w-full h-full"></div>
        </div>
        <div class="animate-pulse w-3/4 h-4 bg-bg2 rounded mt-2"></div>
        <div class="animate-pulse w-1/2 h-4 bg-bg2 rounded mt-2"></div>
      </div>
    );

  return (
    <div
      class={` flex w-full max-w-md lg:mx-4 lg:w-72 flex-col items-start rounded-xl bg-bg1 p-2`}>
      <A
        href={v.url ?? `/watch?v=${videoId(v)}`}
        class="flex aspect-video w-full flex-col overflow-hidden rounded text-text1 outline-none focus-visible:ring-2 focus-visible:ring-primary">
        {progress() !== undefined && (
          <div class="relative h-0 w-0 ">
            <div class="absolute left-0 top-0 z-[1] bg-bg1/80 rounded-br px-2 uppercase">
              Watched
            </div>
          </div>
        )}
        <Show when={!imgError()}>
          <img
            class={`cursor-pointer w-full aspect-video max-w-md break-words ${
              progress() !== undefined ? "saturate-[0.35] opacity-75" : ""
            } `}
            src={generateThumbnailUrl(instance().image_proxy_url, videoId(v))}
            onError={() => setImgError(true)}
            // placeholder="blur"
            width={2560}
            height={1440}
            alt=""
            loading="lazy"
          />
        </Show>
        <Show when={imgError()}>
          <div class="flex w-full h-full items-center justify-center">
            <div class="text-text2">Image not found</div>
          </div>
        </Show>
        <div class="relative h-0 w-12 place-self-end text-sm lg:w-16 lg:text-base">
          <div
            classList={{
              "bg-bg1/80": v.duration !== -1,
              "bg-primary": v.duration === -1,
            }}
            class="absolute bottom-2 right-2 rounded px-1 text-xs">
            <Show when={v.duration === -1}>Live</Show>
            <Show when={v.duration !== -1}>
              {numeral(v.duration).format("00:00:00").replace(/^0:/, "")}
            </Show>
          </div>
        </div>
        {!!progress() && (
          <div class="relative h-0 w-full">
            <div
              style={{
                width: `clamp(0%, ${(progress()! / v.duration) * 100}%, 100%`,
              }}
              class="absolute bottom-0 h-1 bg-highlight"></div>
          </div>
        )}
      </A>
      <div class="mt-2 flex w-full max-h-20 min-w-0 max-w-full justify-between ">
        <div class="flex flex-col gap-2 pr-2 ">
          <A
            href={v.url ?? `/watch?v=${videoId(v)}`}
            class=" two-line-ellipsis min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-primary">
            {v.title}
          </A>

          <div class="flex gap-2 text-text2">
            <Show when={v.uploaderAvatar}>
              <div class="group mb-1 w-max underline ">
                <A
                  href={v.uploaderUrl || ""}
                  class="flex max-w-max items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <img
                    src={v.uploaderAvatar!}
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
                href={v.uploaderUrl || ""}
                class="outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <div class="peer w-fit ">{v.uploaderName}</div>
              </A>
              <div class="flex ">
                <div class="w-fit  ">
                  {" "}
                  {numeral(v.views).format("0a").toUpperCase()} views
                </div>

                <div class="group w-fit pl-1">
                  <Show when={v.uploaded && v.uploaded !== -1}>
                    <div class=""> • {dayjs(v.uploaded).fromNow()} </div>
                  </Show>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col justify-between">
          <Dropdown
            icon={
              <BsThreeDotsVertical
                fill="currentColor"
                class="text-text2 w-6 h-6 group-hover:text-text1"
              />
            }
            iconPosition="right"
            panelPosition="left">
            <DropdownItem as="button" label="Add to queue" />
            <Switch>
              <Match when={progress()}>
                <DropdownItem
                  as="button"
                  label="Remove from history"
                  onClick={() =>
                    SyncedDB.history.delete(writeStore()!, (item) => {
                      console.log(item.id, videoId(v));
                      return item.id === videoId(v);
                    })
                  }
                />
              </Match>
              <Match when={!progress()}>
                <DropdownItem
                  as="button"
                  label="Mark as watched"
                  onClick={() =>
                    SyncedDB.history.create(writeStore()!, {
                      ...v,
                      id: videoId(v),
                      watchedAt: Date.now(),
                      currentTime: v.duration,
                    })
                  }
                />
              </Match>
            </Switch>
          </Dropdown>
          <Show when={(v as any).watchedAt}>
            <div class="relative w-0 h-0 self-end ">
              <button class="peer absolute right-1 -top-8 z-[1] link ">
                <BsInfoCircleFill
                  fill="currentColor"
                  class="w-5 h-5 text-text2"
                />
              </button>
              <div class=" absolute right-0 -top-2 z-[1] bg-bg1/80 w-44 flex items-center rounded px-2 opacity-0 scale-0 transition peer-hover:scale-100 peer-hover:opacity-100 peer-focus-visible:scale-100 peer-focus-visible:opacity-100 ">
                Watched: {dayjs((v as any).watchedAt).fromNow()}
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};
