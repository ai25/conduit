export const Spinner = (props: { class?: string }) => (
  <svg
    classList={{
      "h-24 w-24 text-white duration-300 animate-spin": true,
      [props.class!]: !!props.class,
    }}
    fill="none"
    viewBox="0 0 120 120"
    aria-hidden="true"
  >
    <circle
      class="opacity-25"
      cx="60"
      cy="60"
      r="54"
      stroke="currentColor"
      stroke-width="8"
    />
    <circle
      class="opacity-75"
      cx="60"
      cy="60"
      r="54"
      stroke="currentColor"
      stroke-width="10"
      pathLength="100"
      style={{
        "stroke-dasharray": 50,
        "stroke-dashoffset": "50",
      }}
    />
  </svg>
);
