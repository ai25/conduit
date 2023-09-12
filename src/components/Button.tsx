import { JSX } from "solid-js";
import { Button as KobalteButton } from "@kobalte/core";
import { classNames } from "~/utils/helpers";

export default function Button(props: {
  class?: string;
  onClick?: (e: any) => void;
  label?: string;
  icon?: JSX.Element;
  disabled?: boolean;
  activated?: boolean;
}) {
  return (
    <KobalteButton.Root
      onClick={props.onClick}
      disabled={props.disabled}
      // classList={{ "!text-text1 !bg-bg2": props.activated }}
      class={`${classNames(props.activated && "!text-text1 !bg-bg2")}
      appearance-none transition-colors text-text3 border border-bg3 bg-primary hover:bg-accent1 cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-accent1 font-medium rounded-md text-sm px-4 py-0 mr-2 mb-2 focus:outline-none  ${
        props.class || ""
      }`}
    >
      {props.label}
    </KobalteButton.Root>
  );
}
