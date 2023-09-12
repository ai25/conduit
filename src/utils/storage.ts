function testLocalStorage() {
  try {
    if (window.localStorage !== undefined) localStorage;
    return true;
  } catch {
    return false;
  }
}

export function setStorageValue(
  key: string,
  value: any,
  storage: "sessionStorage" | "localStorage" = "localStorage"
) {
  if (typeof window === "undefined") return;
  if (!testLocalStorage()) return;
  switch (storage) {
    case "localStorage":
      localStorage.setItem(key, JSON.stringify(value));
      break;
    case "sessionStorage":
      sessionStorage.setItem(key, JSON.stringify(value));
      break;
    default:
      throw new Error(`Invalid storage: ${storage}`);
  }
}

export function getStorageValue(
  key: string,
  defaultVal: any,
  type: "boolean" | "string" | "number" | "json" = "string",
  source: "localStorage" | "sessionStorage"
) {
  if (typeof window === "undefined") return defaultVal;

  const urlValue = new URLSearchParams(window.location.search).get(key);
  const storageValue =
    source === "localStorage" && testLocalStorage()
      ? localStorage.getItem(key)
      : sessionStorage.getItem(key);

  const value = urlValue !== null ? urlValue : storageValue;

  if (value !== null) {
    switch (type) {
      case "boolean":
        switch (String(value).toLowerCase()) {
          case "true":
          case "1":
          case "on":
          case "yes":
            return true;
          default:
            return false;
        }
      case "string":
        return value;
      case "number":
        return Number(value);
      case "json":
        try {
          const json = JSON.parse(value);
          if (typeof json === "string") return JSON.parse(json);
          return json;
        } catch (e) {
          console.error(e);
          return defaultVal;
        }
      default:
        throw new Error(`Invalid type: ${type}`);
    }
  } else {
    return defaultVal;
  }
}
