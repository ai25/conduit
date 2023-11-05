import { createEffect, createSignal } from "solid-js";
import { isServer } from "solid-js/web";
import { toast } from "~/components/Toast";
import { useSyncStore } from "~/stores/syncStore";
import { createSharedServicePort, SharedService } from "~/utils/SharedService";

export default function Debug() {
  const sync = useSyncStore();

  const isWebWorkerSupported = () => {
    if (isServer) return false;
    return typeof Worker !== "undefined";
  }

  const isOPFSSupported = async () => {
    if (isServer) return false;
    try {
      await navigator.storage.getDirectory();
      return true;
    } catch (e) {
      return false;
    }
  }
  const isWebRTCSupported = async () => {
    if (isServer) return false;
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (e) {
      return false;
    }
  }

  const isServiceWorkerSupported = () => {
    if (isServer) return false;
    return typeof navigator.serviceWorker !== "undefined";
  }
  const isServiceWorkerEnabled =async () => {
    if (isServer) return false;
    return await fetch("/clientId").then((res) => res.ok);
  }

  const isLocksSupported = () => {
    if (isServer) return false;
    return typeof navigator.locks !== "undefined";
  }
  const isPersistentStorageSupported = () => {
    if (isServer) return false;
    return typeof navigator.storage.persist !== "undefined";
  }
  const isPersistentStorageEnabled = async () => {
    if (isServer) return false;
    return await navigator.storage.persisted();
  }

  const enablePersistentStorage = async () => {
    if (isServer) return false;
    await navigator.storage.persist().then((granted) => {
      if (granted) {
        toast.success("Persistent storage enabled");
        setPersistentStorageEnabled(true);
      } else {
        toast.error("Persistent storage not enabled");
      }
    });
  }

  const isMessageChannelSupported = () => {
    if (isServer) return false;
    return typeof MessageChannel !== "undefined";
  }

  const isBroadcastChannelSupported = () => {
    if (isServer) return false;
    return typeof BroadcastChannel !== "undefined";
  }

  const isCreateSyncAccessHandleEnabled = async () => {
    if (isServer) return false;
    const workerScript = `
    self.onmessage = async () => {
    console.log("worker");
    try {
    console.log("trying to get directory");
    const handle = await navigator.storage.getDirectory();
    const file = await handle.getFileHandle("test.txt", { create: true });
    console.log("got file");
    const accessHandle = await file.createSyncAccessHandle();
    console.log("got access handle");
    accessHandle.write(new TextEncoder().encode("test"));
    accessHandle.flush();
    accessHandle.close();
    console.log("wrote to file");
    self.postMessage(true);
    } catch (e) {
      console.error("Error while creating sync access handle", e);
      self.postMessage(false);
    }
    }
    `;
    const worker = new Worker(URL.createObjectURL(new Blob([workerScript])));
    return new Promise<boolean>((resolve) => {
      worker.onmessage = (e) => {
        resolve(e.data);
      };
      worker.postMessage("");
    }
    );

  }
  const isSharedServiceWorking = async () => {
    if (isServer) return false;
    const workerScript = `
    self.onmessage = async () => {
        self.postMessage(true);
    }
    `;
    const worker = new Worker(URL.createObjectURL(new Blob([workerScript])));

    const sharedService = new SharedService("test", () => {
      return createSharedServicePort({
        read: async () => {
          console.log("Calling read");
          return new Promise((resolve, reject) => {

            const messageHandler = (event: MessageEvent) => {
              resolve(event.data);
              worker?.removeEventListener("message", messageHandler);
            };

            const errorHandler = (error: Event) => {
              if (error instanceof ErrorEvent) {
                reject(error);
              }
              worker?.removeEventListener("error", errorHandler);
            };
            worker.onerror = errorHandler;
            worker.onmessage = messageHandler;

            worker.postMessage("");
          });
        }
      });
    });

    try {
    await sharedService.activate(async () => {
      const res = await sharedService?.proxy["read"]();
      console.log("res", res);
      return res;
    });
    return true;
    } catch (e) {
      console.error("Error connecting to shared service", e);
      return false;
    }
  }






  const [opfsSupported, setOPFSSupported] = createSignal(false);
  const [webRTCSupported, setWebRTCSupported] = createSignal(false);
  const [serviceWorkerEnabled, setServiceWorkerEnabled] = createSignal(false);
  const [persistentStorageEnabled, setPersistentStorageEnabled] = createSignal(false);
  const [webWorkerSupported, setWebWorkerSupported] = createSignal(false);
  const [locksSupported, setLocksSupported] = createSignal(false);
  const [persistentStorageSupported, setPersistentStorageSupported] = createSignal(false);
  const [serviceWorkerSupported, setServiceWorkerSupported] = createSignal(false);
  const [createSyncAccessHandleEnabled, setCreateSyncAccessHandleEnabled] = createSignal(false);
  const [messageChannelSupported, setMessageChannelSupported] = createSignal(false);
  const [broadcastChannelSupported, setBroadcastChannelSupported] = createSignal(false);
  const [sharedServiceWorking, setSharedServiceWorking] = createSignal(false);


  createEffect(async () => {
    setOPFSSupported(await isOPFSSupported());
    setWebRTCSupported(await isWebRTCSupported());
    setServiceWorkerEnabled(await isServiceWorkerEnabled());
    setPersistentStorageEnabled(await isPersistentStorageEnabled());
    setWebWorkerSupported(isWebWorkerSupported());
    setLocksSupported(isLocksSupported());
    setPersistentStorageSupported(isPersistentStorageSupported());
    setServiceWorkerSupported(isServiceWorkerSupported());
    setCreateSyncAccessHandleEnabled(await isCreateSyncAccessHandleEnabled());
    setMessageChannelSupported(isMessageChannelSupported());
    setBroadcastChannelSupported(isBroadcastChannelSupported());
    setSharedServiceWorking(await isSharedServiceWorking());

  });



  return (
    <div class="p-4">   
      <h1 class="text-2xl font-bold">Debug</h1>
      <div class="flex flex-col space-y-2">
        <div class="flex flex-col space-y-1">
          <div class="flex flex-row justify-between">
            <div class="font-bold">Web Worker</div>
            <div>{webWorkerSupported() ? "Supported" : "Not supported"}</div>
          </div>
          <div class="flex flex-row justify-between">
            <div class="font-bold">OPFS</div>
            <div>{opfsSupported() ? "Supported" : "Not supported"}</div>
          </div>
          <div class="flex flex-row justify-between">
            <div class="font-bold">WebRTC</div>
            <div>{webRTCSupported() ? "Supported" : "Not supported"}</div>
          </div>
          <div class="flex flex-row justify-between">
            <div class="font-bold">Service Worker</div>
            <div>{serviceWorkerSupported() ? "Supported" : "Not supported"}</div>
          </div>
          <div class="flex flex-row justify-between">
            <div class="font-bold">Service Worker Enabled</div>
            <div>{serviceWorkerEnabled() ? "Enabled" : "Not enabled"}</div>
          </div>
          <div class="flex flex-row justify-between">
            <div class="font-bold">Locks</div>
            <div>{locksSupported() ? "Supported" : "Not supported"}</div>
          </div>
          <div class="flex flex-row justify-between">
            <div class="font-bold">Persistent Storage</div>
            <div>{persistentStorageSupported() ? "Supported" : "Not supported"}</div>
          </div>
          <div class="flex flex-row justify-between">
            <div class="font-bold">Persistent Storage Enabled</div>
            <div>{persistentStorageEnabled() ? "Enabled" : "Not enabled"}</div>
            <span class="cursor-pointer underline text-primary" onClick={enablePersistentStorage}>Enable</span>
          </div>
          <div class="flex flex-row justify-between">
            <div class="font-bold">Create Sync Access Handle</div>
            <div>{createSyncAccessHandleEnabled() ? "Enabled" : "Not enabled"}</div>
          </div>
          <div class="flex flex-row justify-between">
            <div class="font-bold">Message Channel</div>
            <div>{messageChannelSupported() ? "Supported" : "Not supported"}</div>
          </div>
          <div class="flex flex-row justify-between">
            <div class="font-bold">Broadcast Channel</div>
            <div>{broadcastChannelSupported() ? "Supported" : "Not supported"}</div>
          </div>
          <div class="flex flex-row justify-between">
            <div class="font-bold">Shared Service</div>
            <div>{sharedServiceWorking() ? "Working" : "Not working"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

