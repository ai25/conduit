import { DocTypeDescription } from "@syncedstore/core/types/doc";
import {
  createContext,
  createEffect,
  createSignal,
  from,
  onCleanup,
  useContext,
} from "solid-js";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebrtcProvider } from "y-webrtc";
import { videoId } from "~/routes/library/history";
import { Playlist, Preferences, RelatedStream } from "~/types";
import OpfsPersistence from "~/utils/y-opfs";
console.log("syncedStore.tsx");
import * as Y from "yjs";
import { createStore } from "solid-js/store";
import createYjsStore from "~/lib/createYjsStore";
import { useAppState } from "./appStateStore";

export type HistoryItem = RelatedStream & {
  id: string;
  watchedAt: number;
  currentTime: number;
};

export interface Store extends DocTypeDescription {
  playlists: Record<string, Playlist>;
  history: Record<string, HistoryItem>;
  subscriptions: string[];
  preferences: Preferences;
}
const storeShape: Store = {
  playlists: {},
  history: {},
  subscriptions: [],
  preferences: {} as Preferences,
};
const defaultPreferences = {
  autoplay: false,
  pip: false,
  muted: false,
  volume: 1,
  speed: 1,
  quality: "auto",
  theatreMode: false,
  instance: {
    name: "Piped",
    api_url: "https://pipedapi.kavin.rocks",
    cache: true,
    cdn: true,
    last_checked: new Date().getTime(),
    locations: "",
    version: "0.0.0",
    registered: 0,
    s3_enabled: false,
    up_to_date: false,
    image_proxy_url: "https://pipedproxy.kavin.rocks",
  },
};

const [initialStore] = createStore<Store>({
  playlists: {},
  history: {},
  subscriptions: [],
  preferences: {} as Preferences,
});

const doc = new Y.Doc({
  guid: "test",
});
const [store, setStore] = createYjsStore<Store>(doc, initialStore, true);
const SyncContext = createContext({ store, setStore });

export const SyncedStoreProvider = (props: { children: any }) => {
  const [room, setRoom] = createSignal(
    "localStorage" in globalThis
      ? (JSON.parse(localStorage.getItem("room") || "{}") as {
          id?: string;
          password?: string;
        })
      : {}
  );

  let webrtcProvider: WebrtcProvider | null = null;
  let idbProvider: IndexeddbPersistence | null = null;

  const initWebrtc = async () => {
    if (!room().id) return;
    if (webrtcProvider) {
      console.log("disconnecting");
      webrtcProvider.disconnect();
    }
    webrtcProvider = new WebrtcProvider(room().id!, doc, {
      signaling: ["wss://signaling.fly.dev"],
      ...(room()!.password && { password: room().password }),
    });
    console.log(webrtcProvider, "webrtc provider");
    webrtcProvider.connect();
  };

  createEffect(async () => {
    await initWebrtc();
    webrtcProvider?.connect();
  });
  const [, setAppState] = useAppState();

  createEffect(async () => {
    if (!room().id) return;
    console.time("indexeddb");
    idbProvider = new IndexeddbPersistence(room().id!, doc);
    idbProvider.whenSynced.then(() => {
      console.timeEnd("indexeddb");
      console.log("synced");
    });
  });
  onCleanup(() => {
    webrtcProvider?.disconnect();
  });

  return (
    <SyncContext.Provider value={{ store, setStore }}>
      {props.children}
    </SyncContext.Provider>
  );
};

export const useSyncedStore = () => useContext(SyncContext);

export function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function jsonClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

interface QueryCriteria<T> {
  filter?: (item: T) => boolean;
  sort?: (a: T, b: T) => number;
}

interface UpdateCriteria<T> {
  where: { id: string };
  data: Partial<T>;
}
async function* asyncBatchItems<T>(
  items: T[],
  batchSize: number,
  progressCallback: (progress: number) => void
) {
  let index = 0;
  while (index < items.length) {
    yield new Promise<T[]>((resolve) => {
      setTimeout(() => {
        const batch = items.slice(index, index + batchSize);
        resolve(batch);
        progressCallback(index + batch.length);
      }, 0);
    });
    index += batchSize;
  }
}

