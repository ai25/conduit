import { For, createEffect, createSignal, useContext } from "solid-js";
import { useNavigate } from "solid-start";
import { InstanceContext } from "~/root";
import Dropdown from "./Dropdown";
import DropdownItem from "./DropdownItem";

const Search = () => {
  const [search, setSearch] = createSignal<string | null>(null);
  const [suggestions, setSuggestions] = createSignal<string[]>([]);
  const [instance] = useContext(InstanceContext);
  async function getSuggestions(value: string) {
    const res = await fetch(`${instance()}/suggestions?query=${value}`);
    console.log(res);
    if (res.status === 200) {
      const json = await res.json();
      console.log(json);
      setSuggestions(json);
    } else {
      console.error("Failed to fetch suggestions", res.text());
    }
  }
  const navigate = useNavigate();
  createEffect(() => {
    setSuggestions([]);
    if (search() && search()!.length > 1) {
      getSuggestions(search()!);
    }
  });

  function handleSearch(input: string) {
    setSuggestions([]);
    setSearch(null);
    console.log(input);
    navigate(`/search?q=${input}`, { replace: false });
  }
  const [hasFocus, setHasFocus] = createSignal(false);
  return (
    <div class="inline-block max-w-md">
      <form
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
      </form>
    </div>
  );
};

export default Search;