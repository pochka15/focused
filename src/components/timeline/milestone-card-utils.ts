import type { BacklogTask } from "@/lib/stores/backlog-store";

/**
 * Get the next state in the cycle for a task
 * Returns the updated task with new flags applied
 *
 * State machine:
 * - Active (!isPostponed, !isDone) → Postponed + Done
 * - Postponed + Done → Postponed only (clear isDone)
 * - Postponed only → Active (clear isPostponed)
 */
export const getNextTaskCycleState = (task: BacklogTask): BacklogTask => {
  if (!task.isPostponed) {
    return { ...task, isPostponed: true, isDone: true };
  }
  if (task.isDone) {
    return { ...task, isDone: false };
  }
  return { ...task, isPostponed: false };
};

/**
 * Cycle task through states: active → done → postponed (not done) → active
 */
export const cycleTask = (
  task: BacklogTask,
  updateTask: (task: BacklogTask) => void
) => {
  updateTask(getNextTaskCycleState(task));
};
