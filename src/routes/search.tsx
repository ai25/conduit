import { useLocation } from "solid-start";
import VideoCard from "~/components/VideoCard";
import {
  For,
  Show,
  Switch,
  createEffect,
  createRenderEffect,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";
import { InstanceContext } from "~/root";
import { set, z } from "zod";
import { getStorageValue } from "~/utils/storage";
import {
  ContentItem,
  RelatedChannel,
  RelatedPlaylist,
  RelatedStream,
} from "~/types";
import { Match } from "solid-js";
import PlaylistCard from "~/components/PlaylistCard";
import { A } from "@solidjs/router";
import { Checkmark } from "~/components/Description";
import { assertType, fetchJson } from "~/utils/helpers";
import numeral from "numeral";
import Button from "~/components/Button";
import SubscribeButton from "~/components/SubscribeButton";
import { Spinner } from "~/components/PlayerContainer";
import Field from "~/components/Field";
import Select from "~/components/Select";
import { FaSolidMinus, FaSolidPlus, FaSolidX } from "solid-icons/fa";
import { RadioGroup } from "@kobalte/core";
import { Transition } from "solid-headless";
export interface SearchQuery {
  items: ContentItem[];
  nextpage: string;
  suggestion?: any;
  corrected?: boolean;
}
type FieldNames =
  | keyof RelatedStream
  | keyof RelatedChannel
  | keyof RelatedPlaylist;

type Condition =
  | { type: "INCLUDES" | "IS"; field: FieldNames; value: string }
  | {
      type: "LESS_THAN" | "GREATER_THAN";
      field: FieldNames;
      value: string;
    }
  | { type: "NOT_INCLUDES" | "IS_NOT"; field: FieldNames; value: string };

type LogicalOperator = "AND" | "OR";

type Filter = { conditions: Condition[]; operators: LogicalOperator[] };

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

const IncludesFilter = (props: {
  field: FieldNames;
  value: string;
  removeCondition: () => void;
  addCondition: (condition: Condition) => void;
  addOperator: (operator: LogicalOperator) => void;
  selectedOperator: LogicalOperator | undefined;
  selectOperator: (operator: LogicalOperator) => void;
}) => {
  const [showConditionEditor, setShowConditionEditor] = createSignal(false);
  const [visible, setVisible] = createSignal(false);
  createEffect(() => {
    setTimeout(() => {
      setVisible(true);
    }, 100);
  });
  return (
    <Transition
      enter="transition-all duration-300 ease-in-out transform"
      enterFrom="opacity-0 translate-y-2"
      enterTo="opacity-100 translate-y-0"
      leave="transition-all duration-300 ease-in-out transform"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-2"
      class="my-2"
      show={visible()}>
      <div>
        <div class="flex gap-2 items-center">
          <div>
            <span class="text-accent1">{String(props.field)}</span>{" "}
            <span class="font-bold">INCLUDES </span>
            <span class="text-primary">{props.value}</span>
          </div>
          <button onClick={() => props.removeCondition()}>
            <FaSolidX fill="currentColor" class="w-3 h-3" />
          </button>
        </div>
        <RadioGroup.Root
          value={props.selectedOperator}
          onChange={(value) => {
            setShowConditionEditor(true);
            props.selectOperator(value as LogicalOperator);
          }}
          class="radio-group">
          <div class="flex items-center gap-2">
            <For each={["AND", "OR"]}>
              {(operator) => (
                <RadioGroup.Item value={operator} class="flex items-center">
                  <RadioGroup.ItemInput class="radio__input" />
                  <RadioGroup.ItemControl class="flex items-center justify-center w-5 h-5 rounded-full border border-text2 data-[checked]:border-primary data-[checked]:bg-white">
                    <RadioGroup.ItemIndicator class="bg-primary" />
                  </RadioGroup.ItemControl>
                  <RadioGroup.ItemLabel class="radio__label">
                    {operator}
                  </RadioGroup.ItemLabel>
                </RadioGroup.Item>
              )}
            </For>
          </div>
        </RadioGroup.Root>

        <Transition
          enter="transition-all duration-300 ease-in-out transform"
          enterFrom="opacity-0 translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition-all duration-300 ease-in-out transform"
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
      </div>
    </Transition>
  );
};

const NotIncludesFilter = (props: {
  field: FieldNames;
  value: string;
  updateValue: (value: string) => void;
}) => (
  <div>
    <span>{String(props.field)} NOT INCLUDES </span>
    <Field
      type="text"
      value={props.value}
      onInput={(value) => props.updateValue(value)}
    />
  </div>
);

const LessThanFilter = (props: {
  field: FieldNames;
  value: string;
  updateValue: (value: string) => void;
}) => (
  <div>
    <span>{String(props.field)} LESS THAN </span>
    <Field
      type="number"
      value={props.value}
      onInput={(value) => props.updateValue(value)}
    />
  </div>
);

const GreaterThanFilter = (props: {
  field: FieldNames;
  value: string;
  updateValue: (value: string) => void;
}) => (
  <div>
    <span>{String(props.field)} GREATER THAN </span>
    <Field
      type="number"
      value={props.value}
      onInput={(value) => props.updateValue(value)}
    />
  </div>
);

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
const [filter, setFilter] = createSignal<Filter>({
  conditions: [],
  operators: [],
});

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
        options={["INCLUDES", "LESS_THAN", "NOT_INCLUDES"]}
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

const [filterErrors, setFilterErrors] = createSignal<string[]>([]);
const FilterEditor = (props: { filter: Filter }) => {
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
        enter="transition-all duration-1000 ease-in-out transform"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-all duration-1000 ease-in-out transform"
        leaveFrom="opacity-100 "
        leaveTo="opacity-0 "
        class="my-2"
        show={visible()}>
        <Switch>
          <Match when={condition.type === "INCLUDES"}>
            <IncludesFilter
              field={condition.field}
              value={condition.value as string}
              addCondition={addCondition}
              addOperator={addOperator}
              removeCondition={() => {
                removeCondition(index);
                removeOperator(index);
              }}
              selectedOperator={filter().operators[index]}
              selectOperator={(operator) => {
                if (filter().operators[index]) {
                  updateOperator(index, operator);
                } else {
                  addOperator(operator);
                }
              }}
            />
          </Match>
          <Match when={condition.type === "LESS_THAN"}>
            <LessThanFilter
              field={condition.field}
              value={condition.value}
              updateValue={(value) =>
                updateCondition(index, { ...condition, value })
              }
            />
          </Match>
          <Match when={condition.type === "NOT_INCLUDES"}>
            <NotIncludesFilter
              field={condition.field}
              value={condition.value as FieldNames}
              updateValue={(value) =>
                updateCondition(index, { ...condition, value })
              }
            />
          </Match>
        </Switch>
      </Transition>
    );
  };

  const addCondition = (condition: Condition) => {
    setFilter((prev) => ({
      conditions: [...prev.conditions, condition],
      operators: prev.operators,
    }));
  };

  const updateCondition = (index: number, newCondition: Condition) => {
    console.log(newCondition);
    const newConditions = [...filter().conditions];
    newConditions[index] = newCondition;
    setFilter((filter) => ({ ...filter, conditions: newConditions }));
  };

  const removeCondition = (index: number) => {
    const newConditions = [...filter().conditions];
    newConditions.splice(index, 1);
    setFilter((filter) => ({ ...filter, conditions: newConditions }));
  };

  const addOperator = (operator: LogicalOperator) => {
    setFilter((prev) => ({
      conditions: prev.conditions,
      operators: [...prev.operators, operator],
    }));
  };

  const updateOperator = (index: number, newOperator: LogicalOperator) => {
    const newOperators = [...filter().operators];
    newOperators[index] = newOperator;
    setFilter((filter) => ({ ...filter, operators: newOperators }));
  };

  const removeOperator = (index: number) => {
    const newOperators = [...filter().operators];
    newOperators.splice(index, 1);
    setFilter((filter) => ({ ...filter, operators: newOperators }));
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
const evaluateFilter = (
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
          console.log(condition.value, result, new RegExp(condition.value));
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

export default function Search() {
  const [results, setResults] = createSignal<SearchQuery>();
  const availableFilters = [
    "all",
    "videos",
    "channels",
    "playlists",
    "music_songs",
    "music_videos",
    "music_albums",
    "music_playlists",
  ];
  const route = useLocation();
  const selectedFilter = route.query.filter ?? "all";
  const [instance] = useContext(InstanceContext);
  const [loading, setLoading] = createSignal(true);
  onMount(() => {
    console.log(route);
    window.addEventListener("scroll", handleScroll);
    // if (this.handleRedirect()) return;
    updateResults();
    saveQueryToHistory();
  });
  onCleanup(() => {
    window.removeEventListener("scroll", handleScroll);
  });
  async function fetchResults() {
    return await (
      await fetch(
        `${instance().api_url}/search?q=${route.query.q}&filter=${
          route.query.filter ?? "all"
        }`
      )
    ).json();
  }
  async function updateResults() {
    setLoading(true);
    document.title = route.query.q + " - Conduit";
    const results = await fetchResults();
    console.log(results, "results");
    setResults(results);
    setLoading(false);
  }
  // function updateFilter() {
  //     this.$router.replace({
  //         query: {
  //             search_query: this.$route.query.search_query,
  //             filter: this.selectedFilter,
  //         },
  //     });
  // }
  async function fetchNextPage() {
    if (!results()?.nextpage) return;
    setLoading(true);
    const nextPage = await fetchJson(`${instance().api_url}/nextpage/search`, {
      nextpage: results()!.nextpage,
      q: route.query.q,
      filter: route.query.filter ?? "all",
    });
    console.log(nextPage, "nextPage");
    setResults((results) => ({
      ...results,
      items: [...results!.items, ...nextPage.items],
      nextpage: nextPage.nextpage,
    }));
    setLoading(false);
  }

  function saveQueryToHistory() {
    const query = route.query.q;
    if (!query) return;
    const searchHistory = getStorageValue(
      "search_history",
      [],
      "json",
      "localStorage"
    );
    if (searchHistory.includes(query)) {
      const index = searchHistory.indexOf(query);
      searchHistory.splice(index, 1);
    }
    searchHistory.unshift(query);
    if (searchHistory.length > 10) searchHistory.shift();
    localStorage.setItem("search_history", JSON.stringify(searchHistory));
  }

  const [intersectionRef, setIntersectionRef] = createSignal<
    HTMLDivElement | undefined
  >(undefined);
  function handleScroll(e: any) {
    const entry = e[0];
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }

  createEffect(() => {
    console.log(intersectionRef(), "intersection");
    if (!intersectionRef()) return;

    const intersectionObserver = new IntersectionObserver(handleScroll, {
      threshold: 0.1,
    });

    intersectionObserver.observe(intersectionRef()!);
  });
  return (
    <>
      <h1 class="text-center my-2" v-text="$route.query.search_query" />

      <label for="ddlSearchFilters">
        {/* <strong v-text="`${$t('actions.filter')}:`" /> */}
      </label>
      {/* <select id="ddlSearchFilters" v-model="selectedFilter" default="all" class="select w-auto" change="updateFilter()">
        <option v-for="filter in availableFilters" key="filter" value="filter" v-t="`search.${filter}`" />
    </select> */}

      <hr />
      <Show when={filterErrors().length > 0}>
        <div class="bg-red-300 p-2 rounded-md text-red-900 flex justify-between items-center">
          <span>{filterErrors()[filterErrors().length - 1]}</span>
          <span>x{filterErrors().length}</span>{" "}
        </div>
      </Show>

      <FilterEditor filter={filter()} />

      <Show when={results()?.corrected}>
        <div class="mt-2">
          <p class="">
            Did you mean{" "}
            <A
              href={`/search?q=${
                results()!.suggestion
              }&filter=${selectedFilter}`}
              class="link !text-accent1">
              {results()!.suggestion}
            </A>
            ?
          </p>
        </div>
      </Show>

      <div class="flex flex-wrap justify-center">
        <For
          each={results()?.items}
          fallback={
            <For each={Array(20).fill(0)}>
              {() => <VideoCard v={undefined} />}
            </For>
          }>
          {(item) => (
            <Show
              when={evaluateFilter(filter(), item, (e) =>
                setFilterErrors((errors) => [...errors, e.message])
              )}>
              <Switch>
                <Match
                  when={assertType<RelatedStream>(item, "type", "stream")}
                  keyed>
                  {(item) => <VideoCard v={item} />}
                </Match>
                <Match
                  when={assertType<RelatedChannel>(item, "type", "channel")}
                  keyed>
                  {(item) => (
                    <div class="mx-4 my-2 flex flex-col gap-2 items-start w-full lg:w-72 max-h-20 lg:max-h-full max-w-md">
                      <div class="flex items-center gap-2 w-full lg:flex-col lg:items-start">
                        <A href={item.url} class="group outline-none">
                          <div class="relative w-20 overflow-hidden rounded-full group-hover:ring-2 group-focus-visible:ring-2  ring-accent1 transition-all duration-200">
                            <img
                              class="w-full rounded-full group-hover:scale-105 group-focus-visible:scale-105"
                              src={item.thumbnail}
                              loading="lazy"
                            />
                          </div>
                        </A>
                        <div class="flex flex-col justify-center gap-1 min-w-0 w-full h-20 max-h-20 text-text2 text-xs self-end">
                          <div class="flex items-center gap-1">
                            <A class="link text-sm" href={item.url}>
                              <div class="flex gap-1">
                                <span>{item.name}</span>
                                <Show when={item.verified}>
                                  <Checkmark />
                                </Show>
                              </div>
                            </A>
                            <Show when={item.videos >= 0}>
                              <p>&#183; {item.videos} videos</p>
                            </Show>
                          </div>
                          <Show when={item.description}>
                            <p class="two-line-ellipsis ">{item.description}</p>
                          </Show>
                          <Show when={item.subscribers >= 0} fallback={<p></p>}>
                            <p>
                              {numeral(item.subscribers)
                                .format("0a")
                                .toUpperCase()}{" "}
                              subscribers
                            </p>
                          </Show>
                        </div>
                        <SubscribeButton id={item.url.split("/").pop()!} />
                      </div>
                    </div>
                  )}
                </Match>
                <Match
                  when={assertType<RelatedPlaylist>(item, "type", "playlist")}
                  keyed>
                  {(item) => <PlaylistCard item={item} />}
                </Match>
              </Switch>
            </Show>
          )}
        </For>

        <Show when={loading()}>
          <div class="w-full flex justify-center">
            <Spinner />
          </div>
        </Show>
        <div ref={(ref) => setIntersectionRef(ref)} class="w-full h-20 mt-2" />
      </div>
    </>
  );
}
