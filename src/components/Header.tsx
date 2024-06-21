import { PipedInstance } from "~/types";
import Select from "~/components/Select";
import {
  For,
  JSX,
  Show,
  createEffect,
  createSignal,
  useContext,
  onMount,
  onCleanup,
  createMemo,
} from "solid-js";
import { ThemeContext } from "~/app";
import { useCookie } from "~/utils/hooks";
import { getStorageValue, setStorageValue } from "~/utils/storage";
import { Dropdown } from "./Dropdown";
import Search from "./SearchInput";
import Modal from "./Modal";
import Button from "./Button";
import Field from "./Field";
import {
  Popover as KobaltePopover,
  DropdownMenu,
  toaster,
} from "@kobalte/core";
import {
  FaSolidArrowsRotate,
  FaSolidBrush,
  FaSolidCheck,
  FaSolidGlobe,
} from "solid-icons/fa";
import { useSyncStore } from "~/stores/syncStore";
import { createQuery } from "@tanstack/solid-query";
import { usePreferences } from "~/stores/preferencesStore";
import { useAppState } from "~/stores/appStateStore";
import { Switch } from "solid-js";
import { Match } from "solid-js";
import { BsCloudCheck, BsCloudSlash, BsDatabaseX } from "solid-icons/bs";
import { TiTimes } from "solid-icons/ti";
import { isServer } from "solid-js/web";
import { createMachine } from "@solid-primitives/state-machine";
import { toast } from "./Toast";
import Link from "./Link";
import { THEME_OPTIONS } from "~/config/constants";

enum SyncState {
  DISCONNECTED = "disconnected",
  OFFLINE = "offline",
  ONLINE = "online",
  VOLATILE = "volatile", // Data is flowing but not saved
}
export enum ProviderStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
}

