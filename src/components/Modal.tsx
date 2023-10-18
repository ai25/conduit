import { Dialog } from "@kobalte/core";
import { FaSolidX } from "solid-icons/fa";
import { createSignal, JSX } from "solid-js";

export default function Modal(props: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
  children: JSX.Element;
}): JSX.Element {
  return (
    <>
      <Dialog.Root open={props.isOpen} onOpenChange={props.setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            class=" fixed 
    inset-0 
    z-50 
    bg-black/20
    animate-[overlayHide] 
    duration-250 
    ease-linear 
    delay-100
    data-[expanded]:animate-[overlayShow]
    data-[expanded]:duration-500
    data-[expanded]:ease-linear
    "
          />
          <div
            class="fixed 
    inset-0 
    z-50 
    flex 
    items-center 
    justify-center">
            <Dialog.Content
              class=" z-50 
    max-w-[calc(100vw-16px)] 
    max-h-[85vh]
              my-auto
    overflow-hidden
    border 
    border-bg3
    rounded-md 
    p-4 
    bg-bg1
    shadow-md 
    animate-[contentHide] 
    duration-300 
    ease-in
    data-[expanded]:animate-[contentShow]
    data-[expanded]:duration-500
    data-[expanded]:ease-out
    ">
              <div
                class="flex 
    items-baseline 
    justify-between 
    mb-3">
                <Dialog.Title class="text-xl font-semibold">
                  {props.title}
                </Dialog.Title>
                <Dialog.CloseButton class="">
                  <FaSolidX fill="currentColor" class="w-4 h-4" />
                </Dialog.CloseButton>
              </div>
              <Dialog.Description class="text-base 
    max-h-[calc(100vh-50px)] overflow-y-auto"
              >
                {props.children}
              </Dialog.Description>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
