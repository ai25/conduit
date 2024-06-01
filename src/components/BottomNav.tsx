import { For, JSX } from "solid-js";
import Link from "./Link";
import { FaSolidChevronLeft } from "solid-icons/fa";

export default function BottomNav(props: {
  items: {
    label: string;
    href: string;
    icon: JSX.Element;
  }[];
}) {
  return (
    <nav class="flex gap-2 px-2 py-2 justify-around">
      <button
        onClick={() => {
          history.back();
        }}
        class="flex flex-col items-center justify-center text-sm text-text2"
      >
        <div class="w-6 h-6">{<FaSolidChevronLeft class="w-6 h-6" />}</div>
      </button>
      <For each={props.items}>
        {(item) => (
          <Link
            activeClass="text-primary"
            inactiveClass="text-text2"
            href={item.href}
            class="flex flex-col items-center justify-center text-sm "
          >
            <div class="w-6 h-6">{item.icon}</div>
            <span class="mt-1 text-xs font-semibold ">{item.label}</span>
          </Link>
        )}
      </For>
    </nav>
  );
}
