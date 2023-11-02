import { toaster } from "@kobalte/core";
import { FaSolidBug } from "solid-icons/fa";
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
        isLoading
        appearance="primary"
        label="dajflaeijfpo"
        icon={<FaSolidBug />}
        onClick={() => {
          // setIsOpen(true);
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
