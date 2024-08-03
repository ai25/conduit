/* eslint-disable solid/no-destructure */
import {
  For,
  JSXElement,
  createContext,
  createEffect,
  createSignal,
  useContext,
} from "solid-js";
import Modal from "~/components/Modal";
const [isOpen, setIsOpen] = createSignal(false);
const [title, setTitle] = createSignal("");
const [message, setMessage] = createSignal("");
const [confirmCallback, setConfirmCallback] = createSignal(() => {});
const [dismissCallback, setDismissCallback] = createSignal(() => {});

const confirm = () => {
  setIsOpen(false);
  confirmCallback()?.();
};
const dismiss = () => {
  setIsOpen(false);
  dismissCallback()?.();
};
const Show = () => (
  <div class="flex flex-col gap-4 text-sm items-center justify-center p-4">
    <div class="flex flex-col gap-2">
      <For each={message()?.split("<br>")}>{(chunk) => <p>{chunk}</p>}</For>
    </div>
    <div class="flex items-center justify-center gap-4 my-2">
      <button
        onClick={() => dismiss()}
        class="px-4 py-2 rounded-full outline-none hover:text-text2 font-semibold focus-visible:ring-2 ring-primary/80"
      >
        Dismiss
      </button>
      <button
        onClick={() => confirm()}
        class="bg-primary px-4 py-2 rounded-full outline-none hover:bg-primary/80 font-semibold focus-visible:ring-2 ring-primary/80"
      >
        Confirm
      </button>
    </div>
  </div>
);
const ShowDelete = () => (
  <div class="flex flex-col gap-4 text-sm items-center justify-center p-4">
    <div class="flex flex-col gap-2">
      <For each={message()?.split("<br>")}>{(chunk) => <p>{chunk}</p>}</For>
    </div>
    <div class="flex items-center justify-center gap-4 my-2">
      <button
        onClick={() => dismiss()}
        class="px-4 py-2 rounded-full outline-none hover:text-text2 font-semibold focus-visible:ring-2 ring-primary/80"
      >
        Dismiss
      </button>
      <button
        onClick={() => confirm()}
        class="bg-red-600 px-4 py-2 rounded-full outline-none hover:bg-red-600/80 font-semibold focus-visible:ring-2 ring-red-600/80"
      >
        Delete
      </button>
    </div>
  </div>
);

const [component, setComponent] = createSignal<JSXElement>(<Show />);

const DialogContext = createContext<{
  setTitle: (title: string) => void;
  setMessage: (message: string) => void;
  setIsOpen: (open: boolean) => void;
  setConfirm: (cb?: () => void) => void;
  setDismiss: (cb?: () => void) => void;
  setComponent: (component: JSXElement) => void;
}>({
  setTitle,
  setMessage,
  setIsOpen,
  setConfirm: setConfirmCallback,
  setDismiss: setDismissCallback,
  setComponent,
});
export const DialogContextProvider = (props: { children: any }) => {
  return (
    <DialogContext.Provider
      value={{
        setTitle,
        setMessage,
        setIsOpen,
        setConfirm: setConfirmCallback,
        setDismiss: setDismissCallback,
        setComponent,
      }}
    >
      {props.children}
      <Modal title={title()} isOpen={isOpen()} setIsOpen={() => dismiss()}>
        {component()}
      </Modal>
    </DialogContext.Provider>
  );
};

function show({
  title,
  message,
  onConfirm,
  onDismiss,
}: {
  title: string;
  message: string;
  onConfirm?: () => void;
  onDismiss?: () => void;
}) {
  const context = useContext(DialogContext);
  console.log(context, "DialogContext", useContext(DialogContext));
  if (!context) {
    throw new Error(
      "Function `dialog.show` must be used within a DialogContextProvider"
    );
  }
  context.setTitle(title);
  context.setMessage(message);
  context.setIsOpen(true);
  context.setDismiss(() => onDismiss);
  context.setConfirm(() => onConfirm);
  context.setComponent(<Show />);
}
function showDelete({
  title,
  message,
  onConfirm,
  onDismiss,
}: {
  title: string;
  message: string;
  onConfirm?: () => void;
  onDismiss?: () => void;
}) {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error(
      "Function `dialog.showDelete` must be used within a DialogContextProvider"
    );
  }
  context.setTitle(title);
  context.setMessage(message);
  context.setIsOpen(true);
  context.setDismiss(() => onDismiss);
  context.setConfirm(() => onConfirm);
  context.setComponent(<ShowDelete />);
}

export const dialog = {
  show,
  showDelete,
};
