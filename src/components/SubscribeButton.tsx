import { createSignal } from "solid-js";
import Button from "./Button";
import { getStorageValue, setStorageValue } from "~/utils/storage";
import { useSyncStore } from "~/stores/syncStore";
import { useAppState } from "~/stores/appStateStore";

const SubscribeButton = (props: {
  id: string;
  name: string;
  class?: string;
}) => {
  const sync = useSyncStore();
  const [appState, setAppState] = useAppState();
  const isSubscribed = () => !!sync.store.subscriptions[props.id];
  const toggleSubscribed = () => {
    if (!isSubscribed()) {
      sync.setStore("subscriptions", props.id, {
        subscribedAt: Date.now(),
        name: props.name,
      });
    } else {
      sync.setStore("subscriptions", props.id, undefined!);
    }
  };

  return (
    <Button
      appearance="primary"
      class={props.class}
      onClick={toggleSubscribed}
      isSelected={isSubscribed()}
      label={`Subscribe${isSubscribed() ? "d" : ""}`}
      // isLoading={appState.sync.providers.opfs === "connecting"}
      // isDisabled={appState.sync.providers.opfs !== "connected" && appState.sync.providers.webrtc !== "connected"}
    />
  );
};
export default SubscribeButton;
