import { createEffect, createSignal, For, Show } from "solid-js";
import { useSyncStore } from "~/stores/syncStore";
import Button from "./Button";
import Modal from "./Modal";
import { exportConduitData, ExportOptions } from "~/utils/import-helpers";
import Toggle from "./Toggle";
import { usePreferences } from "~/stores/preferencesStore";

export default function ExportDataModal(props: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [exportItems, setExportItems] = createSignal<ExportOptions>({
    history: true,
    preferences: false,
    playlists: false,
    watchLater: false,
    subscriptions: false,
  });
  const [selectAll, setSelectAll] = createSignal(false);

  const sync = useSyncStore();

  const [preferences] = usePreferences();

  return (
    <Modal
      title="Export Conduit Data"
      isOpen={props.isOpen}
      setIsOpen={props.setIsOpen}
    >
      <div class="px-10 py-3 flex flex-col gap-2">
        <div class="flex gap-2 items-center mb-4">
          <Toggle
            label="Select all"
            checked={selectAll()}
            onChange={(checked) => {
              setExportItems({
                history: checked,
                preferences: checked,
                playlists: checked,
                watchLater: checked,
                subscriptions: checked,
              });
              setSelectAll(checked);
            }}
          />
          <div>Select all</div>
        </div>
        <For each={Object.entries(exportItems())}>
          {([item, enabled]) => (
            <div class="flex gap-2 items-center">
              <Toggle
                label={item.split("")[0].toUpperCase() + item.slice(1)}
                checked={enabled}
                onChange={(checked) =>
                  setExportItems((prev) => ({ ...prev, [item]: checked }))
                }
              />
              <div>{item.split("")[0].toUpperCase() + item.slice(1)}</div>
            </div>
          )}
        </For>
        <Button
          class="mt-4"
          label="Export"
          onClick={() => {
            exportConduitData(exportItems(), sync.store, preferences);
          }}
        />
      </div>
    </Modal>
  );
}
