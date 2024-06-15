import { DEFAULT_PREFERENCES } from "~/stores/preferencesStore";
import { Store } from "~/stores/syncStore";
import {
  ContentItem,
  RelatedChannel,
  RelatedPlaylist,
  RelatedStream,
} from "~/types";
function isRelatedStream(item: ContentItem): item is RelatedStream {
  return item.type === "stream";
}

function isRelatedChannel(item: ContentItem): item is RelatedChannel {
  return item.type === "channel";
}

function isRelatedPlaylist(item: ContentItem): item is RelatedPlaylist {
  return item.type === "playlist";
}

export const filterContent = <T extends ContentItem>(
  items: T[],
  preferences: typeof DEFAULT_PREFERENCES,
  blocklist: Store["blocklist"]
) => {
  if (!items) return [];
  if (!Array.isArray(items)) return [];
  return (
    items
      .filter((item) => {
        if (!item) return false;
        if (isRelatedChannel(item)) {
          return true;
        } else if (isRelatedPlaylist(item)) {
          return true;
        } else if (isRelatedStream(item)) {
          return (
            (preferences.content.displayShorts || !item.isShort) &&
            !blocklist[item.uploaderUrl?.split("/").pop()!]
          );
        }
        return false;
      })
      // remove duplicates
      .filter(
        (item, index, self) =>
          self.findIndex((t) => t?.url === item?.url) === index
      )
  );
};
