import { PipedVideo, Subtitle } from "~/types";
import { ttml2srt } from "../lib/ttml.js";

/**
 * Modify an HLS (HTTP Live Streaming) manifest to isolate a specific bandwidth and its corresponding audio and video URLs.
 *
 * @param manifest {string} - The original HLS manifest.
 * @param bandwidth {string} - The target bandwidth for filtering streams.
 *
 * @returns {Object} An object containing the updated manifest, selected audio URL, and selected video URL.
 * - updatedManifest {string} - The modified HLS manifest.
 * - selectedAudioUrl {string|null} - The selected audio URL, or null if not found.
 * - selectedVideoUrl {string|null} - The selected video URL, or null if not found.
 *
 * @throws Will throw an error if the manifest does not start with "#EXTM3U".
 */
export function modifyManifest(
  manifest: string,
  bandwidth: string
): {
  updatedManifest: string;
  selectedAudioUrl: string | null;
  selectedVideoUrl: string | null;
} {
  if (!manifest.startsWith("#EXTM3U")) {
    throw new Error("Not a valid manifest file");
  }
  const lines = manifest.split("\n");

  let selectedAudioChannel: string | null = null;
  let selectedAudioUrl: string | null = null;
  let selectedVideoUrl: string | null = null;
  let output: string[] = [];

  // get the audio channel
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (
      line.startsWith("#EXT-X-STREAM-INF") &&
      line.includes(`BANDWIDTH=${bandwidth}`)
    ) {
      const audioMatch = line.match(/AUDIO="(\d+)"/);
      if (audioMatch) {
        selectedAudioChannel = audioMatch[1];
        break;
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("#EXT-X-STREAM-INF")) {
      // check if this line contains the chosen bandwidth
      if (line.includes(`BANDWIDTH=${bandwidth}`)) {
        // add the line to the output
        output.push(line);

        if (i + 1 < lines.length) {
          selectedVideoUrl = lines[i + 1];
          output.push("{video}");
          i++; // skip the next line as we've replaced it
        }
      } else {
        i++; // skip the next url as it's irrelevant
      }
    } else if (line.startsWith("#EXT-X-MEDIA")) {
      const uriMatch = line.match(/URI="([^"]+)"/);
      if (selectedAudioChannel !== null) {
        // check if this line contains the chosen audio channel
        if (line.includes(`GROUP-ID="${selectedAudioChannel}"`)) {
          // store the audio url and replace the uri with "{audio}"
          if (uriMatch) {
            selectedAudioUrl = uriMatch[1];
          }
          const replacedLine = line.replace(/URI="[^"]+"/, 'URI="{audio}"');
          output.push(replacedLine);
        }
      }
    } else {
      // keep all other relevant lines
      output.push(line);
    }
  }

  const result = {
    updatedManifest: output.join("\n"),
    selectedAudioUrl: selectedAudioUrl,
    selectedVideoUrl: selectedVideoUrl,
  };

  return result;
}

/**
 * Modify a VOD (Video-On-Demand) HLS manifest to isolate segment information and metadata.
 *
 * @param manifest {string} - The original HLS VOD manifest.
 *
 * @returns {Object} An object containing the updated manifest, map, and list of segments.
 * - modifiedManifest {string} - The modified HLS VOD manifest.
 * - map {string} - The URL of the map (Initialization segment), or an empty string if not found.
 * - segments {string[]} - An array containing the URLs of the video segments.
 */
export function modifyManifestVOD(manifest: string): {
  modifiedManifest: string;
  map: string;
  segments: string[];
} {
  // Split the manifest by lines
  const lines = manifest.split("\n");

  let output: string[] = [];
  let map: string = "";
  let segments: string[] = [];

  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("#EXT-X-MAP")) {
      i++;
      // Extract map URI
      // const mapMatch = line.match(/URI="([^"]+)"/);
      // if (mapMatch) {
      //   map = mapMatch[1];
      // }
      // // Replace the URI with "{map}"
      // const replacedLine = line.replace(/URI="[^"]+"/, 'URI="{map}"');
      // output.push(replacedLine);
    } else if (line.startsWith("#EXTINF")) {
      // Add the #EXTINF line to the output
      output.push(line);
      if (i + 1 < lines.length) {
        segments.push(lines[i + 1]); // Add the URL to segments
        output.push("{segment}");
        i++; // Skip the next line as we've replaced it
      }
    } else {
      // Keep lines that aren't map or #EXTINF info
      output.push(line);
    }
  }

  return {
    modifiedManifest: output.join("\n"),
    map: map,
    segments: segments,
  };
}

