import { Dynamic, Portal } from "solid-js/web";
import {
  Component,
  createEffect,
  createSignal,
  JSX,
  onCleanup,
  onMount,
} from "solid-js";
import useIntersectionObserver from "~/hooks/useIntersectionObserver";

const DEFAULT_THRESHOLD = 50;

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
    document.body.classList.add("overflow-hidden");
    window.visualViewport!.addEventListener("resize", onViewportChange);
  });

  onCleanup(() => {
    document.body.classList.remove("overflow-hidden");
    window.visualViewport!.removeEventListener("resize", onViewportChange);
  });

  createEffect(() => {
    snapPoints = getSnapPoints(maxHeight());
  });

  let snapPoints: number[] = [];

  let touchStartPosition = 0;
  let lastTouchPosition = 0;
  const acceptIds = new Set<string>(["sb-handle", "sb-overlay"]);

  const onTouchStart: JSX.EventHandlerUnion<HTMLDivElement, TouchEvent> = (
    event
  ) => {
    if (!acceptIds.has(event.target.id)) {
      return;
    }
    isSnapVariant && setIsSnapping(false);

    touchStartPosition = lastTouchPosition = event.touches[0].clientY;
  };

  const onTouchMove: JSX.EventHandlerUnion<HTMLDivElement, TouchEvent> = (
    event
  ) => {
    if (!acceptIds.has(event.target.id)) {
      return;
    }
    let dragDistance = 0;

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

  const onTouchEnd: JSX.EventHandlerUnion<HTMLDivElement, TouchEvent> = (
    event
  ) => {
    if (!acceptIds.has(event.target.id)) {
      return;
    }
    let currentPoint = 0;
    let closestPoint = 0;

    switch (props.variant) {
      case "snap":
        currentPoint = maxHeight() - lastTouchPosition;

        closestPoint = snapPoints.reduce((previousVal, currentVal) => {
          return Math.abs(currentVal - currentPoint) <
            Math.abs(previousVal - currentPoint)
            ? currentVal
            : previousVal;
        });

        if (closestPoint === 0) {
          setIsClosing(true);
          break;
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

  const onOverlayClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (
    event
  ) => {
    if (event.target.id === "sb-overlay") {
      setIsClosing(true);
    }
  };
  const [intersectionRef, setIntersectionRef] = createSignal<
    HTMLDivElement | undefined
  >(undefined);
  const isIntersecting = useIntersectionObserver({
    setTarget: () => intersectionRef(),
  });
  createEffect(() => {
    if (isIntersecting()) {
      props.onIntersect?.();
    }
  });
  const MaxHeight = () => (
    <div
      style={{
        "overflow-y": "auto",
        "max-height": `calc(100vh - ${bottomsheetTranslateValue()}px)`,
      }}
    >
      {props.children}
    </div>
  );

  return (
    <Portal>
      <div
        id="sb-overlay"
        class="fixed inset-0 flex items-end bg-bg1/50 z-50"
        onClick={onOverlayClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          classList={{
            "w-full bg-bg1 ": true,
            "animate-slideDown": isClosing(),
            "animate-slideUp": !isClosing(),
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
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div class="w-10 h-1 m-auto bg-bg3" />
          </div>
          <div
            id="sb-content"
            class="relative w-full h-full bg-bg1 overflow-auto"
          >
            <MaxHeight />
            <div
              class="w-full h-40 bg-primary"
              ref={(ref) => setIntersectionRef(ref)}
            />
          </div>
        </div>
      </div>
    </Portal>
  );
};
