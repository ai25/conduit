import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";

class PipedApi {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async fetchData<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(this.baseURL + endpoint, options);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from endpoint: ${endpoint}`);
    }
    return await response.json();
  }

  public async search(query: string, filter?: string): Promise<any> {
    return this.fetchData(`/search?q=${query}&filter=${filter || ""}`);
  }

  public async suggestions(query: string): Promise<string[]> {
    return this.fetchData<string[]>(`/suggestions?query=${query}`);
  }

  public async nextPageSearch(): Promise<any> {
    return this.fetchData(`/nextpage/search`);
  }

  public async streams(id: string): Promise<any> {
    return this.fetchData(`/streams/${id}`);
  }

  public async playlists(listId: string): Promise<any> {
    return this.fetchData(`/playlists/${listId}`);
  }

  public async nextPageChannel(channelId: string): Promise<any> {
    return this.fetchData(`/nextpage/channel/${channelId}`);
  }

  public async channelsTabs(data?: string): Promise<any> {
    const endpoint = data ? `/channels/tabs?data=${data}` : "/channels/tabs";
    return this.fetchData(endpoint);
  }

  public async feedUnauthenticated(channels: any[]): Promise<any> {
    return this.fetchData(`/feed/unauthenticated`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(channels),
    });
  }

  public async comments(videoId: string, nextPage?: string): Promise<any> {
    const endpoint = nextPage
      ? `/nextpage/comments/${videoId}?nextpage=${nextPage}`
      : `/comments/${videoId}`;
    return this.fetchData(endpoint);
  }
}

function useApiStore() {
  const [store, setStore] = createStore({
    baseURL: "https://pipedapi.kavin.rocks",
    api: new PipedApi("https://pipedapi.kavin.rocks"),
  });

  return {
    get baseURL() {
      return store.baseURL;
    },
    set baseURL(value: string) {
      setStore("baseURL", value);
      setStore("api", new PipedApi(value));
    },
    get api() {
      return store.api;
    },
  };
}

const ApiContext = createContext(useApiStore());

export const ApiProvider = (props: any) => {
  return (
    <ApiContext.Provider value={useApiStore()}>
      {props.children}
    </ApiContext.Provider>
  );
};
export const useApi = () => useContext(ApiContext);
