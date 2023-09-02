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
import { Popover as KobaltePopover, DropdownMenu } from "@kobalte/core";
import { FaSolidBrush, FaSolidCheck, FaSolidGlobe } from "solid-icons/fa";

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
  const [instance, setInstance] = useContext(InstanceContext);
  const [, setTheme] = useCookie("theme", "monokai");
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

  const [themeOpen, setThemeOpen] = createSignal(false);
  const [instanceOpen, setInstanceOpen] = createSignal(false);

  return (
    <nav class="fixed bg-bg2 w-full z-[99999] -mx-2 h-10 flex items-center justify-between">
      <button
        class="sr-only focus:not-sr-only absolute top-0 left-0"
        onClick={() => {
          document.querySelector("main")?.focus();
        }}>
        Skip navigation
      </button>
      <div class="flex items-center justify-between w-full max-w-full min-w-0">
        <A href="/" class="text-text1 link px-2">
          Conduit
        </A>
        <ul class="hidden md:inline">
          <For each={links}>
            {(link) => (
              <A
                href={link.href}
                class="link text-sm p-1 text-left transition ">
                {link.label}
              </A>
            )}
          </For>
        </ul>
          <Search />
        <div class="flex items-center gap-2 ">
          <Show when={roomId()}>
            <KobaltePopover.Root>
              <KobaltePopover.Trigger class="p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-green-600 rounded-full"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <circle cx="10" cy="10" r="10" />
                </svg>
              </KobaltePopover.Trigger>
              <KobaltePopover.Portal>
                <KobaltePopover.Content class="bg-bg2 p-2 rounded-md">
                  <KobaltePopover.Arrow />
                  <KobaltePopover.Description class=" text-sm p-1 text-left flex flex-col gap-2 items-center text-green-600">
                    Connected: {roomId()}
                    <Button
                      label="Leave"
                      onClick={() => {
                        localStorage.removeItem("room");
                        location.reload();
                      }}
                    />
                  </KobaltePopover.Description>
                </KobaltePopover.Content>
              </KobaltePopover.Portal>
            </KobaltePopover.Root>
          </Show>
          <Show when={!roomId()}>
            <KobaltePopover.Root>
              <KobaltePopover.Trigger class="p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-red-600 rounded-full"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <circle cx="10" cy="10" r="10" />
                </svg>
              </KobaltePopover.Trigger>
              <KobaltePopover.Portal>
                <KobaltePopover.Content class="bg-bg2 p-2 rounded-md">
                  <KobaltePopover.Arrow />
                  <KobaltePopover.Description class=" text-sm p-1 text-left flex flex-col gap-2 items-center text-red-600">
                    Disconnected
                    <Button
                      label="Join room"
                      onClick={() => setModalOpen(true)}
                    />
                  </KobaltePopover.Description>
                </KobaltePopover.Content>
              </KobaltePopover.Portal>
            </KobaltePopover.Root>
          </Show>

          <DropdownMenu.Root open={themeOpen()} onOpenChange={setThemeOpen}>
            <DropdownMenu.Trigger class=" p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
              <DropdownMenu.Icon>
                <FaSolidBrush fill="currentColor" class="h-5 w-5 text-text1" />
              </DropdownMenu.Icon>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content class="bg-bg2 p-2 rounded-md">
                <DropdownMenu.Arrow />
                <DropdownMenu.RadioGroup
                  value={theme()}
                  onChange={(value) => {
                    setThemeContext(value);
                    setTheme(value);
                  }}>
                  <For
                    each={[
                      { value: "monokai", label: "Monokai" },
                      { value: "dracula", label: "Dracula" },
                      { value: "kawaii", label: "Kawaii" },
                      { value: "discord", label: "Discord" },
                      { value: "github", label: "Github" },
                    ]}>
                    {(option) => (
                      <DropdownMenu.RadioItem
                        value={option.value}
                        class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none">
                        <DropdownMenu.ItemIndicator class="inline-flex absolute left-0">
                          <FaSolidCheck
                            fill="currentColor"
                            class="h-4 w-4 mx-1 text-text1"
                          />
                        </DropdownMenu.ItemIndicator>
                        {option.label}
                      </DropdownMenu.RadioItem>
                    )}
                  </For>
                </DropdownMenu.RadioGroup>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <DropdownMenu.Root
            open={instanceOpen()}
            onOpenChange={setInstanceOpen}>
            <DropdownMenu.Trigger class="mr-2 p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
              <DropdownMenu.Icon>
                <FaSolidGlobe fill="currentColor" class="h-5 w-5 text-text1" />
              </DropdownMenu.Icon>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content class="bg-bg2 p-2 rounded-md">
                <DropdownMenu.Arrow />
                <DropdownMenu.RadioGroup
                  value={instance().api_url}
                  onChange={(value) => {
                    setInstance((instances() as PipedInstance[]).find((i) => i.api_url === value)!);
                  }}>
                  <For each={instances() as PipedInstance[]}>
                    {(instance) => (
                      <DropdownMenu.RadioItem
                        value={instance.api_url}
                        class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none">
                        <DropdownMenu.ItemIndicator class="inline-flex absolute left-0">
                          <FaSolidCheck
                            fill="currentColor"
                            class="h-4 w-4 mx-1 text-text1"
                          />
                        </DropdownMenu.ItemIndicator>
                        {instance.name}
                      </DropdownMenu.RadioItem>
                    )}
                  </For>
                </DropdownMenu.RadioGroup>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
      <Modal
        isOpen={modalOpen()}
        title="Join Room"
        setIsOpen={setModalOpen}>
        <div class="w-full h-full bg-bg1">
          <div class="p-4 flex flex-col items-center justify-center gap-2">
            <Field
              name="room"
              type="text"
              placeholder="Room ID"
              value={roomId()}
              onInput={(e) => setRoomId(e)}
            />
            <Field
              name="password"
              type="password"
              placeholder="Password"
              value={password()}
              onInput={(e) => setPassword(e)}
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


export default Header;
