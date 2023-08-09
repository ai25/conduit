import { For, createSignal, onCleanup, onMount } from "solid-js";

export function clickOutside(el: HTMLElement, accessor: any) {
  const onClick = (e: any) => !el.contains(e.target) && accessor()?.();
  document.body.addEventListener("click", onClick);

  onCleanup(() => document.body.removeEventListener("click", onClick));
}

export default (props: {
  onChange: (value: string) => void;
  value: string;
  options?: { value: string; label: string }[];
  name: string;
}) => {
  const [expanded, setExpanded] = createSignal(false);
  const expand = () => {
    console.log("expand");
    setExpanded(true);
  };
  const close = () => {
    console.log("close");
    setExpanded(false);
  };

  const handleClickOutside = (e: Event) => {
    if (
      (e.target as HTMLElement).closest("[data-button]") === null &&
      expanded()
    ) {
      close();
    }
  };

  onMount(() => {
    window.addEventListener("click", handleClickOutside);
  });
  onCleanup(() => {
    window.removeEventListener("click", handleClickOutside);
  });

  return (
    <div class="relative">
      <button
        aria-valuetext="Select a filter"
        role="menu"
        aria-haspopup="true"
        aria-expanded={expanded()}
        data-button="true"
        onClick={(e) => {
          console.log("click", expanded());
          expanded() ? close() : expand();
        }}
        class="text-text3 max-w-[8rem] relative bg-primary hover:bg-highlight focus:ring-4 focus:outline-none focus:ring-accent1 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center "
        type="button">
        <span class="truncate">{props.value}</span>
        <svg
          class="w-2.5 h-2.5 ml-2.5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6">
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>
      <div
        class={`z-[999999] ${
          expanded() ? "" : "hidden"
        } bg-bg1/50 scrollbar max-h-64 overflow-auto backdrop-blur-sm min-w-min inset-x-0 ring-2 ring-bg1 top-12 absolute  rounded-lg shadow max-w-[20rem] `}>
        <ul
          class="py-2 text-sm "
          aria-labelledby={`dropdownDefaultButton-${props.name}`}>
          <For each={props.options}>
            {(option) => (
              <li>
                <button
                  onClick={() => {
                    close();
                    props.onChange(option.value);
                  }}
                  class="block px-4 py-2 hover:bg-bg1 w-full text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-primary rounded-lg">
                  {option.label}
                </button>
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  );
};
