import { SetStoreFunction } from "solid-js/store";
import { isServer } from "solid-js/web";
import { Store } from "~/stores/syncStore";
import {
  ConduitPlaylist,
  PipedVideo,
  Playlist,
  PreviewFrame,
  RelatedStream,
} from "~/types";

export async function fetchJson(
  url: string,
  params?: Record<string, string>,
  options?: RequestInit
): Promise<any> {
  if (params) {
    const urlObj = new URL(url);
    for (const param in params) {
      if (params.hasOwnProperty(param)) {
        urlObj.searchParams.set(param, params[param]);
      }
    }
    url = urlObj.toString();
  }

  const response = await fetch(url, options);
  return response.json();
}

export function classNames(
  ...classes: (string | boolean | undefined)[]
): string {
  return classes.filter(Boolean).join(" ");
}

export function assertType<T>(item: any, property: string, value: string) {
  if (item[property] === value) {
    return item as T;
  }
}

export function generateThumbnailUrl(proxyUrl: string, videoId: string) {
  return `${proxyUrl}/vi/${videoId}/mqdefault.jpg?host=i.ytimg.com`;
}

export const generateStoryboard = (previewFrames: PreviewFrame | undefined) => {
  if (!previewFrames) return "";
  let output = "WEBVTT\n\n";
  let currentTime = 0;

  for (let url of previewFrames.urls) {
    for (let y = 0; y < previewFrames.framesPerPageY; y++) {
      for (let x = 0; x < previewFrames.framesPerPageX; x++) {
        if (
          currentTime >=
          previewFrames.totalCount * previewFrames.durationPerFrame
        ) {
          break;
        }

        let startX = x * previewFrames.frameWidth;
        let startY = y * previewFrames.frameHeight;

        output += `${formatTime(currentTime)} --> ${formatTime(
          currentTime + previewFrames.durationPerFrame
        )}\n`;
        output += `${url}#xywh=${startX},${startY},${previewFrames.frameWidth},${previewFrames.frameHeight}\n\n`;

        currentTime += previewFrames.durationPerFrame;
      }
    }
  }

  function formatTime(ms: number) {
    let hours = Math.floor(ms / 3600000);
    ms -= hours * 3600000;
    let minutes = Math.floor(ms / 60000);
    ms -= minutes * 60000;
    let seconds = Math.floor(ms / 1000);
    ms -= seconds * 1000;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(3, "0")}`;
  }

  const blob = new Blob([output], { type: "text/vtt" });
  return URL.createObjectURL(blob);
};

export function yieldToMain() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export function getVideoId(item: any): string | undefined {
  const extractVideoId = (url: string | undefined) => {
    let id;
    if (url?.includes("/watch?v=")) {
      id = url.split("/watch?v=")[1];
    } else {
      id = url?.match("vi(?:_webp)?/([a-zA-Z0-9_-]{11})")?.[1];
    }
    return id;
  };

  if (!item) return;

  if (item.videoId) return item.videoId;
  if (item.id) return item.id;
  if (item.url) return extractVideoId(item.url);
  if (item.thumbnailUrl) return extractVideoId(item.thumbnailUrl);
  if (item.thumbnail) return extractVideoId(item.thumbnail);

  return;
}

/**
 * Execute a function with exponential backoff.
 *
 * @param fn - Function to execute
 * @param retries - Maximum number of retries
 * @param minDelay - Minimum delay in milliseconds
 * @param maxDelay - Maximum delay in milliseconds
 * @return Promise containing the result of the function execution
 */
export async function exponentialBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 5,
  minDelay: number = 1000,
  maxDelay: number = 60000
): Promise<T> {
  let attempts = 0;

  if (minDelay >= maxDelay) {
    throw new Error("minDelay should be less than maxDelay.");
  }
  if (retries < 0) {
    throw new Error("Number of retries should be non-negative.");
  }

  while (true) {
    try {
      return await fn();
    } catch (e) {
      attempts++;
      if (attempts > retries) {
        throw new Error("Maximum retries reached.");
      }

      const delay = Math.min(minDelay * Math.pow(2, attempts), maxDelay);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export function isMobile() {
  if (isServer) return false;
  if ((navigator as any).userAgentData) {
    if ((navigator as any).userAgentData.mobile) {
      return true;
    } else if ((navigator as any).userAgentData.mobile === false) {
      return false;
    }
  }
  return (
    navigator.maxTouchPoints > 1 && typeof screen.orientation !== "undefined"
  );
}

export function formatRelativeShort(now: Date, past: Date): string {
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const secondsInAMinute = 60;
  const secondsInAnHour = secondsInAMinute * 60;
  const secondsInADay = secondsInAnHour * 24;
  const secondsInAMonth = secondsInADay * 30.44;
  const secondsInAYear = secondsInADay * 365.25;

  if (diffInSeconds >= secondsInAYear) {
    return `${Math.floor(diffInSeconds / secondsInAYear)}y`;
  } else if (diffInSeconds >= secondsInAMonth) {
    return `${Math.floor(diffInSeconds / secondsInAMonth)}mo`;
  } else if (diffInSeconds >= secondsInADay) {
    return `${Math.floor(diffInSeconds / secondsInADay)}d`;
  } else if (diffInSeconds >= secondsInAnHour) {
    return `${Math.floor(diffInSeconds / secondsInAnHour)}h`;
  } else if (diffInSeconds >= secondsInAMinute) {
    return `${Math.floor(diffInSeconds / secondsInAMinute)}m`;
  } else {
    return `now`;
  }
}
export function parseRelativeTime(relativeTime: string) {
  const now = new Date();
  const regex = /(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/;
  const match = relativeTime.match(regex);

  if (!match) {
    throw new Error("Invalid relative time format");
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "second":
      now.setSeconds(now.getSeconds() - value);
      break;
    case "minute":
      now.setMinutes(now.getMinutes() - value);
      break;
    case "hour":
      now.setHours(now.getHours() - value);
      break;
    case "day":
      now.setDate(now.getDate() - value);
      break;
    case "week":
      now.setDate(now.getDate() - value * 7);
      break;
    case "month":
      now.setMonth(now.getMonth() - value);
      break;
    case "year":
      now.setFullYear(now.getFullYear() - value);
      break;
  }

  return now;
}

/**
 * Debounce a function call.
 *
 * @template T - The type of the `this` context for the function.
 * @template U - The tuple type representing the argument types of the function.
 *
 * @param {(...args: U) => void} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay the function call.
 * @returns {(...args: U) => void} - The debounced function.
 */
export function debounce<T, U extends any[]>(
  func: (this: T, ...args: U) => void,
  wait: number
): (this: T, ...args: U) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (this: T, ...args: U): void {
    const context = this;

    const later = () => {
      timeout = null;
      func.apply(context, args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

export function parseCookie(cookie: string) {
  return cookie
    .split(";")
    .map((v) => v.split("="))
    .reduce(
      (acc, v) => {
        acc[decodeURIComponent(v[0]?.trim())] = decodeURIComponent(
          v[1]?.trim()
        );
        return acc;
      },
      {} as Record<string, string>
    );
}
export function createPlaylist(setStore: SetStoreFunction<Store>) {
  const name = prompt("Playlist name");
  if (!name) return;
  const id = `conduit-${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;
  const playlist: ConduitPlaylist = {
    name,
    relatedStreams: [],
    videos: 0,
    uploader: "You",
    description: "",
    bannerUrl: "",
    uploaderAvatar: "",
    uploaderUrl: "",
    thumbnailUrl: "",
    nextpage: "",
  };
  setStore("playlists", {
    [id]: playlist,
  });
}

export async function sanitizeText(text: string) {
  const dompurify = await import("dompurify");
  const sanitize = dompurify.default().sanitize;
  const t = sanitize(text)
    .replaceAll(
      /(?:http(?:s)?:\/\/)?(?:www\.)?youtube\.com(\/[/a-zA-Z0-9_?=&-]*)/gm,
      "$1"
    )
    .replaceAll(
      /(?:http(?:s)?:\/\/)?(?:www\.)?youtu\.be\/(?:watch\?v=)?([/a-zA-Z0-9_?=&-]*)/gm,
      "/watch?v=$1"
    )
    .replaceAll("\n", "<br>")
    .replace(
      /<a href="\/watch\?v=([a-zA-Z0-9_?=&-]*)&amp;([^"]*)">([a-zA-Z0-9_?=&-:]*)<\/a>/gm,
      (_, videoId, params, textContent) => {
        const url = new URL(`https://youtube.com/watch?v=${videoId}`);
        const searchParams = new URLSearchParams(params);
        const existingParams = new URLSearchParams(window.location.search);

        const timestamp = searchParams.get("t") || "0";

        const allParams = new URLSearchParams();
        searchParams.forEach((value, key) => {
          allParams.set(key, value);
        });
        existingParams.forEach((value, key) => {
          allParams.set(key, value);
        });

        allParams.forEach((value, key) => {
          url.searchParams.set(key, value);
        });

        return `<button class="link" onclick="handleTimestamp('${videoId}','${timestamp}', '${url.search}')">${textContent}</button>`;
      }
    )
    .replaceAll(/<a href/gm, '<a class="link" href');
  return t;
}

export function generateColorFromString(input: string): string {
  const colors: string[] = [
    "#00FFFF",
    "#52E3E1",
    "#2196F3",
    "#03A9F4",
    "#33A8C7",
    "#00BCD4",
    "#A0E426",
    "#FDF148",
    "#FFEB3B",
    "#FFC107",
    "#FFAB00",
    "#FF9800",
    "#F77976",
    "#FF6B6B",
    "#FF5722",
    "#F050AE",
    "#E91E63",
    "#D883FF",
    "#9336FD",
    "#8BC34A",
    "#4CAF50",
  ];

  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export async function testLatency(url: string, numTests: number = 1) {
  let totalTime = 0;
  let successfulTests = 0;

  for (let i = 0; i < numTests; i++) {
    const start = performance.now();

    try {
      const response = await fetch(url);
      if (response.ok) {
        const end = performance.now();
        totalTime += end - start;
        successfulTests++;
      } else {
        console.warn(
          `Test ${i + 1} returned non-OK status: ${response.status}`
        );
      }
    } catch (error) {
      console.error(`Test ${i + 1} failed:`, error);
    }
  }

  if (successfulTests === 0) {
    console.error("No successful tests were conducted.");
    return null;
  }

  return totalTime / successfulTests;
}
