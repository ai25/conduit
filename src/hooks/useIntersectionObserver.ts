import { createEffect, createSignal, onCleanup } from "solid-js";

type IntersectionOptions = IntersectionObserverInit & {
  setTarget: () => HTMLElement | undefined;
};

export default function useIntersectionObserver({
  setTarget,
  root = null,
  rootMargin = "0px",
  threshold = 0,
}: IntersectionOptions) {
  const [isIntersecting, setIntersecting] = createSignal(false);

  let observer: IntersectionObserver;

  createEffect(() => {
    observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    onCleanup(() => {
      if (observer) observer.disconnect();
    });
  });

  createEffect(() => {
    const currentTarget = setTarget();
    if (currentTarget && observer) {
      observer.observe(currentTarget);
    }
  });

  return isIntersecting;
}
