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
    { href: "/import", label: "Import" },
  ];

  const query = createQuery(() => ({
    queryKey: ["instances"],
    queryFn: async (): Promise<PipedInstance[]> => {
      const res = await fetch("https://piped-instances.kavin.rocks/");
      if (!res.ok) {
        throw new Error("Failed to fetch instances");
      }
      return await res.json();
    },
    initialData: getStorageValue("instances", [], "json", "localStorage"),
    select: (data) => {
      setStorageValue("instances", data, "localStorage");
      return data as PipedInstance[];
    },
    retry: (failureCount) => failureCount < 3,
  }));

  const [preferences, setPreferences] = usePreferences();

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
  const navigate = useNavigate();
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

  const cycleInstances = () => {
    if (!query.data) return;
    const instances = query.data;
    let currentInstanceIndex = instances.findIndex(
      (instance) => instance.api_url === preferences.instance.api_url
    );
    currentInstanceIndex = currentInstanceIndex > -1 ? currentInstanceIndex : 0;
    const nextInstanceIndex = (currentInstanceIndex + 1) % instances.length;
    setPreferences("instance", instances[nextInstanceIndex]);
    toast.show(`You are now connected to ${instances[nextInstanceIndex].name}`)
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
    <nav class="fixed top-0 left-0 bg-bg2 w-full z-[99999] h-10 px-2 flex items-center justify-between">
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
        <A href="/" class="text-text1 mx-2 w-8 h-8">
          <img
            src="/logo.svg"
            alt="Conduit"
            class="h-8 w-8 aspect-square min-w-max "
          />

          {/* <svg
            version="1.1"
            class="w-8 h-8 bg-[#] mx-2 rounded group"
            width="495.2276"
            height="431.28802"
            viewBox="0 0 495.2276 431.28802"
          >
            <g transform="translate(-315.77252,-176.71199)">
              <path
                class="fill-[#22173c] transform scale-110  "
                d="m 688.41349,605.75 2.52502,-2.25 c 37.09455,-64.69595 74.23932,-129.36299 111.43645,-194 l 4.30509,-7.5 4.30508,-7.5 0.007,-2.39534 0.008,-2.39534 C 774.74353,327.32955 738.53474,264.92214 702.35111,202.5 l -6.86172,-11.81445 -6.86172,-11.81445 -2.01717,-1.07956 -2.01718,-1.07955 -122.39278,0.51791 -122.39279,0.51791 -1.7895,1.87609 c -41.41243,69.44706 -81.10908,140.39611 -121.35294,210.67608 l -0.4464,2.33521 -0.4464,2.3352 C 352.16487,456.1201 387.49127,517.93992 423.18879,579.5 l 7.57161,13 7.5716,13 1.584,1.2182 1.584,1.21819 122.19424,0.0318 L 685.88847,608 Z m -211.71855,-80 C 447.9108,476.64145 493.46357,554.06435 401,395.16921 v -2.04922 -2.04922 c 27.03211,-46.73006 53.56123,-93.52398 81.25449,-139.86188 54.63145,-0.0644 109.26228,0.12059 163.89332,0.29111 27.05017,46.47208 53.91304,93.05277 80.85219,139.58921 v 1.97293 1.97292 C 700.9008,440.52101 674.70897,485.95383 648.71489,531.5 l -1.51243,1.75 -1.51244,1.75 h -81.78667 -81.78668 z"
              />
              <path
                class="fill-[#ff0063] "
                d="m 688.41349,605.75 2.52502,-2.25 c 37.09455,-64.69595 74.23932,-129.36299 111.43645,-194 l 4.30509,-7.5 4.30508,-7.5 0.007,-2.39534 0.008,-2.39534 C 774.74353,327.32955 738.53474,264.92214 702.35111,202.5 l -6.86172,-11.81445 -6.86172,-11.81445 -2.01717,-1.07956 -2.01718,-1.07955 -122.39278,0.51791 -122.39279,0.51791 -1.7895,1.87609 c -41.41243,69.44706 -81.10908,140.39611 -121.35294,210.67608 l -0.4464,2.33521 -0.4464,2.3352 C 352.16487,456.1201 387.49127,517.93992 423.18879,579.5 l 7.57161,13 7.5716,13 1.584,1.2182 1.584,1.21819 122.19424,0.0318 L 685.88847,608 Z m -211.71855,-80 C 447.9108,476.64145 493.46357,554.06435 401,395.16921 v -2.04922 -2.04922 c 27.03211,-46.73006 53.56123,-93.52398 81.25449,-139.86188 54.63145,-0.0644 109.26228,0.12059 163.89332,0.29111 27.05017,46.47208 53.91304,93.05277 80.85219,139.58921 v 1.97293 1.97292 C 700.9008,440.52101 674.70897,485.95383 648.71489,531.5 l -1.51243,1.75 -1.51244,1.75 h -81.78667 -81.78668 z"
              />
              <path
                class="fill-blue-500 origin-top-left group-hover:translate-x-2  transition duration-200"
                d="m 337.84352,394.22375 c -0.0507,-6.31721 111.3159,-196.18701 112.73798,-198.86242 4.34105,0.12819 218.62131,-0.28665 225.18343,0.54575 1.21351,0.15393 -6.46797,12.55689 -13.89423,24.28072 l -196.33086,0.014 c -25.98603,40.347 -100.73081,171.06773 -99.70155,173.77489 1.39853,3.67842 91.33703,162.56852 100.58042,172.3178 8.90944,-0.0703 180.92694,-0.11598 194.65948,-0.32694 4.96864,7.87214 9.3747,15.95007 14.71988,24.60012 -75.16964,0.36633 -150.36645,0.1465 -225.54528,0.1465 C 346.98314,413.80988 337.89314,400.40881 337.84352,394.22375 Z"
              />
              <path
                class="fill-accent2 origin-top-left group-hover:translate-x-8  transition duration-200"
                d="m 337.84352,394.22375 c -0.0507,-6.31721 111.3159,-196.18701 112.73798,-198.86242 4.34105,0.12819 218.62131,-0.28665 225.18343,0.54575 1.21351,0.15393 -6.46797,12.55689 -13.89423,24.28072 l -196.33086,0.014 c -25.98603,40.347 -100.73081,171.06773 -99.70155,173.77489 1.39853,3.67842 91.33703,162.56852 100.58042,172.3178 8.90944,-0.0703 180.92694,-0.11598 194.65948,-0.32694 4.96864,7.87214 9.3747,15.95007 14.71988,24.60012 -75.16964,0.36633 -150.36645,0.1465 -225.54528,0.1465 C 346.98314,413.80988 337.89314,400.40881 337.84352,394.22375 Z"
              />
              <path
                class="fill-[#ffca64] origin-top-left group-hover:translate-x-16  transition duration-200"
                d="m 337.84352,394.22375 c -0.0507,-6.31721 111.3159,-196.18701 112.73798,-198.86242 4.34105,0.12819 218.62131,-0.28665 225.18343,0.54575 1.21351,0.15393 -6.46797,12.55689 -13.89423,24.28072 l -196.33086,0.014 c -25.98603,40.347 -100.73081,171.06773 -99.70155,173.77489 1.39853,3.67842 91.33703,162.56852 100.58042,172.3178 8.90944,-0.0703 180.92694,-0.11598 194.65948,-0.32694 4.96864,7.87214 9.3747,15.95007 14.71988,24.60012 -75.16964,0.36633 -150.36645,0.1465 -225.54528,0.1465 C 346.98314,413.80988 337.89314,400.40881 337.84352,394.22375 Z"
              />
            </g>
          </svg> */}
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
              <KobaltePopover.Content class="bg-bg1 border border-bg3/80 p-2 rounded-md
                animate-in
                fade-in
                slide-in-from-top-10
                duration-200
                z-[99999]
                ">
                <KobaltePopover.Arrow />
                <KobaltePopover.Description
                  class={`text-sm p-1 text-left flex flex-col gap-2 items-center ${roomId() ? "text-green-600" : "text-red-600"
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
                              Name: {user.name} {user.name === name() && "(You)"}
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
            options={[
              { value: "monokai", label: "Monokai" },
              { value: "dracula", label: "Dracula" },
              { value: "discord", label: "Discord" },
              { value: "github", label: "Github" },
            ]}
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
};

