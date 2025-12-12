import type { Task, TaskGroup } from "@/lib/stores/tasks-store";

export const parseTimeString = (str: string) => {
  // Accept formats like "1H:30m" or "01:30" or "90" (minutes)
  if (!str) return 0;
  const hhmm = str.match(/^(\d{1,2}):?(\d{1,2})?$/);
  if (hhmm) {
    const h = Number(hhmm[1] || 0);
    const m = Number(hhmm[2] || 0);
    return h * 60 + m;
  }
  const hm = str.match(/(\d+)H:?\s*(\d+)?m?/i);
  if (hm) return Number(hm[1]) * 60 + Number(hm[2] || 0);
  const minutes = Number(str);
  return Number.isFinite(minutes) ? minutes : 0;
};

export const formatTime = (minutes: number) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return "0:00";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
};

export const nextNotCompleted = (group?: TaskGroup, focusedTask?: Task) =>
  group?.tasks?.find((it) => !it.completed && it.id != focusedTask?.id);
