import { JSX } from "solid-js";
export default function Field(props: {
  name: string;
  type: JSX.HTMLAttributes<HTMLInputElement>["itemType"]
  value: string;
  onInput: (e: InputEvent) => void;
  class?: string;
  placeholder?: string;
}) {
  return (
    <input
      placeholder={props.placeholder}

  
      class={`bg-bg2 text-text1 outline-none focus-visible:ring-2 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 disabled:bg-bg2 disabled:cursor-not-allowed; ${props.class}`}
      type={props.type}
      name={props.name}
      value={props.value}
      onInput={props.onInput}
    />
  );
}
