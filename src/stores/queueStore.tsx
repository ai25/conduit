import {
  createContext,
  createEffect,
  createSignal,
  useContext,
} from "solid-js";
import { videoId } from "~/routes/library/history";
import { RelatedStream } from "~/types";

export type QueueContextType = {
  queue: () => RelatedStream[];
  currentVideoId: () => string | null;
  setCurrentVideoId: (videoId: string) => void;
  next: () => RelatedStream | null;
  length: () => number;
  isEmpty: () => boolean;
  isCurrentLast: () => boolean;
  hasVideo: (videoId: string) => boolean;
  getCurrentVideo: () => RelatedStream | null;
  setCurrentVideo: (video: RelatedStream) => void;
  addToQueue: (video: RelatedStream) => void;
  enqueueNext: (video: RelatedStream) => void;
  removeFromQueue: (videoId: string) => void;
  clearQueue: () => void;
  getTotalDuration: () => number;
};

const QueueContext = createContext<QueueContextType>();

export const QueueProvider = (props: { children: any }) => {
  const [queue, setQueue] = createSignal<RelatedStream[]>([]);
  createEffect(() => {
    if (!("localStorage" in globalThis)) return;
    setQueue(JSON.parse(localStorage.getItem("videoQueue") || "[]"));
  });

  const [currentVideoId, setCurrentVideoId] = createSignal<string | null>(null);
  const currentIndex = () =>
    queue().findIndex((v) => videoId(v) === currentVideoId());

  const next = () => {
    console.log(
      currentIndex(),
      queue().length,
      queue()[currentIndex() + 1],
      currentIndex() === -1,
      currentIndex() === queue().length - 1
    );
    if (!currentIndex()) return null;
    if (currentIndex() === -1 || currentIndex() === queue().length - 1)
      return null;
    const n = queue()[currentIndex() + 1];
    return n;
  };

  const length = () => queue().length;

  const isEmpty = () => queue().length === 0;

  const isCurrentLast = (): boolean => {
    if (!currentVideoId()) return false;
    return currentIndex() === queue().length - 1;
  };
  const hasVideo = (id: string): boolean => {
    return queue().some((v) => videoId(v) === id);
  };

  const getCurrentVideo = (): RelatedStream | null => {
    const video = queue().find((v) => videoId(v) === currentVideoId());
    return video || null;
  };

  const setCurrentVideo = (video: RelatedStream) => {
    if (!hasVideo(videoId(video))) {
      const updatedQueue = [
        ...queue().slice(0, currentIndex() + 1),
        video,
        ...queue().slice(currentIndex() + 1),
      ];

      localStorage.setItem("videoQueue", JSON.stringify(updatedQueue));
      setQueue(updatedQueue);
    }
    setCurrentVideoId(videoId(video));
  };

  const addToQueue = (video: RelatedStream) => {
    const updatedQueue = [...queue(), video];
    localStorage.setItem("videoQueue", JSON.stringify(updatedQueue));
    setQueue(updatedQueue);
  };

  const enqueueNext = (video: RelatedStream) => {
    if (!currentVideoId()) {
      addToQueue(video);
      return;
    }

    const updatedQueue = [
      ...queue().slice(0, currentIndex() + 1),
      video,
      ...queue().slice(currentIndex() + 1),
    ];

    localStorage.setItem("videoQueue", JSON.stringify(updatedQueue));
    setQueue(updatedQueue);
  };

  const removeFromQueue = (id: string) => {
    const updatedQueue = queue().filter((v) => videoId(v) !== id);
    localStorage.setItem("videoQueue", JSON.stringify(updatedQueue));
    setQueue(updatedQueue);
  };

  const clearQueue = () => {
    localStorage.removeItem("videoQueue");
    setQueue([]);
  };

  const getTotalDuration = () => {
    return queue().reduce((sum, video) => sum + video.duration, 0);
  };

  const queueStore = {
    queue,
    currentVideoId,
    setCurrentVideoId,
    next,
    length,
    isEmpty,
    isCurrentLast,
    hasVideo,
    getCurrentVideo,
    setCurrentVideo,
    addToQueue,
    enqueueNext,
    removeFromQueue,
    clearQueue,
    getTotalDuration,
  };

  return (
    <QueueContext.Provider value={queueStore}>
      {props.children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error("useQueue must be used within a QueueProvider");
  }
  return context;
};
