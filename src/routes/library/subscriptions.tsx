import { createQuery } from "@tanstack/solid-query";
import { For, Show, Suspense } from "solid-js";
import Button from "~/components/Button";
import Link from "~/components/Link";
import { toast } from "~/components/Toast";
import ChannelCard from "~/components/content/channel/ChannelCard";
import { usePreferences } from "~/stores/preferencesStore";
import { useSyncStore } from "~/stores/syncStore";
import { RelatedStream } from "~/types";

export default function Subscriptions() {
  const sync = useSyncStore();
  const [preferences] = usePreferences();
  const query = createQuery<RelatedStream[]>(() => ({
    queryKey: ["feed", preferences.instance.api_url, sync.store.subscriptions],
    queryFn: async (): Promise<RelatedStream[]> => {
      const res = await fetch(
        preferences.instance.api_url + "/feed/unauthenticated",
        {
          method: "POST",
          body: JSON.stringify(Object.keys(sync.store.subscriptions)),
        }
      );
      if (!res.ok) {
        throw new Error("Error fetching feed");
      }
      return res.json() as Promise<RelatedStream[]>;
    },
    enabled:
      preferences.instance?.api_url &&
      Object.keys(sync.store.subscriptions).length > 0
        ? true
        : false,
  }));

  return (
    <div class="flex flex-col">
      <div class="flex flex-row items-center justify-between">
        <h1 class="text-2xl font-bold">Subscriptions</h1>
      </div>
      <div class="flex flex-col gap-2 justify-center w-full mx-auto max-w-4xl">
        <Suspense
          fallback={
            <For each={Object.entries(sync.store.subscriptions)}>
              {([key, value]) => {
                return (
                  <div class="flex flex-row items-center justify-between odd:bg-bg2 p-2 rounded-lg w-full">
                    <div class="flex flex-row items-center">
                      <Link href={`/channel/${key}`} class="text-base link">
                        {value.name ?? key}
                      </Link>
                    </div>
                    <Button
                      label="Unsubscribe"
                      class="ml-2"
                      onClick={() => {
                        try {
                          sync.setStore("subscriptions", key, undefined!);
                          toast.success(
                            `Unsubscribed from ${value.name ?? key}`
                          );
                        } catch (e) {
                          toast.error(
                            `Could not unsubscribe from ${value.name ?? key}`
                          );
                        }
                      }}
                    />
                  </div>
                );
              }}
            </For>
          }
        >
          <For
            each={query.data?.filter(
              (value, index, self) =>
                index ===
                self.findIndex((t) => t.uploaderUrl === value.uploaderUrl)
            )}
          >
            {(item) => (
              <ChannelCard
                item={{
                  name: item.uploaderName,
                  url: item.uploaderUrl,
                  thumbnail: item.uploaderAvatar!,
                  type: "channel",
                  verified: item.uploaderVerified,
                  videos: undefined!,
                  description: "",
                  subscribers: undefined!,
                }}
              />
            )}
          </For>
        </Suspense>
      </div>
    </div>
  );
}
