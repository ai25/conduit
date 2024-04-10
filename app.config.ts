import { defineConfig } from "@solidjs/start/config";
import { ManifestOptions, VitePWA, VitePWAOptions } from "vite-plugin-pwa";
import { PWA_ICONS } from "./src/config/constants";

const pwaOptions: Partial<VitePWAOptions> = {
  base: "/",
  mode: "development",
  // strategies: "generateSW",
  // registerType: "autoUpdate",
  srcDir: "src",
  filename: "claims-sw.ts",
  strategies: "injectManifest",
  scope: "/",
  // selfDestroying: true,
  devOptions: {
    enabled: true,
    type: "module",
    // navigateFallback: "/",
  },
  minify: false,
  manifest: {
    name: "Conduit",
    short_name: "Conduit",
    background_color: "#000000",
    theme_color: "rgb(23,23,18)",
    icons: PWA_ICONS,
  },
};
const config = defineConfig({
  vite: {
    build: {
      target: "esnext",
      sourcemap: true,
    },
    ssr: {
      noExternal: ["@kobalte/core", "@internationalized/message"],
    },
    plugins: [VitePWA(pwaOptions)],
  },
  // ssr: false,
});

export default config;
