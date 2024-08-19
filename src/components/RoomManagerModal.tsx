import { For, createSignal, Show, createEffect } from "solid-js";
import Modal from "./Modal";
import { getStorageValue, setStorageValue } from "~/utils/storage";
import Field from "./Field";
import Button from "./Button";
import EmptyState from "./EmptyState";
import { Transition, TransitionGroup } from "solid-transition-group";
import { createShareableLink, handleIncomingLink } from "~/utils/crypto";
import {
  FaRegularCopy,
  FaSolidCheck,
  FaSolidShare,
  FaSolidShareNodes,
  FaSolidTrash,
} from "solid-icons/fa";
import { BsShareFill, BsThreeDotsVertical } from "solid-icons/bs";
import QRCode from "qrcode";
import { createCanvas, loadImage, CanvasRenderingContext2D } from "canvas";
import { toast } from "./Toast";
import { dialog } from "~/stores/DialogContext";
import {
  createRoom,
  deleteRoom,
  getRoomInfo,
  getRooms,
  renameRoom,
} from "~/utils/opfs-helpers";
import { useAppState } from "~/stores/appStateStore";
import { CgArrowsExchangeAlt } from "solid-icons/cg";
import { DropdownMenu } from "@kobalte/core";
import { BiSolidRename } from "solid-icons/bi";
import { TbExternalLink, TbSwitchHorizontal } from "solid-icons/tb";
import { generateColorFromString } from "~/utils/helpers";

