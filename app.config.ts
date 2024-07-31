import { defineConfig } from "@solidjs/start/config";
import { ManifestOptions, VitePWA, VitePWAOptions } from "vite-plugin-pwa";
import { PWA_ICONS } from "./src/config/constants";

const pwaOptions: Partial<VitePWAOptions> = {
  base: "/",
  srcDir: "src",
  filename: "claims-sw.mjs",
  strategies: "injectManifest",
  scope: "/",
  devOptions: {
    enabled: true,
    type: "module",
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
  server: {
    preset: "vercel",
  },
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
