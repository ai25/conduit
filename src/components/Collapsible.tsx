import { Collapsible as KobalteCollapsible } from "@kobalte/core/collapsible";
import { BsChevronDown } from "solid-icons/bs";
import { JSX, createSignal } from "solid-js";

interface CollapsibleProps {
  children: JSX.Element;
  trigger: JSX.Element;
  class?: string;
  triggerClass?: string;
  contentClass?: string;
}
export default function Collapsible(props: CollapsibleProps) {
  return (
    <KobalteCollapsible class={props.class}>
      <KobalteCollapsible.Trigger
        class={`group flex items-center w-full justify-between outline-none
      flex items-center text-start gap-2 cursor-pointer hover:bg-bg3/80 px-2 md:px-4 py-2 rounded 
      focus-visible:ring-4 focus-visible:ring-primary focus-visible:outline-none ${props.triggerClass}`}
      >
        {props.trigger}
        <BsChevronDown class="group-data-[expanded]:rotate-180 transition-transform right-0" />
      </KobalteCollapsible.Trigger>
      <KobalteCollapsible.Content
        class={`w-full animate-out fade-out slide-out-to-top-5 data-[expanded]:animate-in data-[expanded]:fade-in data-[expanded]:slide-in-from-top-5 ${props.contentClass}`}
      >
        {props.children}
      </KobalteCollapsible.Content>
    </KobalteCollapsible>
  );
}
