import type { BacklogTask } from "@/lib/stores/planning-store";

export const toTimestamp = (
  value: string | null | undefined
): number | null => {
  if (!value) return null;
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : null;
};

export const isTaskSnoozed = (
  task: BacklogTask,
  now: number = Date.now()
): boolean => {
  const ts = toTimestamp(task.snoozeUntil);
  return ts !== null && ts > now;
};

export const isTaskSnoozeExpired = (
  task: BacklogTask,
  now: number = Date.now()
): boolean => {
  const ts = toTimestamp(task.snoozeUntil);
  return ts !== null && ts <= now;
};

export const getVisibleTasks = (
  tasks: BacklogTask[],
  now: number = Date.now()
): BacklogTask[] => tasks.filter((task) => !isTaskSnoozed(task, now));

export const getHiddenSnoozedCount = (
  tasks: BacklogTask[],
  now: number = Date.now()
): number => tasks.filter((task) => isTaskSnoozed(task, now)).length;
