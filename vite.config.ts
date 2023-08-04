import solid from "solid-start/vite";
import { defineConfig } from "vite";
import devtools from "solid-devtools/vite";
import vercel from "solid-start-vercel";

export default defineConfig({
  plugins: [
    devtools({
      /* features options - all disabled by default */
      autoname: true, // e.g. enable autoname
      locator: true, // enables DOM locator tab
    }),
    solid({ adapter: vercel({ edge: true }) }),
  ],
});
