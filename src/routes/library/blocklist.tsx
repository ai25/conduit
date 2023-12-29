import { For } from "solid-js";
import { A } from "solid-start";
import Button from "~/components/Button";
import { toast } from "~/components/Toast";
import { useSyncStore } from "~/stores/syncStore";

export default function Blocklist() {

  const sync = useSyncStore();

  return (
    <div class="flex flex-col">
      <div class="flex flex-row items-center justify-between">
        <h1 class="text-2xl font-bold">Blocklist</h1>
      </div>
      <div class="flex flex-col gap-2 justify-center w-full mx-auto max-w-4xl">
        <For each={Object.entries(sync.store.blocklist)}>
          {([key, value]) => {
            return (
              <div class="flex flex-row items-center justify-between odd:bg-bg2 p-2 rounded-lg w-full">
                <div class="flex flex-row items-center">
                  <A
                    href={`/channel/${key}`}
                    class="text-base link">{value.name}</A>
                </div>
                <Button
                  label="Remove"
                  class="ml-2"
                  onClick={() => {
                    try {
                      sync.setStore("blocklist", key, undefined!);
                      toast.success(`Removed ${value.name} from blocklist`);
                    } catch (e) {
                      toast.error(`Error removing ${value.name} from blocklist`);
                    }}
                  }
                  />
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
}
