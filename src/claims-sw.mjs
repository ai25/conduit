/// <reference lib="webworker" />

import { clientsClaim, skipWaiting } from "workbox-core";
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precache,
  precacheAndRoute,
} from "workbox-precaching";
// import { clientsClaim } from "workbox-core";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheFirst, NetworkFirst } from "workbox-strategies";
import { warmStrategyCache } from "workbox-recipes";

self.skipWaiting();
clientsClaim();
// clean old assets
cleanupOutdatedCaches();

const __BUILD_REVISION__ = Date.now().toString(); // TODO: figure out a better way to add revisions

const PRECACHE_ROUTES = [
  {
    url: "/",
    revision: __BUILD_REVISION__,
  },
  {
    url: "/feed",
    revision: __BUILD_REVISION__,
  },
  {
    url: "/import",
    revision: __BUILD_REVISION__,
  },
  {
    url: "/watch",
    revision: __BUILD_REVISION__,
  },
  {
    url: "/trending",
    revision: __BUILD_REVISION__,
  },
  {
    url: "/import",
    revision: __BUILD_REVISION__,
  },
  {
    url: "/library",
    revision: __BUILD_REVISION__,
  },
  {
    url: "/library/history",
    revision: __BUILD_REVISION__,
  },
  {
    url: "/library/playlists",
    revision: __BUILD_REVISION__,
  },
  {
    url: "/library/downloads",
    revision: __BUILD_REVISION__,
  },
  {
    url: "/library/blocklist",
    revision: __BUILD_REVISION__,
  },
  {
    url: "/library/subscriptions",
    revision: __BUILD_REVISION__,
  },
  {
    url: "/results",
    revision: __BUILD_REVISION__,
  },
  {
    url: "/playlist",
    revision: __BUILD_REVISION__,
  },
  {
    url: "/channel/*",
    revision: __BUILD_REVISION__,
  },
  {
    url: "/preferences",
    revision: __BUILD_REVISION__,
  },
];

// TODO: Change back when VitePWA works with solid start
const manifest = self.__WB_MANIFEST
  .map((asset) => ({
    ...asset,
    url: `/_build/${asset.url}`,
  }))
  .concat(PRECACHE_ROUTES);
try {
  precacheAndRoute(manifest);
} catch (e) {
  console.error("Error in precache:", e);
}

registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
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
  console.log("Received message in service worker:", event.data);

  if (event.data?.sharedService) {
    console.log("Entering sharedService condition");

    const client = await self.clients.get(event.data.clientId);

    if (client) {
      console.log("Client found:", client);
      client.postMessage(event.data, event.ports);
    } else {
      console.error("Client not found for clientId:", event.data.clientId);
    }
  } else {
    console.warn("sharedService property not found in event data");
  }
});
// Tell clients their clientId. A service worker isn't actually needed
// for a context to get its clientId, but this also doubles as a way
// to verify that the service worker is active.
self.addEventListener("fetch", async (event) => {
  if (event.request.url === self.registration.scope + "clientId") {
    return event.respondWith(
      new Response(event.clientId, {
        headers: { "Content-Type": "text/plain" },
      })
    );
  }
});
