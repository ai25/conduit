import { createSignal } from "solid-js";
import Button from "./Button";
import { getStorageValue, setStorageValue } from "~/utils/storage";

const SubscribeButton = (props: { id: string; class?: string }) => {
  const [isSubscribed, setIsSubscribed] = createSignal(false);
  const toggleSubscribed = () => {
    const channels = getStorageValue(
      "localSubscriptions",
      [],
      "json",
      "localStorage"
    ) as string[];
    if (!isSubscribed()) {
      setStorageValue(
        "localSubscriptions",
        JSON.stringify([...channels, props.id]),
        "localStorage"
      );
      setIsSubscribed(true);
    } else {
      setStorageValue(
        "localSubscriptions",
        JSON.stringify(channels.filter((c) => c !== props.id)),
        "localStorage"
      );
      setIsSubscribed(false);
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
