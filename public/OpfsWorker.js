console.log("OpfsWorker.js loaded");
/**
 * Byte sequence used to separate individual updates in the updates binary file.
 */
const DELIMITER = new Uint8Array([0xff, 0xff, 0xff, 0xff]);

/**
 * Read the entire content of a file.
 * @param {FileSystemSyncAccessHandle} accessHandle - The file handle.
 * @returns {Promise<Uint8Array>} - A promise that resolves with the file content.
 */
const readWholeFile = async (accessHandle) => {
  const size = await accessHandle.getSize();
  const buffer = new Uint8Array(size);
  await accessHandle.read(buffer, { at: 0 });
  return buffer;
};

/**
 * Removes all stored updates from the updates binary file and replaces them with the encoded state.
 * This version attempts to be atomic by reading the entire existing file, combining it with the new state,
 * and writing it back.
 * @param {FileSystemSyncAccessHandle} accessHandle - The access handle to the updates file.
 * @param {Uint8Array} state - The encoded state.
 * @returns {Promise<void>} - A promise that resolves when the updates have been stored.
 */
const trimUpdatesFile = async (accessHandle, state) => {
  if (!accessHandle) {
    throw new Error("Access handle is not initialized.");
  }

  // Create a backup of the original state
  const backupState = await readWholeFile(accessHandle);

  // Your logic here to combine the existing file's content and your new state
  // For example, just appending the new state to the existing one:
  const newState = new Uint8Array(state.length);
  newState.set(state, 0);

  try {
    // Write the combined state back to the file
    await accessHandle.write(newState, { at: 0 });
    await accessHandle.flush();
    const size = accessHandle.getSize();

    console.log("Updates file trimmed.");
  } catch (error) {
    // If anything goes wrong, revert the file to its original state
    await accessHandle.write(backupState, { at: 0 });
    await accessHandle.flush();
    throw new Error("Atomic operation failed. Reverted to original state.");
  }
};
/**
 * Retrieves all stored updates from the updates binary file.
 *
 * @returns {Promise<Uint8Array[]>} - A promise that resolves with an array of updates.
 */
let fileHandle = null;
let accessHandle = null;
const UPDATES_FILE_NAME = "yjs_updates.bin";
const getStoredUpdates = (
  //@ts-ignore
  accessHandle
) => {
  if (!accessHandle) {
    throw new Error("Access handle is not initialized.");
  }
  const size = accessHandle.getSize();
  const fileSizeMb = size / 1024 / 1024;
  console.log(`Updates file size: ${fileSizeMb.toFixed(2)} MB`);
  const dataBuffer = new ArrayBuffer(size);
  const dataView = new DataView(dataBuffer);
  accessHandle.read(dataView);
  const data = new Uint8Array(dataBuffer);
  const updates = [];
  let lastDelimiterIndex = -DELIMITER.length;
  for (let i = 0; i <= data.length - DELIMITER.length; i++) {
    let isDelimiter = true;
    for (let j = 0; j < DELIMITER.length; j++) {
      if (data[i + j] !== DELIMITER[j]) {
        isDelimiter = false;
        break;
      }
    }
    if (isDelimiter) {
      updates.push(data.slice(lastDelimiterIndex + DELIMITER.length, i));
      lastDelimiterIndex = i;
    }
  }
  console.log(`Fetched ${updates.length} stored updates from updates file.`);
  return updates;
};

const initialize = async (dirName) => {
  const opfsRoot = await navigator.storage.getDirectory();
  console.log("opfsRoot", opfsRoot);
  const roomHandle = await opfsRoot.getDirectoryHandle(dirName, {
    create: true,
  });
  console.log("roomHandle", roomHandle);
  fileHandle = await roomHandle.getFileHandle(UPDATES_FILE_NAME, {
    create: true,
  });
  console.log("fileHandle", fileHandle);
  accessHandle = await fileHandle.createSyncAccessHandle();
  console.log("accessHandle", accessHandle);
};

self.addEventListener("message", async (event) => {
  const { action, payload } = event.data;
  if (fileHandle === null || accessHandle === null) {
    await initialize(payload.roomName);
  }
  if (!accessHandle) {
    throw new Error("Could not create access handle.");
  }
  let size = accessHandle.getSize();
  switch (action) {
    case "write":
      console.log("write");
      const content = payload.content;
      console.log(
        `Writing update of size ${(content.length / 1024).toFixed(
          2
        )} KB to file of size ${(size / 1024 / 1024).toFixed(2)} MB`
      );
      try {
        accessHandle.write(content, { at: size });
        size += content.length;
        accessHandle.write(DELIMITER, { at: size });
        accessHandle.flush();
        size += DELIMITER.length;
        console.log("write done");
        size = accessHandle.getSize();
        console.log(`Actual file size: ${(size / 1024 / 1024).toFixed(2)} MB`);
        self.postMessage({ success: true });
      } catch (e) {
        console.log("write error", e);
      }
      break;
    case "read":
      console.log("read");
      console.time("getStoredUpdates");
      const updates = getStoredUpdates(accessHandle);
      console.timeEnd("getStoredUpdates");
      self.postMessage({ updates });
      break;
    case "trim":
      console.log("trim");
      const state = payload.content;
      console.time("trimUpdatesFile");
      await trimUpdatesFile(accessHandle, state);
      console.timeEnd("trimUpdatesFile");
      size = accessHandle.getSize();
      self.postMessage({ success: true });
      break;
    default:
      throw new Error(`Unknown action: ${action}`);
  }
});
