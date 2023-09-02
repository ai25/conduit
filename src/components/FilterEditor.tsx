import { RelatedChannel, RelatedPlaylist, RelatedStream } from "~/types";
import { RadioGroup } from "@kobalte/core";
import { For, Show, createEffect, createSignal } from "solid-js";
import { FaSolidX } from "solid-icons/fa";
import { Transition } from "solid-headless";
import Select from "./Select";
import Field from "./Field";

type FieldNames =
  | keyof RelatedStream
  | keyof RelatedChannel
  | keyof RelatedPlaylist;

type Condition = {
  type:
    | "INCLUDES"
    | "IS"
    | "LESS_THAN"
    | "GREATER_THAN"
    | "NOT_INCLUDES"
    | "IS_NOT";
  field: FieldNames;
  value: string;
};

type LogicalOperator = "AND" | "OR";

export type Filter = { conditions: Condition[]; operators: LogicalOperator[] };

const contentItemKeys = [
  "description",
  "duration",
  "name",
  "subscribers",
  "thumbnail",
  "type",
  "url",
  "verified",
  "videos",
  "views",
  "uploaderVerified",
  "uploaderUrl",
  "uploaderName",
  "uploaded",
  "title",
  "isShort",
  "playlistType",
  "shortDescription",
  "uploadedDate",
];

const RadioGroupItem = (props: {
  value: string | undefined;
  onChange: (value: string) => void;
  options: string[];
}) => (
  <RadioGroup.Root value={props.value} onChange={props.onChange} class="">
    <div class="flex items-center gap-2">
      <For each={props.options}>
        {(operator) => (
          <RadioGroup.Item value={operator} class="flex items-center gap-1 rounded  focus-within:ring-2 focus-within:ring-primary">
            <RadioGroup.ItemInput class="flex items-center gap-1" />
            <RadioGroup.ItemControl class="flex items-center justify-center w-5 h-5 rounded-full  border border-text2 data-[checked]:border-primary data-[checked]:bg-white focus-visible:border-spacing-1 focus-visible:border-primary">
              <RadioGroup.ItemIndicator class="w-2.5 h-2.5 rounded-full bg-primary" />
            </RadioGroup.ItemControl>
            <RadioGroup.ItemLabel class="">{operator}</RadioGroup.ItemLabel>
          </RadioGroup.Item>
        )}
      </For>
    </div>
  </RadioGroup.Root>
);
const FieldText = (props: { field: FieldNames }) => (
  <span class="bg-accent1 text-text3 rounded px-2 ">{String(props.field)}</span>
);
const ValueText = (props: { value: string }) => (
  <span class="bg-primary text-text3 rounded px-2 ">{props.value}</span>
);
const RemoveButton = (props: { onClick: () => void }) => (
  <button onClick={props.onClick}>
    <FaSolidX fill="currentColor" class="w-3 h-3" />
  </button>
);
const Filter = (props: {
  operatorText: string;
  field: FieldNames;
  value: string;
  removeCondition: () => void;
  addCondition: (condition: Condition) => void;
  addOperator: (operator: LogicalOperator) => void;
  selectedOperator: LogicalOperator | undefined;
  selectOperator: (operator: LogicalOperator) => void;
}) => {
  const [showConditionEditor, setShowConditionEditor] = createSignal(false);
  return (
    <>
      <div class="flex gap-2 items-center mb-2">
        <div class="flex items-center gap-1">
          <FieldText field={props.field} />
          <span class="font-bold">{props.operatorText}</span>
          <ValueText value={props.value} />
        </div>
        <RemoveButton onClick={() => props.removeCondition()} />
      </div>
      <RadioGroupItem
        value={props.selectedOperator}
        onChange={(value) => {
          setShowConditionEditor(true);
          props.selectOperator(value as LogicalOperator);
        }}
        options={["AND", "OR"]}
      />
      <Transition
        enter="transition duration-300 ease-in-out transform"
        enterFrom="opacity-0 translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition duration-300 ease-in-out transform"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-2"
        class="my-2"
        show={showConditionEditor()}>
        <ConditionEditor
          addCondition={(condition) => {
            setShowConditionEditor(false);
            props.addCondition(condition);
          }}
        />
      </Transition>
    </>
  );
};

const LogicalOperator = (props: {
  operator: LogicalOperator;
  updateOperator: (operator: LogicalOperator) => void;
}) => (
  <Select
    options={["AND", "OR"]}
    onChange={(value) => {
      console.log(value);
      props.updateOperator(value as LogicalOperator);
    }}
    value={props.operator}
  />
);

