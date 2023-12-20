export function ChapterTitle(props: { hasChapters: boolean, title?: string }) {
return (
  <span class="inline-block flex-1 w-full overflow-hidden text-ellipsis whitespace-nowrap px-2 text-sm font-medium text-white">
    <span class="mr-2">•</span>
    <Show when={props.hasChapters}>
        <media-chapter-title />
    </Show>
    <Show when={!props.hasChapters}>
      <span>{props.title}</span>
    </Show>
  </span>
);
}
