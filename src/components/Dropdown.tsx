import {
  Menu,
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "solid-headless";
import { Show, onMount } from "solid-js";
import { JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { classNames } from "~/utils/helpers";

export default function Dropdown(props: {
  class?: string;
  children: JSX.Element | JSX.Element[];
  icon?: JSX.Element;
  label?: string;
  iconPosition?: "left" | "right";
  rotateIcon?: boolean;
  showButton?: boolean;
  show?: boolean;
  buttonClass?: string;
  panelPosition?: "left" | "right" | "center";
}) {
  return (
    <Popover defaultOpen={false} class={`relative ${props.class}`}>
      {({ isOpen, setState }) => (
        <>
          <Show when={props.showButton !== false}>
            <PopoverButton
              class={`text-text3 group  focus:outline-none focus-visible:ring-4 focus-visible:ring-accent1 ${
                props.buttonClass ?? ""
              }`}>
              <Show when={props.iconPosition === "left" && props.icon}>
                <span
                  classList={{
                    "mr-1": !!props.label,
                    "transform rotate-180": props.rotateIcon && isOpen(),
                  }}>
                  {props.icon}
                </span>
              </Show>
              <Show when={props.label}>
                {<span class="truncate">{props.label}</span>}
              </Show>
              <Show when={props.iconPosition === "right" && props.icon}>
                <span
                  classList={{
                    "mr-1": !!props.label,
                    "transition rotate-180": props.rotateIcon && isOpen(),
                  }}>
                  {props.icon}
                </span>
              </Show>
            </PopoverButton>
          </Show>
          <Transition
            show={isOpen() || !!props.show}
            enter="transition duration-200"
            enterFrom="opacity-0 -translate-y-1 scale-50"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition duration-150"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 -translate-y-1 scale-50">
            <PopoverPanel
              unmount={true}
              class={`${classNames(
                props.panelPosition === "left" && "left-8 -translate-x-full",
                props.panelPosition === "right" && "right-8 translate-x-full",
                props.panelPosition === "center" && "left-1/2 -translate-x-1/2"
              )} absolute z-10 px-4 mt-3 transform sm:px-0 lg:max-w-3xl`}>
              <Menu
                onClick={() => {
                  console.log("click");
                  setState(false);
                }}
                class="overflow-hidden w-64 rounded-lg shadow-lg ring-1 ring-black/5 bg-bg2 flex flex-col space-y-1 p-1">
                {Array.isArray(props.children) ? (
                  props.children.map((child) => {
                    return (
                      <Dynamic
                        component={child as any}
                        onClick={() => setState(false)}
                      />
                    );
                  })
                ) : (
                  <Dynamic
                    component={props.children as any}
                    onClick={() => setState(false)}
                  />
                )}
              </Menu>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
