import { Transition } from "solid-headless";
import { For, JSX } from "solid-js";
import { A } from "solid-start";

export default function BottomNav(props: {
  items: {
    label: string;
    href: string;
    icon: JSX.Element;
  }[];
}) {
  return (
        <nav class="flex gap-2 px-2 py-2 justify-evenly">
          <For each={props.items}>
            {(item) => (
              <A
                activeClass="text-primary"
                href={item.href}
                class="flex flex-col items-center justify-center text-sm text-text2">
                <div class="w-6 h-6">{item.icon}</div>
                <span class="mt-1 text-xs font-semibold ">
                  {item.label}
                </span>
              </A>
            )}
          </For>
        </nav>
  );
}
