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
  on,
} from "solid-js";
import { useCookie, useOnClickOutside } from "~/utils/hooks";
import { getStorageValue, setStorageValue } from "~/utils/storage";
import { Dropdown } from "./Dropdown";
import Search, { FocusTrap } from "./SearchInput";
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
  FaSolidBan,
  FaSolidBrush,
  FaSolidCheck,
  FaSolidChevronLeft,
  FaSolidChevronRight,
  FaSolidClock,
  FaSolidClockRotateLeft,
  FaSolidDownload,
  FaSolidGlobe,
  FaSolidHeart,
  FaSolidList,
} from "solid-icons/fa";
import { useSyncStore } from "~/stores/syncStore";
import { createQuery } from "@tanstack/solid-query";
import { usePreferences } from "~/stores/preferencesStore";
import { useAppState } from "~/stores/appStateStore";
import { Switch } from "solid-js";
import { Match } from "solid-js";
import {
  BsCloudCheck,
  BsCloudSlash,
  BsDatabaseX,
  BsThreeDotsVertical,
  BsViewList,
} from "solid-icons/bs";
import { TiTimes } from "solid-icons/ti";
import { isServer } from "solid-js/web";
import { createMachine } from "@solid-primitives/state-machine";
import { toast } from "./Toast";
import Link from "./Link";
import { THEME_OPTIONS } from "~/config/constants";
import { useLocation, useSearchParams } from "@solidjs/router";
import { AiOutlineFire } from "solid-icons/ai";
import { BiRegularNetworkChart, BiSolidCog } from "solid-icons/bi";
import {
  RiDeviceWifiFill,
  RiDeviceWifiLine,
  RiDeviceWifiOffFill,
  RiDeviceWifiOffLine,
} from "solid-icons/ri";
import Toggle from "./Toggle";

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
  const [, setThemeCookie] = useCookie("theme", "monokai");
  const [preferences, setPreferences] = usePreferences();

  const [searchParams, setSearchParams] = useSearchParams();
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
    enabled: !isServer && !searchParams.offline,
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
  const [appState, setAppState] = useAppState();
  const [modalOpen, setModalOpen] = createSignal(false);
  const [dropdownOpen, setDropdownOpen] = createSignal(false);
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
    const nextInstanceIndex = (currentInstanceIndex + 1) % instances().length;
    appState.player.instance?.pause();
    if (instances()[nextInstanceIndex]?.api_url) {
      setPreferences("instance", instances()[nextInstanceIndex]);
      toast.show(
        `You are now connected to ${instances()[nextInstanceIndex].name}`
      );
    } else {
      toast.error("Could not switch instance.");
    }
  };

  const [lastScrollY, setLastScrollY] = createSignal(0);
  const [scrollDelta, setScrollDelta] = createSignal(0);
  const SCROLL_THRESHOLD = 50;

  const controlNavbar = () => {
    if (typeof window !== "undefined") {
      const currentScrollY = window.scrollY;
      if (
        searchParams.fullscreen &&
        location.pathname === "/watch" &&
        currentScrollY === 0
      ) {
        setAppState("showNavbar", false);
      } else {
        setScrollDelta((prev) => prev + currentScrollY - lastScrollY());
        if (Math.abs(scrollDelta()) > SCROLL_THRESHOLD) {
          if (scrollDelta() > 0) {
            setAppState("showNavbar", false);
          } else {
            setAppState("showNavbar", true);
          }
          setScrollDelta(0);
        }
      }

      setLastScrollY(window.scrollY);
    }
  };
  onMount(() => {
    if (isServer) return;
    controlNavbar();
    document.addEventListener("keydown", (e) => {
      if (e.key === "I" && e.shiftKey && !e.ctrlKey && !e.altKey) {
        cycleInstances();
        e.preventDefault();
      }
    });
    window.addEventListener("scroll", controlNavbar);
  });
  onCleanup(() => {
    if (isServer) return;
    document.removeEventListener("keydown", (e) => {
      if (e.key === "I" && e.shiftKey && !e.ctrlKey && !e.altKey) {
        cycleInstances();
        e.preventDefault();
      }
    });
    window.removeEventListener("scroll", controlNavbar);
  });
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  let sidebarRef: HTMLDivElement;
  let toggleSidebarRef: HTMLButtonElement;
  createEffect(() => {
    if (sidebarRef && toggleSidebarRef) {
      useOnClickOutside([toggleSidebarRef, sidebarRef], () => {
        setSidebarOpen(false);
      });
    }
  });

  const location = useLocation();
  createEffect(
    on(
      () => location.pathname,
      () => {
        setSidebarOpen(false);
      }
    )
  );
  onMount(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        setAppState("showNavbar", false);
      } else setAppState("showNavbar", true);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    onCleanup(() => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    });
  });

  return (
    <nav
      classList={{
        "fixed top-0 left-0 bg-bg1 w-full z-[99999] h-14 border-b border-bg2 px-2 transition-transform duration-300 flex items-center justify-between":
          true,
        "translate-y-0": appState.showNavbar,
        "-translate-y-full": !appState.showNavbar,
      }}
    >
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

      <button
        ref={toggleSidebarRef!}
        onKeyDown={(e) => {
          console.log(e.key);
          if (e.key === "Escape") {
            setSidebarOpen((prev) => !prev);
            e.preventDefault();
          }
        }}
        onClick={() => setSidebarOpen((prev) => !prev)}
        class="outline-none aspect-square w-9 h-9 p-1 focus-visible:ring-2 ring-primary/80 rounded-lg flex flex-col gap-[6px] justify-center items-center"
      >
        <div
          classList={{
            "w-[24px] bg-text1 h-[2px] rounded transition-transform origin-top-left":
              true,
            "rotate-45 translate-x-[4px] -translate-y-[0.25px]": sidebarOpen(),
          }}
        />
        <div
          classList={{
            "w-[24px] bg-text1 h-[2px] rounded transition-opacity": true,
            "opacity-0": sidebarOpen(),
          }}
        />
        <div
          classList={{
            "w-[24px] bg-text1 h-[2px] rounded transition-transform origin-bottom-left":
              true,
            "-rotate-45 translate-x-[4px] translate-y-[0.25px]": sidebarOpen(),
          }}
        />
      </button>
      <div class="bg-red-500" ref={sidebarRef!}>
        <FocusTrap
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSidebarOpen((prev) => !prev);
              e.preventDefault();
            }
          }}
          classList={{
            "absolute w-screen sm:w-72  p-3 transition-[transform,opacity] duration-300 bg-bg1 h-screen top-14 left-0 flex flex-col items-center gap-2 overflow-auto":
              true,
            "-translate-x-full scale-x-0 opacity-0": !sidebarOpen(),
            "translate-x-0 scale-x-1": sidebarOpen(),
          }}
          active={true}
        >
          <Link
            class="outline-none w-full focus-visible:ring-2 ring-primary/80 bg-bg1 hover:bg-bg2 px-3 py-2 rounded-lg flex items-center gap-2"
            tabIndex={sidebarOpen() ? 0 : -1}
            href="/feed"
          >
            <BsViewList class="w-6 h-6 mr-4" />
            Feed
          </Link>
          <Link
            class="outline-none w-full focus-visible:ring-2 ring-primary/80 bg-bg1 hover:bg-bg2 px-3 py-2 rounded-lg flex items-center gap-2"
            tabIndex={sidebarOpen() ? 0 : -1}
            href="/trending"
          >
            <AiOutlineFire class="w-6 h-6 mr-4" />
            Trending
          </Link>
          <div class="self-start bg-bg3/80 h-px rounded w-full my-2" />
          <Link
            tabIndex={sidebarOpen() ? 0 : -1}
            class="outline-none w-full focus-visible:ring-2 ring-primary/80 bg-bg1 hover:bg-bg2 px-3 py-2 rounded-lg flex items-center gap-2"
            href="/library/history"
          >
            <FaSolidClockRotateLeft class="w-5 h-5 ml-1 mr-4" />
            History
          </Link>
          <Link
            tabIndex={sidebarOpen() ? 0 : -1}
            class="outline-none w-full focus-visible:ring-2 ring-primary/80 bg-bg1 hover:bg-bg2 px-3 py-2 rounded-lg flex items-center gap-2"
            href="/library/playlists"
          >
            <FaSolidList class="w-5 h-5 ml-1 mr-4" />
            Playlists
          </Link>
          <Link
            tabIndex={sidebarOpen() ? 0 : -1}
            class="outline-none w-full focus-visible:ring-2 ring-primary/80 bg-bg1 hover:bg-bg2 px-3 py-2 rounded-lg flex items-center gap-2"
            href="/library/watch-later"
          >
            <FaSolidClock class="w-5 h-5 ml-1 mr-4" />
            Watch Later
          </Link>
          <Link
            tabIndex={sidebarOpen() ? 0 : -1}
            class="outline-none w-full focus-visible:ring-2 ring-primary/80 bg-bg1 hover:bg-bg2 px-3 py-2 rounded-lg flex items-center gap-2"
            href="/library/downloads"
          >
            <FaSolidDownload class="w-5 h-5 ml-1 mr-4" />
            Downloads
          </Link>
          <Link
            tabIndex={sidebarOpen() ? 0 : -1}
            class="outline-none w-full focus-visible:ring-2 ring-primary/80 bg-bg1 hover:bg-bg2 px-3 py-2 rounded-lg flex items-center gap-2"
            href="/library/blocklist"
          >
            <FaSolidBan class="w-5 h-5 ml-1 mr-4" />
            Blocklist
          </Link>
          <Link
            tabIndex={sidebarOpen() ? 0 : -1}
            class="outline-none w-full focus-visible:ring-2 ring-primary/80 bg-bg1 hover:bg-bg2 px-3 py-2 rounded-lg flex items-center gap-2"
            href="/library/subscriptions"
          >
            <FaSolidHeart class="w-5 h-5 ml-1 mr-4" />
            Subscriptions
          </Link>
          <div class="self-start bg-bg3/80 h-px rounded w-full my-2" />
          <Link
            tabIndex={sidebarOpen() ? 0 : -1}
            class="outline-none w-full focus-visible:ring-2 ring-primary/80 bg-bg1 hover:bg-bg2 px-3 py-2 rounded-lg flex items-center gap-2"
            href="/preferences"
          >
            <BiSolidCog class="w-5 h-5 ml-1 mr-4" />
            Preferences
          </Link>
        </FocusTrap>
      </div>
      <div class="flex items-center justify-between w-full h-full py-2 max-w-full min-w-0">
        <Link
          href={`/${preferences.content.defaultHomePage?.toLowerCase() ?? "trending"}`}
          class="text-text1 mx-2 w-8 h-8"
        >
          <img
            src="/logo.svg"
            alt="Conduit"
            class="h-8 w-8 aspect-square min-w-max "
          />
        </Link>
        <Search />
        <div class="flex items-center gap-2 ">
          <KobaltePopover.Root>
            <KobaltePopover.Trigger class="p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
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
                class="bg-bg1 border border-bg3/80 p-2 rounded-lg
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
                        window.location.reload();
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

          <DropdownMenu.Root
            // overlap={true}
            open={dropdownOpen()}
            onOpenChange={setDropdownOpen}
            // gutter={0}
            modal={false}
            // hideWhenDetached={true}
          >
            <DropdownMenu.Trigger
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              class="p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
            >
              <BsThreeDotsVertical
                fill="currentColor"
                class="text-text1 w-6 h-6"
              />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                class="bg-bg1 border border-bg2 shadow p-2 rounded-md z-[999999]
                -translate-y-2
                animate-in
                fade-in
                slide-in-from-top-10
                zoom-in-50
                duration-300
                "
              >
                <DropdownMenu.Arrow />
                <DropdownMenu.CheckboxItem
                  closeOnSelect={false}
                  onTouchStart={() => {
                    setAppState("touchInProgress", true);
                  }}
                  checked={!!searchParams.offline}
                  onChange={(checked) => {
                    if (checked) {
                      setSearchParams({ offline: true });
                    } else {
                      setSearchParams({ offline: undefined });
                    }
                  }}
                  class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
                >
                  <div class="flex w-full justify-between items-center gap-2">
                    <div class="flex items-center gap-2">
                      <Show when={searchParams.offline}>
                        <RiDeviceWifiOffFill class="w-5 h-5" />
                        <div class="text-text1">Offline</div>
                      </Show>
                      <Show when={!searchParams.offline}>
                        <RiDeviceWifiFill class="w-5 h-5" />
                        <div class="text-text1">Online</div>
                      </Show>
                    </div>
                    <DropdownMenu.ItemIndicator class="w-4 h-4">
                      <FaSolidCheck />
                    </DropdownMenu.ItemIndicator>
                  </div>
                </DropdownMenu.CheckboxItem>
                <DropdownMenu.Sub overlap gutter={4} shift={-8}>
                  <DropdownMenu.SubTrigger class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none">
                    <div class="flex w-full justify-between items-center gap-2">
                      <div class="flex items-center gap-2">
                        <FaSolidBrush class="h-4 w-4" />
                        <div class="text-text1">Theme</div>
                      </div>
                      <div class="ml-auto">
                        <FaSolidChevronRight class="w-4 h-4" />
                      </div>
                    </div>
                  </DropdownMenu.SubTrigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent class="bg-bg1 border border-bg2 shadow p-2 rounded-md z-[999999] animate-in fade-in slide-in-from-right-10 zoom-in-50 duration-300 ">
                      <For each={THEME_OPTIONS}>
                        {(theme) => (
                          <DropdownMenu.Item
                            onTouchStart={() => {
                              setAppState("touchInProgress", true);
                            }}
                            onSelect={() => {
                              setPreferences("theme", theme.value);
                              setThemeCookie(theme.value);
                            }}
                            class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
                          >
                            <div class="flex items-center gap-2">
                              <div
                                class={`${theme.value} rounded bg-bg1 w-10 h-6 p-[2px] flex flex-col gap-[2px] ring-1 ring-bg3`}
                              >
                                <div class="w-full h-[2px] rounded-full bg-text1" />
                                <div class="w-3/4 h-[2px] rounded-full bg-text2" />
                                <div class="flex gap-[2px]">
                                  <div class="w-1/3 h-[2px] rounded-full bg-primary" />
                                  <div class="w-1/3 h-[2px] rounded-full bg-accent1" />
                                </div>
                                <div class="w-full h-[2px] rounded-full bg-bg2" />
                                <div class="w-full h-[2px] rounded-full bg-bg3" />
                              </div>
                              <Show when={preferences.theme === theme.value}>
                                <FaSolidCheck class="absolute left-1 top-[12px]" />
                              </Show>
                              <div class="text-text1">{theme.label}</div>
                            </div>
                          </DropdownMenu.Item>
                        )}
                      </For>
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>
                <DropdownMenu.Sub overlap gutter={4} shift={-8}>
                  <DropdownMenu.SubTrigger class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none">
                    <div class="flex w-full justify-between items-center gap-2">
                      <div class="flex items-center gap-2">
                        <FaSolidGlobe class="h-4 w-4" />
                        <div class="text-text1">Instance</div>
                      </div>
                      <div class="ml-auto">
                        <FaSolidChevronRight class="w-4 h-4" />
                      </div>
                    </div>
                  </DropdownMenu.SubTrigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent class="bg-bg1 max-h-[55vh] overflow-y-auto scrollbar border border-bg2 shadow p-2 rounded-md z-[999999] animate-in fade-in slide-in-from-right-10 zoom-in-50 duration-300 ">
                      <For each={instances() as PipedInstance[]}>
                        {(instance) => (
                          <DropdownMenu.Item
                            onTouchStart={() => {
                              setAppState("touchInProgress", true);
                            }}
                            onSelect={() => {
                              if (instance) {
                                appState.player.instance?.pause();
                                setPreferences("instance", instance);
                              }
                            }}
                            class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
                          >
                            <div class="flex items-center gap-2">
                              <Show
                                when={
                                  preferences.instance.api_url ===
                                  instance.api_url
                                }
                              >
                                <FaSolidCheck class="absolute left-1 top-[12px]" />
                              </Show>
                              <div class="flex flex-col gap-1">
                                <div class="text-text1">{instance.name}</div>
                                <div class="flex text-xs gap-1">
                                  <Show when={instance.cdn}>
                                    <BiRegularNetworkChart class="w-4 h-4 text-primary" />
                                  </Show>
                                  <div>
                                    24h:{" "}
                                    <span class="font-bold">
                                      {instance.uptime_24h.toFixed()}%
                                    </span>
                                  </div>
                                  {instance.locations}
                                </div>
                              </div>
                            </div>
                          </DropdownMenu.Item>
                        )}
                      </For>
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
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
                window.location.reload();
              }}
              label="Join"
            />
          </div>
        </div>
      </Modal>
    </nav>
  );
}
