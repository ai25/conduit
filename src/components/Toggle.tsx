export default function Toggle(props: {
  label: string;
  onChange: (checked: boolean) => void;
  checked: boolean;
  disabled?: boolean;
}) {
  return (
    <label for={props.label} class="flex cursor-pointer items-center ">
      <div class="relative [&:has(:focus-visible)]:ring-4 rounded-full ring-primary [&:has([disabled])]:cursor-not-allowed">
        <input
          disabled={props.disabled}
          checked={props.checked}
          onChange={(e) => {
            props.onChange(e.target.checked);
          }}
          type="checkbox"
          id={props.label}
          class="peer sr-only"
        />
        <div class="peer-checked:ring-bg2 peer-disabled:bg-bg3/50 block h-7 w-12 rounded-full bg-bg1 ring-2 ring-bg3 focus:ring-4 focus-visible:ring-primary peer-checked:bg-primary peer-checked:peer-disabled:bg-primary/50" />
        <div class="absolute left-[4px] top-[4px] h-5 w-5 rounded-full bg-bg3 shadow shadow-black/50 transition duration-200 peer-checked:translate-x-full peer-checked:bg-text1 peer-checked:peer-disabled:bg-text2" />
      </div>
    </label>
  );
}
