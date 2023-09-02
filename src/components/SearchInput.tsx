import {
  For,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";
import { useNavigate } from "solid-start";
import { InstanceContext } from "~/root";
import Dropdown from "./Dropdown";
import DropdownItem from "./DropdownItem";
import { Combobox } from "@kobalte/core";
import { BsCaretDown } from "solid-icons/bs";

const Search = () => {
  const [search, setSearch] = createSignal<string>("");
  const [instance] = useContext(InstanceContext);
  async function getSuggestions(value: string) {
    if (!value) return;
    const res = await fetch(`${instance().api_url}/suggestions?query=${value}`);
    console.log(res);
    if (res.status === 200) {
      const json = await res.json();
      console.log(json);
      if (json.length > 0) {
        setOptions(json);
      } else {
        setOptions([]);
      }
    } else {
      console.error("Failed to fetch suggestions", res.text());
    }
  }
  const navigate = useNavigate();

  function handleSearch(input: string) {
    console.log(input);
    location.replace(`/search?q=${input}`);
  }
  const [options, setOptions] = createSignal([]);
  const onInputChange = (value: string) => {
    setSearch(value);
    getSuggestions(value);
    console.log(options(), "OPTIONS");
  };
  let inputRef: HTMLInputElement | undefined = undefined;
  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
  });
  function handleKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey) {
      if (e.key === "k") {
        e.preventDefault();
        inputRef?.focus();
      }
    }
    if (e.key === "Enter") {
      console.dir(inputRef?.getAttribute("aria-expanded"));
      if (inputRef?.getAttribute("aria-expanded")) {
        if (!search()) return;
        handleSearch(search()!);
      }
    }
  }
  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });
  const [value, setValue] = createSignal("");
  return (
    <>
        <Combobox.Root
          class="w-full max-w-full flex px-2"
          options={options()}
          value={value()}
          onInputChange={onInputChange}
          onChange={setValue}
          placeholder="Search… (⌘+K)"
          itemComponent={(props) => (
            <Combobox.Item
              onPointerUp={() => {
                console.log(props.item);
                handleSearch(props.item.rawValue);
              }}
              item={props.item}
              class="text-base data-[highlighted]:bg-bg1 leading-none text-text1 bg-bg2 rounded-md flex items-center justify-between h-8 px-2 relative select-none outline-none">
              <Combobox.ItemLabel>{props.item.rawValue}</Combobox.ItemLabel>
            </Combobox.Item>
          )}>
          <Combobox.Control class="">
            {({ selectedOptions }) => (
              <Combobox.Input
                ref={inputRef}
                class="w-full max-w-full outline-none bg-bg1 border border-bg2 focus:ring-2 text-text1 text-sm rounded-lg focus:ring-primary focus:border-primary py-1 px-2.5"
              />
            )}
          </Combobox.Control>
          <Combobox.Portal>
            <Combobox.Content class="bg-bg2 z-[999] text-text1 rounded-md border border-bg1 shadow-md transform transition-transform duration-250 ease-in origin-center animate-contentHide">
              <Combobox.Listbox class="overflow-y-auto max-h-90 p-2 focus:outline-none" />
            </Combobox.Content>
          </Combobox.Portal>
        </Combobox.Root>
    </>
  );
};

export default Search;
