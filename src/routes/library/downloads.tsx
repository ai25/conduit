import { createEffect } from "solid-js";

export default function Downloads() {
  createEffect(async () => {
    const root = await navigator.storage.getDirectory();
    console.log(root, Object.keys(root));
  });
  return (
    <>
      <h1>Downloads</h1>
    </>
  );
}