function createCRUDModule<T extends { id?: string }>(name: keyof Store) {
  return {
    create: (store: Store, data: T) => {
      if (!data) return;
      (store[name] as T[]).push(clone(data));
    },
    createMany: async (
      store: Store,
      datas: T[],
      progressCallback?: (progress: number) => void
    ) => {
      const batchSize = 100;
      let progress = 0;
      for await (const batch of asyncBatchItems(
        datas,
        batchSize,
        (newProgress) => {
          progress = newProgress;
          progressCallback?.(progress);
        }
      )) {
        (store[name] as T[]).push(...batch.map((data) => clone(data)));
      }
    },
    findUnique: (store: Store, id: string) => {
      if (!id) return;
      const item = (store[name] as T[]).find((item) => item.id === id);
      if (!item) return undefined;
      return clone(item);
    },
    findMany: (store: Store, criteria?: QueryCriteria<T>) => {
      const items = (store[name] as T[])
        .filter(criteria?.filter || (() => true))
        .sort(criteria?.sort);
      if (items.length === 0) return undefined;
      return clone(items);
    },
    findFirst: (store: Store, criteria?: QueryCriteria<T>) => {
      const item = (store[name] as T[]).find(criteria?.filter || (() => true));
      if (!item) return undefined;
      return clone(item);
    },
    update: (store: Store, criteria: UpdateCriteria<T>) => {
      const index = (store[name] as T[]).findIndex(
        (p) => p.id === criteria.where.id
      );
      if (index === -1) return undefined;
      const item = clone((store[name] as T[])[index]);
      const updatedItem = { ...item, ...criteria.data };
      (store[name] as T[]).splice(index, 1, updatedItem);
    },

    updateMany: (store: Store, criteria: UpdateCriteria<T>[]) => {
      if (!criteria || criteria.length === 0) return undefined;
      let updated = false;
      criteria.forEach((criterion) => {
        const index = (store[name] as T[]).findIndex(
          (p) => p.id === criterion.where.id
        );
        if (index !== -1) {
          updated = true;
          const item = clone((store[name] as T[])[index]);
          const updatedItem = { ...item, ...criterion.data };
          (store[name] as T[]).splice(index, 1, updatedItem);
        }
      });
      if (!updated) return undefined;
    },

    upsert: (store: Store, criteria: UpdateCriteria<T>) => {
      if (!criteria) return undefined;
      const index = (store[name] as T[]).findIndex(
        (p) => p.id === criteria.where.id
      );
      if (index !== -1) {
        console.time("clone");
        const item = clone((store[name] as T[])[index]);
        console.timeEnd("clone");
        const upsertedItem = { ...item, ...criteria.data };
        console.time("splice");
        setTimeout(() => {
          (store[name] as T[]).splice(index, 1, upsertedItem);
        }, 0);
        console.timeEnd("splice");
      } else {
        const upsertedItem = criteria.data;
        (store[name] as T[]).push(upsertedItem as T);
      }
    },
    upsertMany: (store: Store, data: T[]) => {
      if (!data || data.length === 0) return undefined;
      console.time("spliceMany");
      const prevData = clone(store[name]) as T[];
      let newData;
      //remove duplicates
      newData = data.filter((item) => {
        const index = prevData.findIndex((prevItem) => prevItem.id === item.id);
        if (index !== -1) {
          prevData.splice(index, 1);
          return false;
        }
        return true;
      });
      //add new items
      newData = [...prevData, ...newData];
      (store[name] as T[]).splice(0, (store[name] as T[]).length, ...newData);
      console.timeEnd("spliceMany");
    },

    delete: (store: Store, filter: (item: T) => boolean) => {
      if (!filter) return undefined;
      const filteredItems = (store[name] as T[]).filter(filter);
      console.log(filteredItems);
      if (filteredItems.length === 0) return undefined;
      filteredItems.forEach((item) => {
        const index = (store[name] as T[]).indexOf(item);
        console.log(index);
        if (index !== -1) (store[name] as T[]).splice(index, 1);
      });
    },

    deleteMany: (store: Store, filters?: ((item: T) => boolean)[]) => {
      if (!filters || filters.length === 0) return undefined;
      let deleted = false;
      filters.forEach((filter) => {
        const filteredItems = (store[name] as T[]).filter(filter);
        if (filteredItems.length > 0) deleted = true;
        filteredItems.forEach((item) => {
          const index = (store[name] as T[]).indexOf(item);
          if (index !== -1) (store[name] as T[]).splice(index, 1);
        });
      });
      if (!deleted) return undefined;
    },
    removeDuplicates: (store: Store) => {
      const seen = new Map<string, number>();
      const toRemove: [number, number][] = [];
      let rangeStart = -1;

      (store[name] as T[]).forEach((item, index) => {
        const id = videoId(item);
        console.log(!!videoId(item));
        if (!seen.has(id)) {
          seen.set(id, index);
          if (rangeStart !== -1) {
            toRemove.push([rangeStart, index - rangeStart]);
            rangeStart = -1;
          }
        } else if (rangeStart === -1) {
          rangeStart = index;
        }
      });
      console.log(toRemove);
      let removed = 0;
      for (const [start, length] of toRemove.reverse()) {
        (store[name] as T[]).splice(start, length);
        removed += length;
      }
      return removed;
    },
  };
}

export const SyncedDB = {
  playlists: createCRUDModule<Store["playlists"][0]>("playlists"),
  history: createCRUDModule<Store["history"][0]>("history"),
  subscriptions: {
    create: (store: Store, subscription: string) => {
      store.subscriptions.push(subscription);
    },
    createMany: (store: Store, subscriptions: string[]) => {
      store.subscriptions.push(...subscriptions);
    },
    delete: (store: Store, subscription: string) => {
      const index = store.subscriptions.indexOf(subscription);
      if (index !== -1) store.subscriptions.splice(index, 1);
    },
    deleteMany: (
      store: Store,
      criteria?: (subscription: string) => boolean
    ) => {
      if (criteria) {
        store.subscriptions = store.subscriptions.filter(
          (subscription) => !criteria(subscription)
        );
      } else {
        store.subscriptions = [];
      }
    },
  },
  dangerousClearDb: (store: Store, idb: IndexeddbPersistence) => {
    const data = clone(store);
    idb.clearData();
    return data;
  },
  restoreData: (store: Store, data: Store) => {
    SyncedDB.playlists.upsertMany(store, data.playlists);
    SyncedDB.history.upsertMany(store, data.history);
    SyncedDB.subscriptions.createMany(store, data.subscriptions);
  },
};
