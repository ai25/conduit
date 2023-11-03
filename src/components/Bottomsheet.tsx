import { Dynamic, Portal } from "solid-js/web";
import {
  Component,
  createEffect,
  createSignal,
  JSX,
  onCleanup,
  onMount,
} from "solid-js";

const DEFAULT_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 0.5; // Units: pixels/ms


export interface BaseSolidBottomsheetProps {
  children: JSX.Element;
  onClose: () => void;
  onIntersect?: () => void;
}

export interface DefaultVariantProps extends BaseSolidBottomsheetProps {
  variant: "default";
}

export interface SnapVariantProps extends BaseSolidBottomsheetProps {
  variant: "snap";
  defaultSnapPoint: ({ maxHeight }: { maxHeight: number }) => number;
  snapPoints: ({ maxHeight }: { maxHeight: number }) => number[];
}

export type SolidBottomsheetProps = DefaultVariantProps | SnapVariantProps;

export const Bottomsheet: Component<SolidBottomsheetProps> = (props) => {
  const isSnapVariant = props.variant === "snap";

  const [maxHeight, setMaxHeight] = createSignal(window.visualViewport!.height);
  const [isClosing, setIsClosing] = createSignal(false);
  const [isSnapping, setIsSnapping] = createSignal(false);

  const getDefaultTranslateValue = () => {
    if (isSnapVariant) {
      const defaultValue = props.defaultSnapPoint({ maxHeight: maxHeight() });
      if (defaultValue !== maxHeight()) {
        return window.innerHeight - defaultValue;
      }
    }
    return 0;
  };

  const getSnapPoints = (maxHeight: number): number[] => {
    return isSnapVariant
      ? [0, ...props.snapPoints({ maxHeight }).sort((a, b) => b - a)]
      : [];
  };

  const clampInRange = ({
    minimum,
    maximum,
    current,
  }: Record<"minimum" | "maximum" | "current", number>): number =>
    Math.min(Math.max(current, minimum), maximum);

  const [bottomsheetTranslateValue, setBottomsheetTranslateValue] =
    createSignal(getDefaultTranslateValue());

  const onViewportChange = () => {
    setMaxHeight(window.visualViewport!.height);
  };

  onMount(() => {
    // document.body.classList.add("overflow-hidden");
    window.visualViewport!.addEventListener("resize", onViewportChange);
  });

  onCleanup(() => {
    // document.body.classList.remove("overflow-hidden");
    window.visualViewport!.removeEventListener("resize", onViewportChange);
  });

  createEffect(() => {
    snapPoints = getSnapPoints(maxHeight());
  });

  let snapPoints: number[] = [];

  let touchStartPosition = 0;
  let lastTouchPosition = 0;
  const acceptIds = new Set<string>(["sb-handle", "sb-content"]);

  let lastTouchTime = 0;
  let velocityY = 0;

  const onTouchStart: JSX.EventHandlerUnion<HTMLDivElement, TouchEvent> = (
    event
  ) => {
    if (!acceptIds.has(event.target.id) && !isEventFromContentChildren(event)) {
      return;
    }
    lastTouchTime = event.timeStamp;
    isSnapVariant && setIsSnapping(false);

    touchStartPosition = lastTouchPosition = event.touches[0].clientY;
    event.preventDefault();
    event.stopPropagation();
  };
  const [contentScrollTop, setContentScrollTop] = createSignal(1);
  const [isInitialTouch, setIsInitialTouch] = createSignal(true);

  const onTouchMoveHandle: JSX.EventHandlerUnion<HTMLDivElement, TouchEvent> = (
    event
  ) => {
    if (event.target.id !== "sb-handle") return;
    event.preventDefault();
    let dragDistance = 0;
    const currentTime = event.timeStamp;
    const timeDelta = currentTime - lastTouchTime;
    if (timeDelta > 0) {
      // Calculate velocity in pixels per millisecond
      velocityY = dragDistance / timeDelta;
    }
    lastTouchTime = currentTime;

    switch (props.variant) {
      case "snap":
        dragDistance = event.touches[0].clientY - lastTouchPosition;

        setBottomsheetTranslateValue((previousVal) =>
          clampInRange({
            minimum: 0,
            maximum: maxHeight(),
            current: previousVal + dragDistance,
          })
        );

        lastTouchPosition = event.touches[0].clientY;

        break;
      case "default":
      default:
        lastTouchPosition = event.touches[0].clientY;
        dragDistance = lastTouchPosition - touchStartPosition;

        if (dragDistance > 0) {
          setBottomsheetTranslateValue(dragDistance);
        }

        break;
    }
  };

  const onTouchMoveContent: JSX.EventHandlerUnion<
    HTMLDivElement,
    TouchEvent
  > = (event) => {
    if (!isEventFromContentChildren(event)) return;
    console.log("onTouchMoveContent", contentScrollTop());
    if (contentScrollTop() > 5) return;
    let dragDistance = 0;
    const currentTime = event.timeStamp;
    lastTouchTime = currentTime;

    switch (props.variant) {
      case "snap":
        dragDistance = event.touches[0].clientY - lastTouchPosition;

        setBottomsheetTranslateValue((previousVal) =>
          clampInRange({
            minimum: 0,
            maximum: maxHeight(),
            current: previousVal + dragDistance,
          })
        );

        lastTouchPosition = event.touches[0].clientY;

        break;
      case "default":
      default:
        lastTouchPosition = event.touches[0].clientY;
        dragDistance = lastTouchPosition - touchStartPosition;

        if (dragDistance > 0) {
          setBottomsheetTranslateValue(dragDistance);
        }

        break;
    }
  };
  async function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const isInertialScrolling = async (lastScrollTop: number) => {
    await wait(100);
    return new Promise((resolve) => {
      if (lastScrollTop === contentScrollTop()) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  };

  const onTouchEnd: JSX.EventHandlerUnion<HTMLDivElement, TouchEvent> = async (
    event
  ) => {
    if (!acceptIds.has(event.target.id) && !isEventFromContentChildren(event)) {
      return;
    }
    let currentPoint = 0;
    let closestPoint = 0;
    const swipeDuration = event.timeStamp - lastTouchTime;
    const swipeDistance = lastTouchPosition - touchStartPosition;
    const swipeVelocity = -swipeDistance / swipeDuration;
    console.log("swipeVelocity", swipeVelocity, velocityY);

    switch (props.variant) {
      case "snap":
        if (event.target.id !== "sb-handle") {
          if (await isInertialScrolling(contentScrollTop())) {
            console.log("isInertialScrolling");
            return;
          }
          setContentScrollTop(Math.max(0, contentScrollTop() - 1));
          if (contentScrollTop() > 5) {
            console.log("contentScrollTop", contentScrollTop());
            return;
          }
        }
        // Decide to snap or close based on the swipe velocity as well as the distance
        if (Math.abs(swipeVelocity) > VELOCITY_THRESHOLD || Math.abs(swipeDistance) > DEFAULT_THRESHOLD) {
          // If the swipe is quick or long enough, determine the closest snap point or closing
          currentPoint = (maxHeight() - lastTouchPosition) + (swipeVelocity * 2)

          // Use velocity to determine if we should adjust our snap point
          closestPoint = snapPoints.reduce((previousVal, currentVal) => {
            return Math.abs(currentVal - currentPoint) <
              Math.abs(previousVal - currentPoint)
              ? currentVal
              : previousVal;
          });

        } else {
          currentPoint = maxHeight() - bottomsheetTranslateValue();
          closestPoint = snapPoints.reduce((previousVal, currentVal) => {
            return Math.abs(currentVal - currentPoint) <
              Math.abs(previousVal - currentPoint)
              ? currentVal
              : previousVal;
          }
          );
        }

        if (closestPoint === 0) {
          setIsClosing(true);
        }

        setIsSnapping(true);
        setBottomsheetTranslateValue(maxHeight() - closestPoint);

        break;
      case "default":
      default:
        if (lastTouchPosition - touchStartPosition > DEFAULT_THRESHOLD) {
          setIsClosing(true);
        } else {
          setBottomsheetTranslateValue(0);
        }

        break;
    }
  };

  const isEventFromContentChildren = (
    event: TouchEvent | MouseEvent
  ): boolean => {
    let target: EventTarget | null = event.target;

    while (target) {
      if ((target as HTMLElement).id === "sb-content") {
        return true;
      }

      target = (target as HTMLElement).parentElement;
    }

    return false;
  };

  let sbHandle!: HTMLDivElement
  onMount(() => {
    const options = { passive: false };
    sbHandle.addEventListener("touchstart", onTouchStart as any, options);
    sbHandle.addEventListener("touchmove", onTouchMoveHandle as any, options);
    sbHandle.addEventListener("touchend", onTouchEnd as any, options);
    sbHandle.addEventListener("touchcancel", onTouchEnd as any, options);

    onCleanup(() => {
      sbHandle.removeEventListener("touchstart", onTouchStart as any);
      sbHandle.removeEventListener("touchmove", onTouchMoveHandle as any);
      sbHandle.removeEventListener("touchend", onTouchEnd as any);
      sbHandle.removeEventListener("touchcancel", onTouchEnd as any);
    });
  });

  return (
    <Portal>
      <div
        id="sb-overlay"
        class="fixed inset-0 flex items-end pointer-events-none z-[999999]"
      >
        <div
          classList={{
            "w-full bg-bg1 pointer-events-auto": true,
            "animate-out slide-out-to-bottom duration-500": isClosing(),
            "animate-in slide-in-from-bottom ": !isClosing(),
            "transition-all duration-250": isSnapping(),
          }}
          style={{
            transform: `translateY(${bottomsheetTranslateValue()}px)`,
            ...(isSnapVariant ? { height: `${maxHeight()}px` } : {}),
          }}
          {...(isClosing() ? { onAnimationEnd: props.onClose } : {})}
        >
          <div
            id="sb-handle"
            class="py-5 my-0 mx-auto bg-bg1"
            ref={sbHandle}

          >
            <div class="w-10 h-1 m-auto bg-bg3 pointer-events-none" />
          </div>
          <div
            id="sb-content"
            class="relative w-full h-full bg-bg1 overscroll-contain"
            classList={{
              "overflow-y-auto": true,
            }}
            style={{
              height: `calc(100vh - ${bottomsheetTranslateValue()}px)`,
            }}
            onScroll={(e) => {
              setContentScrollTop(e.currentTarget.scrollTop + 1);
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMoveContent}
            onTouchEnd={onTouchEnd}
          >
            {props.children}
          </div>
        </div>
      </div>
    </Portal>
  );
};
