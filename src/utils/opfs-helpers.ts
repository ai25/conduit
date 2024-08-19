import { PipedVideo } from "~/types";
export const createRoomInfo = (name: string) => {
  function genPassword(passwordLength: number) {
    let chars =
      "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let password = "";
    for (let i = 0; i <= passwordLength; i++) {
      var randomNumber = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomNumber, randomNumber + 1);
    }
    return password;
  }
  const password = genPassword(24);
  const id =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  return { name, id, password };
};

export const getDownloadedOPFSVideos = async () => {
  const root = await navigator.storage.getDirectory();
  const allVideosDir = await root.getDirectoryHandle("__videos");
  let videos: PipedVideo[] = [];
  console.log(allVideosDir, "allVideosDir");
  for await (const entry of (allVideosDir as any).values()) {
    if (entry.kind === "directory") {
      try {
        console.log(entry, "allVideosDir");
        const completed = await entry.getFileHandle("completed");
        console.log(completed, "completed");
        if (!completed) continue;
        const stream = await entry.getFileHandle("streams.json");
        if (!stream) continue;
        const file = await stream.getFile();
        const data = await file.text();
        const json = JSON.parse(data);
        const thumbnailFileHandle = await entry.getFileHandle("thumbnail");
        let thumbnailUrl = "";
        if (thumbnailFileHandle) {
          const thumbnailFile = await thumbnailFileHandle.getFile();
          thumbnailUrl = URL.createObjectURL(thumbnailFile);
        }
        videos = [...videos, { ...json, id: entry.name, thumbnailUrl }];
      } catch (e) {
        console.error(e);
        continue;
      }
    }
  }
  return videos;
};
export async function getRooms(): Promise<
  { name: string; id: string; password: string }[]
> {
  const allData = await getAllFilesAndDirectories();
  const rooms = Object.values(allData).filter(
    (v) => (v as any).contents?.["yjs_updates.bin"]
  );
  const getInfo = async (room: FileSystemFileHandle) => {
    console.log(room);
    const file = await room.getFile();
    const json = JSON.parse(await file.text());
    return {
      name: json.name as string,
      id: json.id as string,
      password: json.password as string,
    };
  };
  return Promise.all(
    rooms.map(async (room: any) => {
      let handle = (room as any).contents["room_info.json"]?.handle;
      // compat. TODO: remove eventually
      if (!handle) {
        const newRoomInfo = createRoomInfo(room.name);
        const dirHandle: FileSystemDirectoryHandle = room.handle;
        handle = await dirHandle.getFileHandle("room_info.json", {
          create: true,
        });
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify({ ...newRoomInfo, id: room.name }));
        await writable.close();
      }
      const info = await getInfo(handle);

      return info;
    })
  );
}

export async function deleteRoom(id: string) {
  const root = await navigator.storage.getDirectory();
  await root.removeEntry(id, { recursive: true });
  return id;
}
export async function renameRoom(id: string, newName: string) {
  const root = await navigator.storage.getDirectory();
  const dirHandle: FileSystemDirectoryHandle =
    await root.getDirectoryHandle(id);
  const infoHandle = await dirHandle.getFileHandle("room_info.json", {});
  const infoFile = await infoHandle.getFile();
  const infoText = await infoFile.text();
  const info = JSON.parse(infoText);
  const newRoomInfo = { ...info, name: newName };
  const writable = await infoHandle.createWritable();
  await writable.write(JSON.stringify(newRoomInfo));
  await writable.close();
  return newRoomInfo;
}

export async function createRoom(name: string) {
  const newRoomInfo = createRoomInfo(name);
  const root = await navigator.storage.getDirectory();
  const dirHandle: FileSystemDirectoryHandle = await root.getDirectoryHandle(
    newRoomInfo.id,
    { create: true }
  );
  const infoHandle = await dirHandle.getFileHandle("room_info.json", {
    create: true,
  });
  const writable = await infoHandle.createWritable();
  await writable.write(JSON.stringify(newRoomInfo));
  await writable.close();
  return newRoomInfo;
}
export async function getRoomInfo(id: string) {
  const root = await navigator.storage.getDirectory();
  const dirHandle: FileSystemDirectoryHandle =
    await root.getDirectoryHandle(id);
  const infoHandle = await dirHandle.getFileHandle("room_info.json", {});
  const infoFile = await infoHandle.getFile();
  const infoText = await infoFile.text();
  const info = JSON.parse(infoText);
  return info;
}

export async function getAllFilesAndDirectories() {
  const root = await navigator.storage.getDirectory();
  const result = {};

  async function getFileDetails(
    fileHandle: FileSystemFileHandle,
    parentDir: FileSystemDirectoryHandle
  ) {
    const file = await fileHandle.getFile();
    return {
      parentDir,
      handle: fileHandle,
      name: fileHandle.name,
      kind: "file",
      type: file.type,
      size: file.size,
    };
  }

  async function traverseDirectory(
    dirHandle: FileSystemDirectoryHandle,
    dirObj: Record<string, any>
  ) {
    for await (const entry of (dirHandle as any).values()) {
      if (entry.kind === "file") {
        const fileDetails = await getFileDetails(entry, dirHandle);
        dirObj[entry.name] = fileDetails;
      } else if (entry.kind === "directory") {
        dirObj[entry.name] = {
          parentDir: dirHandle,
          handle: entry,
          name: entry.name,
          kind: "directory",
          contents: {},
        };
        await traverseDirectory(entry, dirObj[entry.name].contents);
      }
    }
  }

  await traverseDirectory(root, result);
  return result;
}
