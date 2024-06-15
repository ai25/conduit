import { useNavigate } from "@solidjs/router";
import { BiRegularRotateLeft } from "solid-icons/bi";
import {
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
  FaSolidDownload,
  FaSolidFilm,
  FaSolidGlobe,
  FaSolidLanguage,
  FaSolidList,
  FaSolidMagnifyingGlass,
  FaSolidPalette,
  FaSolidPencil,
  FaSolidPlay,
  FaSolidPlus,
  FaSolidRss,
  FaSolidTrash,
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
import { ThemeContext } from "~/app";
import Button from "~/components/Button";
import Collapsible from "~/components/Collapsible";
import Field from "~/components/Field";
import ImportHistoryModal from "~/components/ImportHistoryModal";
import PreferencesCard from "~/components/PreferencesCard";
import Select from "~/components/Select";
import Toggle from "~/components/Toggle";
import InstancePreferences from "~/components/preferences/InstancePreferences";
import {
  LANGUAGES,
  THEME_OPTIONS,
  VIDEO_RESOLUTIONS,
} from "~/config/constants";
import { usePreferences } from "~/stores/preferencesStore";
import { useCookie } from "~/utils/hooks";

export default function Preferences() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = usePreferences();
  const [theme, setTheme] = useContext(ThemeContext);
  const [, setThemeCookie] = useCookie("theme", "monokai");
  function capitalize(str: string) {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
  }
  return (
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
                setTheme(value.value);
                setThemeCookie(value.value);
              }}
              value={{
                value: theme(),
                label: capitalize(theme()),
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
              onChange={(v) => setPreferences("history", "saveWatchHistory", v)}
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
                value: preferences.playback.secondaryCaptionsLanguage as string,
                label:
                  LANGUAGES.find(
                    (v) =>
                      v.value === preferences.playback.secondaryCaptionsLanguage
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
        <button class="w-full ml-10 outline-none focus-visible:ring-4 focus-visible:ring-primary rounded hover:bg-bg2">
          <PreferencesCard
            title="Export Conduit data"
            icon={<FaSolidDownload class="w-5 h-5" />}
          />
        </button>
      </Collapsible>
    </div>
  );
}
