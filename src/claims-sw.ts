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

declare let self: ServiceWorkerGlobalScope;

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
];

try {
  precache([...self.__WB_MANIFEST, ...PRECACHE_ROUTES]);
} catch (e) {
  console.error("Error in precache:", e);
}

const navigationHandler = new NetworkFirst({
  cacheName: "navigations",
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
  ],
});

const navigationRoute = new NavigationRoute(navigationHandler, {
  allowlist: [new RegExp("^/$"), /^\/[^._]+$/],
});

registerRoute(navigationRoute);

registerRoute(
  /\.(?:js|ts|jsx|tsx)$/,
  new NetworkFirst({
    cacheName: "js-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 500,
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
self.addEventListener("message", async (event: ExtendableMessageEvent) => {
  console.log("Received message in service worker:", event.data);

  if (event.data?.sharedService) {
    console.log("Entering sharedService condition");

    const client = await self.clients.get(event.data.clientId);

    if (client) {
      console.log("Client found:", client);
      client.postMessage(event.data, (event as any).ports);
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
self.addEventListener("fetch", async (event: FetchEvent) => {
  if (event.request.url === self.registration.scope + "clientId") {
    return event.respondWith(
      new Response(event.clientId, {
        headers: { "Content-Type": "text/plain" },
      })
    );
  }
});
