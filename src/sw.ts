import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";
import { clientsClaim } from "workbox-core";

declare let self: ServiceWorkerGlobalScope;

// Clean up outdated caches
cleanupOutdatedCaches();

// Precache and route
precacheAndRoute(self.__WB_MANIFEST);

// Auto Update Behavior
self.skipWaiting();
clientsClaim();

// Cache any cross-origin image
registerRoute(
  // Ensure you adjust the regex to match the kind of assets you're fetching
  /\.(?:png|jpg|jpeg|svg|gif)$/,
  new StaleWhileRevalidate({
    cacheName: "image-cache",
  })
);

// Prompt For Update Behavior
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
