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
import { QueryClient, createQuery } from "@tanstack/solid-query";
import { usePreferences } from "~/stores/preferencesStore";
import { FaSolidX } from "solid-icons/fa";
import { setStorageValue } from "~/utils/storage";
import { isServer } from "solid-js/web";
import { useAppState } from "~/stores/appStateStore";

const SearchInput = () => {
  const [search, setSearch] = createSignal("");
  const [suggestions, setSuggestions] = createSignal<
    { value: string; isHistory: boolean }[]
  >([]);
  const [activeIndex, setActiveIndex] = createSignal(-1); // For keyboard navigation

  const fetchInitialSuggestions = () => {
    const history = JSON.parse(localStorage.getItem("search_history") || "[]");
    console.log(history);
    setSuggestions(
      history.map((item: string) => ({ value: item, isHistory: true }))
    );
  };
  const [preferences] = usePreferences();
  const searchQuery = createQuery(
    () => ["suggestions"],
    async (): Promise<string[]> => {
      console.log("fetching suggestions", search());
      return await fetch(
        preferences.instance?.api_url + "/suggestions?query=" + search()
      ).then((res) => res.json());
    },
    {
      get enabled() {
        return search().length > 1 &&
          preferences.instance?.api_url &&
          showSuggestions()
          ? true
          : false;
      },
      select: (data) => {
        console.log(data);
        if (data && !(data as any).error) {
          setSuggestions(
            data.map((item: string) => ({ value: item, isHistory: false }))
          );
        } else {
          setSuggestions([]);
        }
      },
    }
  );
  const navigate = useNavigate();
  const [, setAppState] = useAppState();
  const [inputValue, setInputValue] = createSignal("");
  const [showSuggestions, setShowSuggestions] = createSignal(false);

  function handleSearch(input: string) {
    // setAppState("loading", true);
    console.log(input);
    navigate(`/search?q=${input}`, { replace: true });
    // setAppState("loading", false);
  }

  const handleInputChange = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setInputValue(value);
    setSearch(value);
    searchQuery.refetch();
    fetchInitialSuggestions();
  };

  const removeSuggestion = (value: string) => {
    const history = JSON.parse(localStorage.getItem("search_history") || "[]");
    const newHistory = history.filter((item: string) => item !== value);
    setStorageValue("search_history", newHistory, "localStorage");
    fetchInitialSuggestions();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const inputElem = e.target as HTMLInputElement;
    switch (e.key) {
      case "ArrowDown":
        setActiveIndex((prev) => {
          const newIndex = Math.min(prev + 1, suggestions().length - 1);
          setInputValue(suggestions()[newIndex].value);
          return newIndex;
        });
        break;
      case "ArrowUp":
        setActiveIndex((prev) => {
          const newIndex = Math.max(prev - 1, 0);
          setInputValue(suggestions()[newIndex].value);
          return newIndex;
        });
        // Restore cursor position after state update
        setTimeout(() => {
          inputElem.selectionStart = suggestions()[activeIndex()].value.length;
          inputElem.selectionEnd = suggestions()[activeIndex()].value.length;
        }, 0);
        break;
      case "Enter":
        console.log(
          "enter",
          activeIndex(),
          suggestions(),
          suggestions()[activeIndex()]
        );
        if (activeIndex() > -1) {
          setSearch(suggestions()[activeIndex()].value);
          handleSearch(suggestions()[activeIndex()].value);
          setSuggestions([]);
          setShowSuggestions(false);
        } else if (inputValue().length > 0) {
          handleSearch(inputValue());
        }
        break;
      case "Escape":
        setSuggestions([]);
        break;
      case "Delete":
        if (e.ctrlKey) {
          if (activeIndex() > -1) {
            removeSuggestion(suggestions()[activeIndex()].value);
          }
        }

        break;
    }
  };

  onMount(() => {
    if (!isServer)
      document.addEventListener("keydown", handleKeyboardShortcuts);
  });
  onCleanup(() => {
    if (!isServer)
      document.removeEventListener("keydown", handleKeyboardShortcuts);
  });
  let inputRef: HTMLInputElement | undefined = undefined;
  function handleKeyboardShortcuts(e: KeyboardEvent) {
    if (e.ctrlKey) {
      if (e.key === "k") {
        e.preventDefault();
        inputRef?.focus();
      }
    }
  }
  const handleInputFocus = () => {
    setActiveIndex(-1);
    setShowSuggestions(true);
    if (!search()) {
      // If the input is empty
      fetchInitialSuggestions();
    }
  };
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as Node;
    const container = document.getElementById("search-combobox");

    if (container && !container.contains(target)) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  onMount(() => {
    if (!isServer) document.addEventListener("mousedown", handleClickOutside);
  });

  // Cleanup the event listener when the component unmounts
  onCleanup(() => {
    if (!isServer)
      document.removeEventListener("mousedown", handleClickOutside);
  });

  const handleInputBlur = () => {
    // Introducing a small delay to allow onClick events on suggestions to execute
    setTimeout(() => {
      setSuggestions([]);
      setShowSuggestions(false);
    }, 150);
  };
  return (
    <div
      id="search-combobox"
      class="relative"
      role="combobox"
      aria-haspopup="listbox"
      aria-owns="suggestion-list"
      aria-expanded={suggestions().length > 0}
    >
      <input
        ref={inputRef}
        class="w-full max-w-full outline-none bg-bg1 border border-bg2 focus:ring-2 text-text1 text-sm rounded-lg focus:ring-primary focus:border-primary py-1 px-2.5"
        type="text"
        value={inputValue()}
        placeholder="Search... (Ctrl + K)"
        onInput={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        aria-autocomplete="list"
        aria-controls="suggestion-list"
        aria-activedescendant={
          activeIndex() > -1 ? `option-${activeIndex()}` : undefined
        }
      />
      {suggestions().length > 0 && showSuggestions() && (
        <div
          class="absolute w-full top-full bg-bg2 z-[999] text-text1 rounded-md border border-bg1 shadow-md transform transition-transform duration-250 ease-in origin-center animate-contentHide"
          role="listbox"
          id="suggestion-list"
        >
          {suggestions().map((suggestion, index) => (
            <div
              class={`text-sm leading-none text-text1 bg-bg2 rounded-md flex items-center justify-between h-8 px-2 relative select-none outline-none cursor-pointer hover:bg-bg3 ${
                activeIndex() === index && "bg-bg3"
              }`}
              role="option"
              id={`option-${index}`}
              aria-selected={activeIndex() === index}
              onClick={() => {
                console.log("click");
                setSearch(suggestion.value);
                handleSearch(suggestion.value);
                setSuggestions([]);
              }}
              title={suggestion.value}
            >
              {suggestion.value}
              <Show when={suggestion.isHistory}>
                <button
                  class="ml-2 text-xs text-gray-500"
                  onClick={(e) => {
                    console.log("remove");
                    if (suggestion.isHistory) {
                      e.stopPropagation();
                      removeSuggestion(suggestion.value);
                    }
                  }}
                  aria-label={`Remove ${suggestion} (Ctrl+Delete)`}
                  title="Remove suggestion (Ctrl+Delete)"
                >
                  <FaSolidX />
                </button>
              </Show>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
