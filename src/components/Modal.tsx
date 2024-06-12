import { Dialog } from "@kobalte/core";
import { FaSolidX } from "solid-icons/fa";
import { createEffect, createSignal, JSX } from "solid-js";

export default function Modal(props: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
  children: JSX.Element;
}): JSX.Element {
  return (
    <>
      <Dialog.Root modal open={props.isOpen} onOpenChange={props.setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            class=" fixed 
    inset-0 
    z-50 
    bg-black/20
    animate-out
    fade-out
    data-[expanded]:animate-in
    data-[expanded]:fade-in
    "
          />
          <div
            class="fixed 
    inset-0 
    z-[999999]
    flex 
    items-center 
    justify-center"
          >
            <Dialog.Content
              class=" z-50 
    max-w-[calc(100vw-16px)] 
    max-h-[80vh]
              my-auto
    overflow-auto
    border 
    border-bg3
    rounded-md 
    p-4 
    bg-bg1
    shadow-md 
    animate-out
    fade-out
    ease-in
    data-[expanded]:animate-in
    data-[expanded]:fade-in
    data-[expanded]:duration-300
    data-[expanded]:ease-out
    "
            >
              <div
                class="flex 
    items-baseline 
    justify-between 
    mb-3"
              >
                <Dialog.Title class="text-xl font-semibold">
                  {props.title}
                </Dialog.Title>
                <Dialog.CloseButton class="">
                  <FaSolidX fill="currentColor" class="w-4 h-4" />
                </Dialog.CloseButton>
              </div>
              <div
                class="text-base 
    max-h-[calc(100vh-50px)] overflow-y-auto"
              >
                {props.children}
              </div>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
