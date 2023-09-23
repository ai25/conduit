import { createSignal } from "solid-js";
import Toggle from "~/components/Toggle";
import { useSyncStore } from "~/stores/syncStore";

export default function Import() {
  const [subscriptions, setSubscriptions] = createSignal<string[]>([]);
  const [override, setOverride] = createSignal(false);
  const selectedSubscriptions = () => subscriptions().length;
  const sync = useSyncStore();
  let fileSelector: HTMLInputElement | undefined = undefined;
  function fileChange() {
    console.log("fileChange", fileSelector?.files?.[0]?.name);
    if (!fileSelector?.files?.[0]) return;
    const file = fileSelector.files[0];
    file.text().then((text) => {
      setSubscriptions([]);

      // Invidious
      if (text.indexOf("opml") != -1) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        xmlDoc.querySelectorAll("outline[xmlUrl]").forEach((item) => {
          const url = item.getAttribute("xmlUrl");
          const id = url?.slice(-24);
          if (id) {
            setSubscriptions((subscriptions) => [...subscriptions, id]);
          }
        });
      }
      // NewPipe
      else if (text.indexOf("app_version") != -1) {
        console.log("NewPipe");
        const json = JSON.parse(text);
        json.subscriptions
          .filter((item: any) => item.service_id == 0)
          .forEach((item: any) => {
            const url = item.url;
            const id = url.slice(-24);
            setSubscriptions((subscriptions) => [...subscriptions, id]);
          });
      }
      // Invidious JSON
      else if (text.indexOf("thin_mode") != -1) {
        const json = JSON.parse(text);
        setSubscriptions(json.subscriptions);
      }
      // FreeTube DB
      else if (text.indexOf("allChannels") != -1) {
        const json = JSON.parse(text);
        json.subscriptions.forEach((item: any) => {
          setSubscriptions((subscriptions) => [...subscriptions, item.id]);
        });
      }
      // Google Takeout JSON
      else if (text.indexOf("contentDetails") != -1) {
        const json = JSON.parse(text);
        json.forEach((item: any) => {
          const id = item.snippet.resourceId.channelId;
          setSubscriptions((subscriptions) => [...subscriptions, id]);
        });
      }

      // Google Takeout CSV
      else if (
        file.name.length >= 5 &&
        file.name.slice(-4).toLowerCase() == ".csv"
      ) {
        const lines = text.split("\n");
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const id = line.slice(0, line.indexOf(","));
          if (id.length === 24)
            setSubscriptions((subscriptions) => [...subscriptions, id]);
        }
      }
    });
  }
  function handleImport() {
    const subs = override()
      ? [...new Set(subscriptions())]
      : ([
          ...new Set((getLocalSubscriptions() ?? []).concat(subscriptions())),
        ] as string[]);
    // Sort for better cache hits
    console.log("importSubscriptionsLocally", subs.sort());
    setSubscriptions(subs.sort());

    try {
      sync.setStore("subscriptions", subs);
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
          <div>
            <strong>
              Override:{" "}
              {/* <Toggle
                label="Override"
                checked={override()}
                onChange={() => setOverride(!override())}
              /> */}
            </strong>
          </div>
          <div>
            <button class="btn w-auto" onClick={handleImport}>
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
