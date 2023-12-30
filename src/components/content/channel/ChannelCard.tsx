import numeral from "numeral";
import { Show } from "solid-js";
import { Checkmark } from "~/components/Description";
import Link from "~/components/Link";
import SubscribeButton from "~/components/SubscribeButton";
import { RelatedChannel } from "~/types";

export default function ChannelCard(
  props: { item: RelatedChannel; }
) {

  return (
    <div class="mx-4 my-2 flex flex-col gap-2 items-start w-full lg:w-72 max-h-20 lg:max-h-full max-w-md">
      <div class="flex items-center gap-2 w-full lg:flex-col lg:items-start">
        <Link href={props.item.url} class="group outline-none">
          <div class="relative w-20 overflow-hidden rounded-full group-hover:ring-2 group-focus-visible:ring-2  ring-accent1 transition-all duration-200">
            <img
              class="w-full rounded-full group-hover:scale-105 group-focus-visible:scale-105"
              src={props.item.thumbnail}
              loading="lazy"
            />
          </div>
        </Link>
        <div class="flex flex-col justify-center gap-1 min-w-0 w-full h-20 max-h-20 text-text2 text-xs self-end">
          <div class="flex items-center gap-1">
            <Link class="link text-sm" href={props.item.url}>
              <div class="flex gap-1">
                <span>{props.item.name}</span>
                <Show when={props.item.verified}>
                  <Checkmark />
                </Show>
              </div>
            </Link>
            <Show when={props.item.videos >= 0}>
              <p>&#183; {props.item.videos} videos</p>
            </Show>
          </div>
          <Show when={props.item.description}>
            <p class="two-line-ellipsis ">
              {props.item.description}
            </p>
          </Show>
          <Show
            when={props.item.subscribers >= 0}
            fallback={<p></p>}
          >
            <p>
              {numeral(props.item.subscribers)
                .format("0a")
                .toUpperCase()}{" "}
              subscribers
            </p>
          </Show>
        </div>
        <SubscribeButton id={props.item.url.split("/").pop()!}
          name={props.item.name}
        />
      </div>
    </div>
  )
}
