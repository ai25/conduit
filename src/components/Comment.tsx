{
  /* eslint-disable solid/no-innerhtml */
}
import { createInfiniteQuery } from "@tanstack/solid-query";
import {
  FaSolidComment,
  FaSolidCommentDots,
  FaSolidHeart,
  FaSolidThumbsUp,
} from "solid-icons/fa";
import {
  Show,
  createSignal,
  useContext,
  Suspense,
  For,
  createEffect,
} from "solid-js";
import { usePreferences } from "~/stores/preferencesStore";
import { useSyncStore } from "~/stores/syncStore";
import { fetchJson, sanitizeText } from "~/utils/helpers";
import Link from "./Link";
import { BsPin } from "solid-icons/bs";
import { Spinner } from "./Spinner";
export interface PipedCommentResponse {
  comments: PipedComment[];
  disabled: boolean;
  nextpage: string;
  commentCount: number;
}

export interface PipedComment {
  author: string;
  thumbnail: string;
  commentId: string;
  commentText: string;
  commentedTime: string;
  commentorUrl: string;
  repliesPage?: string;
  likeCount: number;
  replyCount: number;
  hearted: boolean;
  pinned: boolean;
  verified: boolean;
  channelOwner: boolean;
  creatorReplied: boolean;
}

interface Props {
  videoId: string;
  comment: PipedComment;
  nextpage: string;
  uploader: string;
  uploaderAvatar: string;
}
export default function Comment(props: Props) {
  const [showingReplies, setShowingReplies] = createSignal(false);
  const [preferences] = usePreferences();
  const fetchComments = async ({
    pageParam = "initial",
  }): Promise<PipedCommentResponse> => {
    if (pageParam === "initial") {
      return await fetchJson(
        `${preferences.instance.api_url}/nextpage/comments/${props.videoId}`,
        {
          nextpage: props.comment.repliesPage!,
        }
      );
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
    queryKey: [
      "commentsReplies",
      props.videoId,
      preferences.instance.api_url,
      props.comment.commentId,
    ],
    queryFn: fetchComments,
    enabled:
      preferences.instance?.api_url &&
      props.videoId &&
      props.comment.repliesPage &&
      showingReplies()
        ? true
        : false,
    getNextPageParam: (lastPage) => {
      return lastPage.nextpage;
    },
    initialPageParam: "initial",
  }));

  const [sanitizedText, setSanitizedText] = createSignal("");
  createEffect(async () => {
    setSanitizedText(await sanitizeText(props.comment.commentText));
  });

  return (
    <>
      <div class="flex  gap-2 px-2 py-1">
        <Link
          href={`${props.comment.commentorUrl}`}
          class="w-[40px] rounded-full justify-center flex h-fit"
        >
          <img
            width="40"
            height="40"
            src={props.comment.thumbnail}
            alt=""
            class="rounded-full w-full h-full"
          />
        </Link>
        <div class="flex flex-col  w-11/12">
          <Show when={props.comment.pinned}>
            <div class="text-xs text-text2 flex items-center gap-1">
              <BsPin class="w-3 h-3" />
              Pinned by {props.uploader}
            </div>
          </Show>
          <span class="flex gap-2 items-center">
            <Link
              href={`${props.comment.commentorUrl}`}
              classList={{
                "text-sm font-bold": true,
                "bg-primary rounded-full px-2": props.comment.channelOwner,
              }}
            >
              {props.comment.author}
            </Link>
            {props.comment.verified && (
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M12.0001 2.00001C6.47715 2.00001 2.00006 6.4771 2.00006 12C2.00006 17.5229 6.47715 22 12.0001 22C17.5229 22 22 17.5229 22 12C22 6.4771 17.5229 2.00001 12.0001 2.00001ZM12.0001 4.00001C16.4182 4.00001 20.0001 7.58191 20.0001 12C20.0001 16.4181 16.4182 20 12.0001 20C7.58199 20 4.00006 16.4181 4.00006 12C4.00006 7.58191 7.58199 4.00001 12.0001 4.00001ZM11.9999 7.00001C11.4477 7.00001 10.9999 7.44772 10.9999 8.00001V12.0001L8.99994 12.0001C8.44775 12.0001 7.99994 12.4478 7.99994 13.0001C7.99994 13.5523 8.44775 14.0001 8.99994 14.0001L11.9999 14.0001V18.0001C11.9999 18.5523 12.4477 19.0001 12.9999 19.0001C13.5521 19.0001 13.9999 18.5523 13.9999 18.0001V8.00001C13.9999 7.44772 13.5521 7.00001 11.9999 7.00001Z"
                />
              </svg>
            )}
            <p class="text-xs text-text2">{props.comment.commentedTime}</p>
          </span>
          <Suspense fallback={<p>Loading...</p>}>
            <p class="text-xs" innerHTML={sanitizedText()} />
          </Suspense>
          <span class="flex gap-1 items-center text-xs ">
            <FaSolidThumbsUp />
            {props.comment.likeCount}
            <Show when={props.comment.hearted}>
              <div class="relative w-4 h-4 ">
                <img
                  src={props.uploaderAvatar}
                  class="rounded-full absolute top-0 left-0 w-full h-full object-contain"
                  alt="Liked by author"
                />
                <div class="bg-red-500">
                  <FaSolidHeart class="w-3 h-3 text-red-500 absolute -bottom-1 -right-1" />
                </div>
              </div>
            </Show>
          </span>
          <div>
            <Show when={props.comment.replyCount > 0 && !showingReplies()}>
              <div class="flex items-center gap-1 mt-1">
                <Show when={props.comment.replyCount > 1}>
                  <button
                    onClick={() => setShowingReplies(true)}
                    class="underline"
                  >
                    View {props.comment.replyCount} replies
                  </button>
                </Show>
                <Show when={props.comment.replyCount === 1}>
                  <button
                    onClick={() => setShowingReplies(true)}
                    class="underline"
                  >
                    View 1 reply
                  </button>
                </Show>

                <Show when={props.comment.creatorReplied}>
                  <div class="relative w-4 h-4 ">
                    <img
                      src={props.uploaderAvatar}
                      class="rounded-full absolute top-0 left-0 w-full h-full object-contain"
                      alt="Creator replied"
                    />
                    <FaSolidCommentDots class="w-3 h-3 text-white absolute -bottom-1 -right-1" />
                  </div>
                </Show>
              </div>
            </Show>
            <Show when={showingReplies()}>
              <button
                onClick={() => setShowingReplies(false)}
                class="underline"
              >
                Hide replies
              </button>
            </Show>
          </div>
        </div>
      </div>
      <Show when={showingReplies()}>
        <div class="ml-10 my-2">
          <Suspense fallback={<Spinner class="self-center !h-10" />}>
            <For
              each={query.data?.pages
                ?.flat()
                ?.map((page) => page.comments)
                .flat()}
            >
              {(comment) => (
                <Comment
                  comment={comment}
                  uploader={props.uploader}
                  uploaderAvatar={props.uploaderAvatar}
                  videoId={props.videoId}
                  nextpage={""}
                />
              )}
            </For>
            <Show when={query.isFetching}>
              <Spinner class="self-center !h-10" />
            </Show>
            <Show when={query.hasNextPage}>
              <button
                onClick={() => query.fetchNextPage()}
                class="underline ml-4"
              >
                Load more replies
              </button>
            </Show>
          </Suspense>
        </div>
      </Show>
    </>
  );
}
