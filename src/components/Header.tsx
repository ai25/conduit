import { PipedInstance } from "~/types";
import Select from "~/components/Select";
import {
  For,
  JSX,
  Show,
  createEffect,
  createSignal,
  useContext,
} from "solid-js";
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
import Dropdown from "./Dropdown";
import DropdownItem from "./DropdownItem";
import Search from "./SearchInput";
import Modal from "./Modal";
import Button from "./Button";
import Field from "./Field";

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
  const [modalOpen, setModalOpen] = createSignal(false);
  const [roomId, setRoomId] = createSignal("");
  const [password, setPassword] = createSignal("");

  createEffect(() => {
    const room = JSON.parse(localStorage.getItem("room") || "{}");
    setRoomId(room.id || "");
    setPassword(room.password || "");
  });

  return (
    <nav class="fixed bg-bg2 w-full z-[99999] -mx-2 h-10 flex items-center justify-between">
      <button
        class="sr-only focus:not-sr-only absolute top-0 left-0"
        onClick={() => {
          document.querySelector("media-player")?.focus();
        }}>
        Skip navigation
      </button>
      <ul class="hidden lg:flex items-center justify-between px-2 mr-auto">
        <For each={links}>
          {(link) => (
            <A href={link.href} class="link text-sm p-1 text-left transition ">
              {link.label}
            </A>
          )}
        </For>
        <div class="w-80 flex justify-start">
          <Search />
        </div>
      </ul>
      <div class="flex items-center justify-center">
        <Show when={roomId()}>
          <Dropdown
            class="mx-2"
            panelPosition="right"
            iconPosition="left"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-green-600"
                viewBox="0 0 20 20"
                fill="currentColor">
                <circle cx="10" cy="10" r="10" />
              </svg>
            }>
            <div class="text-sm p-1 text-left flex gap-2 items-center text-green-600">
              Connected: {roomId()}
              <Button
                label="Leave"
                onClick={() => {
                  localStorage.removeItem("room");
                  location.reload();
                }}
              />
            </div>
          </Dropdown>
        </Show>
        <Show when={!roomId()}>
          <Dropdown
            class="mx-2"
            panelPosition="right"
            iconPosition="left"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-red-600"
                viewBox="0 0 20 20"
                fill="currentColor">
                <circle cx="10" cy="10" r="10" />
              </svg>
            }>
            <div class="text-sm p-1 text-left flex flex-col gap-2 items-center text-red-600">
              Disconnected
              <Button
                label="Join room"
                onClick={() => setModalOpen(true)}
              />
            </div>
          </Dropdown>
          
        </Show>
      </div>

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
      <div class="w-full flex items-center justify-between lg:hidden">
        <Search />
        <div class="w flex items-center justify-center ">
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
                    class="absolute w-[calc(100vw-2px)] h-screen backdrop-blur px-4 mt-2 transform -translate-x-[calc(100%-1.25rem)] left-1/2 ">
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
      </div>
      <Modal
        isOpen={modalOpen()}
        onClose={() => setModalOpen(false)}
        title="Join Room"
        setIsOpen={setModalOpen}>
        <div class="w-full h-full bg-bg1">
          <div class="p-4 flex flex-col items-center justify-center gap-2">
            <Field
              name="room"
              type="text"
              placeholder="Room ID"
              value={roomId()}
              onInput={(e) => setRoomId(e.currentTarget!.value)}
            />
            <Field
              name="password"
              type="password"
              placeholder="Password"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
            />
            <Button
              onClick={() => {
                localStorage.setItem(
                  "room",
                  JSON.stringify({ id: roomId(), password: password() })
                );
                location.reload();
              }}
              label="Join"
            />
          </div>
        </div>
      </Modal>
    </nav>
  );
};

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
        <DisclosurePanel class="relative px-1 pt-4 pb-2 mt-1 text-sm bg-bg2 max-h-32 overflow-auto scrollbar rounded-lg">
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
        <Dropdown
          label={props.value}
          icon={<ChevronDownIcon class="w-5 h-5" />}
          iconPosition="right"
          buttonClass="max-w-[10rem] bg-primary rounded-lg flex px-3 py-1 text-sm font-medium text-left text-bg2 hover:bg-text2 focus:outline-none focus-visible:ring focus-visible:ring-accent1"
          rotateIcon={true}>
          <For each={props.options}>
            {(option) => (
              <DropdownItem
                onClick={() => props.onChange(option.value)}
                as="button"
                label={option.label}
                selected={option.value === props.value}
              />
            )}
          </For>
        </Dropdown>
      </div>
    </>
  );
};

export default Header;
