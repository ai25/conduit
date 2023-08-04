import solid from "solid-start/vite";
import { defineConfig } from "vite";
import devtools from 'solid-devtools/vite'

export default defineConfig({
  plugins: [devtools({
      /* features options - all disabled by default */
      autoname: true, // e.g. enable autoname
      locator: true, // enables DOM locator tab
    }),
    solid()],
});
