
import type { RelatedPlaylist, RelatedStream } from "~/types";
import numeral from "numeral";
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
import DropdownItem from "./DropdownItem";
import Dropdown from "./Dropdown";

dayjs.extend(relativeTime);

export default ({
  item,
}: {
  item?: RelatedPlaylist | undefined
}) => {


  if (!item)
    return (
      <div
        class={` flex w-72 max-w-[18rem] flex-col items-start rounded-xl bg-bg1 `}>
        <div class="animate-pulse w-64 h-32 bg-bg2 flex aspect-video max-w-fit flex-col overflow-hidden rounded text-text1">
          <div class="bg-bg2 w-full h-full"></div>
        </div>
        <div class="animate-pulse w-3/4 h-4 bg-bg2 rounded mt-2"></div>
        <div class="animate-pulse w-1/2 h-4 bg-bg2 rounded mt-2"></div>
      </div>
    );

  return (
    <div
      class={` flex w-full max-w-md mx-4 lg:w-72 flex-col items-center rounded-xl bg-bg1 p-2`}>
      <A
        href={item.url}
        class="flex aspect-video w-full flex-col overflow-hidden rounded text-text1">
        <img
          class={`cursor-pointer w-full aspect-video max-w-md break-words `}
          src={item.thumbnail?.replace("hqdefault", "mqdefault")}
          width={2560}
          height={1440}
          alt={item.name}
          loading="lazy"
        />
        <div class="relative h-0 w-12 place-self-end text-sm lg:w-16 lg:text-base">
          <div class="absolute bottom-2 right-2 rounded bg-bg1/80 px-1 flex items-center gap-1">
            {item.videos} <span>videos</span>
          </div>
        </div>
      </A>
      <div class="mt-2 flex w-full flex-col ">
        <div class="flex flex-col gap-2 pr-2 ">
          <A
            href={item.url}
            class="break-words text-lg leading-tight">
            {item.name}
          </A>

          <div class="flex gap-2 text-text2">
            <div class="group mb-1 w-max underline ">
              {/* <A
                href={item.uploaderUrl || ""}
                class="flex max-w-max items-center gap-2">
              </A> */}
            </div>

            <div class="flex w-full flex-col">
              <Dropdown>
                <DropdownItem as="button" label="Add to queue" />
              </Dropdown>
              <A href={item.uploaderUrl || ""}>
                <div class="peer w-fit text-sm">{item.uploaderName}</div>
              </A>
              {/* <div class="flex ">
                <div class="w-fit text-sm ">
                  {" "}
                  {numeral(item.).format("0a").toUpperCase()} views
                </div>

                <div class="group w-fit pl-1 text-sm">
                  <div class=""> • {dayjs(v.uploaded).fromNow()} </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