export default function Header() {
  const [theme, setTheme] = useContext(ThemeContext);
  const [, setThemeCookie] = useCookie("theme", "monokai");
  const sync = useSyncStore();

  const links = [
    { href: "/feed", label: "Feed" },
    { href: "/trending", label: "Trending" },
    { href: "/library", label: "Library" },
    { href: "/preferences", label: "Preferences" },
  ];
  const [preferences, setPreferences] = usePreferences();

  const query = createQuery(() => ({
    queryKey: ["instances"],
    queryFn: async (): Promise<PipedInstance[]> => {
      console.log("Fetching instances");
      const res = await fetch("https://piped-instances.kavin.rocks/");
      console.log(res, "instances");
      if (!res.ok) {
        throw new Error("Failed to fetch instances");
      }
      return await res.json();
    },
    select: (data) => {
      setStorageValue("instances", data, "localStorage");
      return data as PipedInstance[];
    },
    retry: (failureCount) => failureCount < 3,
    enabled: !isServer,
  }));

  const randomNames = [
    "Alice",
    "Bob",
    "Charlie",
    "Dave",
    "Eve",
    "Frank",
    "Grace",
    "Heidi",
    "Ivan",
    "Judy",
    "Kevin",
    "Larry",
    "Mallory",
    "Nancy",
    "Oscar",
    "Peggy",
    "Quentin",
    "Rupert",
    "Sybil",
    "Trent",
    "Ursula",
    "Victor",
    "Walter",
    "Xavier",
    "Yvonne",
    "Zelda",
  ];
  const [appState] = useAppState();
  const [modalOpen, setModalOpen] = createSignal(false);
  const [name, setName] = createSignal(
    randomNames[Math.floor(Math.random() * randomNames.length)]
  );
  const [roomId, setRoomId] = createSignal("");
  const [password, setPassword] = createSignal("");

  createEffect(() => {
    const room = JSON.parse(localStorage.getItem("room") || "{}");
    if (room.name) {
      setName(room.name);
    }
    setRoomId(room.id || "");
    setPassword(room.password || "");
  });

  const [themeOpen, setThemeOpen] = createSignal(false);
  const [instanceOpen, setInstanceOpen] = createSignal(false);
  function getSyncStatus(
    idbStatus: "connected" | "connecting" | "disconnected",
    webrtcStatus: "connected" | "connecting" | "disconnected"
  ) {
    if (
      idbStatus === ProviderStatus.CONNECTED &&
      webrtcStatus === ProviderStatus.CONNECTED
    ) {
      return SyncState.ONLINE;
    } else if (
      idbStatus === ProviderStatus.CONNECTED &&
      webrtcStatus !== ProviderStatus.CONNECTED
    ) {
      return SyncState.OFFLINE;
    } else if (
      idbStatus !== ProviderStatus.CONNECTED &&
      webrtcStatus === ProviderStatus.CONNECTED
    ) {
      return SyncState.VOLATILE;
    } else {
      return SyncState.DISCONNECTED;
    }
  }
  const instances = createMemo(() => {
    return [
      ...preferences.customInstances,
      ...(query.data ??
        getStorageValue("instances", [], "json", "localStorage")),
    ];
  });

  const cycleInstances = () => {
    if (!query.data) return;
    let currentInstanceIndex = instances().findIndex(
      (instance) => instance.api_url === preferences.instance.api_url
    );
    currentInstanceIndex = currentInstanceIndex > -1 ? currentInstanceIndex : 0;
    const nextInstanceIndex = (currentInstanceIndex + 1) % instances.length;
    setPreferences("instance", instances()[nextInstanceIndex]);
    toast.show(
      `You are now connected to ${instances()[nextInstanceIndex].name}`
    );
  };

  onMount(() => {
    if (isServer) return;
    document.addEventListener("keydown", (e) => {
      if (e.key === "I" && e.shiftKey && !e.ctrlKey && !e.altKey) {
        cycleInstances();
        e.preventDefault();
      }
    });
  });
  onCleanup(() => {
    if (isServer) return;
    document.removeEventListener("keydown", (e) => {
      if (e.key === "I" && e.shiftKey && !e.ctrlKey && !e.altKey) {
        cycleInstances();
        e.preventDefault();
      }
    });
  });

  return (
    <nav class="fixed top-0 left-0 bg-bg2 w-full z-[999] h-10 px-2 flex items-center justify-between">
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
        <Link href="/" class="text-text1 mx-2 w-8 h-8">
          <img
            src="/logo.svg"
            alt="Conduit"
            class="h-8 w-8 aspect-square min-w-max "
          />
        </Link>
        <ul class="hidden md:inline">
          <For each={links}>
            {(link) => (
              <Link href={link.href} class="text-sm p-1 text-left transition ">
                {link.label}
              </Link>
            )}
          </For>
        </ul>
        <Search />
        <div class="flex items-center gap-2 ">
          <KobaltePopover.Root>
            <KobaltePopover.Trigger class="p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
              <Switch>
                <Match when={appState.sync.syncing}>
                  <FaSolidArrowsRotate class="w-6 h-6 text-yellow-500" />
                </Match>
                <Match
                  when={
                    getSyncStatus(
                      appState.sync.providers.opfs,
                      appState.sync.providers.webrtc
                    ) === SyncState.ONLINE
                  }
                >
                  <BsCloudCheck class="w-7 h-7 text-green-500" />
                </Match>
                <Match
                  when={
                    getSyncStatus(
                      appState.sync.providers.opfs,
                      appState.sync.providers.webrtc
                    ) === SyncState.DISCONNECTED
                  }
                >
                  <TiTimes class="w-9 h-9 text-red-500" />
                </Match>
                <Match
                  when={
                    getSyncStatus(
                      appState.sync.providers.opfs,
                      appState.sync.providers.webrtc
                    ) === SyncState.OFFLINE
                  }
                >
                  <BsCloudSlash class="w-7 h-7 text-text1" />
                </Match>
                <Match
                  when={
                    getSyncStatus(
                      appState.sync.providers.opfs,
                      appState.sync.providers.webrtc
                    ) === SyncState.VOLATILE
                  }
                >
                  <BsDatabaseX class="w-6 h-6 text-text1" />
                </Match>
              </Switch>
            </KobaltePopover.Trigger>
            <KobaltePopover.Portal>
              <KobaltePopover.Content
                class="bg-bg1 border border-bg3/80 p-2 rounded-md
                animate-in
                fade-in
                slide-in-from-top-10
                duration-200
                z-[99999]
                "
              >
                <KobaltePopover.Arrow />
                <KobaltePopover.Description
                  class={`text-sm p-1 text-left flex flex-col gap-2 items-center ${
                    roomId() ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <Show when={roomId()}>
                    Connected: {roomId()}
                    <div class="flex items-start flex-col gap-2 text-text1">
                      <details class="text-xs">
                        <summary class="link">
                          Users: {appState.sync.users.length}
                        </summary>
                        <For each={appState.sync.users}>
                          {(user) => (
                            <div class="flex items-center gap-2">
                              ID: {user.id}
                              Name: {user.name}{" "}
                              {user.name === name() && "(You)"}
                            </div>
                          )}
                        </For>
                      </details>
                      <div>
                        Syncing: {appState.sync.syncing ? "true" : "false"}
                      </div>
                      <div>IndexedDB: {appState.sync.providers.idb}</div>
                      <div>WebRTC: {appState.sync.providers.webrtc}</div>
                      <div>OPFS: {appState.sync.providers.opfs}</div>
                    </div>
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
            isOpen={themeOpen()}
            onOpenChange={setThemeOpen}
            onChange={(value) => {
              setTheme(value);
              setThemeCookie(value);
            }}
            options={THEME_OPTIONS}
            selectedValue={theme()}
            triggerIcon={
              <FaSolidBrush fill="currentColor" class="h-5 w-5 text-text1" />
            }
          />

          <Dropdown
            isOpen={instanceOpen()}
            onOpenChange={setInstanceOpen}
            selectedValue={preferences.instance.api_url}
            onChange={(value) => {
              let instance = instances().find((i) => i.api_url === value);
              if (instance) {
                setPreferences("instance", instance);
              }
            }}
            options={(instances() as PipedInstance[]).map((i) => ({
              label: `${i.name} ${i.uptime_24h ? "- " + i.uptime_24h.toFixed(0) + "%" : ""}`,
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
              name="name"
              value={name()}
              onInput={(e) => setName(e)}
              placeholder="Name"
              type="text"
              class="w-full"
            />
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
                  JSON.stringify({
                    name: name(),
                    id: roomId(),
                    password: password(),
                  })
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
}
