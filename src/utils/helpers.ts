import { isServer } from "solid-js/web";
import { PipedVideo, PreviewFrame, RelatedStream } from "~/types";

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
// export function isMobile() {
//   if (isServer) return false;
//   const userAgent = navigator.userAgent || navigator.vendor || window.opera;
//
//   // Regular expressions to match mobile devices
//   const mobileRegex =
//     /(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i;
//
//   // Check if user agent matches mobile patterns
//   if (mobileRegex.test(userAgent)) {
//     return true;
//   }
//
//   // Additional check for iPad which is sometimes considered as a desktop device
//   if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
//     return true;
//   }
//
//   // Fallback for touch events support
//   return (
//     "ontouchstart" in window ||
//     navigator.maxTouchPoints > 0 ||
//     navigator.msMaxTouchPoints > 0
//   );
// }

export function formatRelativeShort(now: Date, past: Date): string {
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const secondsInAMinute = 60;
  const secondsInAnHour = secondsInAMinute * 60;
  const secondsInADay = secondsInAnHour * 24;
  const secondsInAMonth = secondsInADay * 30; // rough average
  const secondsInAYear = secondsInADay * 365; // ignoring leap years for simplicity

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
export function relativeTimeFormatter(now: Date, past:Date): string {
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.44); // average days in a month
  const years = Math.floor(days / 365.25); // average days in a year considering leap years

  if (seconds < 60) {
      return `${seconds} seconds ago`;
  } else if (minutes < 60) {
      return `${minutes} minutes ago`;
  } else if (hours < 24) {
      return `${hours} hours ago`;
  } else if (days === 1) {
      return `yesterday`;
  } else if (days < 7) {
      return `${days} days ago`;
  } else if (weeks === 1) {
      return `last week`;
  } else if (weeks < 5) {
      return `${weeks} weeks ago`;
  } else if (months === 1) {
      return `last month`;
  } else if (months < 12) {
      return `${months} months ago`;
  } else if (years === 1) {
      return `last year`;
  } else {
      const remainingMonths = Math.floor((days % 365.25) / 30.44);
      if (remainingMonths > 0) {
          return `${years} years and ${remainingMonths} months ago`;
      } else {
          return `${years} years ago`;
      }
  }
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
