import { Show, createSignal } from "solid-js";
import Button from "./Button";

export default function FileUploadBox(props: {
  onFileChange: (e: File | undefined) => void;
}) {
  const [dragActive, setDragActive] = createSignal(false);
  let fileSelector: HTMLInputElement;

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    props.onFileChange(e.dataTransfer.files?.[0]);
  };
  return (
    <section class="h-full overflow-auto p-4 sm:p-8 w-full h-full flex flex-col">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        classList={{
          "border-dashed border-2 h-[clamp(100px,30vh,300px)] w-[clamp(200px,60vw,500px)] flex flex-col justify-center items-center":
            true,
          "border-text2/50": !dragActive(),
          "border-primary bg-bg2": dragActive(),
        }}
      >
        <Show when={!dragActive()}>
          <p class="mb-3 font-semibold  flex flex-wrap justify-center">
            <span>Drag and drop your&nbsp;</span> <span>file anywhere or</span>
          </p>
          <input
            onInput={(e) => props.onFileChange(e.target.files?.[0])}
            ref={fileSelector!}
            type="file"
            class="hidden"
          />
          <Button onClick={() => fileSelector?.click()} label="Choose file" />
        </Show>
      </div>
    </section>
  );
}
