import { createInfiniteQuery } from "@tanstack/solid-query";
import { Show } from "solid-js";
import { For } from "solid-js";
import { usePreferences } from "~/stores/preferencesStore";
import { fetchJson } from "~/utils/helpers";
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

  const query = createInfiniteQuery(
    () => ["comments", props.videoId],
    fetchComments,
    {
      get enabled() {
        return preferences.instance?.api_url && props.videoId ? true : false;
      },
      getNextPageParam: (lastPage) => {
        return lastPage.nextpage;
      },
    }
  );
  async function loadComments() {
    // const res = await fetch(`${instance().api_url}/comments/${videoId(props.video)}`);
    // const data = await res.json();
    // console.log(data, "comments");
    // setComments(data);
  }
  async function loadMoreComments() {
    // if (!comments()?.nextpage) return;
    // const res = await fetch(
    //   `${instance().api_url}/nextpage/comments/${videoId(props.video)}?nextpage=${
    //     comments()!.nextpage
    //   }`
    // );
    // const data = await res.json();
    // console.log(data, "comments");
    // setComments({
    //   ...data,
    //   comments: [...comments()!.comments, ...data.comments],
    // });
  }

  return (
    <div class="flex  flex-col ">
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
      </Show>
    </div>
  );
}
