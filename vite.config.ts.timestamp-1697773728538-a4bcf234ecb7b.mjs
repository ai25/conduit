// vite.config.ts
import solid from "file:///home/ai6/dev/conduit/node_modules/.pnpm/solid-start@0.2.32_@solidjs+meta@0.28.6_@solidjs+router@0.8.3_solid-js@1.7.12_solid-start-nod_cnbgaqvdqmb4mhoic4c22kzgha/node_modules/solid-start/vite/plugin.js";
import { defineConfig } from "file:///home/ai6/dev/conduit/node_modules/.pnpm/vite@4.4.9_@types+node@20.8.2/node_modules/vite/dist/node/index.js";
import vercel from "file:///home/ai6/dev/conduit/node_modules/.pnpm/solid-start-vercel@0.2.32_solid-start@0.2.32_vite@4.4.9/node_modules/solid-start-vercel/index.js";
import { VitePWA } from "file:///home/ai6/dev/conduit/node_modules/.pnpm/vite-plugin-pwa@0.16.5_vite@4.4.9_workbox-build@7.0.0_workbox-window@7.0.0/node_modules/vite-plugin-pwa/dist/index.js";
var pwaOptions = {
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
    type: "module"
    // navigateFallback: "/",
  },
  minify: false,
  manifest: {
    name: "Conduit",
    short_name: "Conduit",
    background_color: "#000000",
    theme_color: "#fa4b4b",
    icons: [
      {
        src: "img/icons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "img/icons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "img/icons/android-chrome-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "img/icons/android-chrome-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  }
};
var vite_config_default = defineConfig({
  ssr: {
    noExternal: ["@kobalte/core", "@internationalized/message"]
  },
  build: {
    target: "esnext",
    sourcemap: true
  },
  plugins: [solid({ adapter: vercel() }), VitePWA(pwaOptions)]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9haTYvZGV2L2NvbmR1aXRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2FpNi9kZXYvY29uZHVpdC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9haTYvZGV2L2NvbmR1aXQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgc29saWQgZnJvbSBcInNvbGlkLXN0YXJ0L3ZpdGVcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgZGV2dG9vbHMgZnJvbSBcInNvbGlkLWRldnRvb2xzL3ZpdGVcIjtcbmltcG9ydCB2ZXJjZWwgZnJvbSBcInNvbGlkLXN0YXJ0LXZlcmNlbFwiO1xuaW1wb3J0IHsgTWFuaWZlc3RPcHRpb25zLCBWaXRlUFdBLCBWaXRlUFdBT3B0aW9ucyB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcbmltcG9ydCByZXBsYWNlIGZyb20gXCJAcm9sbHVwL3BsdWdpbi1yZXBsYWNlXCI7XG5cbmNvbnN0IHB3YU9wdGlvbnM6IFBhcnRpYWw8Vml0ZVBXQU9wdGlvbnM+ID0ge1xuICBiYXNlOiBcIi9cIixcbiAgbW9kZTogXCJkZXZlbG9wbWVudFwiLFxuICAvLyBzdHJhdGVnaWVzOiBcImdlbmVyYXRlU1dcIixcbiAgLy8gcmVnaXN0ZXJUeXBlOiBcImF1dG9VcGRhdGVcIixcbiAgc3JjRGlyOiBcInNyY1wiLFxuICBmaWxlbmFtZTogXCJjbGFpbXMtc3cudHNcIixcbiAgc3RyYXRlZ2llczogXCJpbmplY3RNYW5pZmVzdFwiLFxuICByZWdpc3RlclR5cGU6IFwiYXV0b1VwZGF0ZVwiLFxuXG4gIGRldk9wdGlvbnM6IHtcbiAgICBlbmFibGVkOiB0cnVlLFxuICAgIHR5cGU6IFwibW9kdWxlXCIsXG5cbiAgICAvLyBuYXZpZ2F0ZUZhbGxiYWNrOiBcIi9cIixcbiAgfSxcbiAgbWluaWZ5OiBmYWxzZSxcbiAgbWFuaWZlc3Q6IHtcbiAgICBuYW1lOiBcIkNvbmR1aXRcIixcbiAgICBzaG9ydF9uYW1lOiBcIkNvbmR1aXRcIixcbiAgICBiYWNrZ3JvdW5kX2NvbG9yOiBcIiMwMDAwMDBcIixcbiAgICB0aGVtZV9jb2xvcjogXCIjZmE0YjRiXCIsXG4gICAgaWNvbnM6IFtcbiAgICAgIHtcbiAgICAgICAgc3JjOiBcImltZy9pY29ucy9hbmRyb2lkLWNocm9tZS0xOTJ4MTkyLnBuZ1wiLFxuICAgICAgICBzaXplczogXCIxOTJ4MTkyXCIsXG4gICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBzcmM6IFwiaW1nL2ljb25zL2FuZHJvaWQtY2hyb21lLTUxMng1MTIucG5nXCIsXG4gICAgICAgIHNpemVzOiBcIjUxMng1MTJcIixcbiAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHNyYzogXCJpbWcvaWNvbnMvYW5kcm9pZC1jaHJvbWUtbWFza2FibGUtMTkyeDE5Mi5wbmdcIixcbiAgICAgICAgc2l6ZXM6IFwiMTkyeDE5MlwiLFxuICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxuICAgICAgICBwdXJwb3NlOiBcIm1hc2thYmxlXCIsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBzcmM6IFwiaW1nL2ljb25zL2FuZHJvaWQtY2hyb21lLW1hc2thYmxlLTUxMng1MTIucG5nXCIsXG4gICAgICAgIHNpemVzOiBcIjUxMng1MTJcIixcbiAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcbiAgICAgICAgcHVycG9zZTogXCJtYXNrYWJsZVwiLFxuICAgICAgfSxcbiAgICBdLFxuICB9LFxufTtcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHNzcjoge1xuICAgIG5vRXh0ZXJuYWw6IFtcIkBrb2JhbHRlL2NvcmVcIiwgXCJAaW50ZXJuYXRpb25hbGl6ZWQvbWVzc2FnZVwiXSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6IFwiZXNuZXh0XCIsXG4gICAgc291cmNlbWFwOiB0cnVlLFxuICB9LFxuXG4gIHBsdWdpbnM6IFtzb2xpZCh7IGFkYXB0ZXI6IHZlcmNlbCgpIH0pLCBWaXRlUFdBKHB3YU9wdGlvbnMpXSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFpUCxPQUFPLFdBQVc7QUFDblEsU0FBUyxvQkFBb0I7QUFFN0IsT0FBTyxZQUFZO0FBQ25CLFNBQTBCLGVBQStCO0FBR3pELElBQU0sYUFBc0M7QUFBQSxFQUMxQyxNQUFNO0FBQUEsRUFDTixNQUFNO0FBQUE7QUFBQTtBQUFBLEVBR04sUUFBUTtBQUFBLEVBQ1IsVUFBVTtBQUFBLEVBQ1YsWUFBWTtBQUFBLEVBQ1osY0FBYztBQUFBLEVBRWQsWUFBWTtBQUFBLElBQ1YsU0FBUztBQUFBLElBQ1QsTUFBTTtBQUFBO0FBQUEsRUFHUjtBQUFBLEVBQ0EsUUFBUTtBQUFBLEVBQ1IsVUFBVTtBQUFBLElBQ1IsTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osa0JBQWtCO0FBQUEsSUFDbEIsYUFBYTtBQUFBLElBQ2IsT0FBTztBQUFBLE1BQ0w7QUFBQSxRQUNFLEtBQUs7QUFBQSxRQUNMLE9BQU87QUFBQSxRQUNQLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLFFBQ1AsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxLQUFLO0FBQUEsUUFDTCxPQUFPO0FBQUEsUUFDUCxNQUFNO0FBQUEsUUFDTixTQUFTO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxRQUNFLEtBQUs7QUFBQSxRQUNMLE9BQU87QUFBQSxRQUNQLE1BQU07QUFBQSxRQUNOLFNBQVM7QUFBQSxNQUNYO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjtBQUNBLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLEtBQUs7QUFBQSxJQUNILFlBQVksQ0FBQyxpQkFBaUIsNEJBQTRCO0FBQUEsRUFDNUQ7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxFQUNiO0FBQUEsRUFFQSxTQUFTLENBQUMsTUFBTSxFQUFFLFNBQVMsT0FBTyxFQUFFLENBQUMsR0FBRyxRQUFRLFVBQVUsQ0FBQztBQUM3RCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
