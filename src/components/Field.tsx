import { JSX, Switch } from "solid-js";
import { NumberField, TextField } from "@kobalte/core";
import { z } from "zod";
import { Match } from "solid-js";
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
  required?: boolean;
  min?: number;
  max?: number;
}
export default function Field(props: FieldProps) {
  return (
    <Switch>
      <Match when={props.type === "number"}>
        <NumberField.Root
          value={props.value}
          onChange={props.onInput}
          validationState={props.validationState}
          readOnly={props.readOnly}
          required={props.required}
          minValue={props.min}
          maxValue={props.max}
        >
          <NumberField.Label>{props.name}</NumberField.Label>
          <div>
            <NumberField.DecrementTrigger class="rounded-full outline-none text-text1 ring-bg3 ring-2 p-1 px-2">
              -
            </NumberField.DecrementTrigger>
            <NumberField.Input
              style={{
                width: `${(props.value?.length ?? 0) * 9 + 20}px`,
              }}
              class={`w-min min-w-0 bg-bg2 text-text1 outline-none focus-visible:ring-2 text-sm rounded-lg focus:ring-primary focus:border-primary p-2.5 mx-2 disabled:bg-bg2 disabled:cursor-not-allowed; ${props.class}`}
              ref={props.ref}
              onClick={props.onClick}
              placeholder={props.placeholder}
            />
            <NumberField.IncrementTrigger class="rounded-full outline-none text-text1 ring-bg3 ring-2 p-1 px-2">
              +
            </NumberField.IncrementTrigger>
          </div>
        </NumberField.Root>
      </Match>
      <Match when={props.type !== "number"}>
        <TextField.Root
          value={props.value}
          onChange={props.onInput}
          validationState={props.validationState}
          readOnly={props.readOnly}
          required={props.required}
        >
          <TextField.Label class="text-text2 text-sm">
            {props.name}
          </TextField.Label>
          <TextField.Input
            ref={props.ref}
            onClick={props.onClick}
            type={props.type}
            placeholder={props.placeholder}
            class={`w-full bg-bg2 text-text1 outline-none focus-visible:ring-2 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 disabled:bg-bg2 disabled:cursor-not-allowed; ${props.class}`}
          />
          <TextField.ErrorMessage class="text-red-500 text-sm">
            {props.errorMessage}
          </TextField.ErrorMessage>
        </TextField.Root>
      </Match>
    </Switch>
  );
}
