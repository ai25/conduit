import { createEffect, createSignal } from "solid-js";
import { A, useSearchParams } from "solid-start";
import { useAppState } from "~/stores/appStateStore";

export default function Link(props: LinkProps) {

  const [searchParams] = useSearchParams();
  const [href, setHref] = createSignal(props.href);
  const [appState, setAppState] = useAppState();

  createEffect(() => {
    const fullscreen = searchParams.fullscreen === "true";
    try {
      const hrefUrl = new URL(`${window.location.origin}${props.href}`);
      if (fullscreen) {
        hrefUrl.searchParams.set("fullscreen", "true");
      } else {
        hrefUrl.searchParams.delete("fullscreen");
      }
      const relativePath = hrefUrl.pathname;

      setHref(`${relativePath}${hrefUrl.search}${hrefUrl.hash}`);
    } catch (e) {
      console.error(e, props.href);
    }

  })


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
      }
      }
      href={href()}
      class={props.class}
      style={props.style}
      activeClass={props.activeClass}
      inactiveClass={props.inactiveClass}
    >
      {props.children}
    </A>
  )

}
interface LinkProps {
  href: string;
  class?: string;
  style?: any;
  children?: any;
  activeClass?: string;
  inactiveClass?: string;
}


