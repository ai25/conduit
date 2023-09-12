import * as Y from "yjs";
import { Observable } from "lib0/observable";

export default class OpfsPersistence extends Observable<string> {
  /**
   * The directory handle associated with the current room.
   */
  dirHandle: FileSystemDirectoryHandle | null = null;

  /**
   * The file handle for the updates binary file.
   */
  updatesFileHandle: FileSystemFileHandle | null = null;

  /**
   *
   * Constant for the name of the updates file.
   */
  readonly UPDATES_FILE_NAME = "yjs_updates.bin";

  private debug: boolean;

  private updateQueue: Uint8Array[] = [];
  private readonly BATCH_SIZE = 100;
  private readonly FLUSH_INTERVAL = 5000;

  /**
   *
   * @param {Y.Doc} ydoc - The Y.js document to be synchronized.
   * @param {string} room - The room or namespace associated with the Y.js document.
   * @param {boolean} debug - Flag to enable logging.
   */
  constructor(public room: string, public ydoc: Y.Doc, debug: boolean = false) {
    super();
    this.debug = debug;
    this.log("Initializing YOpfsProvider...");
    // this.init();

    // Event listener for updates on the Y.js document.
    // ydoc.on("update", (update, origin) => {
    //   if (origin !== this) {
    //     this.log(
    //       "Received a local Y.Doc update or an update from another provider.", update, origin, this
    //     );
    //     this.emit("update", [update]);
    //   }
    // });

    // Event listener for applying received remote updates.
    this.on("update", (update: Uint8Array) => {
      this.log("Applying received remote update to Y.Doc.", update);
      this.enqueueUpdate(update);
      Y.logUpdate(update);
      Y.applyUpdate(ydoc, update, this);
    });
    this.startBatching();
  }

  startBatching() {
    setInterval(() => {
      if (this.updateQueue.length > 0) {
        this.flushUpdates();
      }
    }, this.FLUSH_INTERVAL);
  }

  enqueueUpdate(update: Uint8Array) {
    this.updateQueue.push(update);

    if (this.updateQueue.length >= this.BATCH_SIZE) {
      this.flushUpdates();
    }
  }

  async flushUpdates() {
    // Calculate the total size including delimiters
    console.log("Flushing updates...");
    const totalSize = this.updateQueue.reduce(
      (acc, curr) => acc + curr.length + this.DELIMITER.length,
      0
    );
    console.log("Total size: ", totalSize, "Update queue: ", this.updateQueue);
    const batchedUpdate = new Uint8Array(totalSize);

    let offset = 0;
    for (const update of this.updateQueue) {
      batchedUpdate.set(update, offset);
      offset += update.length;

      batchedUpdate.set(this.DELIMITER, offset);
      offset += this.DELIMITER.length;
    }
    console.log("Batched update: ", batchedUpdate);
    await this.storeUpdate(batchedUpdate);
    console.log("Stored batched update.");
    this.updateQueue = [];
  }

  async storeUpdate(update: Uint8Array) {
    if (!this.updatesFileHandle) {
      console.error("Updates file handle is not initialized.");
      return;
    }

    const file = await this.updatesFileHandle.getFile();
    const fileSize = file.size;

    //@ts-expect-error
    const writable = await this.updatesFileHandle.createWritable({
      keepExistingData: true,
    });
    await writable.seek(fileSize);

    await writable.write(update);

    await writable.close();

    this.log("Update appended to the updates file.");
  }

  /**
   * Utility function to handle conditional logging based on the debug flag.
   *
   * @param {...any} args - The arguments to be passed to console.log.
   */
  private log(...args: any[]) {
    if (this.debug) {
      console.log(...args);
    }
  }

  /**
   * Initializes the OPFS directory and the updates binary file.
   */

  // Utility function that rejects a promise after a timeout
  timeout(ms: number): Promise<void> {
    return new Promise((_, reject) =>
      setTimeout(() => {
        reject(new Error("Operation timed out."));
      }, ms)
    );
  }