export default function RoomManagerModal(props: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const [name, setName] = createSignal("");
  const [roomId, setRoomId] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [modalTitle, setModalTitle] = createSignal("Rooms");
  const [rooms, setRooms] = createSignal<
    { name: string; id: string; password: string }[]
  >([]);
  const [step, setStep] = createSignal<"initial" | "create" | "join">(
    "initial"
  );
  createEffect(() => {
    getRooms().then((rooms) => {
      setRooms(rooms);
    });
  });
  const [appState, setAppState] = useAppState();

  const [isJoinWithLink, setIsJoinWithLink] = createSignal(true);
  const [link, setLink] = createSignal("");

  createEffect(() => {
    if (!link()) return;
    try {
      const url = new URL(link());
      console.log("URL", url);
      const data = url.searchParams.get("data");
      console.log("Data", data);
      handleIncomingLink(data!)
        .then(async (room: any) => {
          room = JSON.parse(room);
          console.log("Room", room);
          if (room.id && room.name && room.password) {
            let existing;
            try {
              existing = await getRoomInfo(room.id);
            } catch (e) {
              //
            }
            if (!existing) {
              setRooms((prev) => [...prev, room]);
              setStep("initial");
              setAppState("sync", "room", room);
              setStorageValue("room", room, "localStorage");
              toast.success(`Joined room ${room.name}.`);
            } else {
              toast.error(`This room already exists.`);
            }
          } else {
            toast.error(`Invalid data.`);
          }
        })
        .catch((e) => {
          console.error(e);
          toast.error(`Could not join room. ${(e as any).message}`);
        });
    } catch (e) {
      console.error(e);
      toast.error(`Could not join room. ${(e as any).message}`);
    }
  });

  return (
    <Modal
      isOpen={props.isOpen}
      title={modalTitle()}
      setIsOpen={props.setIsOpen}
    >
      <div class="relative overflow-hidden w-full h-full flex flex-col justify-end items-center p-2 gap-4">
        <TransitionGroup
          enterClass="absolute opacity-0 translate-x-10"
          exitToClass="absolute opacity-0 -translate-x-10"
          enterActiveClass="transition-all duration-300"
          exitActiveClass="transition-all duration-300"
        >
          <Show when={step() === "initial"}>
            <div class="flex flex-col w-96 max-w-full p-1 gap-1">
              <For
                each={rooms()}
                fallback={
                  <div class="flex flex-col w-full">
                    <EmptyState message="No rooms." />
                  </div>
                }
              >
                {(room, index) => (
                  <div class="border-b border-bg2 last:border-0 w-full rounded-lg p-1 flex justify-between items-center">
                    <div class="flex gap-2 items-center">
                      <div
                        style={{
                          "background-color": generateColorFromString(room.id),
                        }}
                        class="w-14 h-14 rounded-full text-2xl flex items-center justify-center text-black font-semibold relative"
                      >
                        {room.name[0]}
                        <Show when={appState.sync.room.id === room.id}>
                          <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full ring-4 ring-bg1 bg-primary flex items-center justify-center text-text1 p-1">
                            <FaSolidCheck class="w-full h-full" />
                          </div>
                        </Show>
                        <Show when={appState.sync.room.id != room.id}>
                          <button
                            title="Switch"
                            class="outline-none focus-visible:ring-2 focus-visible:ring-primary/80 p-2 hover:brightness-125 absolute -bottom-1 -right-1 w-6 h-6 rounded-full ring-4 ring-bg1 bg-bg3 flex items-center justify-center text-text1 p-1"
                            onClick={() => {
                              setAppState("sync", "room", room);
                              setStorageValue("room", room, "localStorage");
                              toast.success(`Switched to room ${room.name}`);
                            }}
                          >
                            <CgArrowsExchangeAlt class="w-6 h-6" />
                          </button>
                        </Show>
                      </div>
                      <div class="font-medium flex flex-col">
                        {room.name}
                        <p class="text-xs text-text2">{room.id}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <ShareRoom
                        id={room.id}
                        name={room.name}
                        password={room.password}
                      />
                      <Dropdown
                        room={room}
                        //eslint-disable-next-line solid/reactivity
                        onRename={async (newName) => {
                          try {
                            const newRoomInfo = await renameRoom(
                              room.id,
                              newName
                            );
                            if (room.id === appState.sync.room.id) {
                              setAppState("sync", "room", newRoomInfo);
                              setStorageValue(
                                "room",
                                newRoomInfo,
                                "localStorage"
                              );
                            }
                            getRooms().then((rooms) => {
                              setRooms(rooms);
                            });
                            toast.success(
                              `Renamed ${room.name} to ${newName}.`
                            );
                          } catch (e) {
                            toast.error(
                              `Could not rename room. ${(e as any).message}`
                            );
                          }
                        }}
                        refreshRooms={() =>
                          getRooms().then((rooms) => setRooms(rooms))
                        }
                      />
                    </div>
                  </div>
                )}
              </For>
            </div>
            <div class="flex w-full justify-end items-center gap-2">
              <Button
                class="font-semibold"
                appearance="subtle"
                label="Join"
                onClick={() => {
                  setStep("join");
                  setModalTitle("Join room");
                }}
              />
              <Button
                class="font-semibold"
                onClick={() => {
                  setStep("create");
                  setModalTitle("Create Room");
                }}
                label="Create"
              />
            </div>
          </Show>
          <Show when={step() === "create"}>
            <div class="flex flex-col items-center justify-center gap-4 w-full text-sm">
              <p>
                Choose a name for your new room.
                <br /> You can always change it later.
              </p>
              <Field
                required
                name="Room Name"
                value={name()}
                onInput={(e) => setName(e)}
                placeholder="My room"
                type="text"
                class="w-full"
              />
              <div class="flex self-end gap-2">
                <Button
                  class="self-start font-semibold"
                  appearance="subtle"
                  onClick={() => {
                    setStep("initial");
                    setModalTitle("Rooms");
                  }}
                  label="Back"
                />
                <Button
                  class="font-semibold"
                  isDisabled={!name()}
                  //eslint-disable-next-line solid/reactivity
                  onClick={async () => {
                    try {
                      const newRoom = await createRoom(name());
                      setRooms((prev) => [...prev, newRoom]);
                      toast.success(`Created room ${name()}.`);
                      setName("");
                      setStep("initial");
                      setAppState("sync", "room", newRoom);
                      setStorageValue("room", newRoom, "localStorage");
                    } catch (e) {
                      toast.error(
                        `Could not create room. ${(e as any).message}`
                      );
                    }
                  }}
                  label="Create"
                />
              </div>
            </div>
          </Show>
          <Show when={step() === "join"}>
            <div class="flex flex-col items-center justify-center gap-4 w-full text-sm">
              <div class="max-w-[500px]">
                To connect to an existing room, you can either:
                <ul class="list-inside list-disc">
                  <li>Scan the QR code shared by another device</li>
                  <li>Click on the link shared by another device</li>
                  <li>
                    Paste the link shared by another device into the input below
                  </li>
                  <li>Insert the room name, ID, and password manually</li>
                </ul>
              </div>
              <Show when={!isJoinWithLink()}>
                <Field
                  required
                  name="Name"
                  value={name()}
                  onInput={(e) => setName(e)}
                  placeholder="My room"
                  type="text"
                  class="w-full"
                />
                <Field
                  name="ID"
                  type="text"
                  placeholder="Room ID"
                  value={roomId()}
                  onInput={(e) => setRoomId(e)}
                />
                <Field
                  name="Password"
                  type="password"
                  placeholder="Password"
                  value={password()}
                  onInput={(e) => setPassword(e)}
                />
              </Show>
              <Show when={isJoinWithLink()}>
                <Field
                  name="Link"
                  value={link()}
                  onInput={(e) => setLink(e)}
                  placeholder="Paste the link here..."
                  type="text"
                  class="w-full"
                />
              </Show>
              <Button
                class="!text-primary"
                icon={<TbSwitchHorizontal />}
                appearance="subtle"
                onClick={() => {
                  setIsJoinWithLink((prev) => !prev);
                }}
                label={isJoinWithLink() ? "Enter details manually" : "Use link"}
              />
              <div class="flex self-end gap-2">
                <Button
                  class="self-start font-semibold"
                  appearance="subtle"
                  onClick={() => {
                    setStep("initial");
                    setModalTitle("Rooms");
                  }}
                  label="Back"
                />
                <Button
                  isDisabled={!name() || !roomId() || !password()}
                  class="font-semibold"
                  //eslint-disable-next-line solid/reactivity
                  onClick={async () => {
                    try {
                      const newRoom = {
                        id: roomId(),
                        name: name(),
                        password: password(),
                      };
                      setRooms((prev) => [...prev, newRoom]);
                      toast.success(`Created room ${name()}.`);
                      setName("");
                      setStep("initial");
                      setAppState("sync", "room", newRoom);
                      setStorageValue("room", newRoom, "localStorage");
                    } catch (e) {
                      toast.error(
                        `Could not create room. ${(e as any).message}`
                      );
                    }
                  }}
                  label="Join"
                />
              </div>
            </div>
          </Show>
        </TransitionGroup>
      </div>
    </Modal>
  );
}

