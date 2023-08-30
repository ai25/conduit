export async function fetchJson(
  url: string,
  params?: Record<string, string>,
  options?: RequestInit
): Promise<any> {
  if (params) {
    const urlObj = new URL(url);
    for (const param in params) {
      if (params.hasOwnProperty(param)) {
        urlObj.searchParams.set(param, params[param]);
      }
    }
    url = urlObj.toString();
  }

  const response = await fetch(url, options);
  return response.json();
}

export function classNames(
  ...classes: (string | boolean | undefined)[]
): string {
  return classes.filter(Boolean).join(" ");
}

export function assertType<T>(item: any, property: string, value: string) {
  if (item[property] === value) {
    return item as T;
  }
}

export function generateThumbnailUrl(proxyUrl: string, videoId: string) {
  return `${proxyUrl}/vi/${videoId}/mqdefault.jpg?host=i.ytimg.com`;
}
