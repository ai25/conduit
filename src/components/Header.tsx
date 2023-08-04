import { PipedInstance } from "~/types";
import Select from "~/components/Select";
import { createEffect, createSignal, useContext } from "solid-js";
import { InstanceContext, ThemeContext } from "~/root";
import { useCookie } from "~/utils/hooks";
import { getStorageValue, setStorageValue } from "~/utils/storage";
import { A } from "@solidjs/router";

export default () => {
  // const preferences = useContext(PreferencesContext);
  const [theme, setThemeContext] = useContext(ThemeContext);
  const [instance, setInstanceContext] = useContext(InstanceContext);
  const [, setTheme] = useCookie("theme", "monokai");
  const [, setInstance] = useCookie("instance", "https://pipedapi.kavin.rocks");
  const [instances, setInstances] = createSignal<PipedInstance[] | Error>();

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
    <header>
      <div class="text-text1 flex gap-2 items-center m-2">
        {!instance() && <></>}
        {!theme() && <></>}
        <div>
          <A href="/trending">Trending</A>
        </div>
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

        {instances() && (
          <Select
            name="instance"
            value={
              (instances() as PipedInstance[]).find((i) => {
                let inst = i.api_url === instance();
                console.log(inst, i.api_url, instance());
                return inst;
              })?.name ?? `DOWN - ${instance()}`
            }
            onChange={(v) => {
              console.log("SETTING INSTANCE", v)
              setInstance(v);
              setInstanceContext(v);
            }}
            options={(instances() as PipedInstance[]).map((instance) => {
              return {
                value: instance.api_url,
                label: instance.name,
              };
            })}
          />
        )}
      </div>
    </header>
  );
};
