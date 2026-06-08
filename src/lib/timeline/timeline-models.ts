import type { TagName, TodoMode } from "@/lib/todos/mappings";

export const DONE_PREFIX = "[DONE] ";

export type NewMilestone = {
  type: "task";
  name: string;
  priority: number;
  tag: TagName;
  mode: TodoMode;
  completed?: boolean;
  taskIds?: number[];
};

export type Milestone = NewMilestone & {
  id: string;
};

export type NewTimelineEvent = {
  type: "event";
  name: string;
  rawTime: string;
  durationMinutes: number;
  completed?: boolean;
};

export type TimelineEvent = NewTimelineEvent & {
  id: string;
};

export type NewTimelineItem = NewMilestone | NewTimelineEvent;
export type TimelineItem = Milestone | TimelineEvent;

export const isMilestone = (item: TimelineItem): item is Milestone =>
  item.type === "task";

export const isTimelineEvent = (item: TimelineItem): item is TimelineEvent =>
  item.type === "event";