/**
 * Fetch and save video segments to a local directory.
 *
 * @param {string} instance - The base URL where the segments are located.
 * @param {string} dirName - The directory name where the segments will be saved.
 * @param {string[]} segments - An array containing the segment URLs.
 * @param {number} [maxRetries=3] - The maximum number of retries to fetch a segment.
 *
 * @returns {Promise<string[]>} A Promise resolving to an array of local segment names.
 *
 * @throws Will throw an error if the directory handle is not obtained.
 */

const filterVideoInfo = (videoData: PipedVideo) => {
  return {
    title: videoData.title,
    description: videoData.description,
    uploadDate: videoData.uploadDate,
    uploader: videoData.uploader,
    uploaderUrl: videoData.uploaderUrl,
    category: videoData.category,
    license: videoData.license,
    visibility: videoData.visibility,
    tags: videoData.tags,
    duration: videoData.duration,
    uploaderVerified: videoData.uploaderVerified,
    views: videoData.views,
    likes: videoData.likes,
    dislikes: videoData.dislikes,
    uploaderSubscriberCount: videoData.uploaderSubscriberCount,
    chapters: videoData.chapters,
    subtitles: videoData.subtitles.map((sub) => sub.code),
    previewFrames: videoData.previewFrames,
  };
};

async function fetchVideoData(
  videoId: string,
  apiUrl: string
): Promise<PipedVideo> {
  const response = await fetch(`${apiUrl}/streams/${videoId}`);
  const videoData = (await response.json()) as PipedVideo;
  if (!videoData || (videoData as any).error) {
    throw new Error(
      `Failed to fetch video data for ${videoId}: ${response.status} ${response.statusText}`
    );
  }
  return videoData;
}
interface SaveParams<T> {
  data: T;
  handle: FileSystemFileHandle;
}

async function saveAsset<T>({ data, handle }: SaveParams<T>): Promise<void> {
  const writableStream = await (handle as any).createWritable();
  await writableStream.write(data);
  await writableStream.close();
}

export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number
): Promise<T> {
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (retries >= maxRetries) {
        throw new Error(`Failed after ${maxRetries} retries.`);
      }
      retries++;
    }
  }
}

export async function fetchSegments(
  instance: string,
  segments: string[],
  maxRetries: number = 3,
  progressCallback?: (progress: number) => void
): Promise<Blob[]> {
  const localSegments: Blob[] = [];

  for (let i = 0; i < segments.length; i++) {
    try {
      const segmentData = await fetchAssetData(
        async (url) =>
          await retry(async () => await fetchBlob(url), maxRetries),
        { url: `${instance}${segments[i]}` }
      );
      if (!segmentData) {
        throw new Error("Failed to fetch segment data.");
      }
      localSegments.push(segmentData);

      if (progressCallback) {
        progressCallback(((i + 1) / segments.length) * 100);
      }
    } catch (error) {
      console.error(`Error fetching or saving segment ${i}:`, error);
      break;
    }
  }

  if (localSegments.length !== segments.length) {
    throw new Error("Failed to fetch all segments.");
  }

  return localSegments;
}

type Fetcher<T> = (url: string) => Promise<T>;

export async function fetchAssetData<T>(
  fetcher: Fetcher<T>,
  { url }: { url: string }
): Promise<T> {
  const data = await fetcher(url);
  return data;
}

export const fetchText = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`
    );
  }
  return await response.text();
};

export const fetchBlob = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`
    );
  }
  return await response.blob();
};

/* Download a video including its metadata, segments, and other assets.
 *
 * @param {string} videoId - The ID of the video to be downloaded.
 * @param {string} [apiUrl="https://pipedapi.kavin.rocks"] - The API endpoint to fetch video details.
 *
 * @throws Will throw an error if downloading the video fails at any stage.
 */