const ConditionEditor = (props: {
  addCondition: (condition: Condition) => void;
}) => {
  const [currentValue, setCurrentValue] = createSignal("");
  const [currentField, setCurrentField] = createSignal<FieldNames>("title");
  const [currentOperator, setCurrentOperator] =
    createSignal<Condition["type"]>("INCLUDES");

  return (
    <div class="flex gap-2 items-center">
      <Select
        value={currentField()}
        options={contentItemKeys}
        onChange={(value) => setCurrentField(value as FieldNames)}
      />

      <Select
        value={currentOperator()}
        onChange={(e) => setCurrentOperator(e as Condition["type"])}
        options={[
          "INCLUDES",
          "NOT_INCLUDES",
          "LESS_THAN",
          "GREATER_THAN",
          "IS",
          "IS_NOT",
        ]}
      />

      <Field
        placeholder="String or Regex"
        type="text"
        value={currentValue()}
        validationState={
          Number.isNaN(parseInt(currentValue())) ? "invalid" : "valid"
        }
        onInput={(value) => setCurrentValue(value)}
      />

      <button
        onClick={() => {
          props.addCondition({
            type: currentOperator(),
            field: currentField(),
            value: currentValue(),
          });
        }}>
        Add Condition
      </button>
    </div>
  );
};

const FilterEditor = (props: {
  filter: Filter;
  setFilter: (
    value: (prev: Filter) => {
      conditions: Condition[];
      operators: LogicalOperator[];
    }
  ) => {
    conditions: Condition[];
    operators: LogicalOperator[];
  };
}) => {
  const renderConditionComponent = (condition: Condition, index: number) => {
    const [visible, setVisible] = createSignal(false);
    let timeout: any;
    createEffect(() => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setVisible(true);
      }, 100);
    });

    return (
      <Transition
        enter="transition-all duration-300 ease-in-out transform"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-all duration-300 ease-in-out transform"
        leaveFrom="opacity-100 "
        leaveTo="opacity-0 "
        class="my-2"
        show={visible()}>
        <Filter
          operatorText={condition.type}
          field={condition.field}
          value={condition.value as string}
          addCondition={addCondition}
          addOperator={addOperator}
          removeCondition={() => {
            removeCondition(index);
            removeOperator(index);
          }}
          selectedOperator={props.filter.operators[index]}
          selectOperator={(operator) => {
            if (props.filter.operators[index]) {
              updateOperator(index, operator);
            } else {
              addOperator(operator);
            }
          }}
        />
      </Transition>
    );
  };

  const addCondition = (condition: Condition) => {
    props.setFilter((prev) => ({
      conditions: [...prev.conditions, condition],
      operators: prev.operators,
    }));
  };

  const removeCondition = (index: number) => {
    const newConditions = [...props.filter.conditions];
    newConditions.splice(index, 1);
    props.setFilter((filter) => ({ ...filter, conditions: newConditions }));
  };

  const addOperator = (operator: LogicalOperator) => {
    props.setFilter((prev) => ({
      conditions: prev.conditions,
      operators: [...prev.operators, operator],
    }));
  };

  const updateOperator = (index: number, newOperator: LogicalOperator) => {
    const newOperators = [...props.filter.operators];
    newOperators[index] = newOperator;
    props.setFilter((filter) => ({ ...filter, operators: newOperators }));
  };

  const removeOperator = (index: number) => {
    const newOperators = [...props.filter.operators];
    newOperators.splice(index, 1);
    props.setFilter((filter) => ({ ...filter, operators: newOperators }));
  };

  return (
    <div class="h-full w-full ">
      <Show when={props.filter.conditions.length === 0}>
        <ConditionEditor addCondition={addCondition} />
      </Show>
      <For each={props.filter.conditions}>
        {(condition, index) => {
          return renderConditionComponent(condition, index());
        }}
      </For>
    </div>
  );
};
export const evaluateFilter = (
  filter: Filter,
  video: Record<FieldNames, string | number>,
  onError: (error: unknown) => void = console.error
): boolean => {
  if (filter.conditions.length === 0) return true;
  let conditionResults: boolean[] = [];
  try {
    for (let condition of filter.conditions) {
      let result = false;
      switch (condition.type) {
        case "INCLUDES":
          result = new RegExp(condition.value).test(
            video[condition.field]?.toString().toLowerCase().trim()
          );
          break;
        case "NOT_INCLUDES":
          result = !new RegExp(condition.value).test(
            video[condition.field]?.toString().toLowerCase().trim()
          );
          break;
        case "LESS_THAN":
          const value = parseInt(condition.value);
          const field = parseInt(video[condition.field]?.toString());
          result = isNaN(value) || isNaN(field) ? false : field < value;
          break;
        case "GREATER_THAN":
          const valueGT = parseInt(condition.value);
          const fieldGT = parseInt(video[condition.field]?.toString());
          result = isNaN(valueGT) || isNaN(fieldGT) ? false : fieldGT > valueGT;
          break;
        case "IS":
          result = new RegExp(condition.value).test(
            video[condition.field]?.toString()
          );
          break;
        case "IS_NOT":
          result = !new RegExp(condition.value).test(
            video[condition.field]?.toString()
          );
      }
      conditionResults.push(result);
    }

    let finalResult = conditionResults[0];
    for (let i = 0; i < filter.operators.length; i++) {
      let operator = filter.operators[i];
      let nextCondition = conditionResults[i + 1];
      if (operator === "AND") {
        if (nextCondition === undefined) break;
        finalResult = finalResult && nextCondition;
      } else if (operator === "OR") {
        finalResult = finalResult || nextCondition;
      }
    }

    return finalResult;
  } catch (error) {
    onError(error);
    return false;
  }
};

export default FilterEditor;
