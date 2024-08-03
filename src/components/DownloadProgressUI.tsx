import { For, Show, createEffect, createSignal } from "solid-js";
import Collapsible from "./Collapsible";
import { useAppState } from "~/stores/appStateStore";

const DownloadProgressUI = () => {
  const [overallProgress, setOverallProgress] = createSignal(0);
  const [stages, setStages] = createSignal<string[]>([]);
  const [appState] = useAppState();

  createEffect(() => {
    if (!appState.downloadProgress) return;
    const newOverallProgress =
      (appState.downloadProgress.stageIndex /
        appState.downloadProgress.totalStages) *
      100;
    setOverallProgress(newOverallProgress);
    if (!stages().includes(appState.downloadProgress.stage)) {
      setStages([...stages(), appState.downloadProgress.stage]);
    }
  });

  return (
    <Show when={appState.downloadProgress}>
      <div class="w-full">
        <Collapsible
          triggerClass="mb-4 rounded-lg py-4 bg-bg2"
          trigger={
            <>
              <div class="w-full ">
                <div class="overflow-hidden h-2 text-xs flex rounded-full bg-text2">
                  <div
                    class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                    style={{ width: `${overallProgress()}%` }}
                  />
                </div>
                <div class="flex flex-col justify-between mt-2">
                  <div class="font-semibold text-primary flex gap-2">
                    <div>
                      {appState.downloadProgress?.stageIndex} /{" "}
                      {appState.downloadProgress?.totalStages}
                    </div>
                    ({Math.round(overallProgress())}%)
                  </div>
                  <div class="text-sm font-medium text-text2 flex gap-2">
                    <div>{appState.downloadProgress?.stage}</div>
                    <div>
                      {Math.round(appState.downloadProgress?.progress || 0)}%
                    </div>
                  </div>
                </div>
              </div>
            </>
          }
        >
          <div>
            <ul class="space-y-3">
              <For each={stages()}>
                {(stage, index) => (
                  <li class="flex items-center bg-bg2 p-3 rounded-lg">
                    <div
                      class={`w-8 h-8 flex items-center justify-center rounded-full mr-4 ${
                        index() < appState.downloadProgress!.stageIndex - 1
                          ? "bg-green-500 text-white"
                          : "bg-primary text-text1"
                      }`}
                    >
                      {index() < appState.downloadProgress!.stageIndex - 1 ? (
                        <svg
                          class="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      ) : (
                        index() + 1
                      )}
                    </div>
                    <span class="text-sm">{stage}</span>
                    {index() === appState.downloadProgress!.stageIndex - 1 &&
                      appState.downloadProgress!.progress < 100 && (
                        <span class="ml-auto text-sm font-medium text-primary">
                          {Math.round(appState.downloadProgress!.progress)}%
                        </span>
                      )}
                  </li>
                )}
              </For>
            </ul>
          </div>
        </Collapsible>
      </div>
    </Show>
  );
};
export default DownloadProgressUI;
