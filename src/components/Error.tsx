import { FaSolidCircleExclamation } from "solid-icons/fa";

export const ErrorComponent = (props: { error: any }) => {
  return (
    <>
      <div class="flex items-center justify-center flex-col gap-2 p-4 max-w-full">
        <FaSolidCircleExclamation
          fill="currentColor"
          class="text-4xl text-red-600"
        />
        <pre class="max-h-96 overflow-auto max-w-full scrollbar">
          {JSON.stringify(props.error, undefined, 2)}
        </pre>
      </div>
    </>
  );
};
