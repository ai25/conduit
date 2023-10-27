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


export const generateStoryboard = (
    previewFrames: PreviewFrame | undefined
  ) => {
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
    return id
  };

  if (!item) return 

  if (item.videoId) return item.videoId;
  if (item.id) return item.id;
  if (item.url) return extractVideoId(item.url);
  if (item.thumbnailUrl) return extractVideoId(item.thumbnailUrl);
  if (item.thumbnail) return extractVideoId(item.thumbnail);

  return
}
