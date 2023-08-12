import { PipedInstance } from "~/types";
import Select from "~/components/Select";
import { For, JSX, createEffect, createSignal, useContext } from "solid-js";
import { InstanceContext, PreferencesContext, ThemeContext } from "~/root";
import { useCookie } from "~/utils/hooks";
import { getStorageValue, setStorageValue } from "~/utils/storage";
import { A } from "@solidjs/router";
import { useLocation, useNavigate } from "solid-start";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuItem,
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "solid-headless";

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

function Separator() {
  return (
    <div class="flex items-center" aria-hidden="true">
      <div class="w-full border-t border-gray-200" />
    </div>
  );
}
function ChevronDownIcon(props: JSX.IntrinsicElements["svg"]): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}>
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

const Header = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [theme, setThemeContext] = useContext(ThemeContext);
  const [instance, setInstanceContext] = useContext(InstanceContext);
  const [, setTheme] = useCookie("theme", "monokai");
  const [, setInstance] = useCookie("instance", "https://pipedapi.kavin.rocks");
  const [instances, setInstances] = createSignal<PipedInstance[] | Error>();
  const route = useLocation();
  const [preferences] = useContext(PreferencesContext);

  const links = [
    { href: "/feed", label: "Feed" },
    { href: "/trending", label: "Trending" },
    { href: "/history", label: "History" },
    { href: "/import", label: "Import" },
    { href: "/playlists", label: "Playlists" },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen());
  };
  createEffect(async () => {
    console.log(
      new Date().toISOString().split("T")[1],
      "visible task setting instances in header"
    );
    console.time("visible task setting instances in header");
    await fetch("https://piped-instances.kavin.rocks/")
      .then(async (res) => {
        console.log("INSTANCES", res.status);
        if (res.status === 200) {
          setInstances(await res.json());

        } else {
          setInstances(new Error("Failed to fetch instances"));
        }
      })
      .catch((err) => {
        console.log("INSTANCES ERROR", err.message);
        return err as Error;
      });
    if (
      !instances() ||
      instances() instanceof Error ||
      (instances() as PipedInstance[]).length < 1
    ) {
      setInstances(getStorageValue("instances", [], "json", "localStorage"));
      return;
    }

  });

  const navigate = useNavigate();

  return (
    <nav class="fixed bg-bg2 w-full z-[99999] -mx-2 h-10 flex items-center justify-between">
      <button
        class="sr-only focus:not-sr-only absolute top-0 left-0"
        onClick={() => {
          document.querySelector("media-player")?.focus();
        }}>
        Skip to main content
      </button>
      <ul class="hidden lg:flex items-center justify-between px-2 mr-auto">
        <For each={links}>
          {(link) => (
            <A
              href={link.href}
              class="text-sm p-1 text-left rounded hover:bg-highlight hover:text-text3 focus:outline-none focus:bg-highlight focus:text-text3 transition">
              {link.label}
            </A>
          )}
        </For>
      <div class="w-80 flex justify-start">
        <Search />
      </div>
      </ul>

      <div class="w-80 hidden lg:flex items-center gap-2">
        <Sel
          name="theme"
          value={theme() ?? ""}
          onChange={(v) => {
            setThemeContext(v);
            setTheme(v);
          }}
          options={[
            { value: "monokai", label: "Monokai" },
            { value: "dracula", label: "Dracula" },
            { value: "kawaii", label: "Kawaii" },
            { value: "discord", label: "Discord" },
            { value: "github", label: "Github" },
          ]}
        />
        <Sel
          name="instance"
          value={
            (instances() as PipedInstance[])?.find(
              (i) => i.api_url === instance()
            )?.name ?? `DOWN - ${instance()}`
          }
          onChange={(v) => {
            setInstance(v);
            setInstanceContext(v);
          }}
          options={(instances() as PipedInstance[])?.map((instance) => {
            return {
              value: instance.api_url,
              label: instance.name,
            };
          })}
        />
      </div>
      <div class="w-full flex items-center justify-center lg:hidden">
        <Popover defaultOpen={false} class="relative ">
          {({ isOpen }) => (
            <>
              <PopoverButton
                class={classNames(
                  isOpen() && "text-opacity-90",
                  "group px-3 py-2 rounded-md inline-flex items-center text-base font-medium hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                )}>
                {/* <ChevronDownIcon
                class={classNames(
                  isOpen() && 'text-opacity-0',
                  'h-8 w-8 rounded-sm transition-transform duration-200 ease-out group-aria-expanded:rotate-90 group-data-[focus]:ring-4 group-data-[focus]:ring-primary',
                )}
                aria-hidden="true"
              />  */}
                {/* u/surjithctly -> https://tailwindcomponents.com/component/wip-hamburger-menu-animation */}
                <div class="block w-5 absolute left-1/2 top-1/2   transform  -translate-x-1/2 -translate-y-1/2">
                  <span
                    classList={{
                      "rotate-45": isOpen(),
                      " -translate-y-1.5": !isOpen(),
                    }}
                    aria-hidden="true"
                    class="block absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out"></span>
                  <span
                    classList={{ "opacity-0": isOpen() }}
                    aria-hidden="true"
                    class="block absolute  h-0.5 w-5 bg-current   transform transition duration-500 ease-in-out"></span>
                  <span
                    classList={{
                      "-rotate-45": isOpen(),
                      " translate-y-1.5": !isOpen(),
                    }}
                    aria-hidden="true"
                    class="block absolute  h-0.5 w-5 bg-current transform  transition duration-500 ease-in-out"></span>
                </div>
              </PopoverButton>
              <Transition
                show={isOpen()}
                enter="transition duration-200"
                enterFrom="opacity-0 -translate-y-1 scale-50"
                enterTo="opacity-100 translate-y-0 scale-100"
                leave="transition duration-150"
                leaveFrom="opacity-100 translate-y-0 scale-100"
                leaveTo="opacity-0 -translate-y-1 scale-50">
                <PopoverPanel
                  unmount={false}
                  class="absolute w-[calc(100vw-2px)] h-screen backdrop-blur px-4 mt-4 transform -translate-x-1/2 left-1/2 ">
                  <Menu class="overflow-hidden w-full rounded-lg shadow-lg ring-1 ring-text1/5 py-4 px-2 bg-bg1/95 flex flex-col space-y-1">
                    <For each={links}>
                      {(link) => (
                        <MenuItem
                          onClick={() => navigate(link.href)}
                          as="button"
                          classList={{
                            "-translate-x-50": !isOpen(),
                            "translate-x-0": isOpen(),
                          }}
                          class="text-sm p-1 text-left rounded hover:bg-highlight hover:text-text3 focus:outline-none focus:bg-highlight focus:text-text3 transition">
                          {link.label}
                        </MenuItem>
                      )}
                    </For>
                    {/* <S /> */}
                    <Sel
                      name="theme"
                      value={theme() ?? ""}
                      onChange={(v) => {
                        setThemeContext(v);
                        setTheme(v);
                      }}
                      options={[
                        { value: "monokai", label: "Monokai" },
                        { value: "dracula", label: "Dracula" },
                        { value: "kawaii", label: "Kawaii" },
                        { value: "discord", label: "Discord" },
                        { value: "github", label: "Github" },
                      ]}
                    />
                    <Sel
                      name="instance"
                      value={
                        (instances() as PipedInstance[])?.find(
                          (i) => i.api_url === instance()
                        )?.name ?? `DOWN - ${instance()}`
                      }
                      onChange={(v) => {
                        setInstance(v);
                        setInstanceContext(v);
                      }}
                      options={(instances() as PipedInstance[])?.map(
                        (instance) => {
                          return {
                            value: instance.api_url,
                            label: instance.name,
                          };
                        }
                      )}
                    />
                  </Menu>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </nav>
  );
};

const S = () => (
  <div class="w-full flex items-center justify-center">
    <Popover defaultOpen={false} class="relative">
      {({ isOpen }) => (
        <>
          <PopoverButton
            class={classNames(
              isOpen() && "text-opacity-90",
              "text-white group bg-purple-700 px-3 py-2 rounded-md inline-flex items-center text-base font-medium hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
            )}>
            <span>Action</span>
            <ChevronDownIcon
              class={classNames(
                isOpen() && "text-opacity-70",
                "ml-2 h-5 w-5 text-purple-300 group-hover:text-opacity-80 transition ease-in-out duration-150"
              )}
              aria-hidden="true"
            />
          </PopoverButton>
          <Transition
            show={isOpen()}
            enter="transition duration-200"
            enterFrom="opacity-0 -translate-y-1 scale-50"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition duration-150"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 -translate-y-1 scale-50">
            <PopoverPanel
              unmount={false}
              class="absolute z-10 px-4 mt-3 transform -translate-x-1/2 left-1/2 sm:px-0 lg:max-w-3xl">
              <Menu class="overflow-hidden w-64 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white flex flex-col space-y-1 p-1">
                <MenuItem
                  as="button"
                  class="text-sm p-1 text-left rounded hover:bg-purple-600 hover:text-white focus:outline-none focus:bg-purple-600 focus:text-white">
                  Open Link in New Tab
                </MenuItem>
                <MenuItem
                  as="button"
                  class="text-sm p-1 text-left rounded hover:bg-purple-600 hover:text-white focus:outline-none focus:bg-purple-600 focus:text-white">
                  Open Link in New Window
                </MenuItem>
                <MenuItem
                  as="button"
                  class="text-sm p-1 text-left rounded hover:bg-purple-600 hover:text-white focus:outline-none focus:bg-purple-600 focus:text-white">
                  Open Link in New Incognito Window
                </MenuItem>
                <Separator />
                <MenuItem
                  as="button"
                  class="text-sm p-1 text-left rounded hover:bg-purple-600 hover:text-white focus:outline-none focus:bg-purple-600 focus:text-white">
                  Save Link As...
                </MenuItem>
                <MenuItem
                  as="button"
                  class="text-sm p-1 text-left rounded hover:bg-purple-600 hover:text-white focus:outline-none focus:bg-purple-600 focus:text-white">
                  Copy Link Address
                </MenuItem>
                <Separator />
                <MenuItem
                  as="button"
                  class="text-sm p-1 text-left rounded hover:bg-purple-600 hover:text-white focus:outline-none focus:bg-purple-600 focus:text-white">
                  Inspect
                </MenuItem>
              </Menu>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  </div>
);

const Sel = (props: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => {
  return (
    <>
    <Disclosure class="lg:hidden" defaultOpen={false} as="div">
      <DisclosureButton
        as="button"
        class="flex justify-between w-full px-4 py-2 text-sm font-medium text-left bg-bg2 text-primary rounded-lg hover:bg-text2 focus:outline-none focus-visible:ring focus-visible:ring-highlight/75">
        {({ isOpen }) => (
          <>
            <span>{props.name}</span>
            <ChevronDownIcon
              class={`${isOpen() ? "transform rotate-180" : ""} w-5 h-5`}
            />
          </>
        )}
      </DisclosureButton>
      <DisclosurePanel class="px-1 pt-4 pb-2 mt-1 text-sm bg-bg2 max-h-32 overflow-auto scrollbar rounded-lg">
        <For each={props.options}>
          {(option) => (
            <button
              onClick={() => props.onChange(option.value)}
              class="cursor-pointer w-full border-bg3 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none">
              <div class="flex w-full items-center p-2 pl-2 border-transparent border-l-2 relative ">
                <div class="w-full items-center flex">
                  <div class="mx-2">{option.label}</div>
                </div>
              </div>
            </button>
          )}
        </For>
      </DisclosurePanel>
    </Disclosure>
    <div class="hidden lg:block">
      <Popover defaultOpen={false} class="relative">
        {({ isOpen }) => (
          <>
            <PopoverButton
              class={classNames(
                isOpen() && "text-opacity-90",
                " group bg-primary text-text3 px-3 py-2 rounded-lg inline-flex items-center text-sm hover:text-opacity-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-highlight/75"
              )}>
              <span>{props.name}</span>
              <ChevronDownIcon
                class={classNames(
                  isOpen() && "text-opacity-70 rotate-180",
                  "ml-2 h-5 w-5 group-hover:text-opacity-80 transition ease-in-out duration-150"
                )}
                aria-hidden="true"
              />
            </PopoverButton>
            <Transition
              show={isOpen()}
              enter="transition duration-200"
              enterFrom="opacity-0 -translate-y-1 scale-50"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="transition duration-150"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 -translate-y-1 scale-50">
              <PopoverPanel
                unmount={false}
                class="absolute z-10 px-4 mt-3 transform -translate-x-1/2 left-1/2 sm:px-0 lg:max-w-3xl">
                <Menu class="overflow-hidden w-64 rounded-lg shadow-lg ring-1 ring-black/5 bg-bg2 flex flex-col space-y-1 p-1">
                  <For each={props.options}>
                    {(option) => (
                      <MenuItem
                        onClick={() => props.onChange(option.value)}
                        as="button"
                        class="text-sm p-1 text-left rounded hover:bg-primary hover:text-text3 focus:outline-none focus:bg-primary focus:text-text2">
                        {option.label}
                      </MenuItem>
                    )}
                  </For>
                </Menu>
              </PopoverPanel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
            
</>
  );
};

const Search = () => {
  const [search, setSearch] = createSignal<string | null>(null);
  const [suggestions, setSuggestions] = createSignal<string[]>([]);
  const [instance] = useContext(InstanceContext);
  async function getSuggestions(value: string) {
    const res = await fetch(`${instance()}/suggestions?query=${value}`);
    console.log(res);
    if (res.status === 200) {
      const json = await res.json();
      console.log(json);
      setSuggestions(json);
    } else {
      console.error("Failed to fetch suggestions", res.text());
    }
  }
  const navigate = useNavigate();
  createEffect(() => {
    setSuggestions([]);
    if (search() && search()!.length > 1) {
      getSuggestions(search()!);
    }
  });

  function handleSearch(input: string) {
    setSuggestions([]);
    setSearch(null);
    console.log(input);
    navigate(`/search?q=${input}`, { replace: false });
  }

  return (
    <div class="inline-block max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(search()!);
        }}
        class="relative max-w-full">
        <input
          value={search() ?? ""}
          onInput={(e) => {
            setSearch(e.currentTarget.value);
          }}
          type="search"
          class="peer appearance-none cursor-pointer relative 
          z-10 h-8 w-8 focus:pl-14 rounded-full border border-text2 transition-all origin-right duration-200 
          bg-transparent outline-none 
          focus:w-full focus:cursor-text focus:ring-highlight focus:ring-4 
          ring-inset focus:pr-4 peer-focus:w-full"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="absolute inset-y-0 my-auto h-5 w-8 border-r 
          border-transparent stroke-text2 px-2 peer-focus:border-highlight 
          peer-focus:stroke-highlight"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <div class="absolute peer shadow bg-bg2 z-40 w-full left-0 rounded max-h-select overflow-y-auto ">
          <div class="flex flex-col w-full">
            <For each={suggestions()}>
              {(suggestion) => (
                <button
                  onClick={() => handleSearch(suggestion)}
                  class="cursor-pointer w-full border-bg3 rounded-t border-b hover:bg-bg3">
                  <div class="flex w-full items-center p-2 pl-2 border-transparent border-l-2 relative ">
                    <div class="w-full items-center flex">
                      <div class="mx-2">{suggestion}</div>
                    </div>
                  </div>
                </button>
              )}
            </For>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Header;
