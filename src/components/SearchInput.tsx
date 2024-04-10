import {
  For,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  useContext,
  untrack,
  JSX,
} from "solid-js";
import { QueryClient, createQuery } from "@tanstack/solid-query";
import { usePreferences } from "~/stores/preferencesStore";
import { FaSolidMagnifyingGlass, FaSolidX } from "solid-icons/fa";
import { setStorageValue } from "~/utils/storage";
import { isServer, Portal } from "solid-js/web";
import { useAppState } from "~/stores/appStateStore";
import { TbArrowLeft, TbArrowUpLeft, TbSearch, TbX } from "solid-icons/tb";
import { yieldToMain } from "~/utils/helpers";
import { useNavigate, useSearchParams } from "@solidjs/router";

const SearchInput = () => {
  const [search, setSearch] = createSignal("");
  const [suggestions, setSuggestions] = createSignal<
    { value: string; isHistory: boolean }[]
  >([]);
  const [activeIndex, setActiveIndex] = createSignal(-1); // For keyboard navigation

  const [searchParams] = useSearchParams();
  createEffect(() => {
    setInputValue(searchParams.search_query || untrack(() => inputValue()));
  });

  const fetchInitialSuggestions = () => {
    const history = JSON.parse(localStorage.getItem("search_history") || "[]");
    console.log(history);
    setSuggestions(
      history.map((item: string) => ({ value: item, isHistory: true }))
    );
  };
  const [preferences] = usePreferences();
  const searchQuery = createQuery(() => ({
    queryKey: ["suggestions"],
    queryFn: async (): Promise<string[]> => {
      console.log("fetching suggestions", search());
      return await fetch(
        preferences.instance?.api_url + "/suggestions?query=" + search()
      ).then((res) => res.json());
    },
    enabled:
      search().length > 1 && preferences.instance?.api_url && showSuggestions()
        ? true
        : false,
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
  }));
  const navigate = useNavigate();
  const [, setAppState] = useAppState();
  const [inputValue, setInputValue] = createSignal("");
  const [showSuggestions, setShowSuggestions] = createSignal(false);

  function handleSearch(input: string) {
    // setAppState("loading", true);
    console.log(input);
    navigate(`/results?search_query=${input}`, { replace: true });
    // setAppState("loading", false);
  }

  const handleInputChange = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    if (value.length < 1) {
      fetchInitialSuggestions();
      return;
    }
    setInputValue(value);
    setSearch(value);
    searchQuery.refetch();
    // fetchInitialSuggestions();
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
          if (prev === -1 || suggestions().length === 0) {
            return 0;
          }
          const newIndex = Math.min(prev + 1, suggestions().length - 1);
          setInputValue(suggestions()[newIndex].value);
          return newIndex;
        });
        break;
      case "ArrowUp":
        setActiveIndex((prev) => {
          if (prev === -1 || suggestions().length === 0) {
            return 0;
          }
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
          setSearch(inputValue());
          setSuggestions([]);
          setShowSuggestions(false);
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
    document.addEventListener("keydown", handleKeyboardShortcuts);
    onCleanup(() => {
      document.removeEventListener("keydown", handleKeyboardShortcuts);
    });
  });
  let inputRef: HTMLInputElement | undefined = undefined;
  function handleKeyboardShortcuts(e: KeyboardEvent) {
    if (e.ctrlKey) {
      if (e.key === "k") {
        e.preventDefault();
        inputRef?.focus();
      }
    }
    if (e.key === "Escape") {
      inputRef?.blur();
    }
  }
  const handleInputFocus = () => {
    setActiveIndex(-1);
    setShowSuggestions(true);
    if (!search()) {
      // If the input is empty
      fetchInitialSuggestions();
    }
    document.body.classList.add("overflow-y-hidden");
    document.body.classList.add("sm:overflow-y-auto");
  };

  const handleInputBlur = () => {
    console.log("blur", document.activeElement);
    const focusedElement = document.activeElement;

    if (focusedElement && focusedElement.id.startsWith("search-")) {
      console.log("focused", focusedElement);
      return;
    }

    document.body.classList.remove("overflow-y-hidden");
    document.body.classList.remove("sm:overflow-y-auto");
    setTimeout(() => {
      setSuggestions([]);
      setShowSuggestions(false);
    }, 150);
  };
  return (
    <div
      classList={{
        "relative z-[999999] flex items-center transition-all duration-500 ":
          true,
        "-left-10 sm:left-0 w-screen sm:w-auto":
          suggestions().length > 0 && showSuggestions(),
      }}
    >
      <Show when={suggestions().length > 0 && showSuggestions()}>
        <button
          class="sm:hidden bg-bg2 p-1 px-2 text-gray-500 flex items-center justify-center hover:bg-bg1 hover:text-text1 focus-visible:ring-2 focus-visible:ring-primary/80 rounded focus-visible:outline-none "
          onClick={() => {
            setSuggestions([]);
            setShowSuggestions(false);
            inputRef?.blur();
          }}
          aria-label="Back"
        >
          <TbArrowLeft aria-hidden="true" class="w-6 h-6" />
        </button>
      </Show>

      <label for="search-input" class="sr-only">
        Search
      </label>
      <input
        aria-haspopup="listbox"
        aria-owns="suggestion-list"
        aria-expanded={suggestions().length > 0 && showSuggestions()}
        aria-controls="suggestion-list"
        id="search-input"
        ref={inputRef}
        class="w-full border-0 max-w-full peer outline-none bg-bg1 border-bg2 focus:border-2 focus:border-r-0 placeholder-shown:focus:border-r-2 text-text1 text-sm rounded-lg rounded-r-none placeholder-shown:rounded-r-lg transition-transform focus:ring-primary focus:border-primary py-1 px-2.5"
        type="combobox"
        value={inputValue()}
        placeholder="Search... (Ctrl + K)"
        onInput={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={async () => {
          await yieldToMain();
          handleInputBlur();
        }}
        onKeyDown={handleKeyDown}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex() > -1 ? `option-${activeIndex()}` : undefined
        }
      />
      <div
        onTransitionStart={(e) => {
          console.log("transition start", e.propertyName);
        }}
        class="relative peer-placeholder-shown:hidden  flex w-max items-center justify-center gap-1 peer h-[29px] peer-focus:h-[33px] bg-bg1 py-1 px-1 -left-1 border-0 peer-focus:border-2 peer-focus:border-primary peer-focus:border-l-0 rounded-r-lg"
      >
        <button
          id="search-button"
          class="text-gray-500 flex items-center justify-center hover:bg-bg1 hover:text-text1 focus-visible:ring-2 focus-visible:ring-primary/80 rounded focus-visible:outline-none "
          onClick={() => {
            handleSearch(inputValue());
          }}
          aria-label="Search"
        >
          <TbSearch class="w-5 h-5" aria-hidden="true" />
        </button>
        <button
          id="search-clear-button"
          class="right-2 top-1/2 transform text-gray-500 flex items-center justify-center hover:bg-bg1 hover:text-text1 focus-visible:ring-2 focus-visible:ring-primary/80 rounded focus-visible:outline-none "
          onClick={() => {
            setInputValue("");
            setSearch("");
            setSuggestions([]);
            inputRef?.focus();
          }}
          aria-label="Clear search"
        >
          <TbX class="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
      <Show when={suggestions().length > 0 && showSuggestions()}>
        <Portal>
          <ul
            class={`fixed w-screen h-screen sm:h-auto left-0 right-0 sm:w-max sm:min-w-[30rem] sm:left-[calc(70vw-18rem)] top-10 sm:mt-1 bg-bg1 border-1 border-bg2/80 p-2 z-[999999] text-text1 rounded-md border border-bg1 shadow-md transform transition-transform duration-250 ease-in origin-center animate-in fade-in aria-[expanded]:animate-out aria-[expanded]:fade-out `}
            aria-multiselectable="false"
            aria-live="polite"
            aria-label="Suggestions"
            id="search-suggestion-list"
          >
            <For each={suggestions()}>
              {(suggestion, index) => (
                <li
                  classList={{
                    "text-sm leading-none text-text1 border-b border-bg2 last:border-none rounded-md flex items-center justify-between h-8 px-2 py-5 relative select-none outline-none cursor-pointer hover:bg-bg2":
                      true,
                    "bg-bg2 focus-visible:ring-2 ring-primary":
                      activeIndex() === index(),
                  }}
                  id={`search-option-${index()}`}
                  aria-selected={activeIndex() === index()}
                  tabindex={0}
                  onClick={() => {
                    console.log("click");
                    setSearch(suggestion.value);
                    setInputValue(suggestion.value);
                    handleSearch(suggestion.value);
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  onKeyDown={(e) => {
                    console.log("keydown");
                    e.stopPropagation();
                    if (e.key === "Enter") {
                      setSearch(suggestion.value);
                      setInputValue(suggestion.value);
                      handleSearch(suggestion.value);
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }
                  }}
                  onFocusIn={() => {
                    setActiveIndex(index());
                  }}
                  aria-label={suggestion.value}
                >
                  <span aria-hidden="true">{suggestion.value}</span>

                  <div class="ml-2 flex items-center">
                    <button
                      id={`search-suggestion-use-${index()}`}
                      role="none"
                      class="text-xs text-gray-500 h-8 w-8 flex items-center justify-center hover:bg-bg1 hover:text-text1 focus-visible:ring-2 focus-visible:ring-primary/80 rounded focus-visible:outline-none "
                      onClick={(e) => {
                        e.stopPropagation();
                        setInputValue(suggestion.value);
                        inputRef?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          setInputValue(suggestion.value);
                          inputRef?.focus();
                        }
                      }}
                      aria-label={`Use suggestion ${suggestion.value} (Enter)`}
                    >
                      <TbArrowUpLeft class="w-5 h-5" aria-hidden="true" />
                    </button>
                    <Show when={suggestion.isHistory}>
                      <button
                        id={`search-suggestion-remove-${index()}`}
                        role="none"
                        class="text-xs text-gray-500 h-8 w-8 flex items-center justify-center hover:bg-bg1 hover:text-text1 focus-visible:ring-2 focus-visible:ring-primary/80 rounded focus-visible:outline-none "
                        onClick={(e) => {
                          console.log("remove");
                          if (suggestion.isHistory) {
                            e.stopPropagation();
                            removeSuggestion(suggestion.value);
                            inputRef?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (suggestion.isHistory) {
                              e.stopPropagation();
                              removeSuggestion(suggestion.value);
                              inputRef?.focus();
                            }
                          }
                        }}
                        aria-label={`Remove suggestion ${suggestion.value} (Ctrl+Delete)`}
                      >
                        <TbX class="w-5 h-5" aria-hidden="true" />
                      </button>
                    </Show>
                  </div>
                </li>
              )}
            </For>
          </ul>
        </Portal>
      </Show>
    </div>
  );
};

