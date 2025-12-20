import { findTag, orderedTags } from "@/lib/todos/mappings";
import type { Event, Task, TodoItem } from "@/lib/todos/todo-models";
import { isEvent, isTask } from "@/lib/todos/todo-utils";

const tagRankMap = new Map(orderedTags.map((t, i) => [t, i] as const));

const getTagRank = (task: Task): number => {
  return tagRankMap.get(task.tag) ?? Number.MAX_SAFE_INTEGER;
};

const formatTask = (task: Task): string => {
  const tag = findTag(task.tag);
  const sTag = tag ? `; ${tag.emoji}` : "";
  return `${task.name}${sTag}`;
};

const formatEvent = (event: Event): string => {
  return `[${event.rawTime}] ${event.name}`;
};

export const formatHistory = (items: TodoItem[]): string => {
  const tasks = items.filter(isTask);
  const events = items.filter(isEvent);
  const sortedTasks = [...tasks].sort((a, b) => getTagRank(a) - getTagRank(b));
  const lines = [...sortedTasks.map(formatTask), ...events.map(formatEvent)];
  const numbered = lines.map((line, idx) => `${idx + 1}. ${line}`).join("\n");

  const tagLegendLines = orderedTags
    .map((tagKey) => {
      const tag = findTag(tagKey);
      return tag ? `${tag.emoji} ${tagKey}: ${tag.description}` : undefined;
    })
    .filter((it) => it !== undefined);

  if (tagLegendLines.length === 0) return numbered;

  return `${numbered}\n\nTags:\n${tagLegendLines.join("\n")}`;
};
