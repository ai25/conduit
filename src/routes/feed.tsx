import { For, Show, createEffect, createSignal, useContext } from "solid-js";
import VideoCard from "~/components/VideoCard";
import { InstanceContext, Spinner } from "~/root";
import { RelatedStream } from "~/types";
import { getStorageValue } from "~/utils/storage";

export default function Subscriptions() {
  // const { data, refetch } = trpc.useQuery([
  //   "db.getSubscriptions",

  // ]);
  const [videos, setVideos] = createSignal<RelatedStream[] | null>(null);
  const [all, setAll] = createSignal<RelatedStream[] | null>(null);
  const [instance] = useContext(InstanceContext);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<Error | null>(null);
  // console.log(data, "subs");
  // const ids = data?.map((sub) => sub.channelId);
  // const ids1 = ids?.slice(0, 25);
  // const ids2 = ids?.slice(50, 100);
  // const ids3 = ids?.slice(100, 150);
  const [limit, setLimit] = createSignal(100);
  createEffect(async () => {
    setIsLoading(true);
    const channels = getStorageValue(
      "localSubscriptions",
      [],
      "json",
      "localStorage"
    );
    const cache = await caches.open("conduit-v1");
    const cachedResponse = await cache.match(
      `${instance()}/feed/unauthenticated`
    );
    if (cachedResponse) {
      console.log("cached response");
      const stale = () => {
        const headers = cachedResponse.headers;
        const date = headers.get("date");
        const age = (Date.now() - new Date(date!).getTime()) / 1000;
        return age > 60;
      };
      if (!stale()) {
        console.log("cache is not stale");
        const data = await cachedResponse.json();
        setVideos(data);
        setIsLoading(false);
        return;
      }
      await cache.delete(`${instance()}/feed/unauthenticated`);
      console.log("cache is stale");
    }

    try {
      console.log("cache was stale, refetching");
      const res = await fetch(`${instance()}/feed/unauthenticated`, {
        method: "POST",
        body: JSON.stringify(channels),
      });
      const data = (await res.json()) as RelatedStream[] | Error;
      console.log(data, "subs");
      if (!(data as Error).message) {
        cache.put(
          `${instance()}/feed/unauthenticated`,
          new Response(JSON.stringify(data), {
            headers: {
              "Cache-Control": "max-age=60",
              "Content-Type": "application/json",
              date: new Date().toISOString(),
            },
          })
        );
        setVideos(data as RelatedStream[]);
      }
      setIsLoading(false);
    } catch (err) {
      console.log(err, "error");
      setIsLoading(false);
      setError(err as Error);
    }
  });

  //   if (isLoading()) {
  //     return (
  //       <div class="flex items-center justify-center w-full h-full">
  //         <Spinner />
  //       </div>
  //     );
  //   }
  return (
    <>
      {/* {isLoading&&<div class="fixed flex justify-center w-full text-5xl text-text"><ImSpinner2 class="animate-spin"/></div>} */}
      <div class="mx-2 flex flex-wrap justify-center">
        <Show when={videos()} keyed>
          {(video) => (
            <>
              <For each={videos()!.slice(0, limit())}>
                {(video) => <div class="md:w-72"><VideoCard v={video} /></div>}
              </For>
            </>
          )}
        </Show>
        <Show when={isLoading()} keyed>
          {
            <>
              {Array(44)
                .fill(0)
                .map((_, index) => {
                  return <VideoCard v={undefined} />;
                })}
            </>
          }
        </Show>
        <Show when={error()} keyed>
          {(error) => <>{error?.message}</>}
        </Show>
      </div>
      <div class="w-full flex items-center justify-center">
        <button class="btn" onClick={() => setLimit(limit() + 100)}>
          Load more
        </button>
      </div>
      <div class="h-20 "></div>
    </>
  );
}