export default SearchInput;

type FocusTrapProps = {
  active: boolean;
  children: JSX.Element;
};

export function FocusTrap(props: FocusTrapProps) {
  let focusTrapContainer: HTMLDivElement | undefined;

  const [isActive, setIsActive] = createSignal(props.active);

  const focusableElementsString =
    'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [contenteditable], [tabindex]:not([tabindex^="-"])';

  const setFocusTrap = () => {
    if (focusTrapContainer) {
      let focusableElements = Array.from(
        focusTrapContainer.querySelectorAll(focusableElementsString)
      ) as HTMLElement[];
      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      console.log(firstElement, lastElement);

      const handleFocus = (event: KeyboardEvent) => {
        if (event.key !== "Tab" || !isActive()) {
          return;
        }

        const currentFocusIndex = focusableElements.indexOf(
          document.activeElement as HTMLElement
        );
        if (event.shiftKey) {
          // Move to the last element if the first element is focused
          if (currentFocusIndex === 0 || currentFocusIndex === -1) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Move to the first element if the last element is focused
          if (currentFocusIndex === focusableElements.length - 1) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      };

      focusTrapContainer.addEventListener("keydown", handleFocus);

      // Cleanup event listener on component unmount
      onCleanup(() => {
        focusTrapContainer?.removeEventListener("keydown", handleFocus);
      });

      // Initially focus the first focusable element
      firstElement.focus();
    }
  };

  onMount(() => {
    setIsActive(props.active);
    if (isActive()) {
      setFocusTrap();
    }
  });

  return (
    <div
      class="focus-trap-container" // Add TailwindCSS classes as needed
      ref={focusTrapContainer}
    >
      {props.children}
    </div>
  );
}
