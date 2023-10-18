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


class Node {
  value: RelatedStream;
  next: Node | null = null;
  prev: Node | null = null;
  constructor(value: RelatedStream) {
    this.value = value;
  }
}

export class VideoQueue {
  head: Node | null = null;
  tail: Node | null = null;
  current: Node | null = null;
  private _length: number = 0;
  
  constructor(videos: RelatedStream[] = []) {
    videos.forEach((video) => this.add(video));
    this.current = this.head;
  }

  list(): RelatedStream[] {
    const list: RelatedStream[] = [];
    let temp = this.head;
    while (temp) {
      list.push(temp.value);
      temp = temp.next;
    }
    console.log(list, "queue list");
    return list;
  }

  // Add a video to the end of the queue
  add(video: RelatedStream) {
    const newNode = new Node(video);
    if (this.tail) {
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    } else {
      this.head = this.tail = newNode;
    }
    this._length++;
  }
  
  // Enqueue a video next to the currently playing video
  enqueueNext(video: RelatedStream) {
    if (!this.current) {
      this.add(video);
      return;
    }
    const newNode = new Node(video);
    const temp = this.current.next;
    this.current.next = newNode;
    newNode.prev = this.current;
    newNode.next = temp;
    if (temp) temp.prev = newNode;
    if (this.current === this.tail) this.tail = newNode;
    this._length++;
  }
  
  // Move to the next video
  next():  RelatedStream | null {
    if (!this.current?.next) return null;
    this.current = this.current.next;
    return this.current.value;
  }

  // Move to the previous video
  prev(): RelatedStream | null {
    if (!this.current?.prev) return null;
    this.current = this.current.prev;
    return this.current.value;
  }


  // Get the length of the queue
  length(): number {
    return this._length;
  }

  // Check if the queue is empty
  isEmpty(): boolean {
    return this._length === 0;
  }

  // Get the current video
  getCurrentVideo(): RelatedStream | null {
    return this.current?.value || null;
  }

  // Set the current video by ID
  setCurrentVideo(id: string): boolean {
    let temp = this.head;
    while (temp) {
      if (videoId(temp.value) === id) {
        this.current = temp;
        return true;
      }
      temp = temp.next;
    }
    return false;
  }

  // Remove a video by ID
  remove(id: string): boolean {
    let temp = this.head;
    while (temp) {
      if (videoId(temp.value) === id) {
        if (temp.prev) temp.prev.next = temp.next;
        if (temp.next) temp.next.prev = temp.prev;
        if (temp === this.head) this.head = temp.next;
        if (temp === this.tail) this.tail = temp.prev;
        if (temp === this.current) this.current = temp.next;
        this._length--;
        return true;
      }
      temp = temp.next;
    }
    return false;
  }

  // Clear the queue
  clear() {
    this.head = this.tail = this.current = null;
    this._length = 0;
  }

  // Get the total duration of the queue
  getTotalDuration(): number {
    let temp = this.head;
    let totalDuration = 0;
    while (temp) {
      totalDuration += temp.value.duration;
      temp = temp.next;
    }
    return totalDuration;
  }
}
