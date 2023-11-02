import { clientsClaim, skipWaiting } from "workbox-core";
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
// import { clientsClaim } from "workbox-core";
// import { NavigationRoute, registerRoute } from "workbox-routing";
// import { CacheFirst } from "workbox-strategies";
// import { CacheableResponsePlugin } from "workbox-cacheable-response";
// import { ExpirationPlugin } from "workbox-expiration";
//
declare let self: ServiceWorkerGlobalScope;

skipWaiting();
clientsClaim();
// clean old assets
cleanupOutdatedCaches();
// import { NetworkFirst } from "workbox-strategies";
//
// // Precache assets
try {
precacheAndRoute([
  ...self.__WB_MANIFEST,
  // {
  //   url: "/library",
  //   revision: `${new Date().getTime()}`,
  // },
  // {
  //   url: "/",
  //   revision: `${new Date().getTime()}`,
  // },
  // {
  //   url: "/library/history",
  //   revision: `${new Date().getTime()}`,
  // },
]);
} catch (e) {
  console.error('Error in precacheAndRoute:', e);
}
//
// // Custom handler to manage offline fallback
// const networkFirstHandlerWithFallback = new NetworkFirst({
//   cacheName: "dynamic-cache",
//   plugins: [
//     new CacheableResponsePlugin({
//       statuses: [0, 200],
//     }),
//     new ExpirationPlugin({
//       maxEntries: 50,
//       maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
//     }),
//   ],
//   fetchOptions: {
//     mode: "cors",
//   },
// });
//
// registerRoute(
//   new NavigationRoute(networkFirstHandlerWithFallback, {
//     denylist: [/^\/_/, new RegExp("/[^/?]+\\.[^/]+$")],
//   })
// );
//
// registerRoute(
//   /\.(?:png|jpg|jpeg|svg|gif|com)$/,
//   new CacheFirst({
//     cacheName: "image-cache",
//     plugins: [
//       new CacheableResponsePlugin({
//         statuses: [0, 200],
//       }),
//       new ExpirationPlugin({
//         maxEntries: 100,
//         maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
//       }),
//       {
//         cacheKeyWillBeUsed: async ({ request }) => {
//           return request.url;
//         },
//       },
//     ],
//   })
// );

// Forward messages (and ports) from client to client.
self.addEventListener("message", async (event: ExtendableMessageEvent) => {
  console.log('Received message in service worker:', event.data); // Log the received data

  if (event.data?.sharedService) {
    console.log('Entering sharedService condition');

    const client = await self.clients.get(event.data.clientId);
    
    if (client) {
      console.log('Client found:', client);
      client.postMessage(event.data, event.ports);
    } else {
      console.error('Client not found for clientId:', event.data.clientId); // Log if client is not found
    }

  } else {
    console.warn('sharedService property not found in event data'); // Warning if sharedService is not present in the message
  }
});
// Tell clients their clientId. A service worker isn't actually needed
// for a context to get its clientId, but this also doubles as a way
// to verify that the service worker is active.
self.addEventListener("fetch", async (event: FetchEvent) => {
  if (event.request.url === self.registration.scope + "clientId") {
    return event.respondWith(
      new Response(event.clientId, {
        headers: { "Content-Type": "text/plain" },
      })
    );
  }
});
