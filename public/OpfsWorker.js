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
 * Overwrites the contents of the file with the received update.
 * 
 * @param {FileSystemSyncAccessHandle} accessHandle - The file handle.
 * @param {Uint8Array} state - The new update to overwrite the file with.
 * @param {string} roomName - The name of the room, used for logging.
 */
const trimUpdatesFile = async (accessHandle, state)  => {
  try {

    // Truncate the file to zero length
    accessHandle.truncate(0);

    // Write the new update to the file
    accessHandle.write(state, { at: 0 });

    // write the delimiter after the new update
    const newSize = state.length;
    accessHandle.write(DELIMITER, { at: newSize });

    // Flush the changes to ensure data is written to disk
    accessHandle.flush();

    console.log("Updates file has been overwritten with the new update.");
  } catch (error) {
    console.error(`Failed to trim updates file`, error);
    throw error; // Rethrow the error to handle it in the message event listener
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
const getStoredUpdates = (accessHandle) => {
  if (!accessHandle) {
    throw new Error("Access handle is not initialized.");
  }
  const size = accessHandle.getSize();
  const fileSizeMb = size / 1024 / 1024;
  console.log(`Updates file size: ${fileSizeMb.toFixed(2)} MB`);
  const dataBuffer = new ArrayBuffer(size);
  const dataView = new DataView(dataBuffer);
  accessHandle.read(dataView, { at: 0 });
  const data = new Uint8Array(dataBuffer);
  console.log(`Read ${data.length} bytes from updates file.`);
  const updates = [];
  let lastDelimiterIndex = -DELIMITER.length;
  console.log("DELIMITER", lastDelimiterIndex);
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
      console.log(
        `Found update of size ${(
          (i - lastDelimiterIndex - DELIMITER.length) /
          1024
        ).toFixed(2)} KB`
      );

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

