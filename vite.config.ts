import solid from "solid-start/vite";
import { defineConfig } from "vite";
import devtools from "solid-devtools/vite";
import vercel from "solid-start-vercel";
import { ManifestOptions, VitePWA, VitePWAOptions } from "vite-plugin-pwa";
import replace from "@rollup/plugin-replace";

const pwaOptions: Partial<VitePWAOptions> = {
  base: "/",
  mode: "development",
  // strategies: "generateSW",
  // registerType: "autoUpdate",
  srcDir: "src",
  filename: "claims-sw.ts",
  strategies: "injectManifest",
  registerType: "autoUpdate",

  devOptions: {
    enabled: true,
    type: "module",
    navigateFallback: "index.html",
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
};
export default defineConfig({
  ssr: {
    noExternal: ["@kobalte/core", "@internationalized/message"],
  },
  build: {
    target: "esnext",
    sourcemap: true,
  },

  plugins: [
    // devtools({
    //   /* features options - all disabled by default */
    //   autoname: true, // e.g. enable autoname
    //   locator: true, // enables DOM locator tab
    // }),
    solid({ adapter: vercel() }),
    VitePWA(pwaOptions),
  ],
});
