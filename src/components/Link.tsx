import { A, useLocation, useSearchParams } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";
import { useAppState } from "~/stores/appStateStore";

export default function Link(props: LinkProps) {
  const [searchParams] = useSearchParams();
  const [href, setHref] = createSignal(props.href);
  const [appState, setAppState] = useAppState();
  const location = useLocation();

  createEffect(() => {
    const fullscreen = searchParams.fullscreen === "true";
    try {
      const hrefUrl = new URL(props.href, window.location.origin);

      // Merge params from location.search, but don't overwrite existing params
      new URLSearchParams(location.search).forEach((value, key) => {
        if (!hrefUrl.searchParams.has(key)) {
          hrefUrl.searchParams.set(key, value);
        }
      });

      hrefUrl.searchParams.delete("t");
      hrefUrl.searchParams.delete("filter");

      if (fullscreen) {
        hrefUrl.searchParams.set("fullscreen", "true");
      } else {
        hrefUrl.searchParams.delete("fullscreen");
      }

      if (!props.href.includes("/channel")) {
        hrefUrl.searchParams.delete("tab");
      }

      if (!props.href.includes("/results")) {
        hrefUrl.searchParams.delete("search_query");
      }

      if (props.href.includes("/watch")) {
        if (!props.href.includes("list=")) {
          hrefUrl.searchParams.delete("list");
          hrefUrl.searchParams.delete("index");
        }
      }
      if (!props.href.includes("list=")) {
        hrefUrl.searchParams.delete("playnext");
      }

      const relativePath = hrefUrl.pathname;
      setHref(`${relativePath}${hrefUrl.search}${hrefUrl.hash}`);
    } catch (e) {
      console.error(e, props.href);
    }
  });

  return (
    <A
      onClick={(e) => {
        // hack to get around the touch events propagating down
        if (appState.touchInProgress) {
          e.preventDefault();
          e.stopPropagation();
          setTimeout(() => {
            setAppState("touchInProgress", false);
          }, 100);
        }
      }}
      href={href()}
      class={props.class}
      classList={props.classList}
      style={props.style}
      activeClass={props.activeClass}
      inactiveClass={props.inactiveClass}
    >
      {props.children}
    </A>
  );
}
interface LinkProps {
  href: string;
  class?: string;
  classList?: Record<string, boolean>;
  style?: any;
  children?: any;
  activeClass?: string;
  inactiveClass?: string;
}