  async init() {
    this.log("Fetching directory handle from OPFS...");

    // Use Promise.race to race between timeout and main function
    try {
      const root = await navigator.storage.getDirectory();
      this.dirHandle = await root.getDirectoryHandle(this.room, {
        create: true,
      });
      this.log("Directory handle obtained.");
    } catch (e) {
      console.error(`Error getting directory handle: ${e}`);
      return;
    }

    try {
      this.log("Trying to get existing updates file handle...");

      this.updatesFileHandle = await this.dirHandle.getFileHandle(
        this.UPDATES_FILE_NAME,
        { create: true }
      );
    } catch (e) {
      console.error(`Error getting updates file handle: ${e}`);
    }
  }

  /**
   * Byte sequence used to separate individual updates in the updates binary file.
   */
  DELIMITER = new Uint8Array([0xff, 0xff, 0xff, 0xff]);

  /**
   * Appends an update to the updates binary file.
   *
   * @param {Uint8Array} update - The update to be stored.
   */
  // async storeUpdate(update: Uint8Array) {
  //   if (!this.updatesFileHandle) {
  //     console.error("Updates file handle is not initialized.");
  //     return;
  //   }

  //   // Write the update followed by the delimiter to the updates file.
  //   const file = await this.updatesFileHandle.getFile();
  //   const fileSize = file.size;

  //   const writable = await this.updatesFileHandle.createWritable({
  //     keepExistingData: true,
  //   });
  //   await writable.seek(fileSize);

  //   await writable.write(update);
  //   await writable.write(this.DELIMITER);

  //   await writable.close();

  //   this.log("Update appended to the updates file.");
  // }

  /**
   * Retrieves all stored updates from the updates binary file.
   *
   * @returns {Promise<Uint8Array[]>} - A promise that resolves with an array of updates.
   */
  async getStoredUpdates(): Promise<Uint8Array[]> {
    if (!this.updatesFileHandle) {
      console.error("Updates file handle is not initialized.");
      return [];
    }
    // Fetch the content of the updates file.
    const file = await this.updatesFileHandle.getFile();
    const data = new Uint8Array(await file.arrayBuffer());

    const fileSizeMb = file.size / 1024 / 1024;
    console.log(`Updates file size: ${fileSizeMb.toFixed(2)} MB`);

    // Parse individual updates by splitting the content using the delimiter.
    const updates: Uint8Array[] = [];
    let lastDelimiterIndex = -this.DELIMITER.length;
    for (let i = 0; i <= data.length - this.DELIMITER.length; i++) {
      let isDelimiter = true;
      for (let j = 0; j < this.DELIMITER.length; j++) {
        if (data[i + j] !== this.DELIMITER[j]) {
          isDelimiter = false;
          break;
        }
      }
      if (isDelimiter) {
        updates.push(data.slice(lastDelimiterIndex + this.DELIMITER.length, i));
        lastDelimiterIndex = i;
      }
    }

    this.log(`Fetched ${updates.length} stored updates from updates file.`);
    return updates;
  }

  /**
   * Synchronizes the Y.js document with the stored updates from the OPFS.
   */
  async sync() {
    console.time("OPFS");
    this.log("Synchronizing Y.Doc with OPFS...");
    console.time("OPFS: getStoredUpdates");
    const updates = await this.getStoredUpdates();
    console.timeEnd("OPFS: getStoredUpdates");

    // Apply each stored update to the Y.js document.
    Y.transact(
      this.ydoc,
      () => {
        updates.forEach((update) => {
          // this.log("Applying stored update to Y.Doc...");
          Y.applyUpdate(this.ydoc, update, this);
        });
      },
      this,
      false
    );

    console.timeEnd("OPFS");
    // Store any new updates to the updates file.
    this.ydoc.on("update", async (update, origin) => {
      if (origin !== this) {
        this.log(
          "Received a local Y.Doc update or an update from another provider.",
          update,
          origin,
          this
        );
        this.emit("update", [update]);
      }
    });
  }
}
