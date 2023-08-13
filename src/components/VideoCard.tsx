import type { RelatedStream } from "~/types";
import numeral from "numeral";
// import { DBContext } from "~/routes/layout";
import { extractVideoId } from "~/routes/watch";
import { A } from "solid-start";
import {
  Match,
  Switch,
  createRenderEffect,
  createSignal,
  useContext,
} from "solid-js";
import { DBContext, InstanceContext } from "~/root";
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

dayjs.extend(relativeTime);

export default ({
  v,
}: {
  v?: (RelatedStream & { progress?: number }) | undefined;
}) => {
  const [db] = useContext(DBContext);
  const [progress, setProgress] = createSignal<number | undefined>(undefined);
  const [instance] = useContext(InstanceContext);
  const [thumbnail, setThumbnail] = createSignal<string | undefined>(undefined);

  createRenderEffect(async () => {
    if (!db()) return;
    const tx = db()!.transaction("watch_history", "readwrite");
    const store = tx.objectStore("watch_history");
    const id = videoId(v);
    if (!id) return;
    const val = await store.get(id);
    // setThumbnail(
    //   v?.thumbnail?.replace("hqdefault", "mqdefault") ??
    //     `${instance().replace(
    //       "api",
    //       "proxy"
    //     )}/vi/${id}/mqdefault.jpg?host=i.ytimg.com`
    // );
    setProgress(val?.progress || val?.currentTime);
  });

  if (!v)
    return (
      <div
        class={` flex w-72 max-w-[18rem] flex-col items-start rounded-xl bg-bg1 `}>
        <div class="animate-pulse w-64 h-32 bg-bg2 flex aspect-video max-w-fit flex-col overflow-hidden rounded text-text1">
          <div class="bg-bg2 w-full h-full"></div>
        </div>
        <div class="animate-pulse w-3/4 h-4 bg-bg2 rounded mt-2"></div>
        <div class="animate-pulse w-1/2 h-4 bg-bg2 rounded mt-2"></div>
        <div class="animate-pulse w-1/4 h-4 bg-bg2 rounded mt-2"></div>
      </div>
    );

  return (
    <div
      class={` flex w-full max-w-md mx-4 lg:w-72 flex-col items-center rounded-xl bg-bg1 p-2`}>
      <A
        href={v.url ?? `/watch?v=${videoId(v)}`}
        class="flex aspect-video w-full flex-col overflow-hidden rounded text-text1">
        {progress() !== undefined && (
          <div class="relative h-0 w-0 ">
            <div class="absolute left-0 top-0 z-[1] bg-bg1/80 rounded-br px-2 uppercase">
              Watched
            </div>
          </div>
        )}
        <img
          class={`cursor-pointer w-full aspect-video max-w-md break-words ${
            progress() !== undefined ? "saturate-[0.35] opacity-75" : ""
          } `}
          // src={v.thumbnail?.replace("hqdefault", "mqdefault")}
          src={v.thumbnail?.replace("hqdefault", "mqdefault")}
          // onError={() => setThumbnail("https://via.placeholder.com/352x198")}
          // placeholder="blur"
          width={2560}
          height={1440}
          alt={v.title}
          loading="lazy"
        />
        <div class="relative h-0 w-12 place-self-end text-sm lg:w-16 lg:text-base">
          <div class="absolute bottom-2 right-2 rounded bg-bg1/80 px-1">
            {numeral(v.duration).format("00:00:00").replace(/^0:/, "")}
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
      <div class="mt-2 flex w-full flex-col ">
        <div class="flex flex-col gap-2 pr-2 ">
          <A
            href={v.url ?? `/watch?v=${videoId(v)}`}
            class="break-words text-lg leading-tight">
            {v.title}
          </A>

          <div class="flex gap-2 text-text2">
            <div class="group mb-1 w-max underline ">
              <A
                href={v.uploaderUrl || ""}
                class="flex max-w-max items-center gap-2">
                {v.uploaderAvatar && (
                  <img
                    src={v.uploaderAvatar}
                    width={32}
                    height={32}
                    class="rounded-full"
                    alt={v.uploaderName}
                  />
                )}
              </A>
            </div>

            <div class="flex w-full flex-col">
              <Dropdown>
                <DropdownItem as="button" label="Add to queue" />
                <Switch>
                  <Match when={progress() === undefined}>
                    <DropdownItem
                      as="button"
                      label="Remove from history"
                      // onClick={() => setProgress(undefined)}
                    />
                  </Match>
                  <Match when={progress() !== undefined}>
                    <DropdownItem
                      as="button"
                      label="Mark as watched"
                      // onClick={() => setProgress(0)}
                    />
                  </Match>
                </Switch>
              </Dropdown>
              <A href={v.uploaderUrl || ""}>
                <div class="peer w-fit text-sm">{v.uploaderName}</div>
              </A>
              <div class="flex ">
                <div class="w-fit text-sm ">
                  {" "}
                  {numeral(v.views).format("0a").toUpperCase()} views
                </div>

                <div class="group w-fit pl-1 text-sm">
                  <div class=""> • {dayjs(v.uploaded).fromNow()} </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
