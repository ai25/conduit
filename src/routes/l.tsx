import { toaster } from "@kobalte/core";
import { createEffect } from "solid-js";
import Button from "~/components/Button";
import { toast } from "~/components/Toast";
export default () => {
  return (
    <>
      <Button
        label="x"
        onClick={() => {
          document.body.requestFullscreen();
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
