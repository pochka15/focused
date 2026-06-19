import { getMinutesUntil } from "@/lib/notifications/notifications-utils";
import type { Milestone, TimelineEvent } from "@/lib/timeline/timeline-models";

export type MilestonesWithNoteItem =
  | { kind: "milestone"; item: Milestone; index: number }
  | { kind: "note"; index: -1 };

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const parseTimeComponent = (
  rawTime: string
): { h: number; m: number } | null => {
  const match = rawTime.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (
    Number.isNaN(h) ||
    Number.isNaN(m) ||
    h < 0 ||
    h > 23 ||
    m < 0 ||
    m > 59
  ) {
    return null;
  }
  return { h, m };
};

export const isEventBehind = (event: TimelineEvent): boolean => {
  if (event.completed) return false;
  const time = parseTimeComponent(event.rawTime);
  if (!time) return false;
  return getMinutesUntil(time.h, time.m) < 0;
};

export const buildMilestonesWithNote = (
  milestones: Milestone[]
): MilestonesWithNoteItem[] => {
  const list: MilestonesWithNoteItem[] = milestones.map((item, index) => ({
    kind: "milestone",
    item,
    index,
  }));

  const lastCompletedIndex = milestones.reduce(
    (last, item, index) => (item.completed ? index : last),
    -1
  );

  list.splice(lastCompletedIndex + 1, 0, { kind: "note", index: -1 });
  return list;
};
