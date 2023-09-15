import { createEffect } from "solid-js";

export default function Downloads() {
  createEffect(async () => {
    const root = await navigator.storage.getDirectory();
    console.log(root, Object.keys(root));
    const downloaded = JSON.parse(localStorage.getItem("downloaded") || "[]");
    for (const id of downloaded) {
      const dir = await root.getDirectoryHandle(id, { create: false });
      console.log(dir);
    }
  });
  return (
    <>
      <h1>Downloads</h1>
    </>
  );
}
