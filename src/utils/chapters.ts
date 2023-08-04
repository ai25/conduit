interface Chapter {
  timestamp: string;
  seconds: number;
  name: string;
}
/**
 * Returns a WebVTT friendly timestamp.
 *
 * @param timestamp
 * @returns {string} WebVTT friendly timestamp
 */
function handleVttTimestamp(timestamp: string): string {
  const split: string[] = timestamp.split(":");

  let reconstructed = "";

  let index: number = 0;

  for (let part of split) {
    index++;

    // add a 0 before the number
    part = part.length == 1 ? `0${part}` : part;

    reconstructed += `${part}${index == split.length ? "" : ":"}`;
  }

  if (split.length == 3) {
    return reconstructed;
  }

  return `00:${reconstructed}`;
}

/**
 * Writes the WebVTT cues.
 *
 * @param timestamps array of Chapters @see parseText
 * @param duration total duration of the video in seconds
 * @returns {string} chaptuer cues in WebVTT
 */
export function chaptersVtt(timestamps: Chapter[], duration: number): string {
  // converts the duration into a timestamp with milliseconds
  // i.e. 00:01:42.41
  const endTimestamp = new Date(duration * 1000).toISOString().slice(11, 22);

  let vtt: string = "";

  let index: number = 0;

  for (const timestamp of timestamps) {
    index++;

    if (index == 1 && timestamp.seconds !== 0) {
      console.warn("First chapter definition began before 0. Resetting");

      timestamp.timestamp = "0:00";
      timestamp.seconds = 0;
    }

    const end: string = index == timestamps.length ? endTimestamp : handleVttTimestamp(timestamps[index].timestamp);

    vtt += `${handleVttTimestamp(timestamp.timestamp)} --> ${end}\n${timestamp.name}\n\n`;
  }

  return vtt;
}
