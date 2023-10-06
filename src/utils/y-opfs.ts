import * as Y from "yjs";
import { ObservableV2 } from "lib0/observable";
import { createSharedServicePort, SharedService } from "./SharedService";
export type WorkerMessage<A extends "read" | "write" | "trim"> = {
  action: A;
  payload: {
    roomName: string;
    content?: Uint8Array; // optional for "read"
  };
};

export type WorkerResponse<A extends "read" | "write" | "trim"> =
  A extends "read"
    ? { updates: Uint8Array[] }
    : A extends "write"
    ? { success: boolean }
    : A extends "trim"
    ? { success: boolean }
    : never;

export default class OpfsPersistence extends ObservableV2<{
  [key: string]: (update: Uint8Array) => void;
}> {
  private worker: Worker | null = null;

  private debug: boolean;

  private readonly PREFERRED_TRIM_SIZE = 10;
  private _updateCount = 0;
  private readonly DEBOUNCE_TIMEOUT = 1000;
  private _destroyed = false;
  private _storeTimeoutId: NodeJS.Timeout | null = null;
  whenSynced: () => Promise<this>;
  private _sharedService: SharedService | null = null;

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
    this.worker = new Worker("/OpfsWorker.js");
    console.time("OPFS");
    this._sharedService = new SharedService("SharedService", () => {
      return createSharedServicePort({
        read: async () => {
          console.log("Calling read");
          return new Promise((resolve, reject) => {
            if (!this.worker) {
              reject("Worker not initialized.");
              return;
            }

            const messageHandler = (event: MessageEvent) => {
              resolve(event.data);
              this.worker?.removeEventListener("message", messageHandler);
            };

            const errorHandler = (error: Event) => {
              if (error instanceof ErrorEvent) {
                reject(error);
              }
              this.worker?.removeEventListener("error", errorHandler);
            };
            this.worker.onerror = errorHandler;
            this.worker.onmessage = messageHandler;

            this.worker.postMessage({
              action: "read",
              payload: { roomName: this.room },
            });
          });
        },
        write: (content: Uint8Array) => {
          return this.sendMessage({
            action: "write",
            payload: { roomName: this.room, content },
          });
        },
        trim: (content: Uint8Array) => {
          return this.sendMessage({
            action: "trim",
            payload: { roomName: this.room, content },
          });
        },
      });
    });

    this._sharedService.activate(() => {
      this.sync();
      console.log("SharedService activated");
    });

    this.whenSynced = () =>
      new Promise((resolve) => {
        this.on("synced", () => {
          resolve(this);
        });
      });

    ydoc.on("update", this._storeUpdate);
    ydoc.on("destroy", () => {
      this.destroy();
    });
  }

  private _storeUpdate = async (update: any, origin: any) => {
    this.log("Received update from Y.Doc...");
    if (origin !== this && !this._destroyed) {
      this.log(
        "Received a local Y.Doc update or an update from another provider.",
        update,
        origin,
        this
      );
      this._sharedService?.proxy["write"](update);
      Y.applyUpdate(this.ydoc, update, this);

      if (++this._updateCount >= this.PREFERRED_TRIM_SIZE) {
        if (this._storeTimeoutId !== null) {
          clearTimeout(this._storeTimeoutId);
        }
        this.log("Trimming updates...", Y.encodeStateAsUpdate(this.ydoc));
        this._storeTimeoutId = setTimeout(() => {
          this.log("Trimming updates file...");
          this._sharedService?.proxy["trim"](Y.encodeStateAsUpdate(this.ydoc));
          this._storeTimeoutId = null;
          this._updateCount = 0;
        }, this.DEBOUNCE_TIMEOUT);
      }
    }
  };

  private log(...args: any[]) {
    if (this.debug) {
      console.log(...args);
    }
  }

  private sendMessage<A extends "read" | "write" | "trim">(
    message: WorkerMessage<A>
  ): Promise<WorkerResponse<A>> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject("Worker not initialized.");
        return;
      }

      const messageHandler = (event: MessageEvent) => {
        resolve(event.data);
        this.worker?.removeEventListener("message", messageHandler);
      };

      const errorHandler = (error: Event) => {
        if (error instanceof ErrorEvent) {
          reject(error);
        }
        this.worker?.removeEventListener("error", errorHandler);
      };
      this.worker.onerror = errorHandler;
      this.worker.onmessage = messageHandler;

      this.worker.postMessage(message);
    });
  }

  /**
   * Synchronizes the Y.js document with the stored updates from the OPFS.
   */
  async sync() {
    this.log("Synchronizing Y.Doc with OPFS...");
    console.time("OPFS: getStoredUpdates");
    // const { updates } = await this.sendMessage({
    //   action: "read",
    //   payload: { roomName: this.room },
    // });

    const res = await this._sharedService?.proxy["read"]();
    console.log("res", res);
    const { updates } = res;

    console.timeEnd("OPFS: getStoredUpdates");
    this.log("Received updates from OPFS.", updates.length);

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
  }

  async destroy() {
    this.ydoc.off("update", this._storeUpdate);
    this.ydoc.off("destroy", this.destroy);
    if (this.worker) {
      this.worker.terminate();
    }
  }
}
