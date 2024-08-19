import { useLocation, useNavigate, useSearchParams } from "@solidjs/router";
import { Show, createEffect, createSignal } from "solid-js";
import { isServer } from "solid-js/web";
import { ErrorComponent } from "~/components/Error";
import { Spinner } from "~/components/Spinner";
import { useAppState } from "~/stores/appStateStore";
import { createShareableLink, handleIncomingLink } from "~/utils/crypto";
import { getRoomInfo } from "~/utils/opfs-helpers";
import { setStorageValue } from "~/utils/storage";

export default function Pair() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = createSignal({
    text: "",
    error: false,
    loading: true,
  });
  const [, setAppState] = useAppState();
  const navigate = useNavigate();
  createEffect(() => {
    if (!searchParams.data) {
      setMessage((prev) => ({
        ...prev,
        loading: false,
        error: true,
        text: "No data.",
      }));
    } else {
      try {
        handleIncomingLink(searchParams.data!)
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
              console.log(existing);
              if (!existing) {
                setAppState("sync", "room", room);
                setStorageValue("room", room, "localStorage");
                setMessage((prev) => ({
                  ...prev,
                  loading: false,
                  error: false,
                  text: `Joined room ${room.name}.`,
                }));
                setTimeout(() => {
                  navigate("/");
                }, 1000);
              } else {
                setMessage((prev) => ({
                  ...prev,
                  loading: false,
                  error: true,
                  text: `Room ${room.name} already exists.`,
                }));
              }
            } else {
              setMessage((prev) => ({
                ...prev,
                loading: false,
                error: true,
                text: `Invalid data: ${room}`,
              }));
            }
          })
          .catch((e) => {
            console.error(e);
            setMessage((prev) => ({
              ...prev,
              loading: false,
              error: true,
              text: `Could not join room. ${(e as any).message}`,
            }));
          });
        setMessage((prev) => ({
          ...prev,
          loading: false,
          error: false,
          text: "Success!",
        }));
      } catch (error: any) {
        setMessage((prev) => ({
          ...prev,
          loading: false,
          error: true,
          text: error.message,
        }));
      }
    }
  });
  return (
    <div class="w-full h-full flex flex-col justify-center items-center font-semibold">
      <Show when={message().loading}>
        <Spinner class="w-36 h-36" />
        Pairing...
      </Show>
      <Show when={message().error}>
        <ErrorComponent error={{ message: message().text }} />
      </Show>
      <Show when={!message().error && !message().loading}>
        <div class="">{message().text}</div>
      </Show>
    </div>
  );
}
