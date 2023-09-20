import { PipedVideo, Subtitle } from "~/types";
import { ttml2srt } from "./ttml.js";

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

export async function fetchAndSaveSegments(
  instance: string,
  dirName: string,
  segments: string[],
  maxRetries = 3
): Promise<string[]> {
  const root = await navigator.storage.getDirectory();
  const dirs = dirName.split("/");
  let dirHandle;
  if (dirs.length === 1) {
    dirHandle = await root.getDirectoryHandle(dirName, { create: true });
  } else if (dirs.length === 2) {
    dirHandle = await (
      await root.getDirectoryHandle(dirs[0])
    ).getDirectoryHandle(dirs[1]);
  }
  if (!dirHandle) {
    throw Error("no dir handle");
  }
  const localSegments: string[] = [];

  async function fetchSegmentWithRetry(
    segmentUrl: string,
    retryCount: number = maxRetries
  ): Promise<Blob> {
    try {
      const response = await fetch(`${instance}${segmentUrl}`);
      if (!response.ok) throw new Error("Failed to fetch segment");
      return await response.blob();
    } catch (error) {
      if (retryCount <= 0)
        throw new Error(`Failed to fetch segment after ${maxRetries} retries.`);
      return fetchSegmentWithRetry(segmentUrl, retryCount - 1);
    }
  }

  for (let i = 0; i < segments.length; i++) {
    try {
      const segmentData = await fetchSegmentWithRetry(segments[i]);

      const segmentName = `segment${i}.ts`;
      localSegments.push(segmentName);

      const segmentFileHandle = await dirHandle.getFileHandle(segmentName, {
        create: true,
      });
      const writableStream = await segmentFileHandle.createWritable();

      await writableStream.write(segmentData);
      await writableStream.close();
    } catch (error) {
      console.error(`Error fetching or saving segment ${i}:`, error);
      // break if a segment fails to download after retries
      break;
    }
  }

  return localSegments;
}

