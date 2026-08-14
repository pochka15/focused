import {
  BACKLOG_SHORTCUTS,
  BACKLOG_VIEW_SHORTCUTS,
} from "@/lib/shortcuts/shortcut-mappings";
import {
  BACKLOG_GROUPS,
  type GridGroup,
} from "@/lib/stores/backlog-grid-store";
import type { BacklogTask } from "@/lib/stores/backlog-store";
import type { BacklogRouteView } from "@/lib/backlog/backlog-route-mode";
import { SNOOZE_PRESETS } from "@/lib/backlog/snooze-presets";
import {
  Window as W,
  Window2D,
  type UiWindow,
  type UiWindow2D,
} from "@/shared-lib/shortcuts/window";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";

type Params = {
  modalOpen: boolean;
  zenMode: boolean;
  isWide: boolean;
  isMoving: boolean;
  snoozeTargetTaskId: number | null;
  focusedGroup: GridGroup;
  focusedTasks: BacklogTask[];
  allSorted: BacklogTask[];
  getWindow: (group: GridGroup) => UiWindow;
  setIsMoving: (isMoving: boolean) => void;
  setSnoozeTargetTaskId: (taskId: number | null) => void;
  setWindow2D: (
    updater: (state: UiWindow2D<GridGroup>) => UiWindow2D<GridGroup>
  ) => void;
  setWindowFor: (
    group: GridGroup,
    updater: (windowState: UiWindow) => UiWindow
  ) => void;
  setRouteView: (view: BacklogRouteView) => void;
  openModal: (task?: BacklogTask) => void;
  assignTask: (taskId: number, group: GridGroup) => void;
  swapWithin: (
    group: GridGroup,
    fromId: number,
    toId: number,
    orderedIds: number[]
  ) => void;
  pushTaskToTimeline: (task: BacklogTask, pushFront?: boolean) => void;
  postponeTask: (taskId: number) => void;
  toggleTaskNext: (task: BacklogTask) => void;
  applySnoozeByTaskId: (taskId: number, minutes: number) => void;
  clearSnoozeByTaskId: (taskId: number) => void;
  getFocusedBacklogTask: () => BacklogTask | undefined;
};

const GROUPS = BACKLOG_GROUPS;
const FIRST_GROUP = GROUPS[0] ?? 1;

