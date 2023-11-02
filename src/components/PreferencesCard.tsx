import { JSX } from "solid-js";

export default function PreferencesCard(props:{
  title: string;
  description?: string;
  icon: JSX.Element;
  onClick: () => void;
}) {
  return (
      <button class="flex items-center text-start gap-2 cursor-pointer hover:bg-bg3/80 px-4 py-2 rounded 
      focus-visible:ring-4 focus-visible:ring-primary focus-visible:outline-none
        "
      onClick={props.onClick}>
        <div class="flex items-center justify-center w-10 h-10 aspect-square rounded-full bg-bg3/80">
          {props.icon}
        </div>
        <div class="flex flex-col gap-1">
          <div class="text-text1 font-semibold">{props.title}</div>
          <div class="text-text2 max-w-fit truncate">{props.description}</div>
        </div>
      </button>
  );
}

