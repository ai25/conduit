import { toaster } from "@kobalte/core";
import { createEffect, createSignal, For, Show } from "solid-js";
import Modal from "./Modal";
import {
  FaSolidChevronDown,
  FaSolidFile,
  FaSolidFileAudio,
  FaSolidFileImage,
  FaSolidFileLines,
  FaSolidFileVideo,
  FaSolidFolder,
  FaSolidTrash,
} from "solid-icons/fa";
import { dialog } from "~/stores/DialogContext";
import { toast } from "./Toast";

export default function FileSystemViewer(props: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [fileSystem, setFileSystem] = createSignal({});
  async function getAllFilesAndDirectories() {
    const root = await navigator.storage.getDirectory();
    const result = {};

    async function getFileDetails(fileHandle: FileSystemFileHandle) {
      const file = await fileHandle.getFile();
      return {
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
          const fileDetails = await getFileDetails(entry);
          dirObj[entry.name] = fileDetails;
        } else if (entry.kind === "directory") {
          dirObj[entry.name] = {
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

  createEffect(() => {
    getAllFilesAndDirectories().then(setFileSystem);
  });
  const handleDelete = (item: any) => {
    try {
      item.handle.remove({ recursive: true });
      getAllFilesAndDirectories().then(setFileSystem);
      toast.success(`Removed ${item.name}.`);
    } catch (e) {
      console.error(e);
      toast.error(`Could not remove ${item.name}. ${(e as any).message}`);
    }
  };

  return (
    <Modal
      title="OPFS Explorer"
      isOpen={props.isOpen}
      setIsOpen={props.setIsOpen}
    >
      <div class="p-2 w-96 max-w-full mx-auto">
        <For each={Object.entries(fileSystem())}>
          {([name, item]) => (
            <FileSystemNode item={item} onDelete={handleDelete} />
          )}
        </For>
      </div>
    </Modal>
  );
}

const FileSystemNode = (props: {
  item: any;
  onDelete: (item: any) => void;
}) => {
  const [isOpen, setIsOpen] = createSignal(false);

  const toggleOpen = () => setIsOpen(!isOpen());

  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <FaSolidFileImage class="h-4 w-4" />;
    if (type.startsWith("audio/")) return <FaSolidFileAudio class="h-4 w-4" />;
    if (type.startsWith("video/")) return <FaSolidFileVideo class="h-4 w-4" />;
    if (type.startsWith("text/")) return <FaSolidFileLines class="h-4 w-4" />;
    if (type.startsWith("folder")) return <FaSolidFolder class="h-4 w-4" />;
    return <FaSolidFile class="h-4 w-4" />;
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    dialog.showDelete({
      title: "Delete File",
      message: `Are you sure you want to delete ${props.item.name}? <br> This action cannot be undone.`,
      onConfirm: () => props.onDelete(props.item),
    });
  };

  return (
    <div class="mb-2 w-[--webkit-fill-available]">
      <div
        classList={{
          "rounded-lg shadow-md p-4 cursor-pointer transition-all duration-300 ease-in-out bg-bg2":
            true,
          "hover:shadow-lg": props.item.kind === "directory",
          "ring-2 ring-primary/80": isOpen(),
        }}
        onClick={toggleOpen}
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">
              {getFileIcon(props.item.type || "folder")}
            </span>
            <span
              classList={{
                "font-semibold": true,
                "text-primary": props.item.kind === "directory",
              }}
            >
              {props.item.name}
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <Show when={props.item.kind === "directory"}>
              <span
                classList={{
                  "transform transition-transform duration-300": true,
                  "rotate-180": isOpen(),
                }}
              >
                <FaSolidChevronDown class="w-4 h-4" />
              </span>
            </Show>
            <button
              class="text-red-500 hover:text-red-700"
              onClick={handleDelete}
            >
              <FaSolidTrash class="w-4 h-4" />
            </button>
          </div>
        </div>
        <Show when={props.item.kind === "file"}>
          <div class="mt-2 text-sm text-text2">
            {props.item.type || "unknown"} • {formatSize(props.item.size)}
          </div>
        </Show>
      </div>
      <Show when={props.item.kind === "directory" && isOpen()}>
        <div class="ml-6 mt-2 pl-4 border-l-2 border-primary/80">
          <For each={Object.entries(props.item.contents)}>
            {([name, item]) => (
              <FileSystemNode item={item} onDelete={props.onDelete} />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
