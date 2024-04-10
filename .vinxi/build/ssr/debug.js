import{ssr as $,ssrHydrationKey as q,isServer as e}from"solid-js/web";import{createSignal as t,createEffect as z}from"solid-js";import{E as G,Y as J,Z as Q}from"./assets/syncStore-DaflpWzS.js";import"./assets/Link-ClDVT-6o.js";import"y-webrtc";import"yjs";import"solid-js/store";import"lib0/observable";import"./assets/index-BPtxG8PX.js";import"./assets/index-wr7A5cEE.js";import"numeral";import"@solid-primitives/date";import"./assets/index-Bhsy5eyg.js";import"./assets/routing-CB9zsxEG.js";import"./assets/components-Bl9pqdE7.js";var V=["<div",' class="p-4"><h1 class="text-2xl font-bold">Debug</h1><div class="flex flex-col space-y-2"><div class="flex flex-col space-y-1"><div class="flex flex-row justify-between"><div class="font-bold">Web Worker</div><div>','</div></div><div class="flex flex-row justify-between"><div class="font-bold">OPFS</div><div>','</div></div><div class="flex flex-row justify-between"><div class="font-bold">WebRTC</div><div>','</div></div><div class="flex flex-row justify-between"><div class="font-bold">Service Worker</div><div>','</div></div><div class="flex flex-row justify-between"><div class="font-bold">Service Worker Enabled</div><div>','</div></div><div class="flex flex-row justify-between"><div class="font-bold">Locks</div><div>','</div></div><div class="flex flex-row justify-between"><div class="font-bold">Persistent Storage</div><div>','</div></div><div class="flex flex-row justify-between"><div class="font-bold">Persistent Storage Enabled</div><div>','</div><span class="cursor-pointer underline text-primary">Enable</span></div><div class="flex flex-row justify-between"><div class="font-bold">Create Sync Access Handle</div><div>','</div></div><div class="flex flex-row justify-between"><div class="font-bold">Message Channel</div><div>','</div></div><div class="flex flex-row justify-between"><div class="font-bold">Broadcast Channel</div><div>','</div></div><div class="flex flex-row justify-between"><div class="font-bold">Shared Service</div><div>',"</div></div></div></div></div>"];function ue(){G();const c=()=>e?!1:typeof Worker<"u",f=async()=>{if(e)return!1;try{return await navigator.storage.getDirectory(),!0}catch{return!1}},p=async()=>{if(e)return!1;try{return await navigator.mediaDevices.getUserMedia({audio:!0}),!0}catch{return!1}},v=()=>e?!1:typeof navigator.serviceWorker<"u",u=async()=>e?!1:await fetch("/clientId").then(r=>r.ok),S=()=>e?!1:typeof navigator.locks<"u",g=()=>e?!1:typeof navigator.storage.persist<"u",w=async()=>e?!1:await navigator.storage.persisted(),b=()=>e?!1:typeof MessageChannel<"u",y=()=>e?!1:typeof BroadcastChannel<"u",x=async()=>{if(e)return!1;const r=`
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
    `,s=new Worker(URL.createObjectURL(new Blob([r])));return new Promise(n=>{s.onmessage=o=>{n(o.data)},s.postMessage("")})},m=async()=>{if(e)return!1;const r=`
    self.onmessage = async () => {
        self.postMessage(true);
    }
    `,s=new Worker(URL.createObjectURL(new Blob([r]))),n=new J("test",()=>Q({read:async()=>(console.log("Calling read"),new Promise((o,a)=>{const d=i=>{o(i.data),s?.removeEventListener("message",d)},l=i=>{i instanceof ErrorEvent&&a(i),s?.removeEventListener("error",l)};s.onerror=l,s.onmessage=d,s.postMessage("")}))}));return new Promise(async o=>{try{await n.activate(async()=>{const a=await n?.proxy.read();console.log("res",a),o(a===!0)})}catch(a){console.error("Error connecting to shared service",a),o(!1)}})},[h,k]=t(!1),[W,E]=t(!1),[C,j]=t(!1),[H,P]=t(!1),[N,M]=t(!1),[L,R]=t(!1),[B,A]=t(!1),[D,O]=t(!1),[T,U]=t(!1),[F,I]=t(!1),[K,Y]=t(!1),[Z,_]=t(!1);return z(async()=>{k(await f()),E(await p()),j(await u()),P(await w()),M(c()),R(S()),A(g()),O(v()),U(await x()),I(b()),Y(y()),_(await m())}),$(V,q(),N()?"Supported":"Not supported",h()?"Supported":"Not supported",W()?"Supported":"Not supported",D()?"Supported":"Not supported",C()?"Enabled":"Not enabled",L()?"Supported":"Not supported",B()?"Supported":"Not supported",H()?"Enabled":"Not enabled",T()?"Enabled":"Not enabled",F()?"Supported":"Not supported",K()?"Supported":"Not supported",Z()?"Working":"Not working")}export{ue as default};
//# sourceMappingURL=debug.js.map
