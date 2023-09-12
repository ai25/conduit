import { FaSolidBoxOpen } from "solid-icons/fa";

export default function EmptyState() {
    return (

      <div class="flex items-center justify-center flex-col gap-2 p-4">
        <FaSolidBoxOpen
          fill="currentColor"
          class="text-4xl text-text2"
        />
        <p class="text-text2">Nothing to see here...</p>
      </div>
    )
}