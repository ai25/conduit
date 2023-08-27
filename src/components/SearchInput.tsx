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
  // const [suggestions, setSuggestions] = createSignal<string[]>([]);
  const [instance] = useContext(InstanceContext);
  async function getSuggestions(value: string) {
    if (!value) return;
    const res = await fetch(`${instance()}/suggestions?query=${value}`);
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
  // createEffect(() => {
  //   setSuggestions([]);
  //   if (search() && search()!.length > 1) {
  //     getSuggestions(search()!);
  //   }
  // });

  function handleSearch(input: string) {
    // setSuggestions([]);
    // setSearch(null);
    console.log(input);
    navigate(`/search?q=${input}`, { replace: false });
  }
  const [options, setOptions] = createSignal([]);
  const onOpenChange = (
    isOpen: boolean,
    triggerMode?: Combobox.ComboboxTriggerMode
  ) => {
    // Show all options on ArrowDown/ArrowUp and button click.
    if (isOpen && triggerMode === "manual") {
      // setOptions(suggestions());
    }
  };
  const onInputChange = (value: string) => {
    setSearch(value);
    getSuggestions(value);
    console.log(options(), "OPTIONS");
  };
  const [showPlaceholder, setShowPlaceholder] = createSignal(true);
  let inputRef: HTMLInputElement | undefined = undefined;
  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
  });
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "k" && e.ctrlKey) {
      e.preventDefault();
      inputRef?.focus();
    }
    if (e.key === "Enter") {
      console.dir( inputRef?.getAttribute("aria-expanded"))
      if (inputRef?.getAttribute("aria-expanded")) {
        if (!search()) return;
        handleSearch(search()!);
      }
    }
  }
  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });
  return (
    <>
      {/* <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(search()!);
        }}
        class="relative max-w-full">
        <input
          onFocusIn={() => setHasFocus(true)}
          onFocusOut={() => setHasFocus(false)}
          value={search() ?? ""}
          onInput={(e) => {
            setSearch(e.currentTarget.value);
          }}
          type="search"
          class="peer appearance-none cursor-pointer relative 
          z-10 h-8 w-8 focus:pl-14 rounded-full border border-text2 transition-all origin-right duration-200 
          bg-transparent outline-none text-text1 text-opacity-0  
          focus:w-full focus:cursor-text focus:ring-highlight focus:ring-4 focus:text-opacity-100
          ring-inset focus:pr-4 peer-focus:w-full"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="absolute inset-y-0 my-auto h-5 w-8 border-r 
          border-transparent stroke-text2 px-2 peer-focus:border-highlight 
          peer-focus:stroke-highlight"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <Dropdown
          panelPosition="center"
          showButton={false}
          show={suggestions().length > 0 && hasFocus()}>
          <For each={suggestions()}>
            {(suggestion) => (
              <DropdownItem
                as="button"
                onClick={() => handleSearch(suggestion)}
                label={suggestion}
              />
            )}
          </For>
        </Dropdown>
      </form> */}
      <Combobox.Root
        // value={search()}
        // onChange={setSearch}
        options={options()}
        onInputChange={onInputChange}
        onOpenChange={onOpenChange}
        triggerMode="focus"
        placeholder="Search… (⌘+K)"
        itemComponent={(props) => (
          <Combobox.Item
            onClick={() => {
              console.log(props.item);
              handleSearch(props.item.rawValue);
            }}
            item={props.item}
            class="text-base data-[highlighted]:bg-bg1 leading-none text-text1 bg-bg2 rounded-md flex items-center justify-between h-8 px-2 relative select-none outline-none">
            <Combobox.ItemLabel>{props.item.rawValue}</Combobox.ItemLabel>
            {/* <Combobox.ItemIndicator class="combobox__item-indicator">
              <CheckIcon />
            </Combobox.ItemIndicator> */}
          </Combobox.Item>
        )}>
        <Combobox.Control class="inline-flex text-sm justify-between w-50 rounded-md leading-none outline-none bg-bg1 border border-bg1 text-text1 transition-colors duration-250">
          {({ selectedOptions }) => (
            <Combobox.Input
              ref={inputRef}
              class="appearance-none focus-visible:ring-2 focus-visible:ring-primary text-text1 bg-bg1 inline-flex w-full min-h-10 pl-4 rounded-md outline-none"
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
