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
import { ThemeContext } from "~/root";
import { useCookie } from "~/utils/hooks";
import { getStorageValue, setStorageValue } from "~/utils/storage";
import { A } from "@solidjs/router";
import { useLocation, useNavigate } from "solid-start";
import { Dropdown } from "./Dropdown";
import Search from "./SearchInput";
import Modal from "./Modal";
import Button from "./Button";
import Field from "./Field";
import { Popover as KobaltePopover, DropdownMenu } from "@kobalte/core";
import { FaSolidBrush, FaSolidCheck, FaSolidGlobe } from "solid-icons/fa";
import { useSyncedStore } from "~/stores/syncedStore";
import { createQuery } from "@tanstack/solid-query";
import dayjs from "dayjs";
import { usePreferences } from "~/stores/preferencesStore";

const Header = () => {
  const [theme, setTheme] = useContext(ThemeContext);
  const [, setThemeCookie] = useCookie("theme", "monokai");
  const sync = useSyncedStore();

  const links = [
    { href: "/feed", label: "Feed" },
    { href: "/trending", label: "Trending" },
    { href: "/library", label: "Library" },
    { href: "/import", label: "Import" },
  ];

  const query = createQuery(
    () => ["instances"],
    async (): Promise<PipedInstance[]> =>
      await fetch("https://piped-instances.kavin.rocks/").then((res) =>
        res.json()
      ),
    {
      get initialData() {
        return getStorageValue("instances", [], "json", "localStorage");
      },
      retry: (failureCount) => failureCount < 3,
    }
  );
  const [preferences, setPreferences] = usePreferences();

  createEffect(() => {
    if (query.data && !query.data.error) {
      setStorageValue("instances", query.data, "localStorage");
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
          const main = document.querySelector("main");
          const focusable = main?.querySelectorAll(
            "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
          );
          if (focusable) {
            (focusable[0] as HTMLElement).focus();
          }
        }}
      >
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
                class="link text-sm p-1 text-left transition "
              >
                {link.label}
              </A>
            )}
          </For>
        </ul>
        <Search />
        <div class="flex items-center gap-2 ">
          <KobaltePopover.Root>
            <KobaltePopover.Trigger class="p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class={`h-5 w-5 rounded-full ${
                  roomId() ? "text-green-600" : "text-red-600"
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <circle cx="10" cy="10" r="10" />
              </svg>
            </KobaltePopover.Trigger>
            <KobaltePopover.Portal>
              <KobaltePopover.Content class="bg-bg2 p-2 rounded-md">
                <KobaltePopover.Arrow />
                <KobaltePopover.Description
                  class={`text-sm p-1 text-left flex flex-col gap-2 items-center ${
                    roomId() ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <Show when={roomId()}>
                    Connected: {roomId()}
                    <Button
                      label="Leave"
                      onClick={() => {
                        localStorage.removeItem("room");
                        location.reload();
                      }}
                    />
                  </Show>
                  <Show when={!roomId()}>
                    Disconnected
                    <Button
                      label="Join room"
                      onClick={() => setModalOpen(true)}
                    />
                  </Show>
                </KobaltePopover.Description>
              </KobaltePopover.Content>
            </KobaltePopover.Portal>
          </KobaltePopover.Root>
          <Dropdown
            isOpen={themeOpen}
            onOpenChange={setThemeOpen}
            onChange={(value) => {
              setTheme(value);
              setThemeCookie(value);
            }}
            options={[
              { value: "monokai", label: "Monokai" },
              { value: "dracula", label: "Dracula" },
              { value: "kawaii", label: "Kawaii" },
              { value: "discord", label: "Discord" },
              { value: "github", label: "Github" },
            ]}
            selectedValue={theme}
            triggerIcon={
              <FaSolidBrush fill="currentColor" class="h-5 w-5 text-text1" />
            }
          />

          <Dropdown
            isOpen={instanceOpen}
            onOpenChange={setInstanceOpen}
            selectedValue={() => preferences.instance.api_url}
            onChange={(value) => {
              let instance = (query.data as PipedInstance[]).find(
                (i) => i.api_url === value
              );
              if (instance) {
                setPreferences("instance", instance);
              }
            }}
            options={(query.data as PipedInstance[]).map((i) => ({
              label: i.name,
              value: i.api_url,
            }))}
            triggerIcon={
              <FaSolidGlobe fill="currentColor" class="h-5 w-5 text-text1" />
            }
          />
        </div>
      </div>
      <Modal isOpen={modalOpen()} title="Join Room" setIsOpen={setModalOpen}>
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
