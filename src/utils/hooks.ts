import { Accessor, createSignal, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";

function stringifyOptions(options: Record<string, any> = {}): string {
  return Object.keys(options).reduce((acc, key) => {
    if (key === "days") {
      return acc;
    } else {
      if (options[key] === false) {
        return acc;
      } else if (options[key] === true) {
        return `${acc}; ${key}`;
      } else {
        return `${acc}; ${key}=${options[key]}`;
      }
    }
  }, "");
}

const setCookie = (
  name: string,
  value: string,
  options: Record<string, any>
) => {
  if (isServer) return;

  const optionsWithDefaults = {
    days: 7,
    path: "/",
    ...options,
  };

  const expires = new Date(
    Date.now() + optionsWithDefaults.days * 864e5
  ).toUTCString();

  document.cookie =
    name +
    "=" +
    encodeURIComponent(value) +
    "; expires=" +
    expires +
    stringifyOptions(optionsWithDefaults);
};

const getCookie = (name: string, initialValue = "") => {
  return (
    (!isServer &&
      document.cookie.split("; ").reduce((r, v) => {
        const parts = v.split("=");
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
      }, "")) ||
    initialValue
  );
};

export function useCookie(
  key: string,
  initialValue: string
): [
  Accessor<string | (() => string)>,
  (value: string, options?: Record<string, any>) => void,
] {
  const [item, setItem] = createSignal<string | (() => string)>(() => {
    return getCookie(key, initialValue);
  });

  const updateItem = (value: string, options = {}) => {
    setItem(value);
    setCookie(key, value, options);
  };

  return [item, updateItem];
}

export const useOnClickOutside = (refs: any[], onOutsideClick: () => void) => {
  const handleClickOutside = (event: MouseEvent) => {
    if (refs.length > 0) {
      const isOutside = refs.every(
        (ref) => !ref || !ref.contains(event.target as Node)
      );
      if (isOutside) {
        onOutsideClick();
      }
    }
  };

  onMount(() => {
    if (isServer) return;
    document.addEventListener("click", handleClickOutside, false);
  });

  onCleanup(() => {
    if (isServer) return;
    document.removeEventListener("click", handleClickOutside, false);
  });
};

export const useDocumentEvent = <K extends keyof DocumentEventMap>(
  event: K,
  callback: (event: DocumentEventMap[K]) => void
) => {
  onMount(() => {
    if (isServer) return;
    document.addEventListener(event, callback);
  });
  onCleanup(() => {
    if (isServer) return;
    document.removeEventListener(event, callback);
  });
};

export const useWindowEvent = <K extends keyof WindowEventMap>(
  event: K,
  callback: (event: WindowEventMap[K]) => void
) => {
  onMount(() => {
    if (isServer) return;
    window.addEventListener(event, callback);
  });
  onCleanup(() => {
    if (isServer) return;
    window.removeEventListener(event, callback);
  });
};

export const useDisposable = (fn: () => () => any) => {
  const [unsubscribe, setUnsubscribe] = createSignal(() => {});
  onMount(() => {
    setUnsubscribe(fn());
  });
  onCleanup(() => {
    unsubscribe()?.();
  });
};

export const useInterval = (handler: TimerHandler, timeout?: number) => {
  const [intervalId, setIntervalId] = createSignal<number>();

  onMount(() => {
    setIntervalId(setInterval(handler, timeout));
  });
  onCleanup(() => {
    clearInterval(intervalId());
  });
};
