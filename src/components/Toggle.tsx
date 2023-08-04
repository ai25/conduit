
export default function Toggle({ label, onChange, checked }:{ label: string; onChange: () => void, checked: boolean }) {
  return (
    <label for={label} class="flex cursor-pointer items-center ">
      <div class="relative ">
        <input checked={checked} onChange={onChange} type="checkbox" id={label} class="peer sr-only" />
        <div class="peer-checked:ring-bg2 block h-8 w-14 rounded-full bg-bg1 ring-2 ring-bg2 focus:ring-4 focus:ring-primary peer-checked:bg-primary"></div>
        <div class="absolute left-1 top-1 h-6 w-6 rounded-full bg-bg2 shadow shadow-black/50 transition duration-200 peer-checked:translate-x-full peer-checked:bg-accent1"></div>
      </div>
    </label>
  );
};