const ShareRoom = (props: { id: string; name: string; password: string }) => {
  const [modalOpen, setModalOpen] = createSignal(false);
  const [link, setLink] = createSignal("");
  const [qrCode, setQrCode] = createSignal("");
  createEffect(() => {
    if (props.id && props.name && props.password && modalOpen()) {
      createQRCode();
    }
  });
  async function createQRCode() {
    const url = await createShareableLink(
      JSON.stringify({
        id: props.id,
        name: props.name,
        password: props.password,
      })
    );
    setLink(url);
    setQrCode(await createQRCodeWithLogo(url, "/logo-bw.png"));
  }
  const [inputRef, setInputRef] = createSignal<HTMLInputElement>();
  return (
    <>
      <button
        onClick={() => {
          setModalOpen(true);
        }}
        title="Share"
        class="rounded-full outline-none focus-visible:ring-2 ring-primary/80 p-2 hover:bg-bg2"
      >
        <FaSolidShare class="w-5 h-5" />
      </button>
      <Modal
        isOpen={modalOpen()}
        title={`Join ${props.name}`}
        setIsOpen={setModalOpen}
      >
        <div class="flex flex-col gap-4">
          <div class="rounded-lg w-[clamp(200px,90vw,600px)] h-full max-w-full aspect-square mx-auto relative overflow-hidden">
            <Show when={qrCode()}>
              <img class="absolute top-0 left-0 w-full h-full" src={qrCode()} />
            </Show>
          </div>
          <div class="flex items-center gap-1 m-1">
            <Field
              ref={setInputRef}
              onClick={() => {
                inputRef()?.select();
              }}
              rootClass="w-full"
              value={link()}
              readOnly
            />
            <button
              class="flex items-center justify-center outline-none focus-visible:ring-2 ring-primary/80 rounded h-10 w-10"
              onClick={() => {
                try {
                  navigator.clipboard.writeText(link()!);
                  toast.success("Copied link to clipboard!");
                } catch (e) {
                  toast.error((e as any).message);
                  console.error(e);
                }
              }}
              aria-label="Copy link"
              title="Copy link"
            >
              <FaRegularCopy class="h-6 w-6" />
            </button>
            <a
              href={link()}
              class="flex items-center justify-center outline-none focus-visible:ring-2 ring-primary/80 rounded h-10 w-10"
              aria-label="Open link"
              title="Open link"
              target="_blank"
            >
              <TbExternalLink class="h-7 w-7" />
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
};
const Dropdown = (props: {
  room: { id: string; name: string; password: string };
  onRename: (newName: string) => void;
  refreshRooms: () => void;
}) => {
  const [dropdownOpen, setDropdownOpen] = createSignal(false);
  const [modalOpen, setModalOpen] = createSignal(false);
  const [appState, setAppState] = useAppState();
  const [name, setName] = createSignal("");
  return (
    <>
      <DropdownMenu.Root
        // overlap={true}
        open={dropdownOpen()}
        onOpenChange={setDropdownOpen}
        // gutter={0}
        modal={false}
        // hideWhenDetached={true}
      >
        <DropdownMenu.Trigger
          onClick={(e) => {
            e.stopPropagation();
          }}
          class="p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          <BsThreeDotsVertical class="w-6 h-6" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            class="bg-bg1 border border-bg2 shadow p-2 rounded-md z-[999999]
                animate-in
                fade-in
                slide-in-from-top-10
                duration-200
                "
          >
            <DropdownMenu.Arrow />
            <DropdownMenu.Item
              class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
              onTouchStart={() => {
                setAppState("touchInProgress", true);
              }}
              onSelect={() => {
                setModalOpen(true);
              }}
            >
              <div class="flex items-center gap-2">
                <BiSolidRename class="w-5 h-5" />

                <div class="text-text1">Rename</div>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
              onTouchStart={() => {
                setAppState("touchInProgress", true);
              }}
              onSelect={() => {
                dialog.showDelete({
                  title: `Delete room ${props.room.name}?`,
                  message:
                    "Are you sure you want to delete this room?<br>This operation cannot be undone.",
                  onConfirm: async () => {
                    if (appState.sync.room.id === props.room.id) {
                      toast.error(
                        `This room is currently in use. Please disconnect before trying to delete it.`
                      );
                      return;
                    }
                    try {
                      await deleteRoom(props.room.id);
                      toast.success(`Deleted room ${props.room.name}`);
                      props.refreshRooms();
                    } catch (e) {
                      toast.error(
                        `Could not delete room. ${(e as any).message}`
                      );
                    }
                  },
                });
              }}
            >
              <div class="flex items-center gap-2">
                <FaSolidTrash class="w-5 h-5" />

                <div class="text-text1">Delete</div>
              </div>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <Modal title="Rename room" isOpen={modalOpen()} setIsOpen={setModalOpen}>
        <div class="flex flex-col gap-4 text-sm items-center justify-center p-4">
          <div class="flex flex-col gap-2">
            <Field
              required
              name="New name"
              value={name()}
              onInput={(e) => setName(e)}
              placeholder="My room"
              type="text"
              class="w-full"
            />
          </div>
          <div class="flex items-center justify-center gap-4 my-2">
            <Button
              onClick={() => {
                props.onRename(name());
                setModalOpen(false);
              }}
              isDisabled={!name()}
              label="Rename"
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

async function createQRCodeWithLogo(
  data: string,
  logoPath: string,
  size: number = 500,
  padding: number = 20 // Adding padding parameter
): Promise<string> {
  try {
    // Adjust canvas size to include padding
    const canvasSize = size + padding * 2;
    const canvas = createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext("2d");

    // Fill the background with white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Generate QR code
    const qrCodeData = QRCode.create(data, {
      errorCorrectionLevel: "H",
    });

    const cellSize = size / qrCodeData.modules.size;
    const dotSize = cellSize * 0.9;
    const offset = (cellSize - dotSize) / 2;

    // Helper function to draw filled squares slightly larger than cell size
    const drawFilledSquare = (x: number, y: number, size: number) => {
      const padding = 0.5; // Adjust this value to overlap slightly
      ctx.fillStyle = "#171712";
      ctx.fillRect(
        x - padding,
        y - padding,
        size + 2 * padding,
        size + 2 * padding
      );
    };

    // Identify finder pattern positions (top-left, top-right, bottom-left)
    const finderPatterns = [
      { row: 0, col: 0 }, // Top-left
      { row: 0, col: qrCodeData.modules.size - 7 }, // Top-right
      { row: qrCodeData.modules.size - 7, col: 0 }, // Bottom-left
    ];

    // Draw the QR code with dots and filled squares for finder patterns
    qrCodeData.modules.data.forEach((bit, index) => {
      const col = index % qrCodeData.modules.size;
      const row = Math.floor(index / qrCodeData.modules.size);

      const inFinderPattern = finderPatterns.some(
        (pattern) =>
          row >= pattern.row &&
          row < pattern.row + 7 &&
          col >= pattern.col &&
          col < pattern.col + 7
      );

      const x = col * cellSize + padding;
      const y = row * cellSize + padding;

      if (bit) {
        if (inFinderPattern) {
          drawFilledSquare(x, y, cellSize);
        } else {
          ctx.beginPath();
          ctx.arc(
            x + offset + dotSize / 2,
            y + offset + dotSize / 2,
            dotSize / 2,
            0,
            2 * Math.PI
          );
          ctx.fillStyle = "#171712";
          ctx.fill();
          ctx.closePath();
        }
      }
    });

    // Load the logo
    const logo = await loadImage(logoPath);

    // Calculate logo size and position
    const logoSize = size / 4;
    const logoX = (canvasSize - logoSize) / 2;
    const logoY = (canvasSize - logoSize) / 2;

    // Draw logo on canvas
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL("image/png");

    console.log("QR code with logo created successfully!");
    return dataUrl;
  } catch (error) {
    console.error("Error creating QR code with logo:", error);
    throw error;
  }
}
