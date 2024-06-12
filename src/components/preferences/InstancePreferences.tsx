import { For, Show, createSignal } from "solid-js";
import { usePreferences } from "~/stores/preferencesStore";
import PreferencesCard from "../PreferencesCard";
import Button from "../Button";
import {
  FaSolidPencil,
  FaSolidPlus,
  FaSolidTrash,
  FaSolidX,
} from "solid-icons/fa";
import Field from "../Field";
import Collapsible from "../Collapsible";
import Modal from "../Modal";

export default function InstancePreferences() {
  const [preferences, setPreferences] = usePreferences();
  let addInstanceForm: HTMLFormElement;
  const [customInstanceName, setCustomInstanceName] = createSignal("");
  const [customInstanceUrl, setCustomInstanceUrl] = createSignal("");
  const [customInstanceProxy, setCustomInstanceProxy] = createSignal("");
  const [instanceToEdit, setInstanceToEdit] = createSignal("");
  let editInstanceForm: HTMLFormElement;
  const [editInstanceName, setEditInstanceName] = createSignal("");
  const [editInstanceUrl, setEditInstanceUrl] = createSignal("");
  const [editInstanceProxy, setEditInstanceProxy] = createSignal("");

  const [customInstanceModalOpen, setCustomInstanceModalOpen] =
    createSignal(false);

  return (
    <div class="ml-10">
      <For each={preferences.customInstances}>
        {(instance, index) => (
          <div>
            <div class="flex justify-between items-center">
              <PreferencesCard
                title={instance.name}
                description={instance.api_url}
              />

              <div>
                <Show when={instanceToEdit() !== instance.api_url}>
                  <Button
                    appearance="subtle"
                    onClick={() => {
                      setInstanceToEdit(instance.api_url);
                      setEditInstanceName(instance.name);
                      setEditInstanceUrl(instance.api_url);
                      setEditInstanceProxy(instance.image_proxy_url);
                    }}
                    icon={<FaSolidPencil class="w-5 h-5" />}
                  />
                </Show>
                <Show when={instanceToEdit() === instance.api_url}>
                  <Button
                    appearance="subtle"
                    onClick={() => {
                      setInstanceToEdit("");
                    }}
                    icon={<FaSolidX class="w-5 h-5" />}
                  />
                </Show>
                <Button
                  appearance="subtle"
                  onClick={() => {
                    setPreferences("customInstances", (prev) =>
                      prev.splice(index() + 1, 1)
                    );
                  }}
                  icon={<FaSolidTrash class="w-5 h-5" />}
                />
              </div>
            </div>
            <div>
              <Show when={instanceToEdit() === instance.api_url}>
                <form
                  ref={editInstanceForm!}
                  class="ml-10 flex flex-col gap-2 my-2"
                >
                  <Field
                    name="Name"
                    required
                    value={editInstanceName()}
                    onInput={setEditInstanceName}
                    placeholder="My Custom Instance"
                  />
                  <Field
                    name="API URL"
                    required
                    placeholder="https://pipedapi.example.com"
                    value={editInstanceUrl()}
                    onInput={setEditInstanceUrl}
                  />
                  <Field
                    name="Image Proxy URL"
                    required
                    placeholder="https://pipedproxy.example.com"
                    value={editInstanceProxy()}
                    onInput={setEditInstanceProxy}
                  />
                  <div class="flex items-center gap-10 w-full mt-4">
                    <Button
                      isDisabled={
                        editInstanceName() === instance.name &&
                        editInstanceUrl() === instance.api_url &&
                        editInstanceProxy() === instance.image_proxy_url
                      }
                      label="Save"
                      onClick={() => {
                        // const currentInstanceIndex =
                        //   preferences.customInstances.findIndex((i) => {
                        //     i.api_url === instance.api_url;
                        //   });
                        // if (!currentInstanceIndex) return;
                        // let customInstances = preferences.customInstances;
                        // customInstances.splice(currentInstanceIndex, 1);
                        // customInstances.push({
                        //   name: editInstanceName(),
                        //   api_url: editInstanceUrl(),
                        //   image_proxy_url: editInstanceProxy(),
                        // });
                        setPreferences("customInstances", (prev) =>
                          prev.map((v, i) =>
                            i === index()
                              ? {
                                  name: editInstanceName(),
                                  api_url: editInstanceUrl(),
                                  image_proxy_url: editInstanceProxy(),
                                }
                              : v
                          )
                        );
                      }}
                    />
                    <Show
                      when={
                        editInstanceName() !== instance.name ||
                        editInstanceUrl() !== instance.api_url ||
                        editInstanceProxy() !== instance.image_proxy_url
                      }
                    >
                      <Button
                        label="Cancel"
                        appearance="danger"
                        onClick={() => {
                          setInstanceToEdit("");
                        }}
                      />
                    </Show>
                  </div>
                </form>
              </Show>
            </div>
          </div>
        )}
      </For>
      <button
        class="w-full outline-none focus-visible:ring-4 focus-visible:ring-primary hover:bg-bg2 rounded"
        onClick={() => setCustomInstanceModalOpen(true)}
      >
        <PreferencesCard
          title="Add Custom Instance"
          icon={<FaSolidPlus class="w-5 h-5" />}
        />
      </button>
      <Modal
        title="Custom Instance"
        isOpen={customInstanceModalOpen()}
        setIsOpen={setCustomInstanceModalOpen}
      >
        <form
          ref={addInstanceForm!}
          class="flex flex-col gap-2 my-2 p-4 w-[clamp(200px,80vw,25rem)]"
        >
          <Field
            name="Name"
            required
            value={customInstanceName()}
            onInput={setCustomInstanceName}
            placeholder="My Custom Instance"
          />
          <Field
            name="API URL"
            required
            placeholder="https://pipedapi.example.com"
            value={customInstanceUrl()}
            onInput={setCustomInstanceUrl}
          />
          <Field
            name="Image Proxy URL"
            required
            placeholder="https://pipedproxy.example.com"
            value={customInstanceProxy()}
            onInput={setCustomInstanceProxy}
          />
          <div class="flex items-center justify-center gap-4 w-full mt-4 ">
            <Button
              isDisabled={
                !customInstanceName() ||
                !customInstanceUrl() ||
                !customInstanceProxy()
              }
              label="Add"
              onClick={() => {
                if (
                  !customInstanceName() ||
                  !customInstanceUrl() ||
                  !customInstanceProxy()
                )
                  return;
                setPreferences("customInstances", [
                  ...preferences.customInstances,
                  {
                    name: customInstanceName(),
                    api_url: customInstanceUrl(),
                    image_proxy_url: customInstanceProxy(),
                  },
                ]);
                addInstanceForm.reset();
                setCustomInstanceModalOpen(false);
              }}
            />
            <Button
              isDisabled={
                !customInstanceName() &&
                !customInstanceUrl() &&
                !customInstanceProxy()
              }
              appearance="danger"
              onClick={() => {
                addInstanceForm.reset();
              }}
              label="Clear"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
