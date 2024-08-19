import * as Y from "yjs";
import { ObservableV2 } from "lib0/observable";
import { createSharedServicePort, SharedService } from "./SharedService";
export type WorkerMessage<A extends "read" | "write" | "trim" | "cleanup"> = {
  action: A;
  payload: {
    roomName: string;
    content?: Uint8Array; // optional for "read"
  };
};
function fnv1aHash(update: Uint8Array): string {
  const FNV_PRIME = 0x01000193; // 16777619
  const OFFSET_BASIS = 0x811c9dc5; // 2166136261

  let hash = OFFSET_BASIS;
  for (const byte of update) {
    hash ^= byte;
    hash *= FNV_PRIME;
    hash >>>= 0; // Use unsigned right shift to ensure we stay within 32 bit range
  }

  return hash.toString(16); // Return hash as hexadecimal string
}

export type WorkerResponse<A extends "read" | "write" | "trim" | "cleanup"> =
  A extends "read"
    ? { updates: Uint8Array[] }
    : A extends "write"
      ? { success: boolean }
      : A extends "trim"
        ? { success: boolean }
        : A extends "cleanup"
          ? { success: boolean }
          : never;

export default class OpfsPersistence extends ObservableV2<{
  [key: string]: any;
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
  synced = false;
  private _timerId: NodeJS.Timeout | null = null;

  /**
   *
   * @param {Y.Doc} ydoc - The Y.js document to be synchronized.
   * @param {string} room - The room or namespace associated with the Y.js document.
   * @param {boolean} debug - Flag to enable logging.
   */
  constructor(
    public room: string,
    public ydoc: Y.Doc,
    debug: boolean = false
  ) {
    super();
    this.debug = debug;
    this.log("Initializing YOpfsProvider...");
    this.worker = new Worker("/OpfsWorker.js");
    console.time("OPFS");

    this.whenSynced = () =>
      new Promise((resolve) => {
        this.on("synced", () => {
          resolve(this);
        });
      });

    ydoc.on("update", (update, origin) => {
      this._storeUpdate(update, origin);
    });
    ydoc.on("destroy", () => {
      this.destroy();
    });
  }

  private _getSessionId = (): string => {
    let sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem("sessionId", sessionId);
    }
    return sessionId;
  };

  private _storeUpdate = async (update: any, origin: any) => {
    this.log("Received update from Y.Doc...", update, origin);
    if (origin !== this && !this._destroyed) {
      if (this._timerId) {
        clearTimeout(this._timerId);
      }
      const lock = (await navigator.locks.query()).held?.find(
        (lock) => lock.name === `SharedService-${this.room}`
      );
      if (!this.synced && !lock) {
        this.log("Waiting for sync...");
        this._timerId = setTimeout(() => {
          this._storeUpdate(update, origin);
        }, 1000);
        return;
      }
      const updateHash = fnv1aHash(update);
      const read = await this._sharedService?.proxy["read"]();
      const { updates } = read;
      console.log("updates", updates);

      this.log(
        "Received a local Y.Doc update or an update from another provider.",
        update,
        origin,
        this,
        this._updateCount
      );

      this._sharedService?.proxy["write"](update);

      if (++this._updateCount >= 10) {
        if (this._storeTimeoutId !== null) {
          clearTimeout(this._storeTimeoutId);
        }
        const updates: Uint8Array = Y.encodeStateAsUpdate(this.ydoc);
        const updatesSizeMB = updates.byteLength / 1024 / 1024;
        console.log(`updates size: ${updatesSizeMB} MB`);
        this._storeTimeoutId = setTimeout(() => {
          this.log("Trimming updates file...");
          this._sharedService?.proxy["trim"](updates);
          this._storeTimeoutId = null;
          this._updateCount = 0;
        }, this.DEBOUNCE_TIMEOUT);
      }
    }
  };

  private log = (...args: any[]) => {
    if (this.debug) {
      console.log(...args);
    }
  };

  private sendMessage<A extends "read" | "write" | "trim" | "cleanup">(
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
  activateCalled = false;

  async readUpdatesFromOPFS(): Promise<Uint8Array[]> {
    const res = await this._sharedService?.proxy["read"]();
    const { updates }: { updates: Uint8Array[] } = res;
    this.log("Received updates from OPFS.", updates.length);
    this._updateCount = updates.length;
    return updates;
  }

  applyUpdatesToYDoc(updates: Uint8Array[]): void {
    Y.transact(
      this.ydoc,
      () => {
        updates.forEach((update) => {
          Y.applyUpdate(this.ydoc, update, this);
        });
      },
      this,
      false
    );
  }

  /**
   * Synchronizes the Y.js document with the stored updates from the OPFS.
   */
  async sync(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.log("Synchronizing Y.Doc with OPFS...");
        console.time("OPFS: getStoredUpdates");
        this._sharedService = new SharedService(this.room, () => {
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
            write: async (content: Uint8Array) => {
              console.log("Calling write");
              return this.sendMessage({
                action: "write",
                payload: { roomName: this.room, content },
              });
            },
            trim: (content: Uint8Array) => {
              console.log("Calling trim");
              return this.sendMessage({
                action: "trim",
                payload: { roomName: this.room, content },
              });
            },
            cleanup: () => {
              return this.sendMessage({
                action: "cleanup",
                payload: { roomName: this.room },
              });
            },
          });
        });
        console.log("this._sharedService", this._sharedService);

        this._sharedService
          .activate(async () => {
            if (this._destroyed || this.synced || this.activateCalled) {
              return;
            }
            this.activateCalled = true;

            this.readUpdatesFromOPFS().then((updates) => {
              this.applyUpdatesToYDoc(updates);
            });

            if (this._destroyed) {
              return this;
            }

            this.emit("synced", []);
            this.synced = true;
            console.timeEnd("OPFS");
            console.log("resolving");
            resolve();
          })
          .then(resolve)
          .catch((e) => {
            reject(e);
          });
      } catch (e) {
        console.error("Error syncing", e);
        this.destroy();
        reject(e);
      }
    });
  }

  destroy() {
    this.ydoc.off("update", this._storeUpdate);
    this.ydoc.off("destroy", this.destroy);
    this._destroyed = true;
    if (this.worker) {
      this.worker.terminate();
    }
    this._sharedService?.deactivate();
  }
}