export async function downloadVideo(
  videoId: string,
  apiUrl = "https://pipedapi.kavin.rocks"
) {
  try {
    const videoData = (await (
      await fetch(`${apiUrl}/streams/${videoId}`)
    ).json()) as PipedVideo;
    console.log(videoData);

    const storageRoot = await navigator.storage.getDirectory();
    const videoDirectory = await storageRoot.getDirectoryHandle(videoId, {
      create: true,
    });
    const videoInfo = await videoDirectory.getFileHandle("streams.json", {
      create: true,
    });
    // keep only necessary data
    const videoInfoData = {
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
    const videoInfoWritableStream = await videoInfo.createWritable();
    await videoInfoWritableStream.write(
      new Blob([JSON.stringify(videoInfoData)])
    );
    await videoInfoWritableStream.close();

    const baseProxyUrl = videoData.hls.split("/api")[0];
    const videoManifest = await (await fetch(videoData.hls)).text();

    const bandwidthString = videoManifest
      .split("\n")
      .find((line) => line.includes("1920"))
      ?.split("BANDWIDTH=")?.[1]
      ?.match(/([0-9])*/g)?.[0];
    const manifestResults = modifyManifest(videoManifest, bandwidthString);

    console.log(manifestResults);

    const indexFile = await videoDirectory.getFileHandle("index.m3u8", {
      create: true,
    });
    const indexWritableStream = await indexFile.createWritable();
    await indexWritableStream.write(manifestResults.updatedManifest);
    await indexWritableStream.close();

    const audioManifestContent = await (
      await fetch(`${baseProxyUrl}${manifestResults.selectedAudioUrl}`)
    ).text();
    const videoManifestContent = await (
      await fetch(`${baseProxyUrl}${manifestResults.selectedVideoUrl}`)
    ).text();

    const modifiedAudioManifest = modifyManifestVOD(audioManifestContent);
    const modifiedVideoManifest = modifyManifestVOD(videoManifestContent);

    const audioDirectory = await videoDirectory.getDirectoryHandle(`audio`, {
      create: true,
    });
    const audioFile = await audioDirectory.getFileHandle("audio.m3u8", {
      create: true,
    });
    const audioWritableStream = await audioFile.createWritable();
    await audioWritableStream.write(modifiedAudioManifest.modifiedManifest);
    await audioWritableStream.close();

    const videoSubDirectory = await videoDirectory.getDirectoryHandle(`video`, {
      create: true,
    });
    const videoFile = await videoSubDirectory.getFileHandle("video.m3u8", {
      create: true,
    });
    const videoWritableStream = await videoFile.createWritable();
    await videoWritableStream.write(modifiedVideoManifest.modifiedManifest);
    await videoWritableStream.close();

    await fetchAndSaveSegments(
      baseProxyUrl,
      `${videoId}/audio`,
      modifiedAudioManifest.segments
    );
    await fetchAndSaveSegments(
      baseProxyUrl,
      `${videoId}/video`,
      modifiedVideoManifest.segments
    );
    // fetch subtitles
    try {
      const subtitles = videoData.subtitles;
      if (subtitles) {
        const subtitlesDirectory = await videoDirectory.getDirectoryHandle(
          `subtitles`,
          {
            create: true,
          }
        );
        for (const subtitle of subtitles) {
          const subtitleFile = await subtitlesDirectory.getFileHandle(
            `${subtitle.code}.srt`,
            {
              create: true,
            }
          );
          const subtitleWritableStream = await subtitleFile.createWritable();
          const { srtText } = await ttml2srt(subtitle.url);
          await subtitleWritableStream.write(srtText);
          await subtitleWritableStream.close();
        }
      }
    } catch (error) {
      console.error("Error fetching subtitles:", error);
    }
    // fetch thumbnail
    try {
      const thumbnail = videoData.thumbnailUrl;
      if (thumbnail) {
        const thumbnailFile = await videoDirectory.getFileHandle(`thumbnail`, {
          create: true,
        });
        const thumbnailWritableStream = await thumbnailFile.createWritable();
        const thumbnailBlob = await (await fetch(thumbnail)).blob();
        await thumbnailWritableStream.write(thumbnailBlob);
        await thumbnailWritableStream.close();
      }
    } catch (error) {
      console.error("Error fetching thumbnail:", error);
    }
    // fetch channel icon
    try {
      const channelIcon = videoData.uploaderAvatar;
      if (channelIcon) {
        const channelIconFile = await videoDirectory.getFileHandle(
          `channel-icon`,
          {
            create: true,
          }
        );
        const channelIconWritableStream =
          await channelIconFile.createWritable();
        const channelIconBlob = await (await fetch(channelIcon)).blob();
        await channelIconWritableStream.write(channelIconBlob);
        await channelIconWritableStream.close();
      }
    } catch (error) {
      console.error("Error fetching channel icon:", error);
    }
    // fetch preview frames
    try {
      const previewFrames = videoData.previewFrames;
      if (previewFrames) {
        const previewFramesDirectory = await videoDirectory.getDirectoryHandle(
          `preview-frames`,
          {
            create: true,
          }
        );
        let index = 0;
        for (const previewFrame of previewFrames[1].urls) {
          const previewFrameFile = await previewFramesDirectory.getFileHandle(
            `${index}`,
            {
              create: true,
            }
          );
          const previewFrameWritableStream =
            await previewFrameFile.createWritable();
          const previewFrameBlob = await (await fetch(previewFrame)).blob();
          await previewFrameWritableStream.write(previewFrameBlob);
          await previewFrameWritableStream.close();
          index++;
        }
      }
    } catch (error) {
      console.error("Error fetching preview frames:", error);
    }

    const downloaded = JSON.parse(localStorage.getItem("downloaded") || "[]");
    downloaded.push(videoId);
    localStorage.setItem("downloaded", JSON.stringify(downloaded));
  } catch (error) {
    console.error("Error downloading the video:", error);
    throw error;
  }
}
export async function getHlsManifest(videoId: string) {
  console.time("manifest generating");

  const storageRoot = await navigator.storage.getDirectory();
  const videoDirectory = await storageRoot.getDirectoryHandle(videoId, {
    create: false,
  });

  const audioDirectory = await videoDirectory.getDirectoryHandle("audio");
  const videoDirectoryHandle = await videoDirectory.getDirectoryHandle("video");

  const audioManifestHandle = await audioDirectory.getFileHandle("audio.m3u8");
  const videoManifestHandle = await videoDirectoryHandle.getFileHandle(
    "video.m3u8"
  );

  const audioManifestContent = (
    await (await audioManifestHandle.getFile()).text()
  ).split("\n");
  const videoManifestContent = (
    await (await videoManifestHandle.getFile()).text()
  ).split("\n");

  let audioContent = "";
  let videoContent = "";

  let audioSegmentIndex = 0;
  for (let line of audioManifestContent) {
    if (line.includes("{segment}")) {
      const segmentFileHandle = await audioDirectory.getFileHandle(
        `segment${audioSegmentIndex}.ts`
      );
      const segmentFile = await segmentFileHandle.getFile();
      const segmentUrl = URL.createObjectURL(segmentFile);
      line = line.replace("{segment}", segmentUrl);
      audioSegmentIndex++;
    }
    audioContent += `${line}\n`;
  }

  let videoSegmentIndex = 0;
  for (let line of videoManifestContent) {
    if (line.includes("{segment}")) {
      const segmentFileHandle = await videoDirectoryHandle.getFileHandle(
        `segment${videoSegmentIndex}.ts`
      );
      const segmentFile = await segmentFileHandle.getFile();
      const segmentUrl = URL.createObjectURL(segmentFile);
      line = line.replace("{segment}", segmentUrl);
      videoSegmentIndex++;
    }
    videoContent += `${line}\n`;
  }

  const audioContentUrl = URL.createObjectURL(new Blob([audioContent]));
  const videoContentUrl = URL.createObjectURL(new Blob([videoContent]));

  const indexManifestHandle = await videoDirectory.getFileHandle("index.m3u8");
  const indexFile = await indexManifestHandle.getFile();
  const indexContent = (await indexFile.text())
    .replace("{audio}", audioContentUrl)
    .replace("{video}", videoContentUrl);

  console.log(audioContent, videoContent, indexContent);

  console.timeEnd("manifest generating");

  return URL.createObjectURL(new Blob([indexContent]));
}

export const getStreams = async (videoId: string) => {
  const storageRoot = await navigator.storage.getDirectory();
  const videoDirectory = await storageRoot.getDirectoryHandle(videoId, {
    create: false,
  });
  if (!videoDirectory) {
    return null;
  }
  const streamsFileHandle = await videoDirectory.getFileHandle("streams.json");
  const streamsFile = await streamsFileHandle.getFile();
  const text = await streamsFile.text();
  const streams = JSON.parse(text);
  if (!streams) throw new Error("Streams not found");
  const thumbnailFileHandle = await videoDirectory.getFileHandle("thumbnail");
  const thumbnailFile = await thumbnailFileHandle.getFile();
  const thumbnailUrl = URL.createObjectURL(thumbnailFile);

  const channelIconFileHandle = await videoDirectory.getFileHandle(
    "channel-icon"
  );
  const channelIconFile = await channelIconFileHandle.getFile();
  const channelIconUrl = URL.createObjectURL(channelIconFile);

  streams.thumbnailUrl = thumbnailUrl;
  streams.uploaderAvatar = channelIconUrl;
  const subtitlesDirectory = await videoDirectory.getDirectoryHandle(
    `subtitles`,
    {
      create: false,
    }
  );
  const subtitles = [];
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
  streams.subtitles = subtitles;
  const previewFramesDirectory = await videoDirectory.getDirectoryHandle(
    `preview-frames`,
    {
      create: false,
    }
  );
  const urls = [];
  let index = 0;
  for (const frameUrl of streams.previewFrames[1].urls) {
    const frameFileHandle = await previewFramesDirectory.getFileHandle(
      `${index}`
    );
    const frameFile = await frameFileHandle.getFile();
    const frameUrl = URL.createObjectURL(frameFile);
    urls.push(frameUrl);
    index++;
  }
  streams.previewFrames[1].urls = urls;

  return streams;
};

const fetchSubtitles = async (subtitles: Subtitle[]) => {
  console.time("fetching subtitles");
  const newTracks = await Promise.all(
    subtitles.map(async (subtitle) => {
      if (!subtitle.url) return null;
      if (subtitle.mimeType !== "application/ttml+xml")
        return {
          id: `track-${subtitle.code}`,
          key: subtitle.url,
          kind: "subtitles",
          src: subtitle.url,
          srcLang: subtitle.code,
          label: `${subtitle.name} - ${subtitle.autoGenerated ? "Auto" : ""}`,
          dataType: subtitle.mimeType,
        };
      const { srtUrl, srtText } = await ttml2srt(subtitle.url);
      // remove empty subtitles
      if (srtText.trim() === "") return null;
      return {
        id: `track-${subtitle.code}`,
        key: subtitle.url,
        kind: "subtitles",
        src: srtUrl,
        srcLang: subtitle.code,
        label: `${subtitle.name} - ${subtitle.autoGenerated ? "Auto" : ""}`,
        dataType: "srt",
      };
    })
  );
};
