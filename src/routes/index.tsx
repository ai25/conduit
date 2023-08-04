import { onCleanup, onMount } from "solid-js";
import { A } from "solid-start";
import Counter from "~/components/Counter";

export default function Home() {
  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">
        Hello world from Index!
      </h1>
      {/* <Counter /> */}
      <media-player
        title="Sprite Fight"
        src="https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/low.mp4"
        poster="https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/thumbnail.webp?time=268&width=980"
        thumbnails="https://media-files.vidstack.io/sprite-fight/thumbnails.vtt"
        aspect-ratio="16/9"
        crossorigin>
        <media-outlet>
          <media-poster alt="Girl walks into sprite gnomes around her friend on a campfire in danger!"></media-poster>
          <track
            src="https://media-files.vidstack.io/sprite-fight/subs/english.vtt"
            label="English"
            srclang="en-US"
            kind="subtitles"
            default
          />
          <track
            src="https://media-files.vidstack.io/sprite-fight/chapters.vtt"
            srclang="en-US"
            kind="chapters"
            default
          />
        </media-outlet>
        <media-community-skin></media-community-skin>
      </media-player>
    </main>
  );
}
