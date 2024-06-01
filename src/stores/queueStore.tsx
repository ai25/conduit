import {
  batch,
  createContext,
  createEffect,
  createSignal,
  useContext,
} from "solid-js";
import { RelatedStream } from "~/types";
import { getVideoId } from "~/utils/helpers";

class Node {
  value: RelatedStream;
  next: Node | null = null;
  prev: Node | null = null;
  constructor(value: RelatedStream) {
    this.value = value;
  }
}

// export class VideoQueue implements Iterable<RelatedStream> {
//   private head = createSignal<Node | null>(null);
//   private tail = createSignal<Node | null>(null);
//   private current = createSignal<Node | null>(null);
//   private _length = createSignal<number>(0);
//   private videoIdSet = new Set<string>();
//   private watchedVideoIds = new Set<string>();
//
//   public get currentVideo() {
//     return this.current[0]()?.value;
//   }
//
//   public get uniqueIds() {
//     return Array.from(this.videoIdSet);
//   }
//
//   constructor(videos: RelatedStream[] = []) {
//     videos.forEach((video) => this.add(video));
//   }
//
//   [Symbol.iterator](): Iterator<RelatedStream> {
//     let current = this.head[0]()?.value;
//     return {
//       next: (): IteratorResult<RelatedStream> => {
//         if (current) {
//           const value = current;
//           current = this.head[0]()?.next?.value;
//           return { value, done: false };
//         } else {
//           return { value: undefined!, done: true };
//         }
//       },
//     };
//   }
//
//   add(video: RelatedStream) {
//     this.clearUnwatched();
//     const id = getVideoId(video);
//     console.log("adding", id);
//     if (!id) return;
//     if (this.videoIdSet.has(id)) return;
//     const newNode = new Node(video);
//     const tail = this.tail[0]();
//     if (tail) {
//       console.log("tail", tail);
//       tail.next = newNode;
//       newNode.prev = tail;
//       this.tail[1](newNode);
//     } else {
//       console.log("no tail", tail);
//       this.head[1](newNode);
//       this.tail[1](newNode);
//       if (!this.current[0]()) this.current[1](newNode);
//     }
//     this.videoIdSet.add(id);
//     this._length[1](this._length[0]() + 1);
//     return newNode.value;
//   }
//
//   clearUnwatched() {
//     let temp = this.current[0]();
//     while (temp?.value) {
//       if (
//         !this.watchedVideoIds.has(getVideoId(temp.value)!) &&
//         !(temp.value as any).manuallyEnqueued
//       ) {
//         this.remove(getVideoId(temp.value)!);
//       }
//       temp = temp.prev;
//     }
//   }
//
//   list(): RelatedStream[] {
//     const list: RelatedStream[] = [];
//     let temp = this.head[0]();
//     while (temp) {
//       list.push(temp.value);
//       temp = temp.next;
//     }
//     return list;
//   }
//   enqueue(video: RelatedStream) {
//     (video as any).manuallyEnqueued = true;
//     this.add(video);
//   }
//
//   enqueueNext(video: RelatedStream) {
//     const id = getVideoId(video);
//     if (!id) return;
//     if (this.videoIdSet.has(id)) return;
//     const current = this.current[0]();
//     if (!current) {
//       this.add(video);
//       return;
//     }
//     (video as any).manuallyEnqueued = true;
//     const newNode = new Node(video);
//     const temp = current.next;
//     current.next = newNode;
//     newNode.prev = current;
//     newNode.next = temp;
//     if (temp) temp.prev = newNode;
//     if (current === this.tail[0]()) this.tail[1](newNode);
//     this.videoIdSet.add(id);
//     this._length[1](this._length[0]() + 1);
//   }
//
//   next(): RelatedStream | null {
//     const current = this.current[0]();
//     if (!current?.next) return null;
//     this.current[1](current.next);
//     return current.next.value;
//   }
//
//   peekNext(): RelatedStream | null {
//     return this.current[0]()?.next?.value || null;
//   }
//
//   prev(): RelatedStream | null {
//     const current = this.current[0]();
//     if (!current?.prev) return null;
//     this.current[1](current.prev);
//     return current.prev.value;
//   }
//
//   peekPrev(): RelatedStream | null {
//     return this.current[0]()?.prev?.value || null;
//   }
//
//   length(): number {
//     return this._length[0]();
//   }
//
//   has(id: string): boolean {
//     return this.videoIdSet.has(id);
//   }
//
//   isEmpty(): boolean {
//     return this._length[0]() === 0;
//   }
//
//   setCurrentVideo(id: string): boolean {
//     let temp = this.head[0]();
//     while (temp) {
//       if (getVideoId(temp.value) === id) {
//         this.current[1](temp);
//         this.watchedVideoIds.add(id);
//         return true;
//       }
//       temp = temp.next;
//     }
//     return false;
//   }
//
//   remove(id: string): boolean {
//     let temp = this.head[0]();
//     console.log("removing", id);
//     while (temp) {
//       if (getVideoId(temp.value) === id) {
//         console.log(
//           "found",
//           !!temp.prev,
//           !!temp.next,
//           temp === this.head[0](),
//           temp === this.tail[0](),
//           temp === this.current[0]()
//         );
//         if (temp.prev) temp.prev.next = temp.next;
//         if (temp.next) temp.next.prev = temp.prev;
//         if (temp === this.head[0]()) this.head[1](temp.next);
//         if (temp === this.tail[0]()) this.tail[1](temp.prev);
//         if (temp === this.current[0]()) this.current[1](temp.next);
//         this._length[1](this._length[0]() - 1);
//         return true;
//       }
//       temp = temp.next;
//     }
//     this.videoIdSet.delete(id);
//     return false;
//   }
//
//   clear() {
//     this.head[1](null);
//     this.tail[1](null);
//     this.current[1](null);
//     this._length[1](0);
//     this.videoIdSet.clear();
//   }
//
//   getTotalDuration(): number {
//     let temp = this.head[0]();
//     let totalDuration = 0;
//     while (temp) {
//       totalDuration += temp.value.duration;
//       temp = temp.next;
//     }
//     return totalDuration;
//   }
// }
//
export class VideoQueue extends EventTarget {
  private head: Node | null = null;
  private tail: Node | null = null;
  private current: Node | null = null;
  private _length = 0;
  private videoIdSet = new Set<string>();
  private watchedVideoIds = new Set<string>();

