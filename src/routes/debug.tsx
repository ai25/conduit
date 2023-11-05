import { createEffect, createSignal } from "solid-js";
import { isServer } from "solid-js/web";
import { toast } from "~/components/Toast";
import { useSyncStore } from "~/stores/syncStore";
import { SharedService } from "~/utils/SharedService";

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
  const isUnlimitedStorageSupported = () => {
    if (isServer) return false;
    return typeof navigator.storage.persist !== "undefined";
  }
  const isUnlimitedStorageEnabled = async () => {
    if (isServer) return false;
    return await navigator.storage.persisted();
  }

  const enableUnlimitedStorage = async () => {
    if (isServer) return false;
    await navigator.storage.persist().then((granted) => {
      if (granted) {
        toast.success("Unlimited storage enabled");
        setUnlimitedStorageEnabled(true);
      } else {
        toast.error("Unlimited storage not enabled");
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
  // const isSharedServiceWorking = async () => {
  //   if (isServer) return false;
  //   const sharedService = new SharedService("test");
  //     sharedService.activate((e) => {
  //       console.log("shared service", e);
  //     }






  const [opfsSupported, setOPFSSupported] = createSignal(false);
  const [webRTCSupported, setWebRTCSupported] = createSignal(false);
  const [serviceWorkerEnabled, setServiceWorkerEnabled] = createSignal(false);
  const [unlimitedStorageEnabled, setUnlimitedStorageEnabled] = createSignal(false);
  const [webWorkerSupported, setWebWorkerSupported] = createSignal(false);
  const [locksSupported, setLocksSupported] = createSignal(false);
  const [unlimitedStorageSupported, setUnlimitedStorageSupported] = createSignal(false);
  const [serviceWorkerSupported, setServiceWorkerSupported] = createSignal(false);
  const [createSyncAccessHandleEnabled, setCreateSyncAccessHandleEnabled] = createSignal(false);
  const [messageChannelSupported, setMessageChannelSupported] = createSignal(false);
  const [broadcastChannelSupported, setBroadcastChannelSupported] = createSignal(false);


  createEffect(async () => {
    setOPFSSupported(await isOPFSSupported());
    setWebRTCSupported(await isWebRTCSupported());
    setServiceWorkerEnabled(await isServiceWorkerEnabled());
    setUnlimitedStorageEnabled(await isUnlimitedStorageEnabled());
    setWebWorkerSupported(isWebWorkerSupported());
    setLocksSupported(isLocksSupported());
    setUnlimitedStorageSupported(isUnlimitedStorageSupported());
    setServiceWorkerSupported(isServiceWorkerSupported());
    setCreateSyncAccessHandleEnabled(await isCreateSyncAccessHandleEnabled());
    setMessageChannelSupported(isMessageChannelSupported());
    setBroadcastChannelSupported(isBroadcastChannelSupported());

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
            <div class="font-bold">Unlimited Storage</div>
            <div>{unlimitedStorageSupported() ? "Supported" : "Not supported"}</div>
          </div>
          <div class="flex flex-row justify-between">
            <div class="font-bold">Unlimited Storage Enabled</div>
            <div>{unlimitedStorageEnabled() ? "Enabled" : "Not enabled"}</div>
            <span class="cursor-pointer underline text-primary" onClick={enableUnlimitedStorage}>Enable</span>
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
        </div>
      </div>
    </div>
  );
}

