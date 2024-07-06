import { useSyncStore } from "~/stores/syncStore";
import Modal from "../Modal";
import { ConduitPlaylist, RelatedStream } from "~/types";
import { Match, Switch, createSignal } from "solid-js";
import Select from "../Select";
import Button from "../Button";
import { toast } from "../Toast";
import { createPlaylist } from "~/utils/helpers";

const AddToPlaylistModal = (props: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  v: RelatedStream;
}) => {
  const sync = useSyncStore();
  const [list, setList] = createSignal({
    value: "",
    label: "",
    disabled: false,
  });
  return (
    <Modal
      isOpen={props.isOpen}
      setIsOpen={props.setIsOpen}
      title="Add to playlist"
    >
      <div class="flex flex-col gap-4">
        <Switch>
          <Match when={Object.keys(sync.store.playlists).length === 0}>
            <div class="flex items-center gap-2">
              <div class="text-text1">You don't have any playlists yet.</div>
            </div>
          </Match>
          <Match when={Object.keys(sync.store.playlists).length > 0}>
            <div class="text-text1">
              Select a playlist to add this video to:
            </div>
            <div class=" w-full flex justify-center items-center mb-2">
              <Select
                options={Object.entries(sync.store.playlists).map(
                  ([id, playlist]) => ({
                    value: id,
                    label: playlist.name,
                    disabled: playlist.relatedStreams?.some(
                      (v) => v.url === props.v.url
                    ),
                  })
                )}
                value={list()}
                onChange={setList}
                placeholder="Select a playlist..."
              />
            </div>
          </Match>
        </Switch>
      </div>
      <div class="flex items-center justify-center gap-4 my-2">
        <Button
          appearance="subtle"
          label="Create a playlist"
          onClick={() => createPlaylist(sync.setStore)}
        />
        <Button
          onClick={() => {
            console.log(
              props.v,
              list(),
              sync.store.playlists[list().value]?.relatedStreams
            );
            try {
              const playlist = sync.store.playlists[list().value];
              const order = playlist?.relatedStreams.length || 0;
              sync.setStore("playlists", list().value, "relatedStreams", [
                ...playlist.relatedStreams,
                {
                  url: props.v.url,
                  title: props.v.title,
                  type: props.v.type,
                  duration: props.v.duration,
                  thumbnail: props.v.thumbnail,
                  uploaderName: props.v.uploaderName,
                  uploaderUrl: props.v.uploaderUrl,
                  uploaderAvatar: props.v.uploaderAvatar,
                  views: props.v.views,
                  uploaded: props.v.uploaded,
                  uploaderVerified: props.v.uploaderVerified,
                  shortDescription: "",
                  uploadedDate: props.v.uploadedDate,
                  isShort: props.v.isShort,
                  order,
                  timeAdded: Date.now(),
                },
              ]);
              toast.success(
                `Added "${props.v.title.length > 20 ? props.v.title.slice(0, 20) + "..." : props.v.title}" to playlist "${playlist.name}".`
              );
              props.setIsOpen(false);
            } catch (e) {
              toast.error("Failed to add to playlist. " + (e as any).message);
              console.error(e);
            }
          }}
          label="Add"
          isDisabled={!list()?.value}
          appearance="primary"
        />
      </div>
    </Modal>
  );
};

export default AddToPlaylistModal;