export interface DownloadProgress {
  stage: string;
  stageIndex: number;
  progress: number;
  totalStages: number;
}
export async function downloadVideo(
  videoId: string,
  apiUrl: string = "https://pipedapi.kavin.rocks",
  resolution: number = 1080,
  subtitleCode?: string,
  progressCallback?: (progress: DownloadProgress) => void
) {
  try {
    const totalStages = subtitleCode ? 11 : 10;
    let currentStage = 0;
    const updateProgress = (stage: string, progress: number = 100) => {
      console.log("updating progress", stage, currentStage);
      currentStage++;
      if (progressCallback) {
        progressCallback({
          stage,
          stageIndex: currentStage,
          progress,
          totalStages,
        });
      }
    };

    console.log("Fetching video data...");
    updateProgress("Downloading video data");

    const videoData = await fetchVideoData(videoId, apiUrl);
    console.log("Video data fetched.", videoData);

    console.log("Getting directory handle...");
    const root = await navigator.storage.getDirectory();
    const allVideosDir = await root.getDirectoryHandle("__videos", {
      create: true,
    });
    const videoDir = await allVideosDir.getDirectoryHandle(videoId, {
      create: true,
    });
    const streamsHandle = await videoDir.getFileHandle("streams.json", {
      create: true,
    });

    const filteredVideoInfo = filterVideoInfo(videoData);
    console.log("Filtered video info:", filteredVideoInfo);

    console.log("Saving video info...");
    await saveAsset({
      data: JSON.stringify(filteredVideoInfo),
      handle: streamsHandle,
    });
    console.log("Video info saved.");

    const baseProxyUrl = videoData.hls.split("/api")[0];

    console.log("Fetching manifest...");
    updateProgress("Downloading manifest");
    const initialManifest = await fetchAssetData(
      async (url) => {
        return retry(async () => {
          return await fetchText(url);
        }, 3);
      },
      {
        url: videoData.hls,
      }
    );
    console.log("Manifest fetched.", initialManifest);
    if (!initialManifest || !initialManifest.includes("#EXTM3U")) {
      throw new Error("Failed to fetch manifest.");
    }

    const findBandwithByResolution = (resolution: number, manifest: string) => {
      const lines = manifest.split("\n");
      const line = lines.find((line) => line.includes(resolution.toString()));
      if (!line) throw new Error(`Could not find resolution ${resolution}`);
      const bw = line.split("BANDWIDTH=")?.[1]?.match(/([0-9])*/g)?.[0];
      if (!bw)
        throw new Error(
          `Could not find the matching bandwidth for ${resolution}`
        );
      return bw;
    };

    const videoBandwidth = findBandwithByResolution(
      resolution,
      initialManifest
    );
    console.log("Video bandwidth:", videoBandwidth);

    const manifestResults = modifyManifest(initialManifest, videoBandwidth);

    console.log("Modified manifest:", manifestResults);
    if (
      !manifestResults ||
      !manifestResults.updatedManifest ||
      !manifestResults.updatedManifest.includes("#EXTM3U")
    ) {
      throw new Error("Failed to modify manifest.");
    }

    const manifestIndexHandle = await videoDir.getFileHandle("index.m3u8", {
      create: true,
    });

    console.log("Saving manifest...");
    saveAsset({
      data: manifestResults.updatedManifest,
      handle: manifestIndexHandle,
    });
    console.log("Manifest saved.");

    if (!manifestResults.selectedVideoUrl) {
      throw new Error("Failed to find a matching video URL.");
    }
    if (!manifestResults.selectedAudioUrl) {
      throw new Error("Failed to find a matching audio URL.");
    }

    console.log("Fetching audio manifest...");

    updateProgress("Downloading HLS audio manifest");
    const audioManifestContent = await fetchAssetData(
      async (url) => {
        return retry(async () => {
          return await fetchText(url);
        }, 3);
      },
      {
        url: `${baseProxyUrl}${manifestResults.selectedAudioUrl}`,
      }
    );
    console.log("Audio manifest fetched.", audioManifestContent);

    console.log("Fetching video manifest...");
    updateProgress("Downloading HLS video manifest");
    const videoManifestContent = await fetchAssetData(
      async (url) => {
        return retry(async () => {
          return await fetchText(url);
        }, 3);
      },
      {
        url: `${baseProxyUrl}${manifestResults.selectedVideoUrl}`,
      }
    );
    console.log("Video manifest fetched.", videoManifestContent);

    const modifiedAudioManifest = modifyManifestVOD(audioManifestContent);
    const modifiedVideoManifest = modifyManifestVOD(videoManifestContent);

    console.log("Saving audio manifest...");
    const audioSegmentsDir = await videoDir.getDirectoryHandle(`audio`, {
      create: true,
    });
    const audioFile = await audioSegmentsDir.getFileHandle("audio.m3u8", {
      create: true,
    });
    saveAsset({
      data: modifiedAudioManifest.modifiedManifest,
      handle: audioFile,
    });
    console.log("Audio manifest saved.");

    console.log("Saving video manifest...");
    const videoSegmentsDir = await videoDir.getDirectoryHandle(`video`, {
      create: true,
    });
    const videoFile = await videoSegmentsDir.getFileHandle("video.m3u8", {
      create: true,
    });
    saveAsset({
      data: modifiedVideoManifest.modifiedManifest,
      handle: videoFile,
    });
    console.log("Video manifest saved.");

    console.log("Fetching audio segments...");

    updateProgress("Downloading audio segments", 0);
    const audioSegments = await fetchSegments(
      baseProxyUrl,
      modifiedAudioManifest.segments,
      3,
      (segmentProgress) => {
        if (progressCallback) {
          progressCallback({
            stage: "Downloading audio segments",
            stageIndex: currentStage,
            progress: segmentProgress,
            totalStages,
          });
        }
      }
    );
    console.log("Audio segments fetched.", audioSegments);

    console.log("Saving audio segments...");
    for (let i = 0; i < audioSegments.length; i++) {
      const segmentName = `segment-${i}.ts`;
      const segmentHandle = await audioSegmentsDir.getFileHandle(segmentName, {
        create: true,
      });
      saveAsset({
        data: audioSegments[i],
        handle: segmentHandle,
      });
    }
    console.log("Audio segments saved.");

    console.log("Fetching video segments...");
    updateProgress("Downloading video segments", 0);
    const videoSegments = await fetchSegments(
      baseProxyUrl,
      modifiedVideoManifest.segments,
      3,
      (segmentProgress) => {
        if (progressCallback) {
          progressCallback({
            stage: "Downloading video segments",
            stageIndex: currentStage,
            progress: segmentProgress,
            totalStages,
          });
        }
      }
    );
    console.log("Video segments fetched.", videoSegments);

    console.log("Saving video segments...");
    for (let i = 0; i < videoSegments.length; i++) {
      const segmentName = `segment-${i}.ts`;
      const segmentHandle = await videoSegmentsDir.getFileHandle(segmentName, {
        create: true,
      });
      saveAsset({
        data: videoSegments[i],
        handle: segmentHandle,
      });
    }
    console.log("Video segments saved.");

    if (subtitleCode) {
      if (videoData.subtitles.length > 0) {
        console.log("Fetching subtitles...");
        updateProgress("Downloading subtitles");
        const subtitle = videoData.subtitles.find(
          (subtitle) => subtitle.code === subtitleCode
        );
        console.log("Subtitle fetched.", subtitle);
        if (subtitle) {
          console.log("Converting subtitles...");
          const subs = await ttml2srt(subtitle.url, null);
          console.log("Subtitles converted.", subs);
          console.log("Saving subtitles...");
          const subtitleHandle = await videoDir.getFileHandle(
            `${subtitle.code}.srt`,
            { create: true }
          );
          saveAsset({
            data: subs,
            handle: subtitleHandle,
          });
          console.log("Subtitles saved.");
        }
      }
    }
    console.log("Fetching thumbnail...");
    updateProgress("Downloading thumbnail");
    const thumbnail = await fetchAssetData(
      (url) => {
        return retry(async () => {
          return await fetchBlob(url);
        }, 3);
      },
      {
        url: videoData.thumbnailUrl,
      }
    );
    console.log("Thumbnail fetched.", thumbnail);
    console.log("Saving thumbnail...");
    const thumbnailHandle = await videoDir.getFileHandle("thumbnail", {
      create: true,
    });
    saveAsset({
      data: thumbnail,
      handle: thumbnailHandle,
    });
    console.log("Thumbnail saved.");

    console.log("Fetching channel logo...");
    updateProgress("Downloading channel picture");
    const channelIcon = await fetchAssetData(
      (url) => {
        return retry(async () => {
          return await fetchBlob(url);
        }, 3);
      },
      {
        url: videoData.thumbnailUrl,
      }
    );
    console.log("Channel logo fetched.", channelIcon);
    console.log("Saving channel logo...");
    const channelIconHandle = await videoDir.getFileHandle("channel-icon", {
      create: true,
    });
    saveAsset({
      data: channelIcon,
      handle: channelIconHandle,
    });
    console.log("Channel logo saved.");

    console.log("Fetching preview frames...");
    updateProgress("Downloading preview frames");
    const previewFramesDir = await videoDir.getDirectoryHandle(
      `preview-frames`,
      {
        create: true,
      }
    );
    let index = 0;
    for (const url of videoData.previewFrames[1].urls) {
      const frame = await fetchAssetData(
        (url) => {
          return retry(async () => {
            return await fetchBlob(url);
          }, 3);
        },
        {
          url,
        }
      );
      console.log(`Getting file handle: preview-frame-${url.split("/").pop()}`);
      const frameHandle = await previewFramesDir.getFileHandle(`${index}`, {
        create: true,
      });
      console.log("Saving preview frame...", frame);
      saveAsset({
        data: frame,
        handle: frameHandle,
      });
      index++;
      console.log("Preview frame saved.");
    }
    // Create file to mark as completed
    await videoDir.getFileHandle("completed", { create: true });
    updateProgress("Completed");
  } catch (error) {
    console.error("Error downloading the video:", error);
    throw error;
  }
}

