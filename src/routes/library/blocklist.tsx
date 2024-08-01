import { Title } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { For, Show, Suspense } from "solid-js";
import Button from "~/components/Button";
import EmptyState from "~/components/EmptyState";
import Link from "~/components/Link";
import { toast } from "~/components/Toast";
import ChannelCard from "~/components/content/channel/ChannelCard";
import { usePreferences } from "~/stores/preferencesStore";
import { useSyncStore } from "~/stores/syncStore";
import { RelatedStream } from "~/types";

export default function Blocklist() {
  const sync = useSyncStore();
  const [preferences] = usePreferences();

  const isEmpty = () => Object.keys(sync.store.blocklist).length === 0;
  const [searchParams] = useSearchParams()
  const query = createQuery<RelatedStream[]>(() => ({
    queryKey: ["blocklist", preferences.instance.api_url, sync.store.blocklist],
    queryFn: async (): Promise<RelatedStream[]> => {
      const res = await fetch(
        preferences.instance.api_url + "/feed/unauthenticated",
        {
          method: "POST",
          body: JSON.stringify(Object.keys(sync.store.blocklist)),
        }
      );
      if (!res.ok) {
        throw new Error("Error fetching feed");
      }
      return res.json() as Promise<RelatedStream[]>;
    },
    enabled: preferences.instance?.api_url && !isEmpty() && !searchParams.offline ? true : false,
  }));

  return (
    <>
      <Title>Blocklist</Title>
      <div class="max-w-4xl mx-auto my-6">
        <div class="flex flex-col gap-2 justify-center w-full">
          <Show
            when={query.data}
            fallback={
              <For each={Object.entries(sync.store.blocklist)}>
                {([key, value]) => {
                  return (
                    <ChannelCard
                      layout="list"
                      item={{
                        name: value.name ?? key,
                        url: `/channel/${key}`,
                        thumbnail: "",
                        type: "channel",
                        verified: false,
                        videos: 0,
                        description: "",
                        subscribers: undefined!,
                      }}
                    />
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
                  layout="list"
                  item={{
                    name: item.uploaderName,
                    url: item.uploaderUrl,
                    thumbnail: item.uploaderAvatar!,
                    type: "channel",
                    verified: item.uploaderVerified,
                    videos: undefined!,
                    description: item.shortDescription,
                    subscribers: undefined!,
                  }}
                />
              )}
            </For>
          </Show>
          <Show when={isEmpty()}>
            <EmptyState />
          </Show>
        </div>
      </div>
    </>
  );
}
