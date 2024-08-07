import { ImUndo, ImUndo2 } from "solid-icons/im";
export function ToastComponent(props: {
  toastId: number;
  title?: string;
  description?: string;
  success?: boolean;
  error?: boolean;
  loading?: boolean;
  children?: JSX.Element;
  undo?: () => void;
}) {
  return (
    <Toast.Root
      toastId={props.toastId}
      classList={{
        "flex flex-col justify-between outline-none border-0 items-center gap-2 rounded p-3 bg-bg2 shadow ring-2 ring-inset ring-bg1 text-text1 data-[opened]:animate-in data-[opened]:fade-in data-[opened]:slide-in-from-right data-[closed]:animate-out data-[closed]:transition-[transform] data-[closed]:translate-x-[var(--kb-toast-swipe-end-x)] data-[closed]:fade-out-25 data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform] data-[swipe=move]:translate-x-[var(--kb-toast-swipe-move-x)] data-[swipe=end]:animate-out data-[swipe=end]:fade-out data-[swipe=end]:slide-out-to-right":
          true,
      }}
    >
      <div class="flex items-center w-full h-full  justify-center align-bottom">
        <Show when={props.success}>
          <FaSolidCircleCheck class="h-5 w-5 text-green-600 mr-2 " />
        </Show>
        <Show when={props.error}>
          <FaSolidCircleXmark class="h-5 w-5 text-red-600 mr-2 " />
        </Show>
        <Show when={props.loading}>
          <Spinner class="w-5 h-5 mr-2" />
        </Show>
        <div class="w-full h-full flex flex-col gap-1 max-h-min">
          <Toast.Title class="">{props.title}</Toast.Title>
          <Show when={props.description}>
            <Toast.Description class="">{props.description}</Toast.Description>
          </Show>
          {props.children}
        </div>
        <Show when={props.undo}>
          <button
            onClick={() => {
              props.undo!();
              toaster.dismiss(props.toastId);
            }}
            class="flex gap-1 items-center ml-2 outline-none rounded-full px-2 py-1 focus-visible:ring-2 ring-primary/80 text-text1 underline"
          >
            Undo
            <ImUndo2 />
          </button>
        </Show>
        <Toast.CloseButton class="ml-auto rounded">
          <FaSolidX class="h-4 w-4" />
        </Toast.CloseButton>
      </div>
      <Toast.ProgressTrack class="w-full h-1 bg-bg1">
        <Toast.ProgressFill class="bg-primary h-full rounded w-[var(--kb-toast-progress-fill-width)] transition-[width]" />
      </Toast.ProgressTrack>
    </Toast.Root>
  );
}

import { Toast, toaster } from "@kobalte/core";
import { JSX } from "solid-js/jsx-runtime";
import { Switch, Match, Show } from "solid-js";

import {
  FaSolidCircleCheck,
  FaSolidCircleXmark,
  FaSolidX,
} from "solid-icons/fa";
import { Spinner } from "./Spinner";
function show(message: string, undo?: () => void) {
  return toaster.show((props) => (
    <ToastComponent toastId={props.toastId} title={message} undo={undo} />
  ));
}
function success(message: string, undo?: () => void) {
  return toaster.show((props) => (
    <ToastComponent
      toastId={props.toastId}
      title={message}
      success
      undo={undo}
    />
  ));
}
function error(message: string, undo?: () => void) {
  return toaster.show((props) => (
    <ToastComponent toastId={props.toastId} title={message} error undo={undo} />
  ));
}
function promise<T, U>(
  promise: Promise<T> | (() => Promise<T>),
  options: {
    loading?: JSX.Element;
    success?: (data: T) => JSX.Element;
    error?: (error: U) => JSX.Element;
  }
) {
  return toaster.promise(promise, (props) => (
    <ToastComponent
      toastId={props.toastId}
      loading={props.state === "pending"}
      success={props.state === "fulfilled"}
      error={props.state === "rejected"}
    >
      <Switch>
        <Match when={props.state === "pending"}>{options.loading}</Match>
        <Match when={props.state === "fulfilled"}>
          {options.success?.(props.data!)}
        </Match>
        <Match when={props.state === "rejected"}>
          {options.error?.(props.error)}
        </Match>
      </Switch>
    </ToastComponent>
  ));
}
function custom(jsx: () => JSX.Element) {
  return toaster.show((props) => (
    <Toast.Root toastId={props.toastId}>{jsx()}</Toast.Root>
  ));
}
function dismiss(id: number) {
  return toaster.dismiss(id);
}
export const toast = {
  show,
  success,
  error,
  promise,
  custom,
  dismiss,
};
