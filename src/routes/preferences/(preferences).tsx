import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { AiOutlineFire, AiOutlineStop } from "solid-icons/ai";
import { BiRegularRotateLeft } from "solid-icons/bi";
import {
  BsLayoutSidebarInsetReverse,
  BsPlay,
  BsUniversalAccess,
  BsUniversalAccessCircle,
} from "solid-icons/bs";
import {
  FaSolidBan,
  FaSolidBrush,
  FaSolidClapperboard,
  FaSolidClock,
  FaSolidClockRotateLeft,
  FaSolidClosedCaptioning,
  FaSolidComments,
  FaSolidDownload,
  FaSolidFilm,
  FaSolidGlobe,
  FaSolidHouse,
  FaSolidLanguage,
  FaSolidList,
  FaSolidMagnifyingGlass,
  FaSolidPalette,
  FaSolidPencil,
  FaSolidPlay,
  FaSolidPlus,
  FaSolidRss,
  FaSolidTrash,
  FaSolidTrashCan,
  FaSolidUpload,
  FaSolidX,
} from "solid-icons/fa";
import {
  TbAdjustmentsCog,
  TbCloudCog,
  TbFilterCog,
  TbPhotoCog,
} from "solid-icons/tb";
import { TiCog } from "solid-icons/ti";
import { Show } from "solid-js";
import { For, createSignal } from "solid-js";
import { createEffect, useContext } from "solid-js";
import Button from "~/components/Button";
import Collapsible from "~/components/Collapsible";
import Combobox from "~/components/Combobox";
import ExportDataModal from "~/components/ExportDataModal";
import Field from "~/components/Field";
import ImportDataModal from "~/components/ImportDataModal";
import ImportHistoryModal from "~/components/ImportHistoryModal";
import PreferencesCard from "~/components/PreferencesCard";
import Select from "~/components/Select";
import Toggle from "~/components/Toggle";
import InstancePreferences from "~/components/preferences/InstancePreferences";
import {
  LANGUAGES,
  THEME_OPTIONS,
  TRENDING_REGIONS,
  VIDEO_RESOLUTIONS,
} from "~/config/constants";
import { usePreferences } from "~/stores/preferencesStore";
import { useSyncStore } from "~/stores/syncStore";
import { useCookie } from "~/utils/hooks";

