{
  /* eslint-disable solid/no-innerhtml */
}
import { createInfiniteQuery } from "@tanstack/solid-query";
import {
  createEffect,
  createSignal,
  Match,
  onCleanup,
  onMount,
  Show,
  Suspense,
  Switch,
} from "solid-js";
import { For } from "solid-js";
import { isServer } from "solid-js/web";
import useIntersectionObserver from "~/hooks/useIntersectionObserver";
import { usePreferences } from "~/stores/preferencesStore";
import { fetchJson, isMobile } from "~/utils/helpers";
import { Bottomsheet } from "./Bottomsheet";
import Comment, { PipedCommentResponse } from "./Comment";
import numeral from "numeral";
import { sanitizeText } from "./Description";

export default function Comments(props: {
  videoId: string;
  uploader: string;
  uploaderAvatar: string;
  display: "default" | "bottomsheet";
}) {
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

  const query = createInfiniteQuery(() => ({
    queryKey: ["comments", props.videoId, preferences.instance.api_url],
    queryFn: fetchComments,
    enabled: preferences.instance?.api_url && props.videoId ? true : false,
    getNextPageParam: (lastPage) => {
      return lastPage.nextpage;
    },
    initialPageParam: "initial",
  }));
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
  const numberOfComments = () => query.data?.pages?.[0]?.commentCount;
  const firstComment = () => query.data?.pages?.[0]?.comments?.[0];
  const [sanitizedText, setSanitizedText] = createSignal("");
  createEffect(async () => {
    if (!firstComment()) return;
    setSanitizedText(await sanitizeText(firstComment()!.commentText));
  });

  return (
    <>
      <Switch>
        <Match when={props.display === "bottomsheet"}>
          <button
            class="text-center text-sm w-full rounded-xl bg-bg2 p-2 mb-2"
            onClick={() => setCommentsOpen(true)}
          >
            <Show when={!firstComment()}>
              Comments{" "}
              {numberOfComments() &&
                ` - ${numeral(numberOfComments()).format("0a")}`}
            </Show>
            <Show when={firstComment()}>
              Comments{" "}
              {numberOfComments() &&
                ` - ${numeral(numberOfComments()).format("0a")}`}
              <div class="text-xs flex items-center gap-2">
                <img
                  class="rounded-full h-10 w-10"
                  src={firstComment()!.thumbnail}
                  alt={firstComment()!.author}
                />
                <div innerHTML={sanitizedText()} class="two-line-ellipsis" />
              </div>
            </Show>
          </button>
          {commentsOpen() && (
            <Bottomsheet
              variant="snap"
              defaultSnapPoint={({ maxHeight }) => maxHeight - 300}
              snapPoints={({ maxHeight }) => [maxHeight - 40, maxHeight - 300]}
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
                        <For
                          each={page?.comments?.filter((c) => c.commentText)}
                        >
                          {(comment) => (
                            <Comment
                              videoId={props.videoId}
                              comment={comment}
                              uploader={props.uploader}
                              uploaderAvatar={props.uploaderAvatar}
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
        <Match when={props.display === "default"}>
          <div class="text-text1 bg-bg1 p-2 rounded-t-lg max-w-full overflow-y-auto ">
            <Suspense fallback={<p>Loading...</p>}>
              <div id="sb-content" class="flex flex-col gap-1 relative  ">
                <div class="p-2 text-md font-semibold">
                  Comments{" "}
                  {numberOfComments() &&
                    ` - ${numeral(numberOfComments()).format("0a")}`}
                </div>
                <div class="h-px w-full bg-bg3 mb-2" />
                <Show when={query.data}>
                  <For each={query.data!.pages}>
                    {(page) => (
                      <For each={page.comments.filter((c) => c.commentText)}>
                        {(comment) => (
                          <Comment
                            videoId={props.videoId}
                            comment={comment}
                            uploader={props.uploader}
                            uploaderAvatar={props.uploaderAvatar}
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
