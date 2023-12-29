
import { For } from "solid-js";
import { A } from "solid-start";
import Button from "~/components/Button";
import { toast } from "~/components/Toast";
import { useSyncStore } from "~/stores/syncStore";

export default function Subscriptions() {

  const sync = useSyncStore();

  return (
    <div class="flex flex-col">
      <div class="flex flex-row items-center justify-between">
        <h1 class="text-2xl font-bold">Subscriptions</h1>
      </div>
      <div class="flex flex-col gap-2 justify-center w-full mx-auto max-w-4xl">
        <For each={Object.entries(sync.store.subscriptions)}>
          {([key, value]) => {
            return (
              <div class="flex flex-row items-center justify-between odd:bg-bg2 p-2 rounded-lg w-full">
                <div class="flex flex-row items-center">
                  <A
                    href={`/channel/${key}`}
                    class="text-base link">{value.name ?? key}</A>
                </div>
                <Button
                  label="Unsubscribe"
                  class="ml-2"
                  onClick={() => {
                    try {
                      sync.setStore("subscriptions", key, undefined!);
                      toast.success(`Unsubscribed from ${value.name ?? key}`);
                    } catch (e) {
                      toast.error(`Could not unsubscribe from ${value.name ?? key}`);
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