export default function Preferences() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = usePreferences();
  const [, setThemeCookie] = useCookie("theme", "monokai");
  function capitalize(str: string) {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
  }
  const [exportDataModalOpen, setExportDataModalOpen] = createSignal(false);
  const [importDataModalOpen, setImportDataModalOpen] = createSignal(false);
  const sync = useSyncStore();

  function recursiveDelete(obj: any, path: string[] = []) {
    for (let key in obj) {
      const newPath = [...path, key];
      console.log("delete", newPath);
      if (typeof obj[key] === "object" && obj[key] !== null) {
        recursiveDelete(obj[key], newPath);
      }
      sync.setStore(...newPath, undefined);
    }
  }
  const [, setDefaultHomePageCookie] = useCookie("defaultHomePage", "Trending");
  return (
    <>
      <Title>Preferences</Title>
      <div class="flex flex-col max-w-2xl mx-auto gap-2 p-4">
        <Collapsible
          trigger={
            <PreferencesCard
              title="User Interface"
              description="Customize the look and feel of Conduit"
              icon={<FaSolidPalette class="w-5 h-5" />}
            />
          }
        >
          <div class="ml-10">
            <div class="flex justify-between items-center">
              <PreferencesCard
                icon={<FaSolidBrush class="w-5 h-5" />}
                title="Theme"
              />
              <Select
                options={THEME_OPTIONS}
                onChange={(value) => {
                  setPreferences("theme", value.value);
                  setThemeCookie(value.value);
                }}
                value={{
                  value: preferences.theme,
                  label: capitalize(preferences.theme),
                  disabled: false,
                }}
              />
            </div>
          </div>
        </Collapsible>
        <Collapsible
          trigger={
            <PreferencesCard
              title="Instance"
              description="Add/Remove custom instances"
              icon={<FaSolidGlobe class="w-5 h-5" />}
            />
          }
        >
          <InstancePreferences />
        </Collapsible>
        <Collapsible
          trigger={
            <PreferencesCard
              title="Sync"
              description="Sync your data across devices"
              icon={<TbCloudCog class="w-6 h-6" />}
            />
          }
        >
          <div class="ml-10">
            <div class="flex justify-between items-center">
              <PreferencesCard
                icon={<TbCloudCog class="w-6 h-6" />}
                title="Enabled"
              />
              <Toggle
                label="Sync Enabled"
                checked={preferences.sync.enabled}
                onChange={(v) => {
                  setPreferences("sync", "enabled", v);
                }}
              />
            </div>
          </div>
        </Collapsible>
        <Collapsible
          trigger={
            <PreferencesCard
              title="Content"
              description="Customize the type of content you see"
              icon={<TbFilterCog class="w-6 h-6" />}
            />
          }
        >
          <div class="ml-10">
            <div class="flex justify-between items-center">
              <PreferencesCard
                icon={<FaSolidClapperboard class="w-5 h-5" />}
                title="Display Shorts"
              />
              <Toggle
                label="Display Shorts"
                checked={preferences.content.displayShorts}
                onChange={(v) => setPreferences("content", "displayShorts", v)}
              />
            </div>
            <div class="flex justify-between items-center">
              <PreferencesCard
                icon={<FaSolidHouse class="w-5 h-5" />}
                title="Default Home Page"
              />
              <Select
                options={["Feed", "Trending"].map((page) => ({
                  value: page,
                  label: page,
                }))}
                onChange={(value) => {
                  setPreferences(
                    "content",
                    "defaultHomePage",
                    value.value as "Feed" | "Trending"
                  );
                  setDefaultHomePageCookie(value.value);
                }}
                value={{
                  value: preferences.content.defaultHomePage,
                  label: preferences.content.defaultHomePage,
                }}
              />
            </div>
            <div class="flex justify-between items-center">
              <PreferencesCard
                icon={<AiOutlineFire class="w-6 h-6" />}
                title="Trending Region"
              />
              <Select
                options={TRENDING_REGIONS.map((region) => ({
                  value: region.value,
                  label: region.flag + region.label,
                }))}
                onChange={(value) => {
                  setPreferences("content", "trendingRegion", value.value);
                  setDefaultHomePageCookie(value.value);
                }}
                value={{
                  value: preferences.content.trendingRegion,
                  label:
                    TRENDING_REGIONS.find(
                      (r) => r.value === preferences.content.trendingRegion
                    )?.label ?? "",
                }}
              />
            </div>
            <div class="flex justify-between items-center">
              <PreferencesCard
                icon={<BsLayoutSidebarInsetReverse class="w-6 h-6" />}
                title="Hide related videos"
              />
              <Toggle
                label="Hide related videos"
                checked={preferences.content.hideRelated}
                onChange={(v) => {
                  setPreferences("content", "hideRelated", v);
                }}
              />
            </div>
            <div class="flex justify-between items-center">
              <PreferencesCard
                icon={<FaSolidComments class="w-6 h-6" />}
                title="Hide comments"
              />
              <Toggle
                label="Hide comments"
                checked={preferences.content.hideComments}
                onChange={(v) => {
                  setPreferences("content", "hideComments", v);
                }}
              />
            </div>
          </div>
        </Collapsible>
        <Collapsible
          trigger={
            <PreferencesCard
              title="History"
              description="Watch history, search history"
              icon={<FaSolidClockRotateLeft class="w-5 h-5" />}
            />
          }
        >
          <div class="ml-10">
            <div class="flex justify-between items-center">
              <PreferencesCard
                icon={<FaSolidClockRotateLeft class="w-5 h-5" />}
                title="Save watch history"
              />
              <Toggle
                label="Save watch history"
                checked={preferences.history.saveWatchHistory}
                onChange={(v) =>
                  setPreferences("history", "saveWatchHistory", v)
                }
              />
            </div>
          </div>
          <div class="ml-10">
            <div class="flex justify-between items-center">
              <PreferencesCard
                icon={<FaSolidMagnifyingGlass class="w-5 h-5" />}
                title="Save search history"
              />
              <Toggle
                label="Save search history"
                checked={preferences.history.saveSearchHistory}
                onChange={(v) =>
                  setPreferences("history", "saveSearchHistory", v)
                }
              />
            </div>
          </div>
          <div class="ml-10">
            <div class="flex justify-between items-center">
              <PreferencesCard
                icon={<FaSolidMagnifyingGlass class="w-5 h-5" />}
                title="Max search history"
                description="'-1' for no limit."
              />
              <Field
                class="w-10"
                type="number"
                min={-1}
                max={30000}
                value={preferences.history.maxSearchHistory?.toString()}
                onInput={(v) => {
                  setPreferences("history", "maxSearchHistory", parseInt(v));
                }}
              />
            </div>
          </div>
        </Collapsible>
        <Collapsible
          trigger={
            <PreferencesCard
              title="Playback"
              description="Adjustments for video and audio playback, and autoplay features."
              icon={<FaSolidPlay class="w-6 h-6" />}
            />
          }
        >
          <div class="ml-10">
            <div class="flex justify-between items-center">
              <PreferencesCard
                icon={<FaSolidPlay class="w-6 h-6" />}
                title="Autoplay videos"
              />
              <Toggle
                label="Autoplay videos"
                checked={preferences.playback.autoplay}
                onChange={(v) => setPreferences("playback", "autoplay", v)}
              />
            </div>
          </div>
          <div class="ml-10">
            <div class="flex justify-between items-center">
              <PreferencesCard
                icon={<FaSolidPlay class="w-6 h-6" />}
                title="Autoplay muted when autoplay fails"
                description="Browsers don't allow websites to play audio without user interaction. Enable this to start videos without sound when autoplay fails."
              />
              <Toggle
                disabled={!preferences.playback.autoplay}
                label="Autoplay muted when autoplay fails"
                checked={preferences.playback.autoplayMuted}
                onChange={(v) => setPreferences("playback", "autoplayMuted", v)}
              />
            </div>
          </div>
          <div class="ml-10">
            <div class="flex justify-between items-center">
              <PreferencesCard
                icon={<FaSolidFilm class="w-5 h-5" />}
                title="Preferred Video Quality"
              />
              <Select
                options={VIDEO_RESOLUTIONS.map((resolution) => ({
                  value: resolution,
                  label: resolution,
                }))}
                onChange={(value) => {
                  setPreferences("playback", "preferedQuality", value.value);
                }}
                value={
                  preferences.playback.preferedQuality
                    ? {
                        value: preferences.playback.preferedQuality,
                        label: preferences.playback.preferedQuality as string,
                      }
                    : {
                        value: "Auto",
                        label: "Auto",
                      }
                }
              />
            </div>
          </div>
          <div class="ml-10">
            <div class="flex justify-between items-center">
              <PreferencesCard
                icon={<FaSolidClosedCaptioning class="w-5 h-5" />}
                title="Enable captions by default"
              />
              <Toggle
                label="Enable captions by default"
                checked={preferences.playback.defaultCaptionsEnabled}
                onChange={(v) =>
                  setPreferences("playback", "defaultCaptionsEnabled", v)
                }
              />
            </div>
          </div>
          <div class="ml-10">
            <div class="flex justify-between items-center">
              <PreferencesCard
                icon={<FaSolidLanguage class="w-5 h-5" />}
                title="Default captions language"
              />
              <Select
                options={LANGUAGES}
                onChange={(value) => {
                  setPreferences(
                    "playback",
                    "defaultCaptionsLanguage",
                    value.value
                  );
                }}
                value={{
                  value: preferences.playback.defaultCaptionsLanguage as string,
                  label:
                    LANGUAGES.find(
                      (v) =>
                        v.value === preferences.playback.defaultCaptionsLanguage
                    )?.label ?? "English",
                }}
              />
            </div>
          </div>
          <div class="ml-10">
            <div class="flex justify-between items-center">
              <PreferencesCard
                icon={<FaSolidLanguage class="w-5 h-5" />}
                title="Fallback captions language"
                description="Fall back to another language in case preferred one is not available."
              />
              <Select
                options={LANGUAGES}
                onChange={(value) => {
                  setPreferences(
                    "playback",
                    "secondaryCaptionsLanguage",
                    value.value
                  );
                }}
                defaultValue="Select"
                value={{
                  value: preferences.playback
                    .secondaryCaptionsLanguage as string,
                  label:
                    LANGUAGES.find(
                      (v) =>
                        v.value ===
                        preferences.playback.secondaryCaptionsLanguage
                    )?.label ?? "English",
                }}
              />
            </div>
          </div>
        </Collapsible>
        <Collapsible
          trigger={
            <PreferencesCard
              title="Backup and restore"
              icon={<BiRegularRotateLeft class="w-7 h-7" />}
            />
          }
        >
          <button
            onClick={() => {
              setImportDataModalOpen(true);
            }}
            class="w-full pl-10 outline-none focus-visible:ring-4 focus-visible:ring-primary rounded hover:bg-bg2"
          >
            <PreferencesCard
              title="Import data"
              icon={<FaSolidUpload class="w-5 h-5" />}
            />
          </button>
          <button
            onClick={() => {
              setExportDataModalOpen(true);
            }}
            class="w-full pl-10 outline-none focus-visible:ring-4 focus-visible:ring-primary rounded hover:bg-bg2"
          >
            <PreferencesCard
              title="Export Conduit data"
              icon={<FaSolidDownload class="w-5 h-5" />}
            />
          </button>
          <button
            onClick={() => {
              // recursiveDelete(sync.store);
            }}
            class="w-full pl-10 outline-none focus-visible:ring-4 focus-visible:ring-primary rounded hover:bg-bg2"
          >
            <PreferencesCard
              title="Delete Conduit data"
              icon={<FaSolidTrashCan class="w-5 h-5" />}
            />
          </button>
        </Collapsible>
        <ExportDataModal
          isOpen={exportDataModalOpen()}
          setIsOpen={setExportDataModalOpen}
        />
        <ImportDataModal
          isOpen={importDataModalOpen()}
          setIsOpen={setImportDataModalOpen}
        />
        <Collapsible
          trigger={
            <PreferencesCard
              title="DeArrow"
              icon={<DeArrowIcon class="w-6 h-6" />}
            />
          }
        >
          <div class="ml-10 flex justify-between items-center">
            <PreferencesCard
              icon={<DeArrowIcon class="w-6 h-6" />}
              title="Enable DeArrow"
            />
            <Toggle
              label="Enable DeArrow"
              checked={preferences.dearrow}
              onChange={(v) => setPreferences("dearrow", v)}
            />
          </div>
        </Collapsible>
      </div>
    </>
  );
}

