import { JSX } from "solid-js";
import { TextField } from "@kobalte/core";
import { z } from "zod";
interface FieldProps {
  name?: string;
  type?: JSX.HTMLAttributes<HTMLInputElement>["itemType"];
  value?: string;
  onInput?: (value: string) => void;
  class?: string;
  placeholder?: string;
  validationState?: "valid" | "invalid" | undefined;
  errorMessage?: string;
  readOnly?: boolean;
  onClick?: () => void;
  ref?: any;
}
export default function Field(props: FieldProps) {
  return (
    <TextField.Root
      value={props.value}
      onChange={props.onInput}
      validationState={props.validationState}
      readOnly={props.readOnly}
    >
      <TextField.Label class="text-text2 text-sm">{props.name}</TextField.Label>
      <TextField.Input
        ref={props.ref}
        onClick={props.onClick}
        type={props.type}
        placeholder={props.placeholder}
        class={`bg-bg2 text-text1 outline-none focus-visible:ring-2 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 disabled:bg-bg2 disabled:cursor-not-allowed; ${props.class}`}
      />
      <TextField.ErrorMessage class="text-red-500 text-sm">
        {props.errorMessage}
      </TextField.ErrorMessage>
    </TextField.Root>
  );
}