  public get currentVideo() {
    return this.current?.value || null;
  }

  public get uniqueIds() {
    return Array.from(this.videoIdSet);
  }

  private isPlaylist = false;

  constructor(videos: RelatedStream[] = []) {
    super();
    videos.forEach((video) => this.add(video));
  }

  public init(videos: RelatedStream[] = []) {
    this.clear();
    videos.forEach((video) => this.add(video));
    this.dispatchChangeEvent();
  }
  public initPlaylist(videos: RelatedStream[] = []) {
    this.clear();
    this.isPlaylist = true;
    videos.forEach((video) => this.add(video));
    this.dispatchChangeEvent();
  }

  private dispatchChangeEvent() {
    this.dispatchEvent(new Event("change"));
  }

  add(video: RelatedStream) {
    console.log("adding", video.title, this.current);
    // if (!this.isPlaylist) {
    //   this.clearUnwatched();
    // }
    const id = getVideoId(video);
    if (!id || this.videoIdSet.has(id)) return;
    const newNode = new Node(video);
    if (this.tail) {
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
      console.log("has tail", this.current);
    } else {
      console.log("does not have tail", this.current);
      this.head = this.tail = newNode;
      if (!this.current) this.current = newNode;
    }
    this.videoIdSet.add(id);
    this._length++;
    this.dispatchChangeEvent();
    return newNode.value;
  }

  clearUnwatched() {
    if (this.isPlaylist) return;
    let temp = this.current;
    while (temp) {
      const id = getVideoId(temp.value);
      if (
        id &&
        !this.watchedVideoIds.has(id) &&
        !(temp.value as any).manuallyEnqueued
      ) {
        const next = temp.prev;
        this.remove(id);
        temp = next;
      } else {
        temp = temp.prev;
      }
    }
  }

  list(): RelatedStream[] {
    const list: RelatedStream[] = [];
    let temp = this.head;
    while (temp) {
      list.push(temp.value);
      temp = temp.next;
    }
    return list;
  }

  enqueue(video: RelatedStream) {
    (video as any).manuallyEnqueued = true;
    this.add(video);
  }

  enqueueNext(video: RelatedStream) {
    const id = getVideoId(video);
    if (!id || this.videoIdSet.has(id)) return;
    const current = this.current;
    if (!current) {
      this.add(video);
      return;
    }
    (video as any).manuallyEnqueued = true;
    const newNode = new Node(video);
    const temp = current.next;
    current.next = newNode;
    newNode.prev = current;
    newNode.next = temp;
    if (temp) temp.prev = newNode;
    if (current === this.tail) this.tail = newNode;
    this.videoIdSet.add(id);
    this._length++;
    this.dispatchChangeEvent();
  }

  next(): RelatedStream | null {
    const current = this.current;
    if (!current?.next) return null;
    this.current = current.next;
    this.dispatchChangeEvent();
    return current.next.value;
  }

  peekNext(): RelatedStream | null {
    return this.current?.next?.value || null;
  }

  prev(): RelatedStream | null {
    const current = this.current;
    if (!current?.prev) return null;
    this.current = current.prev;
    this.dispatchChangeEvent();
    return current.prev.value;
  }

  peekPrev(): RelatedStream | null {
    return this.current?.prev?.value || null;
  }

  length(): number {
    return this._length;
  }

  has(id: string): boolean {
    return this.videoIdSet.has(id);
  }

  isEmpty(): boolean {
    return this._length === 0;
  }

  setCurrentVideo(id: string): boolean {
    let temp = this.head;
    while (temp) {
      if (getVideoId(temp.value) === id) {
        if (this.current !== temp) {
          this.current = temp;
          this.watchedVideoIds.add(id);
          this.dispatchChangeEvent();
        }
        return true;
      }
      temp = temp.next;
    }
    return false;
  }

  remove(id: string): boolean {
    let temp = this.head;
    while (temp) {
      if (getVideoId(temp.value) === id) {
        if (temp.prev) temp.prev.next = temp.next;
        if (temp.next) temp.next.prev = temp.prev;
        if (temp === this.head) this.head = temp.next;
        if (temp === this.tail) this.tail = temp.prev;
        if (temp === this.current) this.current = temp.next;
        this.videoIdSet.delete(id);
        this._length--;
        this.dispatchChangeEvent();
        return true;
      }
      temp = temp.next;
    }
    return false;
  }

  clear() {
    this.head = this.tail = null;
    this.current = null;
    this._length = 0;
    this.videoIdSet.clear();
    this.isPlaylist = false;
    this.dispatchChangeEvent();
  }

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

const QueueContext = createContext<VideoQueue>(new VideoQueue());

export function QueueProvider(props: any) {
  const queue = new VideoQueue();
  return (
    <QueueContext.Provider value={queue}>
      {props.children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const queue = useContext(QueueContext);
  if (!queue) throw new Error("useQueue must be used within a QueueProvider");
  return queue;
}
