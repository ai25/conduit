import solid from "solid-start/vite";
import { defineConfig } from "vite";
import devtools from "solid-devtools/vite";
import vercel from "solid-start-vercel";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    // devtools({
    //   /* features options - all disabled by default */
    //   autoname: true, // e.g. enable autoname
    //   locator: true, // enables DOM locator tab
    // }),
    solid({ adapter: vercel() }),
    VitePWA({
      registerType: "autoUpdate",
      
      workbox: {
        globPatterns: [
          "**/*.{js,css,html,ico,svg,png}",
          "manifest.webmanifest","manifest.json"
        ],
        globIgnores: ["**/*-legacy-*.js"],
        runtimeCaching: [
          {
            urlPattern: /https:\/\/[a-zA-Z./0-9_]*\.(?:otf|ttf)/i,
            handler: "CacheFirst",
            options: {
              cacheName: "fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /https:\/\/[a-zA-Z./0-9_]*\.(?:png|jpg|jpeg|svg)/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 30, // <== 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: "Conduit",
        short_name: "Conduit",
        background_color: "#000000",
        theme_color: "#fa4b4b",
        icons: [
          {
            src: "img/icons/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "img/icons/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "img/icons/android-chrome-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "img/icons/android-chrome-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
