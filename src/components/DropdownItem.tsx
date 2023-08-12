import { MenuItem } from "solid-headless";
import { JSX, Show } from "solid-js";

export default function DropdownItem(props: {
  as: keyof JSX.IntrinsicElements;
  class?: string;
  icon?: JSX.Element;
  label: string;
  value?: string;
  onClick?: (e: any, value?: string) => void;
  selected?: boolean;
  iconPosition?: "left" | "right";
}) {
  return (
    <MenuItem
      as={props.as}
      class={`group z-10 text-text1 bg-bg1/95 hover:bg-bg3/50 focus-visible:bg-bg3/50 focus-visible:ring-2 focus-visible:ring-primary inline-flex items-center w-full px-2 py-2 text-sm rounded-md transition-colors duration-200 ease-in-out focus:outline-none ${
        props.class ?? ""
      } `}
      classList={{
        "text-text3 bg-primary focus-visible:text-text1": props.selected,
      }}
      onClick={(e: any) => props.onClick?.(e, props.value)}>
      <Show when={props.iconPosition === "left" && props.icon}>
        <span
          classList={{
            "ml-1": !!props.label,
          }}>
          {props.icon}
        </span>
      </Show>
      <span class="">{props.label}</span>
      <Show when={props.iconPosition === "right" && props.icon}>
        <span
          classList={{
            "mr-1": !!props.label,
          }}>
          {props.icon}
        </span>
      </Show>
    </MenuItem>
  );
}
