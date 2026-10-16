import { normalizeBacklogTag } from "@/lib/backlog/backlog-tag-presets";
import type { BacklogTask } from "@/lib/stores/backlog-store";
import type { NewMilestone } from "@/lib/timeline/timeline-models";
import { DEFAULT_TAG, type TagName } from "@/lib/todos/mappings";

const BACKLOG_TO_TIMELINE_TAGS: Record<string, TagName> = {
  "real value": "bigger",
  "thank me later": "bigger",
  "duty task": "smaller",
  dessert: "other",
  "maybe vibes": "other",
};

export const toTimelineMilestoneFromBacklog = (
  task: BacklogTask
): NewMilestone => ({
  type: "task",
  name: task.name,
  taskIds: [task.id],
  tag: BACKLOG_TO_TIMELINE_TAGS[normalizeBacklogTag(task.tag)] ?? DEFAULT_TAG,
});
