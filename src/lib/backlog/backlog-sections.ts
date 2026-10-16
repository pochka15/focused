import {
  getBacklogTagPreset,
  normalizeBacklogTag,
} from "@/lib/backlog/backlog-tag-presets";
import { isTaskSnoozed, toTimestamp } from "@/lib/backlog/backlog-task-utils";
import type { BacklogTask } from "@/lib/stores/backlog-store";
import {
  CakeSlice,
  Cog,
  Gem,
  HandHeart,
  Inbox,
  Moon,
  Tornado,
  type LucideIcon,
} from "lucide-react";

const SNOOZED_KEY = "snoozed";

export type BacklogSection = {
  // Normalized tag value; "" is the inbox (untagged tasks), "snoozed" holds
  // snoozed tasks of any tag.
  tag: string;
  title: string;
  icon: LucideIcon;
  tasks: BacklogTask[];
};

const SECTIONS: Omit<BacklogSection, "tasks">[] = [
  { tag: "", title: "Входящие", icon: Inbox },
  { tag: "real value", title: "Хорошие задачи на посидеть", icon: Gem },
  { tag: "thank me later", title: "Скажешь спасибо позже", icon: HandHeart },
  { tag: "duty task", title: "А чекни эти дежурные задачи", icon: Cog },
  {
    tag: "maybe vibes",
    title: "Что-то непонятное, можно попробовать поделать",
    icon: Tornado,
  },
  { tag: "dessert", title: "На десерт", icon: CakeSlice },
];

// Unknown tags fall back to the inbox so nothing gets lost.
const sectionTagOf = (task: BacklogTask): string =>
  getBacklogTagPreset(task.tag) ? normalizeBacklogTag(task.tag) : "";

const snoozeEndOf = (task: BacklogTask): number =>
  toTimestamp(task.snoozeUntil) ?? 0;

export const groupIntoSections = (
  tasks: BacklogTask[],
  now: number = Date.now()
): BacklogSection[] => {
  const awake = tasks.filter((task) => !isTaskSnoozed(task, now));
  const snoozed: BacklogSection = {
    tag: SNOOZED_KEY,
    title: "Snoozed",
    icon: Moon,
    // Wakes up soonest first.
    tasks: tasks
      .filter((task) => isTaskSnoozed(task, now))
      .sort((a, b) => snoozeEndOf(a) - snoozeEndOf(b)),
  };

  return [
    ...SECTIONS.map((section) => ({
      ...section,
      tasks: awake
        .filter((task) => sectionTagOf(task) === section.tag)
        .sort((a, b) => a.id - b.id),
    })),
    snoozed,
  ].filter((section) => section.tasks.length > 0);
};
