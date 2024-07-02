import { createSignal } from "solid-js";
import Toggle from "~/components/Toggle";
import { useSyncStore } from "~/stores/syncStore";
import {
  processConduitSubscriptions,
  processFreeTubeDBSubscriptions,
  processFreeTubeJSONSubscriptions,
  processGoogleTakeoutCSVSubscriptions,
  processGoogleTakeoutJSONSubscriptions,
  processInvidiousJSONSubscriptions,
  processInvidiousOPMLSubscriptions,
  processLibreTubeSubscriptions,
  processNewPipeSubscriptions,
} from "~/utils/import-helpers";

export default function Import() {
  const [subscriptions, setSubscriptions] = createSignal<
    Record<string, { subscribedAt: number }>
  >({});
  const [override, setOverride] = createSignal(false);
  const selectedSubscriptions = () => Object.keys(subscriptions()).length;
  const sync = useSyncStore();
  sync.store.subscriptions;
  let fileSelector: HTMLInputElement | undefined = undefined;
  function fileChange() {
    console.log("fileChange", fileSelector?.files?.[0]?.name);
    if (!fileSelector?.files?.[0]) return;
    const file = fileSelector.files[0];
    file.text().then((text) => {
      let processedSubscriptions =
        processConduitSubscriptions(text) ||
        processInvidiousOPMLSubscriptions(text) ||
        processLibreTubeSubscriptions(text) ||
        processNewPipeSubscriptions(text) ||
        processInvidiousJSONSubscriptions(text) ||
        processFreeTubeDBSubscriptions(text) ||
        processFreeTubeJSONSubscriptions(text) ||
        processGoogleTakeoutJSONSubscriptions(text) ||
        processGoogleTakeoutCSVSubscriptions(text, file.name);

      if (processedSubscriptions) {
        setSubscriptions(processedSubscriptions);
      } else {
        alert("Unsupported file format for subscriptions");
      }
    });
  }
  function handleImport() {
    if (override()) {
      Object.keys(sync.store.subscriptions).forEach((id) => {
        sync.setStore("subscriptions", id, undefined!);
      });
    }

    console.log("subs", subscriptions(), getLocalSubscriptions());

    try {
      sync.setStore("subscriptions", subscriptions());
    } catch (e) {
      alert("Error saving subscriptions");
    }
  }
  function getLocalSubscriptions() {
    try {
      return sync.store.subscriptions;
    } catch {
      return [];
    }
  }
  return (
    <>
      <div class="text-center">
        <form>
          <div>
            <input ref={fileSelector} type="file" onInput={fileChange} />
          </div>
          <div>
            <strong>
              {`Selected Subscriptions: ${selectedSubscriptions()}`}{" "}
            </strong>
          </div>
          <div class="flex items-center justify-center my-2 gap-2">
            Override{" "}
            <Toggle
              label="Override"
              checked={override()}
              onChange={() => setOverride(!override())}
            />
          </div>
          <div>
            <button class="btn w-auto" onClick={() => handleImport()}>
              Import
            </button>
          </div>
        </form>
        <br />
        <strong>Importing Subscriptions from YouTube</strong>
        <br />
        <div>
          Open
          <a href="https://takeout.google.com/takeout/custom/youtube">
            takeout.google.com/takeout/custom/youtube
          </a>
          <br />
          In "Select data to include", click on "All YouTube data included" and
          select only "subscriptions".
          <br />
          Create the export and download the zip file.
          <br />
          Extract subscriptions.csv from the zip file.
          <br />
          Select and import the file above.
        </div>
        <br />
        <strong>Importing Subscriptions from Invidious</strong>
        <br />
        <div>
          Open
          <a href="https://invidio.us/data_control">invidiou.us/data_control</a>
          <br />
          Click on any of the export options.
          <br />
          Select and import the file above.
        </div>
        <br />
        <strong>Importing Subscriptions from NewPipe</strong>
        <br />
        <div>
          Go to the Feed tab.
          <br />
          Click on the arrow on where it says "Subscriptions".
          <br />
          Save the file somewhere.
          <br />
          Select and import the file above.
        </div>
      </div>
    </>
  );
}
