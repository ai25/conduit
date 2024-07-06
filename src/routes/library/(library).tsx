import { Title } from "@solidjs/meta";
import {
  FaSolidBan,
  FaSolidClock,
  FaSolidClockRotateLeft,
  FaSolidDownload,
  FaSolidHeart,
  FaSolidList,
  FaSolidUserClock,
} from "solid-icons/fa";
import { JSX } from "solid-js";
import Link from "~/components/Link";

export default function Library() {
  return (
    <>
      <Title>Library</Title>
      <div class="flex flex-col max-w-2xl mx-auto my-4 items-start">
        <LinkItem
          href="/library/history"
          icon={<FaSolidClockRotateLeft class="w-5 h-5 text-primary" />}
          title="History"
        />
        <LinkItem
          href="/library/playlists"
          icon={<FaSolidList class="w-5 h-5 text-primary" />}
          title="Playlists"
        />
        <LinkItem
          href="/library/watch-later"
          icon={<FaSolidClock class="w-5 h-5 text-primary" />}
          title="Watch Later"
        />
        <LinkItem
          href="/library/downloads"
          icon={<FaSolidDownload class="w-5 h-5 text-primary" />}
          title="Downloads"
        />
        <LinkItem
          href="/library/blocklist"
          icon={<FaSolidBan class="w-5 h-5 text-primary" />}
          title="Blocklist"
        />
        <LinkItem
          href="/library/subscriptions"
          icon={<FaSolidHeart class="w-5 h-5 text-primary" />}
          title="Subscriptions"
        />
      </div>
    </>
  );
}

const LinkItem = (props: {
  title: string;
  href: string;
  icon: JSX.Element;
}) => (
  <Link
    href={props.href}
    class="w-full flex items-center text-start gap-2 md:px-4 py-2"
  >
    <div class="flex items-center justify-center w-10 h-10 aspect-square rounded-full text-primary">
      {props.icon}
    </div>
    <div class="flex flex-col gap-1 min-w-0">
      <div class="text-text1 font-semibold">{props.title}</div>
    </div>
  </Link>
);
