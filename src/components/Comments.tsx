import { createInfiniteQuery } from "@tanstack/solid-query";
import { createEffect, createSignal, Match, onCleanup, onMount, Show, Suspense, Switch } from "solid-js";
import { For } from "solid-js";
import { isServer } from "solid-js/web";
import useIntersectionObserver from "~/hooks/useIntersectionObserver";
import { usePreferences } from "~/stores/preferencesStore";
import { fetchJson, isMobile } from "~/utils/helpers";
import { Bottomsheet } from "./Bottomsheet";
import Comment, { PipedCommentResponse } from "./Comment";

export default function Comments(props: { videoId: string; uploader: string }) {
  const [preferences] = usePreferences();
  const fetchComments = async ({
    pageParam = "initial",
  }): Promise<PipedCommentResponse> => {
    if (pageParam === "initial") {
      return await (
        await fetch(`${preferences.instance.api_url}/comments/${props.videoId}`)
      ).json();
    } else {
      return await fetchJson(
        `${preferences.instance.api_url}/nextpage/comments/${props.videoId}`,
        {
          nextpage: pageParam,
        }
      );
    }
  };
  const [playerHeight, setPlayerHeight] = createSignal(0);
  createEffect(() => {
    const player = document.querySelector("media-player");
    if (player) {
      setPlayerHeight(player.clientHeight + 50);
    }
  });

  const query = createInfiniteQuery(() => ({
    queryKey: ["comments", props.videoId, preferences.instance.api_url],
    queryFn: fetchComments,
    enabled: (preferences.instance?.api_url && props.videoId) ? true : false,
    getNextPageParam: (lastPage) => {
      return lastPage.nextpage;
    },
    initialPageParam: "initial",
  })
  );
  const [commentsOpen, setCommentsOpen] = createSignal(false);
  const [intersectionRef, setIntersectionRef] = createSignal<
    HTMLDivElement | undefined
  >(undefined);

  const isIntersecting = useIntersectionObserver({
    setTarget: () => intersectionRef(),
  });

  createEffect(() => {
    if (isIntersecting()) {
      if (query.hasNextPage) {
        query.fetchNextPage();
      }
    }
  });
  const [windowWidth, setWindowWidth] = createSignal(1000)

  onMount(() => {
    window.addEventListener("resize", (e) => {
      setWindowWidth(window.innerWidth)
      })

      onCleanup(() => {
        window.removeEventListener("resize", (e) => {
          setWindowWidth(window.innerWidth)
          })
        })
  })

      

  return (
    <>
      <Switch>
        <Match when={isMobile() && windowWidth() < 600}>
          <button
            class="text-center text-sm w-full rounded-lg bg-bg2 p-2 mt-2"
            onClick={() => setCommentsOpen(true)}
          >
            Comments
          </button>
          {commentsOpen() && (
            <Bottomsheet
              variant="snap"
              defaultSnapPoint={({ maxHeight }) => maxHeight - playerHeight() ?? 300}
              snapPoints={({ maxHeight }) => [maxHeight - 40, maxHeight - playerHeight() ?? 300]}
              onClose={() => {
                console.log("close");
                setCommentsOpen(false);
              }}
            >
              {/* <div class="text-text1 bg-bg1 p-2 rounded-t-lg max-h-full max-w-full overflow-auto"> */}
              <Suspense fallback={<p>Loading...</p>}>
                <div id="sb-content" class="flex flex-col gap-1 relative z-50 ">
                  <Show when={query.data}>
                    <For each={query.data!.pages}>
                      {(page) => (
                        <For each={page.comments}>
                          {(comment) => (
                            <Comment
                              videoId={props.videoId}
                              comment={comment}
                              uploader={props.uploader}
                              nextpage={""}
                            />
                          )}
                        </For>
                      )}
                    </For>
                    <div
                      class="w-full h-40 bg-primary"
                      ref={(ref) => setIntersectionRef(ref)}
                    />
                  </Show>
                </div>
              </Suspense>
              {/* </div> */}
            </Bottomsheet>
          )}
        </Match>
        <Match when={!isMobile() || windowWidth() > 600}>
          <div class="text-text1 bg-bg1 p-2 rounded-t-lg max-w-full overflow-y-auto ">
            <Suspense fallback={<p>Loading...</p>}>
              <div id="sb-content" class="flex flex-col gap-1 relative  ">
                <Show when={query.data}>
                  <For each={query.data!.pages}>
                    {(page) => (
                      <For each={page.comments}>
                        {(comment) => (
                          <Comment
                            videoId={props.videoId}
                            comment={comment}
                            uploader={props.uploader}
                            nextpage={""}
                          />
                        )}
                      </For>
                    )}
                  </For>
                  <div
                    class="w-full h-40 bg-primary"
                    ref={(ref) => setIntersectionRef(ref)}
                  />
                </Show>
              </div>
            </Suspense>
          </div>
        </Match>
      </Switch>
    </>
  );
}
