import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { usePreferences } from "~/stores/preferencesStore";
import Modal from "./Modal";
import { PipedVideo, RelatedStream } from "~/types";
import VideoCard from "./content/stream/VideoCard";
import Button from "./Button";
import {
  FaBrandsYoutube,
  FaRegularCopy,
  FaSolidClipboard,
} from "solid-icons/fa";
import Field from "./Field";
import Toggle from "./Toggle";
import { formatTime } from "vidstack";
import { TbExternalLink } from "solid-icons/tb";
import { toast } from "./Toast";
import { isServer } from "solid-js/web";

export default function ShareModal(props: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  thumbnail: string;
  id: string;
  title: string;
  t?: number;
}) {
  const [withTime, setWithTime] = createSignal(false);
  const [platform, setPlatform] = createSignal("Conduit");
  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null);

  const url = createMemo(() => {
    if (isServer) return;
    switch (platform()) {
      case "Conduit":
        return `${origin}/watch?v=${props.id}${withTime() && props.t ? "&t=" + props.t.toFixed(0) : ""}`;
      case "Piped":
        return `https://piped.video/watch?v=${props.id}${withTime() && props.t ? "&t=" + props.t.toFixed(0) : ""}`;
      default:
        return `https://www.youtube.com/watch?v=${props.id}${withTime() && props.t ? "&t=" + props.t.toFixed(0) : ""}`;
    }
  });
  return (
    <Modal title="Share" isOpen={props.isOpen} setIsOpen={props.setIsOpen}>
      <div class="flex flex-col gap-4 justify-center p-4 w-[clamp(200px,100%,80vw)] max-w-[25rem]">
        <div class="mx-auto h-44 w-fit">
          <img src={props.thumbnail} class="h-full w-full" />
        </div>
        <div class="font-semibold">{props.title}</div>
        <Show when={props.t}>
          <div class="flex items-center gap-2 text-text2">
            <Toggle
              label="withTime"
              checked={withTime()}
              onChange={() => setWithTime((prev) => !prev)}
            />
            <p>
              Start at{" "}
              <span class="font-semibold ml-1">{formatTime(props.t!)}</span>
            </p>
          </div>
        </Show>
        <div class="flex flex-col justify-center items-start gap-4">
          <div class="flex items-center gap-2">
            <div
              classList={{
                "[&:has(:focus-visible)]:bg-primary/40 p-2 rounded": true,
                "ring-4 ring-primary/70 bg-primary/20":
                  platform() === "Conduit",
              }}
            >
              <button
                onClick={() => {
                  setPlatform("Conduit");
                }}
                class="outline-none text-sm font-medium w-14 h-14 rounded-lg"
              >
                <div class="w-full h-full rounded-full p-2 bg-primary/80">
                  <img alt="Conduit" src="/logo.svg" class="w-full h-full" />
                </div>
              </button>
              <p class="text-xs text-center">Conduit</p>
            </div>
            <div
              classList={{
                "[&:has(:focus-visible)]:bg-primary/40 p-2 rounded": true,
                "ring-4 ring-primary/70 bg-primary/20":
                  platform() === "YouTube",
              }}
            >
              <button
                onClick={() => {
                  setPlatform("YouTube");
                }}
                class="outline-none text-sm font-medium w-14 h-14 rounded-lg"
              >
                <div class="w-full h-full rounded-full p-2 bg-red-600">
                  <FaBrandsYoutube class="h-full w-full text-white" />
                </div>
              </button>
              <p class="text-xs text-center">YouTube</p>
            </div>
            <div
              classList={{
                "[&:has(:focus-visible)]:bg-primary/40 p-2 rounded": true,
                "ring-4 ring-primary/70 bg-primary/20": platform() === "Piped",
              }}
            >
              <button
                onClick={() => {
                  setPlatform("Piped");
                }}
                class="outline-none text-sm font-medium w-14 h-14 rounded-lg"
              >
                <div class="w-full h-full rounded-full p-2 bg-neutral-800">
                  <img alt="Piped" src="/piped.svg" class=" w-full h-full" />
                </div>
              </button>
              <p class="text-xs text-center">Piped</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <Field
              ref={setInputRef}
              onClick={() => {
                inputRef()?.select();
              }}
              class="w-full"
              value={url()}
              readOnly
            />
            <button
              class="flex items-center justify-center outline-none focus-visible:ring-2 ring-primary/80 rounded h-10 w-10"
              onClick={() => {
                try {
                  navigator.clipboard.writeText(url());
                  toast.success("Copied link to clipboard!");
                } catch (e) {
                  toast.error((e as any).message);
                  console.error(e);
                }
              }}
              aria-label="Copy link"
              title="Copy link"
            >
              <FaRegularCopy class="h-6 w-6" />
            </button>
            <a
              href={url()}
              class="flex items-center justify-center outline-none focus-visible:ring-2 ring-primary/80 rounded h-10 w-10"
              aria-label="Open link"
              title="Open link"
              target="_blank"
            >
              <TbExternalLink class="h-7 w-7" />
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}
