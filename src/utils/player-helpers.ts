import { SetStoreFunction } from "solid-js/store";
import { MediaPlayerElement } from "vidstack/elements";
import { Store } from "~/stores/syncStore";
import { PipedVideo } from "~/types";
import { getVideoId, yieldToMain } from "./helpers";

export type MediaMetadataProps = {
  title: string;
  artist: string;
  thumbnailUrl: string;
};

export const initMediaSession = (
  mediaSession: MediaSession | null,
  metadataProps: MediaMetadataProps | null,
  mediaPlayer: MediaPlayerElement | null
) => {
  if (!mediaSession || !metadataProps || !mediaPlayer) return;

  mediaSession.metadata = new MediaMetadata({
    title: metadataProps.title,
    artist: metadataProps.artist,
    artwork: [
      {
        src: metadataProps.thumbnailUrl,
        sizes: "128x128",
        type: "image/png",
      },
    ],
  });
  const actionHandlers = {
    play: () => mediaPlayer.play(),
    pause: () => mediaPlayer.pause(),
    seekbackward: () => {
      mediaPlayer.currentTime -= 10;
    },
    seekforward: () => {
      mediaPlayer.currentTime += 10;
    },
    previoustrack: () => {
      mediaPlayer.currentTime -= 10;
    },
    nexttrack: () => {
      mediaPlayer.currentTime += 10;
    },
    stop: () => console.log("stop"),
  };

  for (const action in actionHandlers) {
    if (Object.prototype.hasOwnProperty.call(actionHandlers, action)) {
      const mediaAction = action as MediaSessionAction;
      mediaSession.setActionHandler(mediaAction, actionHandlers[mediaAction]!);
    }
  }
};
const buildProgressObject = (
  id: string,
  currentTime: number | null,
  video: PipedVideo
) => ({
  title: video.title,
  duration: video.duration,
  thumbnail: video.thumbnailUrl,
  uploaderName: video.uploader,
  uploaderAvatar: video.uploaderAvatar,
  uploaderUrl: video.uploaderUrl,
  url: `/watch?v=${id}`,
  currentTime: currentTime ?? video.duration,
  watchedAt: new Date().getTime(),
  type: "stream",
  uploaded: new Date(video.uploadDate).getTime(),
  uploaderVerified: video.uploaderVerified,
  views: video.views,
});

export const updateProgress = async (
  video: PipedVideo,
  started: boolean,
  currentTime: number | null,
  sync: { store: Store; setStore: SetStoreFunction<Store> }
) => {
  if (!video || !started) return;

  const id = getVideoId(video);
  if (!id) return;

  console.time("updating progress");

  const progressObject = buildProgressObject(id, currentTime, video);

  console.log("updating progress", progressObject);

  await yieldToMain();
  const updateStore = async (
    sync: { store: Store; setStore: SetStoreFunction<Store> },
    id: string,
    currentTime: number,
    progressObject: Record<string, unknown>
  ) => {
    if (sync.store.history[id]) {
      sync.setStore("history", id, "currentTime", currentTime!);
      sync.setStore("history", id, "watchedAt", new Date().getTime());
    } else {
      sync.setStore("history", id, progressObject);
    }
  };

  await updateStore(sync, id, currentTime ?? 0, progressObject);

  console.timeEnd("updating progress");
};
