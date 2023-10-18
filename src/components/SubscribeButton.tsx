import { createSignal } from "solid-js";
import Button from "./Button";
import { getStorageValue, setStorageValue } from "~/utils/storage";
import { useSyncStore } from "~/stores/syncStore";

const SubscribeButton = (props: { id: string; class?: string }) => {
  const sync = useSyncStore();
  const isSubscribed = () => !!sync.store.subscriptions[props.id];
  const toggleSubscribed = () => {
    const channels = sync.store.subscriptions;
    if (!isSubscribed()) {
      sync.setStore("subscriptions", props.id, {
        subscribedAt: Date.now(),
      });
    } else {
      sync.setStore(
        "subscriptions",
        props.id,
        undefined!,
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