export function useBacklogShortcuts({
  modalOpen,
  zenMode,
  isWide,
  isMoving,
  snoozeTargetTaskId,
  focusedGroup,
  focusedTasks,
  allSorted,
  getWindow,
  setIsMoving,
  setSnoozeTargetTaskId,
  setWindow2D,
  setWindowFor,
  setRouteView,
  openModal,
  assignTask,
  swapWithin,
  pushTaskToTimeline,
  postponeTask,
  toggleTaskNext,
  applySnoozeByTaskId,
  clearSnoozeByTaskId,
  getFocusedBacklogTask,
}: Params) {
  const bh = BACKLOG_SHORTCUTS;
  const bv = BACKLOG_VIEW_SHORTCUTS;

  useShortcuts({
    name: "backlogView",
    enabled: !modalOpen,
    keys: (key, event) => {
      if (snoozeTargetTaskId !== null) {
        if (key === bv.cancelSnooze) {
          setSnoozeTargetTaskId(null);
          return true;
        }
        if (key === bv.clearSnooze) {
          clearSnoozeByTaskId(snoozeTargetTaskId);
          setSnoozeTargetTaskId(null);
          return true;
        }
        const preset = SNOOZE_PRESETS.find((item) => item.key === key);
        if (preset) {
          applySnoozeByTaskId(snoozeTargetTaskId, preset.minutes);
          setSnoozeTargetTaskId(null);
          return true;
        }
      }

      if (key === bh.switchMode) {
        event.preventDefault();
        setRouteView(zenMode ? "full" : "zen");
        return true;
      }

      if (key === bh.newTask) {
        openModal();
        return true;
      }

      const curTasks = isWide ? focusedTasks : allSorted;
      const n = curTasks.length;
      const cursorNow = isWide
        ? getWindow(focusedGroup).cursor
        : getWindow(FIRST_GROUP).cursor;

      const numericKey = Number(key);
      const isGroupNumber =
        Number.isInteger(numericKey) && GROUPS.includes(numericKey);

      if (isMoving) {
        if (isGroupNumber) {
          const destGroup = numericKey as GridGroup;
          const task = curTasks[cursorNow];
          if (task) assignTask(task.id, destGroup);
          setIsMoving(false);
          return true;
        }
        setIsMoving(false);
        return false;
      }

      if (isGroupNumber) {
        setWindow2D((state) =>
          Window2D.setFocusedGroup(state, numericKey as GridGroup)
        );
        return true;
      }

      if (key === bh.groupRight || key === bh.groupRightArrow) {
        event.preventDefault();
        setWindow2D((state) => Window2D.cycleFocusedGroup(state, 1));
        return true;
      }

      if (key === bh.groupLeft || key === bh.groupLeftArrow) {
        event.preventDefault();
        setWindow2D((state) => Window2D.cycleFocusedGroup(state, -1));
        return true;
      }

      if (key === bh.edit) {
        const task = curTasks[cursorNow];
        if (task) openModal(task);
        return true;
      }
      if (key === bh.pushTimeline) {
        const task = curTasks[cursorNow];
        if (task) pushTaskToTimeline(task);
        return true;
      }
      if (key === bh.pushTimelineFront) {
        const task = curTasks[cursorNow];
        if (task) pushTaskToTimeline(task, true);
        return true;
      }
      if (key === bh.postpone) {
        const task = curTasks[cursorNow];
        if (task) postponeTask(task.id);
        return true;
      }
      if (key === bh.snoozePicker) {
        const task = getFocusedBacklogTask();
        if (task) setSnoozeTargetTaskId(task.id);
        return true;
      }
      if (key === bh.moveTask) {
        setIsMoving(true);
        return true;
      }

      if (key === bh.toggleNext) {
        const task = curTasks[cursorNow];
        if (task) toggleTaskNext(task);
        return true;
      }

      if (key === bh.taskDown || key === bh.taskDownArrow) {
        event.preventDefault();
        if (isWide)
          setWindowFor(focusedGroup, (windowState) =>
            W.moveSingle(windowState, 1, n)
          );
        else
          setWindowFor(FIRST_GROUP, (windowState) =>
            W.moveSingle(windowState, 1, n)
          );
        return true;
      }
      if (key === bh.taskUp || key === bh.taskUpArrow) {
        event.preventDefault();
        if (isWide)
          setWindowFor(focusedGroup, (windowState) =>
            W.moveSingle(windowState, -1, n)
          );
        else
          setWindowFor(FIRST_GROUP, (windowState) =>
            W.moveSingle(windowState, -1, n)
          );
        return true;
      }
      if (key === bh.taskFirst) {
        if (isWide) setWindowFor(focusedGroup, W.first);
        else setWindowFor(FIRST_GROUP, W.first);
        return true;
      }
      if (key === bh.taskLast) {
        if (isWide)
          setWindowFor(focusedGroup, (windowState) => W.last(windowState, n));
        else setWindowFor(FIRST_GROUP, (windowState) => W.last(windowState, n));
        return true;
      }

      const direction = key === bh.swapDown ? 1 : key === bh.swapUp ? -1 : 0;

      if (direction) {
        const group = isWide ? focusedGroup : FIRST_GROUP;
        const cur = getWindow(group).cursor;
        const fromTask = curTasks[cur];
        const toTask = curTasks[cur + direction];
        if (!fromTask || !toTask) return true;

        swapWithin(
          group,
          fromTask.id,
          toTask.id,
          curTasks.map((task) => task.id)
        );
        setWindowFor(group, (windowState) =>
          W.moveSingle(windowState, direction, n)
        );
        return true;
      }

      return false;
    },
  });
}
