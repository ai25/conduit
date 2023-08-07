import { PipedInstance } from "~/types";
import Select from "~/components/Select";
import { For, createEffect, createSignal, useContext } from "solid-js";
import { InstanceContext, ThemeContext } from "~/root";
import { useCookie } from "~/utils/hooks";
import { getStorageValue, setStorageValue } from "~/utils/storage";
import { A } from "@solidjs/router";
import { useNavigate } from "solid-start";

const Header = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [theme, setThemeContext] = useContext(ThemeContext);
  const [instance, setInstanceContext] = useContext(InstanceContext);
  const [, setTheme] = useCookie("theme", "monokai");
  const [, setInstance] = useCookie("instance", "https://pipedapi.kavin.rocks");
  const [instances, setInstances] = createSignal<PipedInstance[] | Error>();

  const links = [
    { href: "/feed", label: "Feed" },
    { href: "/trending", label: "Trending" },
    { href: "/history", label: "History" },
    { href: "/import", label: "Import" },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen());
  };
  createEffect(async () => {
    console.log(
      new Date().toISOString().split("T")[1],
      "visible task setting instances in header",
      instances
    );
    console.time("visible task setting instances in header");
    await fetch("https://piped-instances.kavin.rocks/")
      .then(async (res) => {
        console.log("INSTANCES", res.status);
        if (res.status === 200) {
          setInstances(await res.json());
          console.timeEnd("visible task setting instances in header");
        } else {
          setInstances(new Error("Failed to fetch instances"));
        }
      })
      .catch((err) => {
        console.log("INSTANCES ERROR", err.message);
        return err as Error;
      });
    if (
      !instances() ||
      instances() instanceof Error ||
      (instances() as PipedInstance[]).length < 1
    ) {
      setInstances(getStorageValue("instances", [], "json", "localStorage"));
      return;
    }

    setStorageValue("instances", JSON.stringify(instances), "localStorage");
  });

  return (
    <header class="w-full px-2 max-h-12">
      <button
        class="sr-only focus:not-sr-only"
        onClick={() => {
          document.querySelector("media-player")?.focus();
        }}>
        Skip to main content
      </button>
      <div class="flex flex-wrap items-center justify-start">
        <div class="mr-6 flex items-center">
          <div class="relative h-8">
            <img
              src="favicon.ico"
              class="object-contain"
              alt="logo"
              sizes="(max-width: 640px) 100vw, 640px"
            />
          </div>
        </div>
        <button
          class="inline sm:hidden items-center rounded border px-3 py-2 hover:border-black"
          onClick={toggleMenu}>
          <svg
            class="h-3 w-3 fill-current"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg">
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
        <nav
          class={`${
            isOpen() ? "block" : "hidden"
          } block w-full flex-grow sm:flex sm:w-auto sm:items-center`}>
          <div class="sm:flex-grow sm:flex-row sm:text-center">
            <For each={links}>
              {(link) => (
                <A
                  href={link.href}
                  class="mr-4 mt-4 block hover:text-highlight sm:mt-0 sm:inline-block">
                  {link.label}
                </A>
              )}
            </For>
          </div>
        </nav>
        <Search />
        <Select
          name="theme"
          value={theme() ?? ""}
          onChange={(v) => {
            setThemeContext(v);
            setTheme(v);
          }}
          options={[
            { value: "monokai", label: "Monokai" },
            { value: "dracula", label: "Dracula" },
            { value: "kawaii", label: "Kawaii" },
            { value: "discord", label: "Discord" },
            { value: "github", label: "Github" },
          ]}
        />

        <Select
          name="instance"
          value={
            (instances() as PipedInstance[])?.find((i) => {
              let inst = i.api_url === instance();
              console.log(inst, i.api_url, instance());
              return inst;
            })?.name ?? `DOWN - ${instance()}`
          }
          onChange={(v) => {
            console.log("SETTING INSTANCE", v);
            setInstance(v);
            setInstanceContext(v);
          }}
          options={(instances() as PipedInstance[])?.map((instance) => {
            return {
              value: instance.api_url,
              label: instance.name,
            };
          })}
        />
      </div>
    </header>
  );
};

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

  return (
    <div class="inline-block max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(search()!);
        }}
        class="relative max-w-full">
        <input
          value={search() ?? ""}
          onInput={(e) => {
            setSearch(e.currentTarget.value);
          }}
          type="search"
          class="peer appearance-none cursor-pointer relative 
          z-10 h-12 w-12 focus:pl-14 rounded-full border border-text2 transition-all origin-right duration-200 
          bg-transparent outline-none 
          focus:w-full focus:cursor-text focus:ring-highlight focus:ring-4 
          ring-inset focus:pr-4"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="absolute inset-y-0 my-auto h-8 w-12 border-r 
          border-transparent stroke-text2 px-3.5 peer-focus:border-highlight 
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
        <div class="absolute shadow bg-bg2 z-40 w-full left-0 rounded max-h-select overflow-y-auto svelte-5uyqqj">
          <div class="flex flex-col w-full">
            <For each={suggestions()}>
              {(suggestion) => (
                <div
                  onClick={() => handleSearch(suggestion)}
                  class="cursor-pointer w-full border-bg3 rounded-t border-b hover:bg-bg3">
                  <div class="flex w-full items-center p-2 pl-2 border-transparent border-l-2 relative ">
                    <div class="w-full items-center flex">
                      <div class="mx-2">{suggestion}</div>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Header;
