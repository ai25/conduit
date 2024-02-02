import { createEffect, createSignal } from "solid-js";
import { A, useSearchParams } from "solid-start";

export default function Link(props: LinkProps) {

  const [searchParams] = useSearchParams();
  const [href, setHref] = createSignal(props.href);
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
    <A href={href()}
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


