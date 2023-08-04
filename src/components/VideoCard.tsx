import type { RelatedStream } from "~/types";
import numeral from "numeral";
// import { DBContext } from "~/routes/layout";
import { extractVideoId } from "~/routes/watch";
import { A } from "solid-start";
import { createRenderEffect, createSignal, useContext } from "solid-js";
import { DBContext } from "~/root";
import { videoId } from "~/routes/history";

export default ({ v }: { v: RelatedStream & { progress?: number } }) => {
  const [db] = useContext(DBContext);
  const [progress, setProgress] = createSignal<number | undefined>(undefined);

  createRenderEffect(
    async () => {
      if (!db()) return;
      const tx = db()!.transaction("watch_history", "readwrite");
      const store = tx.objectStore("watch_history");
      const id = videoId(v);
      if (!id) return;
      const val = await store.get(id);
      console.log(val, "val");
      setProgress(val?.progress || val?.currentTime);
    }
  );

  if (!v) return null;

  return (
    <div class={` flex w-72 max-w-[18rem] flex-col items-center rounded-xl bg-bg1 p-4`}>
      <A href={`${v.url}`} class=" flex aspect-video max-w-fit flex-col overflow-hidden rounded text-text1">
        {progress() !== undefined && (
          <div class="relative h-0 w-0 bg-blue-400">
            <div class="absolute left-0 top-0 z-[1] bg-bg1/80 rounded-br px-2 uppercase">Watched</div>
          </div>
        )}
        <img
          class={`cursor-pointer max-w-full break-words ${progress() ? "saturate-[0.35]" : ""} `}
          src={v.thumbnail.replace("hqdefault", "mqdefault")}
          // placeholder="blur"
          width={352}
          height={198}
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
              class="absolute bottom-0 h-1 bg-highlight"
            ></div>
          </div>
        )}
      </A>
      <div class="mt-2 flex w-full flex-col ">
        <div class="flex flex-col gap-2 pr-2 ">
          <A href={v.url} class="break-words text-lg leading-tight">
            {v.title}
          </A>

          <div class="flex gap-2 text-text2">
            <div class="group mb-1 w-max underline ">
              <A href={v.uploaderUrl || ""} class="flex max-w-max items-center gap-2">
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
              <A href={v.uploaderUrl || ""}>
                <div class="peer w-fit text-sm">{v.uploaderName}</div>
              </A>
              <div class="flex ">
                <div class="w-fit text-sm "> {numeral(v.views).format("0a").toUpperCase()} views</div>

                <div class="group w-fit pl-1 text-sm">
                  <div class=""> • {v.uploadedDate} </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
