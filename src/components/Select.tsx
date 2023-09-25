import { Select as KobalteSelect } from "@kobalte/core";
import { FaSolidCaretDown, FaSolidCheck, FaSolidSort } from "solid-icons/fa";

const Select = (props: {
  onChange: (value: string) => void;
  value: string;
  options: string[];
  defaultValue?: string;
  placeholder?: string;
}) => {
  return (
    <KobalteSelect.Root
      defaultValue={props.value}
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
      options={props.options}
      itemComponent={(props) => {
        return (
          <KobalteSelect.Item
            class="cursor-pointer w-full border-bg3 flex relative items-center px-7 py-2 rounded border-b hover:bg-bg3 focus-visible:bg-bg3 focus-visible:ring-4 focus-visible:ring-highlight focus-visible:outline-none"
            item={props.item}
          >
            <KobalteSelect.Label>{props.item.rawValue}</KobalteSelect.Label>
            <KobalteSelect.ItemIndicator class="inline-flex absolute left-0">
              <FaSolidCheck
                fill="currentColor"
                class="h-4 w-4 mx-1 text-text1"
              />
            </KobalteSelect.ItemIndicator>
          </KobalteSelect.Item>
        );
      }}
      class="relative"
    >
      <KobalteSelect.Trigger class=" p-1 outline-none bg-bg3 ring-1 ring-bg2 inline-flex items-center justify-between py-2 px-3 focus-visible:ring-2 focus-visible:ring-primary rounded-md">
        <KobalteSelect.Value<string>>
          {(state) => state.selectedOption()}
        </KobalteSelect.Value>
        <KobalteSelect.Icon>
          <FaSolidSort
            fill="currentColor"
            class="h-3 w-3 text-text1 relative left-1"
          />
        </KobalteSelect.Icon>
      </KobalteSelect.Trigger>
      <KobalteSelect.Portal>
        <KobalteSelect.Content class="bg-bg2 p-1 rounded-md z-[9999] ">
          <KobalteSelect.Arrow />
          <KobalteSelect.Listbox class="overflow-y-auto max-h-[40vh] p-2 " />
        </KobalteSelect.Content>
      </KobalteSelect.Portal>
    </KobalteSelect.Root>
  );
};

export default Select;
