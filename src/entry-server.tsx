// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";
import { parseCookie } from "./utils/helpers";
import { getRequestEvent } from "solid-js/web";

export default createHandler(() => {
  const event = getRequestEvent();

  const cookie = parseCookie(event?.request.headers.get("cookie") ?? "");
  const theme = cookie.theme ?? "monokai";
  return (
    <StartServer
      document={({ assets, children, scripts }) => (
        <html class={theme} lang="en">
          <head>
            <meta charset="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <link rel="icon" href="/favicon.ico" />
            {assets}
          </head>
          <body class="bg-black text-white scrollbar">
            <div id="app">{children}</div>
            {scripts}
          </body>
        </html>
      )}
    />
  );
});
