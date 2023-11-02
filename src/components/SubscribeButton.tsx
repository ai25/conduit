import { createSignal } from "solid-js";
import Button from "./Button";
import { getStorageValue, setStorageValue } from "~/utils/storage";
import { useSyncStore } from "~/stores/syncStore";

const SubscribeButton = (props: { id: string; class?: string }) => {
  const sync = useSyncStore();
  const isSubscribed = () => !!sync.store.subscriptions[props.id];
  const toggleSubscribed = () => {
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
      appearance="primary"
      class={props.class}
      onClick={toggleSubscribed}
      isSelected={isSubscribed()}
      label={`Subscribe${isSubscribed() ? "d" : ""}`}
      isLoading={!sync.store.subscriptions}
    />
  );
};
export default SubscribeButton;
