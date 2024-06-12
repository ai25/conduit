import { JSX } from "solid-js";

export default function PreferencesCard(props: {
  title: string;
  description?: string;
  icon?: JSX.Element;
}) {
  return (
    <div class="flex items-center text-start gap-2 md:px-4 py-2">
      <div class="flex items-center justify-center w-10 h-10 aspect-square rounded-full text-primary">
        {props.icon}
      </div>
      <div class="flex flex-col gap-1 min-w-0">
        <div class="text-text1 font-semibold">{props.title}</div>
        <div class="text-text2 text-xs max-w-fit">{props.description}</div>
      </div>
    </div>
  );
}
