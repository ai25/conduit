import { For, JSX } from "solid-js";
import { DropdownMenu } from "@kobalte/core";
import { FaSolidCheck } from "solid-icons/fa";

interface Option {
  value?: string;
  label: string;
  onClick?: () => void;
}

interface DropdownProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  triggerIcon: JSX.Element;
  options: Option[];
  selectedValue?: string;
  onChange?: (value: string) => void;
}

export const Dropdown = (props: DropdownProps) => {
  return (
    <DropdownMenu.Root open={props.isOpen} onOpenChange={props.onOpenChange}>
      <DropdownMenu.Trigger class="p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
        <DropdownMenu.Icon>{props.triggerIcon}</DropdownMenu.Icon>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content class="bg-bg1 border border-bg3/80 rounded-md z-[999999]
          -top-2
          animate-in
          fade-in
          slide-in-from-top-10
          duration-200
          ">
           <DropdownMenu.Arrow />
          <DropdownMenu.RadioGroup
            class="max-h-[40vh] overflow-y-auto
            p-2
            "
            value={props.selectedValue}
            onChange={props.onChange}
          >
            <For each={props.options}>
              {(option) => (
                <DropdownMenu.RadioItem
                  value={option.value ?? option.label}
                  class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b last:border-none hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-primary focus-visible:outline-none"
                  onClick={option.onClick}
                >
                  <DropdownMenu.ItemIndicator class="inline-flex absolute left-0">
                    <FaSolidCheck
                      fill="currentColor"
                      class="h-4 w-4 mx-1 text-text1"
                    />
                  </DropdownMenu.ItemIndicator>
                  {option.label}
                </DropdownMenu.RadioItem>
              )}
            </For>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
