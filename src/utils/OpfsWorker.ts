let fileHandle: FileSystemFileHandle | null = null;
//@ts-ignore
let accessHandle: FileSystemSyncAccessHandle | null = null;

const initialize = async (fileName: string) => {
  const opfsRoot = await navigator.storage.getDirectory();
  fileHandle = await opfsRoot.getFileHandle(fileName, { create: true });
  accessHandle = await (fileHandle as any).createSyncAccessHandle();
};
/**
 * Byte sequence used to separate individual updates in the updates binary file.
 */
const DELIMITER = new Uint8Array([0xff, 0xff, 0xff, 0xff]);

/**
 * Retrieves all stored updates from the updates binary file.
 *
 * @returns {Promise<Uint8Array[]>} - A promise that resolves with an array of updates.
 */

const getStoredUpdates = (
  //@ts-ignore
  accessHandle: FileSystemSyncAccessHandle
): Uint8Array[] => {
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

  const updates: Uint8Array[] = [];
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
// WorkerMessage mapped type
type WorkerMessageForAction<A extends "read" | "write"> = {
  action: A;
  payload: PayloadForAction<A>;
};

// Define the payload shape based on action
type PayloadForAction<A> = A extends "read"
  ? { fileName: string }
  : A extends "write"
  ? { fileName: string; content: Uint8Array }
  : never;

self.addEventListener(
  "message",
  async (event: { data: WorkerMessage<any> }) => {
    const { action, payload } = event.data;

    if (fileHandle === null || accessHandle === null) {
      await initialize(payload.fileName);
    }
    if (!accessHandle) {
      throw new Error("Could not create access handle.");
    }

    let size = accessHandle.getSize();

    switch (action) {
      case "write":
        const content = payload.content;
        accessHandle.write(content, { at: size });
        accessHandle.flush();
        size = accessHandle.getSize();
        self.postMessage({
          success: true,
        });
        break;

      case "read":
        const updates = getStoredUpdates(accessHandle);
        self.postMessage({
          updates,
        });
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
);
