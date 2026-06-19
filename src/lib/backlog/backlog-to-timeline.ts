import { normalizeBacklogTag } from "@/lib/backlog/backlog-tag-presets";
import type { BacklogTask } from "@/lib/stores/planning-store";
import type { NewMilestone } from "@/lib/timeline/timeline-models";

type TimelinePreset = Pick<NewMilestone, "tag" | "mode" | "priority">;

const DEFAULT_PRESET: TimelinePreset = {
  tag: "other",
  mode: "light",
  priority: 2,
};

const BACKLOG_TO_TIMELINE_PRESETS: Record<string, TimelinePreset> = {
  "real value": { tag: "deep-routine", mode: "deep", priority: 2 },
  "thank me later": { tag: "good-one", mode: "light", priority: 2 },
  "duty task": { tag: "light-good", mode: "deep", priority: 2 },
  dessert: { tag: "other", mode: "light", priority: 3 },
  "maybe vibes": { tag: "other", mode: "light", priority: 2 },
};

export const toTimelineMilestoneFromBacklog = (
  task: BacklogTask
): NewMilestone => {
  const normalizedTag = normalizeBacklogTag(task.tag);
  const preset = BACKLOG_TO_TIMELINE_PRESETS[normalizedTag] ?? DEFAULT_PRESET;

  return {
    type: "task",
    name: task.name,
    taskIds: [task.id],
    tag: preset.tag,
    mode: task.tiny ? "light" : preset.mode,
    priority: task.isNext ? 1 : preset.priority,
  };
};
