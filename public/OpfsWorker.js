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

const trimUpdatesFile = async (accessHandle, state, dirName) => {
  if (!accessHandle) {
    throw new Error("Handles are not initialized.");
  }

  let tmpFileHandle;
  let tmpAccessHandle;
  let roomHandle;
  try {
    console.log("Getting root directory");

    const root = await navigator.storage.getDirectory();
    console.log("Getting room directory");
    roomHandle = await root.getDirectoryHandle(dirName);

    // Create or get a temporary file handle
    console.log("Creating temporary file");
    tmpFileHandle = await roomHandle.getFileHandle("tmp_file", {
      create: true,
    });
    console.log("Creating temporary file access handle");
    tmpAccessHandle = await tmpFileHandle.createSyncAccessHandle();

    // Write the new state to the temporary file
    console.log("Writing new state to temporary file");
    await tmpAccessHandle.write(state, { at: 0, resize: true });
    console.log("Saving to disk");
    await tmpAccessHandle.flush();
  } catch (error) {
    throw new Error("Failed to write to the temporary file.");
  }

  try {
    console.log("closing access handle");
    await accessHandle.close();
    console.log("deleting file");
    await roomHandle.removeEntry(UPDATES_FILE_NAME);

    await tmpAccessHandle.close();
    // Rename the temporary file to replace the original file
    console.log("renaming temporary file");
    await tmpFileHandle.move(UPDATES_FILE_NAME);
    accessHandle = null;
    console.log("success");
  } catch (error) {
    //rollback
    try {
      console.log("rollback");
      const newFileHandle = await roomHandle.getFileHandle(UPDATES_FILE_NAME, {
        create: true,
      });
      const newAccessHandle = await newFileHandle.createSyncAccessHandle();
      newAccessHandle.write(state, { at: 0, resize: true });
    } catch (error) {
      console.log("rollback failed");
      throw new Error(error);
    }
    throw new Error(error);
  }

  console.log("Updates file trimmed.");
};

/**
 * Retrieves all stored updates from the updates binary file.
 *
 * @returns {Promise<Uint8Array[]>} - A promise that resolves with an array of updates.
 */
let fileHandle = null;
let accessHandle = null;
const UPDATES_FILE_NAME = "yjs_updates.bin";
const getStoredUpdates = (accessHandle) => {
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

const acquireFileHandle = async (dirName) => {
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
}

const acquireAccessHandle = async () => {
  accessHandle = await fileHandle.createSyncAccessHandle();
  console.log("accessHandle", accessHandle);
};

const cleanup = () => {
  console.warn("CLEANUP CALL RECEIVED");
  if (accessHandle) {
    try{
    accessHandle.flush();
    accessHandle.close();
    } catch (error) {
      console.error(error, "Trying to recreate access handle");
      accessHandle = null;
      return
    }
    console.warn("accessHandle closed", JSON.stringify(accessHandle));
  }

  if (fileHandle) {
    // nullify for GC
    fileHandle = null;
  }
};
let initializedCount = 0;


self.addEventListener("message", async (event) => {
  const { action, payload } = event.data;
  console.log("Message received", action, payload);
  if (fileHandle === null) {
    await acquireFileHandle(payload.roomName);
  }
  if (!accessHandle) {
    initializedCount++;
    console.log("accessHandle is null", initializedCount);
    await acquireAccessHandle();
  }
  let size;
  try {
    size = accessHandle.getSize();
  } catch (error) {
    console.error(error, "Trying to recreate access handle");
    await acquireAccessHandle();
    size = accessHandle.getSize();
  }
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
      await trimUpdatesFile(accessHandle, state, payload.roomName);
      console.timeEnd("trimUpdatesFile");
      console.log(`Actual file size: ${(size / 1024 / 1024).toFixed(2)} MB`);
      self.postMessage({ success: true });
      break;
    case "cleanup":
      cleanup()
      self.postMessage({ success: true })
      break;
    default:
      throw new Error(`Unknown action: ${action}`);
  }
});

