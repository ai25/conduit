import { toaster } from "@kobalte/core";
import { createEffect, createSignal } from "solid-js";
import Button from "~/components/Button";
import Modal from "~/components/Modal";
import { toast } from "~/components/Toast";
export default () => {
  const [isOpen, setIsOpen] = createSignal(false);
  return (
    <>
      <Modal
        isOpen={isOpen()}
        setIsOpen={setIsOpen}
        title="Import History"
      >
      </Modal>
      <Button
        label="x"
        onClick={() => {
          setIsOpen(true);
         toast.promise(
            new Promise((resolve) => {
              setTimeout(() => {
                resolve("Hello World");
              }, 5500);
            }),
            {
            loading: "Loading...",
            success:()=> "Success!",
            error: ()=>"Error!",
            }
          );
        }}
      />
    </>
  );
};
