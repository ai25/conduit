import { useNavigate } from "@solidjs/router";
import {
  BsPlay,
  BsUniversalAccess,
  BsUniversalAccessCircle,
} from "solid-icons/bs";
import {
  TbAdjustmentsCog,
  TbCloudCog,
  TbFilterCog,
  TbPhotoCog,
} from "solid-icons/tb";
import PreferencesCard from "~/components/PreferencesCard";

export default function Preferences() {
  const navigate = useNavigate();
  return (
    <div class="flex flex-col gap-2 p-4">
      <PreferencesCard
        title="User Interface"
        description="Customize the look and feel of Conduit"
        icon={<TbPhotoCog class="w-5 h-5" />}
        onClick={() => navigate("/preferences/ui")}
      />
      <PreferencesCard
        title="Sync"
        description="Sync your data across devices"
        icon={<TbCloudCog class="w-5 h-5" />}
        onClick={() => navigate("/preferences/sync")}
      />
      <PreferencesCard
        title="Content"
        description="Customize the type of content you see"
        icon={<TbFilterCog class="w-5 h-5" />}
        onClick={() => navigate("/preferences/content")}
      />
      <PreferencesCard
        title="Playback"
        description="Adjustments for video and audio playback, history, and autoplay features."
        icon={<BsPlay class="w-7 h-7 ml-0.5" />}
        onClick={() => navigate("/preferences/playback")}
      />
      <PreferencesCard
        title="Accessibility"
        description="Enhance app usability for diverse user needs, including auditory and visual support."
        icon={<BsUniversalAccess class="w-5 h-5" />}
        onClick={() => navigate("/preferences/accessibility")}
      />
      <PreferencesCard
        title="Advanced"
        description="Advanced settings for power users."
        icon={<TbAdjustmentsCog class="w-5 h-5" />}
        onClick={() => navigate("/preferences/advanced")}
      />
    </div>
  );
}
