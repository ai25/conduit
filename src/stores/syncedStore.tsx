import syncedStore, { getYjsDoc, observeDeep } from "@syncedstore/core";
import { DocTypeDescription } from "@syncedstore/core/types/doc";
import {
  createContext,
  createEffect,
  from,
  Accessor,
  createSignal,
} from "solid-js";
import { isServer } from "solid-js/web";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebrtcProvider } from "y-webrtc";
import { Playlist, RelatedStream } from "~/types";

export type HistoryItem = RelatedStream & {
  id: string;
  watchedAt: number;
  currentTime: number;
};

interface StorePlaylist extends Playlist {
  id: string;
}
export interface Store extends DocTypeDescription {
  playlists: StorePlaylist[];
  history: HistoryItem[];
  subscriptions: string[];
}

export function clone<T>(obj: T): T {
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

function createCRUDModule<T extends { id?: string }>(name: keyof Store) {
  return {
    create: (store: Store, data: T) => {
      if (!data) return;
      (store[name] as T[]).push(clone(data));
    },
    createMany: (store: Store, datas: T[]) => {
      if (!datas) return;
      datas.forEach((data) => (store[name] as T[]).push(clone(data)));
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
        const item = clone((store[name] as T[])[index]);
        const upsertedItem = { ...item, ...criteria.data };
        (store[name] as T[]).splice(index, 1, upsertedItem);
      } else {
        const upsertedItem = criteria.data;
        (store[name] as T[]).push(upsertedItem as T);
      }
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
};
