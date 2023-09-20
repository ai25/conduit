import { createSignal } from "solid-js";
import Button from "./Button";
import { getStorageValue, setStorageValue } from "~/utils/storage";
import { useSyncedStore } from "~/stores/syncedStore";

const SubscribeButton = (props: { id: string; class?: string }) => {
  const sync = useSyncedStore();
  const isSubscribed = () => sync.store.subscriptions.includes(props.id);
  const toggleSubscribed = () => {
    const channels = sync.store.subscriptions;
    if (!isSubscribed()) {
      sync.setStore("subscriptions", [...channels, props.id].sort());
    } else {
      sync.setStore(
        "subscriptions",
        channels.filter((c) => c !== props.id)
      );
    }
  };

  return (
    <Button
      class={props.class}
      onClick={toggleSubscribed}
      activated={isSubscribed()}
      label={`Subscribe${isSubscribed() ? "d" : ""}`}
    />
  );
};
export default SubscribeButton;