/**
 * Reads a manifest file and returns its content as an array of lines.
 *
 * @param directory - Directory handle containing the manifest file.
 * @param manifestFile - Name of the manifest file.
 * @returns An array containing lines of the manifest file.
 */
const readManifestFileFromDirectory = async (
  directory: any,
  manifestFile: string
) => {
  console.log("Reading manifest file...");
  const fileHandle = await directory.getFileHandle(manifestFile);
  const file = await fileHandle.getFile();
  console.log("Manifest file read.");
  return (await file.text()).split("\n");
};

/**
 * Generates HLS content with the segments replaced.
 *
 * @param directory - Directory handle containing the segment files.
 * @param manifestContent - An array containing lines of the manifest file.
 * @returns A Blob URL containing the processed HLS content.
 */
const rebuildManifest = async (directory: any, manifestContent: string[]) => {
  console.log("Rebuilding manifest...", directory, manifestContent);
  let content = "";
  let segmentIndex = 0;
  for (let line of manifestContent) {
    console.log("Processing line...", line);
    if (line.includes("{segment}")) {
      const segmentFileHandle = await directory.getFileHandle(
        `segment-${segmentIndex}.ts`
      );
      console.log("Getting segment file...", segmentFileHandle);
      const segmentFile = await segmentFileHandle.getFile();
      const segmentUrl = URL.createObjectURL(segmentFile);
      line = line.replace("{segment}", segmentUrl);
      segmentIndex++;
    }
    content += `${line}\n`;
  }
  console.log("Manifest rebuilt.", content);
  return URL.createObjectURL(new Blob([content]));
};