const DeArrowIcon = (props: { class?: string }) => (
  <svg
    width="800px"
    height="800px"
    viewBox="0 0 36 36"
    aria-hidden="true"
    role="img"
    class={props.class}
    preserveAspectRatio="xMidYMid meet"
    version="1.1"
    id="svg10"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs id="defs14" />

    <path
      fill="currentColor"
      d="M36 18.302c0 4.981-2.46 9.198-5.655 12.462s-7.323 5.152-12.199 5.152s-9.764-1.112-12.959-4.376S0 23.283 0 18.302s2.574-9.38 5.769-12.644S13.271 0 18.146 0s9.394 2.178 12.589 5.442C33.931 8.706 36 13.322 36 18.302z"
      id="path2"
    />
    <path
      fill="#fff"
      fill-opacity={0.7}
      d="m 30.394282,18.410186 c 0,3.468849 -1.143025,6.865475 -3.416513,9.137917 -2.273489,2.272442 -5.670115,2.92874 -9.137918,2.92874 -3.467803,0 -6.373515,-1.147212 -8.6470033,-3.419654 -2.2734888,-2.272442 -3.5871299,-5.178154 -3.5871299,-8.647003 0,-3.46885 0.9420533,-6.746149 3.2144954,-9.0196379 2.2724418,-2.2734888 5.5507878,-3.9513905 9.0196378,-3.9513905 3.46885,0 6.492841,1.9322561 8.76633,4.204698 2.273489,2.2724424 3.788101,5.2974804 3.788101,8.7663304 z"
      id="path4"
    />
    <path
      fill="#000"
      fill-opacity={0.4}
      d="m 23.95823,17.818306 c 0,3.153748 -2.644888,5.808102 -5.798635,5.808102 -3.153748,0 -5.599825,-2.654354 -5.599825,-5.808102 0,-3.153747 2.446077,-5.721714 5.599825,-5.721714 3.153747,0 5.798635,2.567967 5.798635,5.721714 z"
      id="path8"
    />
  </svg>
);
