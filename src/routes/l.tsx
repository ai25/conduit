import { downloadVideo } from "~/utils/hls";
import { RelatedStream } from "../types";
import { videoId } from "./history";
import Description from "~/components/Description";
import { createEffect, useContext } from "solid-js";
import { PlayerContext } from "~/root";
import { clone, useSyncedStore } from "~/stores/syncedStore";
import Button from "~/components/Button";

export default () => {
  const [video] = useContext(PlayerContext);
  const { store, setStore } = useSyncedStore();
  const DELIMITER = new Uint8Array([0xff, 0xff, 0xff, 0xff]);
  const UPDATE = "test";
  const UINT8UPDATE = new TextEncoder().encode(UPDATE);

  async function storeUpdate() {
    const root = await navigator.storage.getDirectory();
    // const dir = await root.getDirectoryHandle("matrix-crdt-conduit");
    // const fileHandle = await dir.getFileHandle("yjs_updates.bin");

    const fileHandle = await root.getFileHandle("test.bin", { create: true });
    const file = await fileHandle.getFile();
    console.log(await file.text());
    const fileSize = file.size;
    console.log(fileSize);

    const writable = await fileHandle.createWritable({
      keepExistingData: true,
    });
    await writable.seek(fileSize);

    await writable.write(UPDATE);
    await writable.write(DELIMITER);

    await writable.close();

    console.log("Update appended to the updates file.");
  }
  createEffect(() => {
    // write()
    //   ?.getMap("preferences")
    //   ?.observeDeep((e) => {
    //     console.log(write()?.getMap("preferences").toJSON());
    //   });
  });
  return (
    <>
      <Button
        label="x"
        onClick={() => {
          storeUpdate();
        }}
      />
      {JSON.stringify(store)}
    </>
  );
};
