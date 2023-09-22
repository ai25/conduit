import { Toast } from "@kobalte/core";
import { BsXCircle } from "solid-icons/bs";

export default function ToastComponent(props: {
  toastId: number;
  tite: string;
  description?: string;
}) {
  return (
    <Toast.Root toastId={props.toastId} class="toast">
      <div class="toast__content">
        <div>
          <Toast.Title class="toast__title">{props.tite}</Toast.Title>
          <Toast.Description class="toast__description">
            {props.description}
          </Toast.Description>
        </div>
        <Toast.CloseButton class="toast__close-button">
          <BsXCircle />
        </Toast.CloseButton>
      </div>
      <Toast.ProgressTrack class="toast__progress-track">
        <Toast.ProgressFill class="toast__progress-fill" />
      </Toast.ProgressTrack>
    </Toast.Root>
  );
}
