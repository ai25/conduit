import { A } from "@solidjs/router";
import dayjs from "dayjs";
import numeral from "numeral";
import { createRenderEffect, createSignal, useContext } from "solid-js";
import { DBContext } from "~/root";
import { videoId } from "~/routes/history";
import { RelatedStream } from "~/types";

const PlaylistCard = (props: {
  v: RelatedStream;
  index: number;
  list: string;
  active: string
}) => {
  const [db] = useContext(DBContext);
  const [progress, setProgress] = createSignal<number | undefined>(undefined);

  createRenderEffect(async () => {
    if (!db()) return;
    const tx = db()!.transaction("watch_history", "readwrite");
    const store = tx.objectStore("watch_history");
    const id = videoId(props.v);
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

  return (
    <A
      href={`${props.v.url}&list=${props.list}&index=${props.index}`}
      classList={{"bg-primary text-text3": parseInt(props.active) === props.index}}
      class="flex justify-between bg-bg2 hover:bg-bg1 px-1 py-2 rounded-lg text-text1">
      <div class="flex max-w-full w-full @container">
        <div class="flex flex-col items-center justify-center mr-2">
          {props.index}
        </div>
        <div class=" min-w-[4rem] @[20rem]:min-w-[7rem] @[35rem]:min-w-[9rem] @[50rem]:min-w-[11rem]max-w-[6rem] @[20rem]:max-w-[7rem] @[35rem]:max-w-[9rem] @[50rem]:max-w-[11rem] aspect-video max-h-full rounded-lg ">
          <img
            class="object-contain max-w-full aspect-video max-h-full rounded-lg "
            src={props.v.thumbnail}
          />
          {!!progress() && (
            <div class="relative h-0 w-full">
              <div
                style={{
                  width: `clamp(0%, ${
                    (progress()! / props.v.duration) * 100
                  }%, 100%`,
                }}
                class="absolute bottom-0 h-1 bg-highlight"></div>
            </div>
          )}
          <div class="relative h-0 w-full bg-red-500 align-self-end">
            <div class="absolute bottom-1 right-1 text-xs @[20rem]:text-sm rounded bg-bg1/80 px-1">
              {numeral(props.v.duration).format("00:00:00").replace(/^0:/, "")}
            </div>
          </div>
        </div>

        <div class="px-2 grow">
          <div class="overflow-hidden max-h-10 text-sm">{props.v.title} </div>
          <div class="text-text2 truncate text-xs overflow-hidden">
            <A href={props.v.uploaderUrl} class="inline-block mr-1 link">
              {props.v.uploaderName} •
            </A>
            <div class="inline-block mr-1">
              {numeral(props.v.views).format("0a").toUpperCase()} views •
            </div>
            <div class="inline-block mr-1">
              {dayjs(props.v.uploadedDate).fromNow()}
            </div>
          </div>
        </div>
      </div>
      <div class="w-4 justify-self-end ml-2">1</div>
    </A>
  );
};

export default PlaylistCard;
