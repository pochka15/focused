import type { BacklogTask } from "@/lib/stores/backlog-store";

export type TaskDisplayState = "active" | "done" | "postponed";

export const getTaskDisplayState = (task: BacklogTask): TaskDisplayState => {
  if (!task.isPostponed) return "active";
  return task.isDone ? "done" : "postponed";
};

export const getDoneTasks = (tasks: BacklogTask[]): BacklogTask[] =>
  tasks.filter((t) => t.isDone);

/**
 * Create a map of tasks by ID for fast lookup
 * Useful for finding tasks across all tasks
 */
export const createTasksMap = (
  tasks: BacklogTask[]
): Map<number, BacklogTask> => new Map(tasks.map((t) => [t.id, t]));
