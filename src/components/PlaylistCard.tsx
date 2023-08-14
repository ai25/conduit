import { A } from "@solidjs/router";
import dayjs from "dayjs";
import numeral from "numeral";
import {
  createEffect,
  createRenderEffect,
  createSignal,
  useContext,
} from "solid-js";
import { DBContext } from "~/root";
import { videoId } from "~/routes/history";
import { RelatedStream } from "~/types";
import Modal from "./Modal";
import Dropdown from "./Dropdown";
import DropdownItem from "./DropdownItem";

const PlaylistCard = (props: {
  v: RelatedStream;
  index: number;
  list: string;
  active: string;
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
  let card: HTMLAnchorElement | undefined = undefined;
  createEffect(() => {
    import("long-press-event");
    if (!card) return;
    if (parseInt(props.active) === props.index) {
      card.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "start",
      });
    }
    card.addEventListener("long-press", (e) => {
      e.preventDefault();
      console.log("long press");
      setIsOpen(true);
    });
    card.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  });
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <A
      data-long-press-delay="500"
      ref={card}
      href={`${props.v.url}&list=${props.list}&index=${props.index}`}
      classList={{
        "bg-primary text-text3 hover:bg-accent1":
          parseInt(props.active) === props.index,
      }}
      style={{ "background-image": `url(${props.v.thumbnail})` }}
      class={`bg-cover !select-none [-webkit-touch-callout:none] relative min-h-[5rem] bg-no-repeat bg-center flex justify-between sm:bg-bg2 hover:bg-bg1 px-1 mx-1 py-2 rounded-lg text-text1`}>
      <div class="absolute inset-0 w-full h-full bg-bg1/50 backdrop-blur-sm"></div>
      <div class="flex max-w-full w-full @container">
        <div class="flex absolute top-0 left-0 flex-col items-center justify-center rounded bg-bg1/50 backdrop-blur-sm px-1 text-xs">
          {props.index}
        </div>
        <div class="shadow-xl my-auto shadow-bg1 w-0 min-w-[6rem] @[20rem]:min-w-[7rem] @[35rem]:min-w-[9rem] @[50rem]:min-w-[11rem]max-w-[6rem] @[20rem]:max-w-[7rem] @[35rem]:max-w-[9rem] @[50rem]:max-w-[11rem] aspect-video max-h-full rounded-lg ">
          <img
            class="object-cover w-full h-full max-w-full max-h-full rounded-lg "
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
            <div class="absolute bottom-1 right-1 text-xs @[20rem]:text-sm rounded bg-bg1/80 text-text1 px-1">
              {numeral(props.v.duration).format("00:00:00").replace(/^0:/, "")}
            </div>
          </div>
        </div>

        <div class="px-2 max-w-full min-w-0">
          <div
            // style={{"text-shadow": "1px 1px 2px rgba(0,0,0,0.9)"}}
            class="max-h-10 min-w-0 font-bold max-w-full text-sm overflow-hidden overflow-ellipsis ">
            {props.v.title}{" "}
          </div>
          <div
            classList={{ "text-text3": parseInt(props.active) === props.index }}
            class="truncate text-xs">
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
      <div class="w-4 justify-self-end ml-2">
        <Dropdown icon={ <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-three-dots-vertical"
          viewBox="0 0 16 16">
          {" "}
          <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />{" "}
        </svg>} iconPosition="right"
        panelPosition="left"
        >
          <DropdownItem as="button" label="Add to playlist" />
          <DropdownItem as="button" label="Add to queue" />
          </Dropdown>
      </div>
    </A>
  );
};

export default PlaylistCard;
