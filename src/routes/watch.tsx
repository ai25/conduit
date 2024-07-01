// TODO: Integrate offline playback
import Description from "~/components/Description";
import {
  Show,
  createEffect,
  createSignal,
  onMount,
  onCleanup,
  createMemo,
} from "solid-js";
import { For } from "solid-js";
import { getHlsManifest, getStreams } from "~/utils/hls";
import { usePlaylist } from "~/stores/playlistStore";
import { useSyncStore } from "~/stores/syncStore";
import { useAppState } from "~/stores/appStateStore";
import { createQuery } from "@tanstack/solid-query";
import { Chapter } from "~/types";
import { usePreferences } from "~/stores/preferencesStore";
import { Suspense } from "solid-js";
import numeral from "numeral";
import { isServer } from "solid-js/web";
import RelatedVideos from "~/components/RelatedVideos";
import Comments from "~/components/Comments";
import { getVideoId, isMobile } from "~/utils/helpers";
import PlaylistItem from "~/components/content/playlist/PlaylistItem";
import { useLocation, useSearchParams } from "@solidjs/router";
import { useVideoContext } from "~/stores/VideoContext";

export interface SponsorSegment {
  category: string;
  actionType: string;
  segment: number[];
  UUID: string;
  videoDuration: number;
  locked: number;
  votes: number;
  description: string;
}

export async function fetchWithTimeout(
  resource: string,
  options: RequestInit & { timeout: number } = { timeout: 800 }
) {
  const { timeout } = options;

  const controller = new AbortController();
  const id = setTimeout(() => {
    console.log("aborting");
    controller.abort(`Request exceeded timeout of ${timeout}ms.`);
  }, timeout);
  console.log("fetching", controller.signal);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}

export default function WatchRoute() {
  return <></>;
}
