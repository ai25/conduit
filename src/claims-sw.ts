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
precacheAndRoute(self.__WB_MANIFEST);

// clean old assets
cleanupOutdatedCaches();

let allowlist: undefined | RegExp[];
if (import.meta.env.DEV) allowlist = [/.*/];

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL("/"), { allowlist }));
// precache index.html
precacheAndRoute([
  {
    url: "index.html",
    revision: null,
  },
]);

// cache any cross-origin image
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif)$/,
  new StaleWhileRevalidate({
    cacheName: "image-cache",
  })
);
// cache any cross-origin font
registerRoute(
  /\.(?:woff|woff2|ttf|otf|eot)$/,
  new StaleWhileRevalidate({
    cacheName: "font-cache",
  })
);
// cache any cross-origin css
registerRoute(
  /\.(?:css)$/,
  new StaleWhileRevalidate({
    cacheName: "css-cache",
  })
);
// cache any cross-origin js
registerRoute(
  /\.(?:js)$/,
  new StaleWhileRevalidate({
    cacheName: "js-cache",
  })
);
// cache any cross-origin tsx
registerRoute(
  /\.(?:tsx)$/,
  new StaleWhileRevalidate({
    cacheName: "tsx-cache",
  })
);
// cache any cross-origin webmanifest
registerRoute(
  /\.(?:webmanifest)$/,
  new StaleWhileRevalidate({
    cacheName: "webmanifest-cache",
  })
);

self.skipWaiting();
clientsClaim();
