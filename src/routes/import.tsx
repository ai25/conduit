import { createSignal } from "solid-js";
import Toggle from "~/components/Toggle";
import { useSyncStore } from "~/stores/syncStore";

export default function Import() {
  const [subscriptions, setSubscriptions] = createSignal<Record<string, {subscribedAt:number}>>({});
  const [override, setOverride] = createSignal(false);
  const selectedSubscriptions = () => Object.keys(subscriptions()).length;
  const sync = useSyncStore();
  sync.store.subscriptions
  let fileSelector: HTMLInputElement | undefined = undefined;
  function fileChange() {
    console.log("fileChange", fileSelector?.files?.[0]?.name);
    if (!fileSelector?.files?.[0]) return;
    const file = fileSelector.files[0];
    file.text().then((text) => {

      // Conduit
      if (text.includes("Conduit")) {
        console.log("Conduit");
        const json = JSON.parse(text);
        console.log(json);
        setSubscriptions(json.subscriptions);
        if (json.playlists) {
          json.playlists.forEach((playlist: any) => {
            sync.setStore("playlists", playlist.id, playlist);
            sync.setStore("playlists", playlist.id, "relatedStreams", playlist.relatedStreams);
          });
        }
      }
      // Invidious
      else if (text.indexOf("opml") != -1) {
        console.log("Invidious");
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        xmlDoc.querySelectorAll("outline[xmlUrl]").forEach((item) => {
          const url = item.getAttribute("xmlUrl");
          const id = url?.slice(-24);
          if (id) {
            setSubscriptions((subs)=>({...subs, [id]: {subscribedAt: Date.now()}}));
          }
        });
      }
      //LibreTube
      else if (text.indexOf("localSubscriptions") != -1) {
        console.log("LibreTube");
        const json = JSON.parse(text);
        json.localSubscriptions.forEach((item: any) => {
          setSubscriptions((subs)=>({...subs, [item.channelId]: {subscribedAt: Date.now()}}));
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
            setSubscriptions((subs)=>({...subs, [id]: {subscribedAt: Date.now()}}));
          });
      }
      // Invidious JSON
      else if (text.indexOf("thin_mode") != -1) {
        console.log("Invidious JSON");
        const json = JSON.parse(text);
        json.subscriptions.forEach((id: string) => {
          setSubscriptions((subs) => ({...subs, [id]: {subscribedAt: Date.now()}}));
        });
      }
      // FreeTube DB
      else if (text.indexOf("allChannels") != -1) {
        console.log("FreeTube DB");
        const json = JSON.parse(text);
        json.subscriptions.forEach((item: any) => {
          setSubscriptions((subs) => ({...subs, [item.id]: {subscribedAt: Date.now()}}));
        });
      }
      //FreeTube JSON
      else if (text.indexOf("subscriptions") != -1) {
        console.log("FreeTube JSON");
        const json = JSON.parse(text);
        json.subscriptions.forEach((item: any) => {
          setSubscriptions((subs) => ({...subs, [item.id]: {subscribedAt: Date.now()}}));
        });
      }
      // Google Takeout JSON
      else if (text.indexOf("contentDetails") != -1) {
        console.log("Google Takeout JSON");
        const json = JSON.parse(text);
        json.forEach((item: any) => {
          const id = item.snippet.resourceId.channelId;
          setSubscriptions((subs) => ({...subs, [id]: {subscribedAt: Date.now()}}));
        });
      }

      // Google Takeout CSV
      else if (
        file.name.length >= 5 &&
        file.name.slice(-4).toLowerCase() == ".csv"
      ) {
        console.log("Google Takeout CSV");
        const lines = text.split("\n");
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const id = line.slice(0, line.indexOf(","));
          if (id.length === 24)
            setSubscriptions((subs) => ({...subs, [id]: {subscribedAt: Date.now()}}));
        }
      }
    });
  }
  function handleImport(e: Event) {
    e.preventDefault();
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
          <div class="flex items-center justify-center my-2 gap-2" >
              Override{" "}
               <Toggle
                label="Override"
                checked={override()}
                onChange={() => setOverride(!override())}
              /> 
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
