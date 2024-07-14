import { Combobox as KobalteCombobox } from "@kobalte/core/combobox";
import { For, createSignal } from "solid-js";
import { BsX } from "solid-icons/bs";
import { FaSolidCheck, FaSolidSort } from "solid-icons/fa";

interface ComboboxProps {
  options: string[];
  values: string[];
  setValues: (values: string[]) => void;
  placeholder?: string;
}
export default function Combobox(props: ComboboxProps) {
  return (
    <>
      <KobalteCombobox<string>
        multiple
        options={props.options}
        value={props.values}
        onChange={props.setValues}
        placeholder={props.placeholder}
        itemComponent={(props) => (
          <KobalteCombobox.Item
            class="flex items-center gap-2 rounded-lg px-2 py-1 cursor-pointer data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:pointer-events-none data-[highlighted]:bg-bg2"
            item={props.item}
          >
            <KobalteCombobox.ItemLabel>
              {props.item.rawValue}
            </KobalteCombobox.ItemLabel>
            <KobalteCombobox.ItemIndicator>
              <FaSolidCheck />
            </KobalteCombobox.ItemIndicator>
          </KobalteCombobox.Item>
        )}
      >
        <KobalteCombobox.Control<string>
          class="inline-flex justify-between w-full max-w-xs rounded-lg px-2 py-1 outline-none bg-bg2 duration-300 [&:has(:focus-visible)]:ring-2 [&:has(:focus-visible)]:ring-primary/80"
          aria-label="Fruits"
        >
          {(state) => (
            <>
              <div>
                <div class="flex flex-wrap gap-1">
                  <For each={state.selectedOptions()}>
                    {(option) => (
                      <span
                        class="flex items-center gap-1 rounded-lg py-1 px-2 bg-bg1 border-1 border-bg1/50"
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        {option}
                        <button
                          class="w-5 h-5 flex items-center justify-center rounded-lg outline-none focus-visible:ring-2 ring-primary/80"
                          onClick={() => state.remove(option)}
                        >
                          <BsX class="w-5 h-5" />
                        </button>
                      </span>
                    )}
                  </For>
                </div>
                <KobalteCombobox.Input class="appearance-none inline-flex min-w-0 w-full min-h-[40px] pl-3 bg-bg2 rounded-lg outline-none " />
              </div>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                class="self-center w-7 h-7 flex items-center justify-center rounded-lg outline-none focus-visible:ring-2 ring-primary/80"
                onClick={state.clear}
              >
                <BsX class="h-7 w-7 " />
              </button>
              <KobalteCombobox.Trigger class="self-center w-7 h-7 flex items-center justify-center rounded-lg outline-none focus-visible:ring-2 ring-primary/80">
                <KobalteCombobox.Icon>
                  <FaSolidSort class="w-4 h-4" />
                </KobalteCombobox.Icon>
              </KobalteCombobox.Trigger>
            </>
          )}
        </KobalteCombobox.Control>
        <KobalteCombobox.Portal>
          <KobalteCombobox.Content class="bg-bg1 border-2 rounded-lg border-bg2/80 ">
            <KobalteCombobox.Listbox class="overflow-y-auto p-2 max-h-[clamp(0px,50vh,300px)]" />
          </KobalteCombobox.Content>
        </KobalteCombobox.Portal>
      </KobalteCombobox>
      {/* <p>Your favorite fruits are: {values().join(", ")}.</p> */}
    </>
  );
}
