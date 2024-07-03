import { Navigate } from "@solidjs/router";
import { createRenderEffect, createSignal } from "solid-js";
import { getRequestEvent, isServer } from "solid-js/web";
import { usePreferences } from "~/stores/preferencesStore";
import { parseCookie } from "~/utils/helpers";

export default function Home() {
  const [defaultHomePage, setDefaultHomePage] = createSignal("Trending");
  createRenderEffect(() => {
    if (!isServer) return;
    const event = getRequestEvent();

    const cookie = parseCookie(event?.request.headers.get("cookie") ?? "");
    setDefaultHomePage(cookie.defaultHomePage ?? "Trending");
  });
  return (
    <>
      <Navigate href={`/${defaultHomePage()?.toLowerCase()}`} />
    </>
  );
}
