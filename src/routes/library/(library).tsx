import {
  FaSolidClockRotateLeft,
  FaSolidDownload,
  FaSolidList,
} from "solid-icons/fa";
import { A } from "solid-start";

export default function Library() {
  return (
    <>
      <h1 class="text-lg">Library</h1>
      <div class="flex flex-col w-full items-start">
        <div class="flex flex-col text-lg gap-2 w-full even:bg-bg2">
          <A
            class="flex flex-row items-end gap-2 p-2 rounded-lg w-full"
            href="/library/history"
          >
            <FaSolidClockRotateLeft class="w-6 h-6 text-text1" />
            <div class="text-text1">History</div>
          </A>
          <A
            class="flex flex-row items-end gap-2 p-2 rounded-lg w-full"
            href="/library/playlists"
          >
            <FaSolidList class="w-6 h-6 text-text1" />
            <div class="text-text1">Playlists</div>
          </A>
          <A
            class="flex flex-row items-end gap-2 p-2 rounded-lg w-full "
            href="/library/downloads"
          >
            <FaSolidDownload class="w-6 h-6 text-text1" />
            <div class="text-text1">Downloads</div>
          </A>
        </div>
      </div>
    </>
  );
}
