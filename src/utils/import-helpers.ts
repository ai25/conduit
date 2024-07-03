import { DEFAULT_PREFERENCES } from "~/stores/preferencesStore";
import { Store } from "~/stores/syncStore";

export interface ExportOptions {
  history?: boolean;
  subscriptions?: boolean;
  playlists?: boolean;
  watchLater?: boolean;
  preferences?: boolean;
}

type ExportDataParameters<T extends ExportOptions> = T extends {
  preferences: true;
}
  ? [options: T, store: Store, preferencesStore: typeof DEFAULT_PREFERENCES]
  : [options: T, store: Store, preferencesStore?: typeof DEFAULT_PREFERENCES];
export function exportConduitData<T extends ExportOptions>(
  ...args: ExportDataParameters<T>
) {
  const [options, store, preferencesStore] = args;
  const {
    history = false,
    subscriptions = false,
    playlists = false,
    watchLater = false,
    preferences = false,
  } = options;

  const exportData: any = {
    platform: "Conduit",
    version: 1,
  };

  const exportedItems: string[] = [];

  if (history) {
    exportData.history = store.history;
    exportedItems.push("history");
  }

  if (subscriptions) {
    exportData.subscriptions = store.subscriptions;
    exportedItems.push("subscriptions");
  }

  if (playlists) {
    exportData.playlists = store.playlists;
    exportedItems.push("playlists");
  }

  if (watchLater) {
    exportData.watchLater = store.watchLater;
    exportedItems.push("watchLater");
  }

  if (preferences) {
    if (preferencesStore) {
      exportData.preferences = preferencesStore;
      exportedItems.push("preferences");
    } else {
      throw new Error(
        "Preferences export was requested but preferencesStore was not provided"
      );
    }
  }

  if (exportedItems.length === 0) {
    console.warn("No data selected for export");
    return;
  }

  const toExport = JSON.stringify(exportData, null, 2);
  const blob = new Blob([toExport], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  const exportedItemsString = exportedItems.join("-");
  let fileName = `conduit-${exportedItemsString}-${new Date().toISOString()}.json`;

  if (exportedItems.length === 5) {
    fileName = `conduit-data-${new Date().toISOString()}.json`;
  }

  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function processConduitHistory(text: string): any[] | null {
  if (!text.includes("Conduit")) return null;

  const json = JSON.parse(text);
  console.log(json);
  const history = Object.values(json.history);
  console.log(history);
  return history;
}

export function processYouTubeHistory(text: string): any[] | null {
  if (!(text.includes("products") && text.includes("YouTube"))) return null;

  const json = JSON.parse(text);
  console.log(json);
  const items = json.map((video: any) => ({
    url: video.titleUrl.split("https://www.youtube.com")[1],
    title: video.title,
    uploaderName: video.subtitles[0].name,
    uploaderUrl: video.subtitles[0].url.split("https://www.youtube.com")[1],
    watchedAt: new Date(video.time).getTime(),
  }));
  console.log(items);
  return items.sort((a: any, b: any) => b.watchedAt - a.watchedAt);
}

export function processLibreTubeHistory(text: string): any[] | null {
  if (!text.includes("watchPositions")) return null;

  console.log("LibreTube");
  const json = JSON.parse(text);
  const lt = json.watchHistory.map((video: any) => ({
    url: `/watch?v=${video.videoId}`,
    duration: video.duration,
    thumbnail: video.thumbnailUrl,
    title: video.title,
    uploaderName: video.uploader,
    uploaderUrl: video.uploaderUrl,
    uploaded: new Date(video.uploadDate).getTime(),
    currentTime:
      json.watchPositions.find((i: any) => i.videoId === video.videoId)
        ?.position / 1000 ?? 0,
  }));
  return lt.sort((a: any, b: any) => b.watchedAt - a.watchedAt);
}

export function processPipedHistory(text: string): any[] | null {
  if (!text.includes("watchHistory")) return null;

  const json = JSON.parse(text);
  console.log(json);
  const items = json.watchHistory.map((video: any) => ({
    duration: video.duration,
    url: video.url,
    title: video.title,
    uploaderName: video.uploaderName,
    uploaderUrl: video.uploaderUrl,
    watchedAt: video.watchedAt ?? 0,
    currentTime: video.currentTime ?? 0,
  }));
  return items.sort((a: any, b: any) => b.watchedAt - a.watchedAt);
}

export function processFreeTubeHistory(text: string): any[] | null {
  if (!text.startsWith(`{"videoId:`)) return null;

  text = `[${text.replace(/\n/g, ", ").slice(0, -2)}]`;
  let json = JSON.parse(text);
  console.log(json);
  const ft = json
    .map((video: any) => ({
      duration: video.duration,
      thumbnail: video.thumbnail,
      title: video.title,
      uploaderName: video.author,
      uploaderUrl: video.authorUrl,
      videoId: video.videoId,
      watchedAt: video.watchedDate,
      currentTime: video.currentTime,
    }))
    .sort((a: any, b: any) => b.watchedAt - a.watchedAt);
  return ft;
}

export function processInvidiousHistory(text: string): any[] | null {
  if (!text.startsWith(`{"subscriptions":`)) return null;

  const json = JSON.parse(text);
  console.log(json);
  const iv = json.watch_history.map((video: any) => ({
    videoId: video,
    watchedAt: 0,
    currentTime: 0,
  }));
  return iv;
}

export function processConduitSubscriptions(text: string): any | null {
  if (!text.includes("Conduit")) return null;

  console.log("Conduit");
  const json = JSON.parse(text);
  console.log(json);
  return json.subscriptions;
}

export function processInvidiousOPMLSubscriptions(text: string): any | null {
  if (text.indexOf("opml") === -1) return null;

  console.log("Invidious");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, "text/xml");
  let subscriptions: Record<string, { subscribedAt: number }> = {};
  xmlDoc.querySelectorAll("outline[xmlUrl]").forEach((item) => {
    const url = item.getAttribute("xmlUrl");
    const id = url?.slice(-24);
    if (id) {
      subscriptions[id] = { subscribedAt: Date.now() };
    }
  });
  return subscriptions;
}

export function processLibreTubeSubscriptions(text: string): any | null {
  if (text.indexOf("localSubscriptions") === -1) return null;

  console.log("LibreTube");
  const json = JSON.parse(text);
  let subscriptions: Record<string, { subscribedAt: number }> = {};
  json.localSubscriptions.forEach((item: any) => {
    subscriptions[item.channelId] = { subscribedAt: Date.now() };
  });
  return subscriptions;
}

export function processNewPipeSubscriptions(text: string): any | null {
  if (text.indexOf("app_version") === -1) return null;

  console.log("NewPipe");
  const json = JSON.parse(text);
  let subscriptions: Record<string, { subscribedAt: number }> = {};
  json.subscriptions
    .filter((item: any) => item.service_id == 0)
    .forEach((item: any) => {
      const url = item.url;
      const id = url.slice(-24);
      subscriptions[id] = { subscribedAt: Date.now() };
    });
  return subscriptions;
}

export function processInvidiousJSONSubscriptions(text: string): any | null {
  if (text.indexOf("thin_mode") === -1) return null;

  console.log("Invidious JSON");
  const json = JSON.parse(text);
  let subscriptions: Record<string, { subscribedAt: number }> = {};
  json.subscriptions.forEach((id: string) => {
    subscriptions[id] = { subscribedAt: Date.now() };
  });
  return subscriptions;
}

export function processFreeTubeDBSubscriptions(text: string): any | null {
  if (text.indexOf("allChannels") === -1) return null;

  console.log("FreeTube DB");
  const json = JSON.parse(text);
  let subscriptions: Record<string, { subscribedAt: number }> = {};
  json.subscriptions.forEach((item: any) => {
    subscriptions[item.id] = { subscribedAt: Date.now() };
  });
  return subscriptions;
}

export function processFreeTubeJSONSubscriptions(text: string): any | null {
  if (text.indexOf("subscriptions") === -1) return null;

  console.log("FreeTube JSON");
  const json = JSON.parse(text);
  let subscriptions: Record<string, { subscribedAt: number }> = {};
  json.subscriptions.forEach((item: any) => {
    subscriptions[item.id] = { subscribedAt: Date.now() };
  });
  return subscriptions;
}

export function processGoogleTakeoutJSONSubscriptions(
  text: string
): any | null {
  if (text.indexOf("contentDetails") === -1) return null;

  console.log("Google Takeout JSON");
  const json = JSON.parse(text);
  let subscriptions: Record<string, { subscribedAt: number }> = {};
  json.forEach((item: any) => {
    const id = item.snippet.resourceId.channelId;
    subscriptions[id] = { subscribedAt: Date.now() };
  });
  return subscriptions;
}

export function processGoogleTakeoutCSVSubscriptions(
  text: string,
  fileName: string
): any | null {
  if (fileName.length < 5 || fileName.slice(-4).toLowerCase() !== ".csv")
    return null;

  console.log("Google Takeout CSV");
  const lines = text.split("\n");
  let subscriptions: Record<string, { subscribedAt: number }> = {};
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const id = line.slice(0, line.indexOf(","));
    if (id.length === 24) {
      subscriptions[id] = { subscribedAt: Date.now() };
    }
  }
  return subscriptions;
}
