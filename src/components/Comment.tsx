import { A } from "@solidjs/router";
import dayjs from "dayjs";
import { Show, createSignal, useContext } from "solid-js";
import { InstanceContext } from "~/root";
export interface PipedCommentResponse {
  comments: PipedComment[]
  disabled: boolean
  nextpage: string
}

export interface PipedComment {
  author: string
  commentId: string
  commentText: string
  commentedTime: string
  commentorUrl: string
  hearted: boolean
  likeCount: number
  pinned: boolean
  thumbnail: string
  verified: boolean
}


interface Props {
  videoId: string;
  comment: PipedComment;
  nextpage: string;
  uploader: string;
}
export default function Comment(props: Props) {
  const [loadingReplies, setLoadingReplies] = createSignal(false);
  const [showingReplies, setShowingReplies] = createSignal(false);
  const [replies, setReplies] = createSignal([]);
  const [nextpage, setNextpage] = createSignal(null);
  const [instance] = useContext(InstanceContext);
  async function loadReplies() {
    if (!showingReplies() && loadingReplies()) {
      setShowingReplies(true);
      return;
    }

    setLoadingReplies(true);
    setShowingReplies(true);
    const res = await fetch(
      `${instance().api_url}/nextpage/comments/${props.videoId}?nextpage=${nextpage()}`
    );
    const data = await res.json();
    setReplies(replies().concat(data.comments));
    setNextpage(data.nextpage);
  }
  async function hideReplies() {
    setShowingReplies(false);
  }

  return (
    <>
      {/* <div class="comment flex mt-1.5">
        <img
            src={props.comment.thumbnail}
            class="rounded-full w-12 h-12"
            height="48"
            width="48"
            loading="lazy"
            alt="Avatar"
        />

        <div class="comment-content pl-2">
            <div class="comment-header">
                <Show when={props.comment.pinned}>
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

                    <span
                        class="ml-1.5"
                    >Pinned by {props.comment.uploader}</span>
                </Show> */}
      <div class="flex  gap-2 ">
        <A
          href={`/channel/${props.comment.commentorUrl}`}
          class="w-1/12 rounded-full justify-center flex h-fit">
          <img
            width="48"
            height="48"
            src={props.comment.thumbnail}
            alt=""
            class="rounded-full w-full h-full"
          />
        </A>
        <div class="flex flex-col gap-2 w-11/12">
          <span class="flex gap-2 items-center">
            <A
              href={`/channel/${props.comment.commentorUrl}`}
              class={`text-xl font-bold ${
                props.comment.commentorUrl === props.uploader &&
                "bg-background rounded-full px-4"
              }`}>
              {props.comment.author}
            </A>
            {props.comment.verified && 
            <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M12.0001 2.00001C6.47715 2.00001 2.00006 6.4771 2.00006 12C2.00006 17.5229 6.47715 22 12.0001 22C17.5229 22 22 17.5229 22 12C22 6.4771 17.5229 2.00001 12.0001 2.00001ZM12.0001 4.00001C16.4182 4.00001 20.0001 7.58191 20.0001 12C20.0001 16.4181 16.4182 20 12.0001 20C7.58199 20 4.00006 16.4181 4.00006 12C4.00006 7.58191 7.58199 4.00001 12.0001 4.00001ZM11.9999 7.00001C11.4477 7.00001 10.9999 7.44772 10.9999 8.00001V12.0001L8.99994 12.0001C8.44775 12.0001 7.99994 12.4478 7.99994 13.0001C7.99994 13.5523 8.44775 14.0001 8.99994 14.0001L11.9999 14.0001V18.0001C11.9999 18.5523 12.4477 19.0001 12.9999 19.0001C13.5521 19.0001 13.9999 18.5523 13.9999 18.0001V8.00001C13.9999 7.44772 13.5521 7.00001 11.9999 7.00001Z"
                />
            </svg>}
            <p class="">{props.comment.commentedTime}</p>
            {/* {props.comment.&& <p class="text-sm">edited</p>} */}
          </span>
          <p class="">{props.comment.commentText}</p>
          <span class="flex gap-2 items-center">
            {/* <FaThumbsUp /> */}
            <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M12.0001 2.00001C6.47715 2.00001 2.00006 6.4771 2.00006 12C2.00006 17.5229 6.47715 22 12.0001 22C17.5229 22 22 17.5229 22 12C22 6.4771 17.5229 2.00001 12.0001 2.00001ZM12.0001 4.00001C16.4182 4.00001 20.0001 7.58191 20.0001 12C20.0001 16.4181 16.4182 20 12.0001 20C7.58199 20 4.00006 16.4181 4.00006 12C4.00006 7.58191 7.58199 4.00001 12.0001 4.00001ZM11.9999 7.00001C11.4477 7.00001 10.9999 7.44772 10.9999 8.00001V12.0001L8.99994 12.0001C8.44775 12.0001 7.99994 12.4478 7.99994 13.0001C7.99994 13.5523 8.44775 14.0001 8.99994 14.0001L11.9999 14.0001V18.0001C11.9999 18.5523 12.4477 19.0001 12.9999 19.0001C13.5521 19.0001 13.9999 18.5523 13.9999 18.0001V8.00001C13.9999 7.44772 13.5521 7.00001 11.9999 7.00001Z"
                />
            </svg>
            {props.comment.likeCount}
            {/* {props.comment.replies && comment.replies.replyCount > 1 && (
              <button class="underline">
                View {comment.replies.replyCount} replies
              </button>
            )}
            {comment.replies?.replyCount === 1 && (
              <button class="underline">View 1 reply</button>
            )} */}
            {/* <template v-if="comment.repliesPage && (!loadingReplies || !showingReplies)">
                <div click="loadReplies" class="cursor-pointer">
                    <a v-text="`${$t('actions.reply_count', comment.replyCount)}`" />
                    <font-awesome-icon class="ml-1.5" icon="level-down-alt" />
                </div>
            </template> */}
          </span>
        </div>
      </div>
      {/* 
                <div class="comment-author">
                    <router-link class="font-bold link" :to="comment.commentorUrl">{{ comment.author }}</router-link>
                    <font-awesome-icon class="ml-1.5" v-if="comment.verified" icon="check" />
                </div>
                <div class="comment-meta text-sm mb-1.5" v-text="comment.commentedTime" />
            </div>
            <div class="whitespace-pre-wrap" v-html="purifyHTML(comment.commentText)" />
            <div class="comment-footer mt-1 flex items-center">
                <div class="i-fa-solid:thumbs-up" />
                <span class="ml-1" v-text="numberFormat(comment.likeCount)" />
                <font-awesome-icon class="ml-1" v-if="comment.hearted" icon="heart" />
            </div>
            <template v-if="showingReplies">
                <div @click="hideReplies" class="cursor-pointer">
                    <a v-t="'actions.hide_replies'" />
                    <font-awesome-icon class="ml-1.5" icon="level-up-alt" />
                </div>
            </template>
            <div v-show="showingReplies" v-if="replies" class="replies">
                <div v-for="reply in replies" :key="reply.commentId" class="w-full">
                    <CommentItem :comment="reply" :uploader="uploader" :video-id="videoId" />
                </div>
                <div v-if="nextpage" @click="loadReplies" class="cursor-pointer">
                    <a v-t="'actions.load_more_replies'" />
                    <font-awesome-icon class="ml-1.5" icon="level-down-alt" />
                </div>
            </div>
        </div>
    </div> */}
    </>
  );
}
