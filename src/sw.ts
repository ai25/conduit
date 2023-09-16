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
// Cache any cross-origin font
registerRoute(
  // Ensure you adjust the regex to match the kind of assets you're fetching
  /\.(?:woff|woff2|ttf|otf|eot)$/,
  new StaleWhileRevalidate({
    cacheName: "font-cache",
  })
);
// Cache any cross-origin css
registerRoute(
  // Ensure you adjust the regex to match the kind of assets you're fetching
  /\.(?:css)$/,
  new StaleWhileRevalidate({
    cacheName: "css-cache",
  })
);
// Cache any cross-origin js
registerRoute(
  // Ensure you adjust the regex to match the kind of assets you're fetching
  /\.(?:js)$/,
  new StaleWhileRevalidate({
    cacheName: "js-cache",
  })
);
// Cache any cross-origin html
registerRoute(
  // Ensure you adjust the regex to match the kind of assets you're fetching
  /\.(?:html)$/,
  new StaleWhileRevalidate({
    cacheName: "html-cache",
  })
);
// Cache any cross-origin json
registerRoute(
  // Ensure you adjust the regex to match the kind of assets you're fetching
  /\.(?:json)$/,
  new StaleWhileRevalidate({
    cacheName: "json-cache",
  })
);
// Cache all routes
registerRoute(
  // Ensure you adjust the regex to match the kind of assets you're fetching
  /\/$/,
  new StaleWhileRevalidate({
    cacheName: "all-cache",
  })
);

// Prompt For Update Behavior
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