/**
 * Generates an HLS manifest for a given video.
 *
 * @param videoId - The video ID.
 * @returns A Blob URL pointing to the HLS manifest.
 */
export async function getHlsManifest(videoId: string) {
  console.time("manifest generating");

  console.log("Getting video data...");
  const storageRoot = await navigator.storage.getDirectory();
  const allVideosDir = await storageRoot.getDirectoryHandle("__videos");
  const videoDirectory = await allVideosDir.getDirectoryHandle(videoId, {
    create: false,
  });

  console.log("Reading video manifest...");
  const audioDirectory = await videoDirectory.getDirectoryHandle("audio");
  const videoDirectoryHandle = await videoDirectory.getDirectoryHandle("video");

  const audioManifestContent = await readManifestFileFromDirectory(
    audioDirectory,
    "audio.m3u8"
  );
  const videoManifestContent = await readManifestFileFromDirectory(
    videoDirectoryHandle,
    "video.m3u8"
  );

  console.log("Rebuilding audio manifest...", audioManifestContent);
  const audioContentUrl = await rebuildManifest(
    audioDirectory,
    audioManifestContent
  );

  console.log("Rebuilding video manifest...", videoManifestContent);
  const videoContentUrl = await rebuildManifest(
    videoDirectoryHandle,
    videoManifestContent
  );

  console.log("Generating master manifest...");
  const indexManifestHandle = await videoDirectory.getFileHandle("index.m3u8");
  console.log("master manifest handle", indexManifestHandle);
  const indexFile = await indexManifestHandle.getFile();
  console.log("master manifest file", indexFile);
  const indexContent = (await indexFile.text())
    .replace("{audio}", audioContentUrl)
    .replace("{video}", videoContentUrl);
  console.log("master manifest content", indexContent);

  console.timeEnd("manifest generating");

  return URL.createObjectURL(new Blob([indexContent]));
}

