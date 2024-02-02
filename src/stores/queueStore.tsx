import {
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

export class VideoQueue implements Iterable<RelatedStream> {
  private head = createSignal<Node | null>(null);
  private tail = createSignal<Node | null>(null);
  private current = createSignal<Node | null>(null);
  private _length = createSignal<number>(0);
  private videoIdSet = new Set<string>();

  public get currentVideo() {
    return this.current[0]()?.value;
  }

  public get uniqueIds() {
    return Array.from(this.videoIdSet);
  }

  constructor(videos: RelatedStream[] = []) {
    videos.forEach((video) => this.add(video));
  }

  [Symbol.iterator](): Iterator<RelatedStream> {
    let current = this.head[0]()?.value;
    return {
      next: (): IteratorResult<RelatedStream> => {
        if (current) {
          const value = current;
          current = this.head[0]()?.next?.value
          return { value, done: false };
        } else {
          return { value: undefined!, done: true };
        }
      }
    };
  }

  add(video: RelatedStream) {
    const id = getVideoId(video);
    console.log("adding", id);
    if (!id) return;
    if (this.videoIdSet.has(id)) return;
    const newNode = new Node(video);
    const tail = this.tail[0]();
    if (tail) {
      console.log("tail", tail)
      tail.next = newNode;
      newNode.prev = tail;
      this.tail[1](newNode);
    } else {
      console.log("no tail", tail)
      this.head[1](newNode);
      this.tail[1](newNode);
      if (!this.current[0]()) this.current[1](newNode);
    }
    this.videoIdSet.add(id);
    this._length[1](this._length[0]() + 1);
    return newNode.value
  }

  list(): RelatedStream[] {
    const list: RelatedStream[] = [];
    let temp = this.head[0]();
    while (temp) {
      list.push(temp.value);
      temp = temp.next;
    }
    return list;
  }


  enqueueNext(video: RelatedStream) {
    const id = getVideoId(video);
    if (!id) return;
    if (this.videoIdSet.has(id)) return;
    const current = this.current[0]();
    if (!current) {
      this.add(video);
      return;
    }
    const newNode = new Node(video);
    const temp = current.next;
    current.next = newNode;
    newNode.prev = current;
    newNode.next = temp;
    if (temp) temp.prev = newNode;
    if (current === this.tail[0]()) this.tail[1](newNode);
    this.videoIdSet.add(id);
    this._length[1](this._length[0]() + 1);
  }

  next(): RelatedStream | null {
    const current = this.current[0]();
    if (!current?.next) return null;
    this.current[1](current.next);
    return current.next.value;
  }

  peekNext(): RelatedStream | null {
    return this.current[0]()?.next?.value || null;
  }

  prev(): RelatedStream | null {
    const current = this.current[0]();
    if (!current?.prev) return null;
    this.current[1](current.prev);
    return current.prev.value;
  }

  peekPrev(): RelatedStream | null {
    return this.current[0]()?.prev?.value || null;
  }

  length(): number {
    return this._length[0]();
  }

  has(id: string): boolean {
    return this.videoIdSet.has(id);
  }

  isEmpty(): boolean {
    return this._length[0]() === 0;
  }

  setCurrentVideo(id: string): boolean {
    let temp = this.head[0]();
    while (temp) {
      if (getVideoId(temp.value) === id) {
        this.current[1](temp);
        return true;
      }
      temp = temp.next;
    }
    return false;
  }

  remove(id: string): boolean {
    let temp = this.head[0]();
    while (temp) {
      if (getVideoId(temp.value) === id) {
        if (temp.prev) temp.prev.next = temp.next;
        if (temp.next) temp.next.prev = temp.prev;
        if (temp === this.head[0]()) this.head[1](temp.next);
        if (temp === this.tail[0]()) this.tail[1](temp.prev);
        if (temp === this.current[0]()) this.current[1](temp.next);
        this._length[1](this._length[0]() - 1);
        return true;
      }
      temp = temp.next;
    }
    this.videoIdSet.delete(id);
    return false;
  }

  clear() {
    this.head[1](null);
    this.tail[1](null);
    this.current[1](null);
    this._length[1](0);
    this.videoIdSet.clear();
  }

  getTotalDuration(): number {
    let temp = this.head[0]();
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
