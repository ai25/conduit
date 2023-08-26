import { beforeEach, expect, test } from "vitest";
import { Store, SyncedDB, clone } from "./syncedStore";

const initialStore: Store = {
  playlists: [
    { id: "1", name: "Playlist 1" },
    { id: "2", name: "Playlist 2" },
  ],
  history: [
    { id: "2", title: "History 2" },
    { id: "1", title: "History 1" },
    { id: "3", title: "History 3" },
  ],
  subscriptions: ["sub1", "sub2", "sub4"],
} as unknown as Store;

let mockStore: Store;

beforeEach(() => {
  mockStore = new Proxy(clone(initialStore), {});
});

test("clone function should create a deep clone of the object", () => {
  const obj = { id: "1", name: "Test", nested: { field: "value" } };
  const proxy = new Proxy(obj, {});
  const clonedObj = clone(proxy);
  expect(clonedObj).toEqual(obj);
  expect(clonedObj).not.toBe(obj);
  expect(clonedObj.nested).toEqual(obj.nested);
  expect(clonedObj.nested).not.toBe(obj.nested);
});

test("create function should add a new playlist", () => {
  const newPlaylist = { id: "3", name: "Playlist 3" } as Store["playlists"][0];
  SyncedDB.playlists.create(mockStore, newPlaylist);
  expect(mockStore.playlists.length).toBe(3);
  expect(mockStore.playlists[2]).toEqual({ id: "3", name: "Playlist 3" });
});

test("createMany function should add multiple playlists", () => {
  const newPlaylists = [
    { id: "3", name: "Playlist 3" },
    { id: "4", name: "Playlist 4" },
  ] as Store["playlists"];
  SyncedDB.playlists.createMany(mockStore, newPlaylists);
  expect(mockStore.playlists.length).toBe(4);
  expect(mockStore.playlists[2]).toEqual({ id: "3", name: "Playlist 3" });
});

test("findFirst function should return the first playlist", () => {
  const playlist = SyncedDB.playlists.findFirst(mockStore);
  expect(playlist).toEqual({ id: "1", name: "Playlist 1" });
});

test("findMany function should return all items matching the criteria", () => {
  const history = SyncedDB.history.findMany(mockStore, {
    filter: (item) => item.title.includes("History"),
  });
  expect(history).toEqual([
    { id: "2", title: "History 2" },
    { id: "1", title: "History 1" },
    { id: "3", title: "History 3" },
  ]);
});

test("findFirst function should return the first playlist matching the criteria", () => {
  const playlist = SyncedDB.playlists.findFirst(mockStore, {
    filter: (item) => item.name.includes("Playlist"),
  });
  expect(playlist).toEqual({ id: "1", name: "Playlist 1" });
});

test("findUnique function should return a specific playlist", () => {
  const playlist = SyncedDB.playlists.findUnique(mockStore, "1");
  expect(playlist).toEqual({ id: "1", name: "Playlist 1" });
});

test("findUnique returns undefined if no item is found", () => {
  const playlist = SyncedDB.playlists.findUnique(mockStore, "3");
  expect(playlist).toBeUndefined();
});

test("sort function should sort items by name", () => {
  const history = SyncedDB.history.findMany(mockStore, {
    sort: (a, b) => a.title.localeCompare(b.title),
  });
  expect(history).toEqual([
    { id: "1", title: "History 1" },
    { id: "2", title: "History 2" },
    { id: "3", title: "History 3" },
  ]);
});

test("update function should update a specific playlist", () => {
  SyncedDB.playlists.update(mockStore, {
    where: { id: "1" },
    data: { name: "Updated Playlist" },
  });
  expect(mockStore.playlists[0].name).toBe("Updated Playlist");
});

test("upsert function should update or insert a specific playlist", () => {
  SyncedDB.playlists.upsert(mockStore, {
    where: { id: "3" },
    data: { id: "3", name: "Upserted Playlist" },
  });
  expect(mockStore.playlists.length).toBe(3);
  expect(mockStore.playlists[2]).toEqual({
    id: "3",
    name: "Upserted Playlist",
  });
});

test("delete function should remove a specific playlist", () => {
  SyncedDB.playlists.delete(mockStore, (playlist) => playlist.id === "1");
  expect(mockStore.playlists.length).toBe(1);
  expect(mockStore.playlists[0]).toEqual({ id: "2", name: "Playlist 2" });
});

test("deleteMany function should remove multiple playlists", () => {
  SyncedDB.playlists.deleteMany(mockStore, [
    (playlist) => playlist.id === "1",
    (playlist) => playlist.id === "2",
  ]);
  expect(mockStore.playlists.length).toBe(0);
});

test("deleteMany function for subscriptions should remove all subscriptions matching the criteria", () => {
  SyncedDB.subscriptions.deleteMany(
    mockStore,
    (subscription) => subscription === "sub1"
  );
  expect(mockStore.subscriptions).toEqual(["sub2", "sub4"]);
});

// Test update with no matching ID
test("update: no match", () => {
  const result = SyncedDB.playlists.update(mockStore, {
    where: { id: "10" },
    data: { name: "newPlaylist10" },
  });
  expect(result).toBeUndefined();
});

// Test updateMany with no criteria
test("updateMany: no criteria", () => {
  const result = SyncedDB.playlists.updateMany(mockStore, []);
  expect(result).toBeUndefined();
});

// Test updateMany with no matches
test("updateMany: no matches", () => {
  const result = SyncedDB.playlists.updateMany(mockStore, [
    { where: { id: "10" }, data: { name: "newPlaylist10" } },
    { where: { id: "11" }, data: { name: "newPlaylist11" } },
  ]);
  expect(result).toBeUndefined();
});

// Test upsert with no criteria
test("upsert: no criteria", () => {
  const result = SyncedDB.playlists.upsert(mockStore, null as any);
  expect(result).toBeUndefined();
});

// Test delete with no filter
test("delete: no filter", () => {
  const result = SyncedDB.playlists.delete(mockStore, null as any);
  expect(result).toBeUndefined();
});

// Test delete with no matches
test("delete: no matches", () => {
  const result = SyncedDB.playlists.delete(mockStore, (p) => p.id === "10");
  expect(result).toBeUndefined();
});

// Test deleteMany with no filters
test("deleteMany: no filters", () => {
  const result = SyncedDB.playlists.deleteMany(mockStore, []);
  expect(result).toBeUndefined();
});

// Test deleteMany with no matches
test("deleteMany: no matches", () => {
  const result = SyncedDB.playlists.deleteMany(mockStore, [
    (p) => p.id === "10",
    (p) => p.id === "11",
  ]);
  expect(result).toBeUndefined();
});
