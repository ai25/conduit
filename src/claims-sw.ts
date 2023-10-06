import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

declare let self: ServiceWorkerGlobalScope;
self.skipWaiting();
clientsClaim();

// // clean old assets
cleanupOutdatedCaches();

import { NetworkFirst } from "workbox-strategies";

// Precache assets
precacheAndRoute([
  ...self.__WB_MANIFEST,
  {
    url: "/library",
    revision: `${new Date().getTime()}`,
  },
  {
    url: "/",
    revision: `${new Date().getTime()}`,
  },
  {
    url: "/library/history",
    revision: `${new Date().getTime()}`,
  },
]);

// Custom handler to manage offline fallback
const networkFirstHandlerWithFallback = new NetworkFirst({
  cacheName: "dynamic-cache",
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
    }),
  ],
  fetchOptions: {
    mode: "cors",
  },
});

registerRoute(
  new NavigationRoute(networkFirstHandlerWithFallback, {
    denylist: [/^\/_/, new RegExp("/[^/?]+\\.[^/]+$")],
  })
);

registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|com)$/,
  new CacheFirst({
    cacheName: "image-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
      {
        cacheKeyWillBeUsed: async ({ request }) => {
          return request.url;
        },
      },
    ],
  })
);

// Forward messages (and ports) from client to client.
self.addEventListener("message", async (event) => {
  console.log("SW Received Message: " + event.data);
  fetch("/api/claims", {
    method: "POST",
    body: JSON.stringify(event.data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (event.data?.sharedService) {
    const client = await self.clients.get(event.data.clientId);
    client?.postMessage(event.data, event.ports);
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