export const getStreams = async (videoId: string) => {
  console.log("Getting streams...");
  const storageRoot = await navigator.storage.getDirectory();
  console.log("Storage root:", storageRoot);
  const allVideosDir = await storageRoot.getDirectoryHandle("__videos");
  const videoDirectory = await allVideosDir.getDirectoryHandle(videoId, {
    create: false,
  });
  console.log("Video directory:", videoDirectory);
  if (!videoDirectory) {
    return null;
  }
  const streamsFileHandle = await videoDirectory.getFileHandle("streams.json");
  const streamsFile = await streamsFileHandle.getFile();
  console.log("Streams file:", streamsFile);

  const text = await streamsFile.text();
  const streams = JSON.parse(text);
  console.log("Streams:", streams);
  if (!streams) throw new Error("Streams not found");
  const thumbnailFileHandle = await videoDirectory.getFileHandle("thumbnail");
  const thumbnailFile = await thumbnailFileHandle.getFile();
  const thumbnailUrl = URL.createObjectURL(thumbnailFile);
  console.log("Thumbnail URL:", thumbnailUrl);

  const channelIconFileHandle =
    await videoDirectory.getFileHandle("channel-icon");
  console.log("Channel icon file handle:", channelIconFileHandle);
  const channelIconFile = await channelIconFileHandle.getFile();
  const channelIconUrl = URL.createObjectURL(channelIconFile);

  console.log("Channel icon URL:", channelIconUrl);
  const subtitles = [];
  streams.thumbnailUrl = thumbnailUrl;
  streams.uploaderAvatar = channelIconUrl;
  try {
    const subtitlesDirectory = await videoDirectory.getDirectoryHandle(
      `subtitles`,
      {
        create: false,
      }
    );
    console.log("Subtitles directory:", subtitlesDirectory);
    for (const code of streams.subtitles) {
      const subtitleFileHandle = await subtitlesDirectory.getFileHandle(
        `${code}.srt`
      );
      const subtitleFile = await subtitleFileHandle.getFile();
      const subtitleUrl = URL.createObjectURL(subtitleFile);
      subtitles.push({
        code,
        url: subtitleUrl,
      });
    }
  } catch (error) {
    console.log("Error getting subtitles:", error);
  }

  if (subtitles.length > 0) {
    streams.subtitles = subtitles;
  }
  console.log("Getting preview frames...");
  let previewFramesDirectory;

  try {
    previewFramesDirectory = await videoDirectory.getDirectoryHandle(
      `preview-frames`,
      {
        create: false,
      }
    );
  } catch (error) {
    console.log("Error getting preview frames:", error);
  }
  console.log("Preview frames directory:", previewFramesDirectory);
  const urls = [];
  let index = 0;
  if (previewFramesDirectory) {
    try {
      for (const frameUrl of streams.previewFrames[1].urls) {
        const frameFileHandle = await previewFramesDirectory.getFileHandle(
          `${index}`
        );
        const frameFile = await frameFileHandle.getFile();
        const frameUrl = URL.createObjectURL(frameFile);
        urls.push(frameUrl);
        index++;
      }
    } catch (error) {
      console.log("Error getting preview frames:", error);
    }
  }
  console.log("Preview frames URLs:", urls);
  streams.previewFrames[1].urls = urls;
  console.log("Streams:", streams);

  return streams;
};
