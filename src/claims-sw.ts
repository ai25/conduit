import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

// self.__WB_MANIFEST is default injection point
// precacheAndRoute(self.__WB_MANIFEST);

// clean old assets
cleanupOutdatedCaches();

let allowlist: undefined | RegExp[];
allowlist = [/.*/];
import { NetworkFirst } from "workbox-strategies";

// Precache assets
precacheAndRoute([
  ...self.__WB_MANIFEST,
  { url: "/offline.html", revision: "your-revision-id" },
]);

// Custom handler to manage offline fallback
const networkFirstHandlerWithFallback = new NetworkFirst({
  cacheName: "dynamic-cache",
  plugins: [
    // Any other plugins you might want to use
    {
      async handlerDidError() {
        const cache = await caches.open("offline-cache");
        return await cache.match("/offline.html");
      },
    },
  ],
  // This is the important part:
  fetchOptions: {
    mode: "cors",
  },
});

registerRoute(
  new NavigationRoute(networkFirstHandlerWithFallback, {
    denylist: [/^\/_/, new RegExp("/[^/?]+\\.[^/]+$")],
  })
);

// Cache other assets like CSS, JS, and images using StaleWhileRevalidate
registerRoute(
  /\.(?:css|js|jpg|jpeg|png|svg)$/,
  new StaleWhileRevalidate({ cacheName: "static-resources" })
);
self.skipWaiting();
clientsClaim();
