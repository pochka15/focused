import { BACKLOG_SHORTCUTS } from "@/lib/shortcuts/shortcut-mappings";
import type { BacklogTask } from "@/lib/stores/backlog-store";
import { Window as W, type UiWindow } from "@/shared-lib/shortcuts/window";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import type { Dispatch, SetStateAction } from "react";

export type BacklogColumn = "sections" | "queue";

type Params = {
  modalOpen: boolean;
  isQueueing: boolean;
  setIsQueueing: Dispatch<SetStateAction<boolean>>;
  column: BacklogColumn;
  setColumn: Dispatch<SetStateAction<BacklogColumn>>;
  sectionTasks: BacklogTask[];
  // Index in sectionTasks where each section begins.
  sectionStarts: number[];
  queueTasks: BacklogTask[];
  sectionsWindow: UiWindow;
  setSectionsWindow: Dispatch<SetStateAction<UiWindow>>;
  queueWindow: UiWindow;
  setQueueWindow: Dispatch<SetStateAction<UiWindow>>;
  openModal: (task?: BacklogTask) => void;
  pushTaskToTimeline: (task: BacklogTask, pushFront?: boolean) => void;
  postponeTask: (taskId: number) => void;
  enqueue: (taskId: number) => void;
  dequeue: (taskId: number) => void;
  dequeueAll: () => void;
  swapInQueue: (aId: number, bId: number) => void;
};

const findSectionIdx = (starts: number[], cursor: number): number => {
  let idx = 0;
  starts.forEach((start, i) => {
    if (start <= cursor) idx = i;
  });
  return idx;
};

export function useBacklogShortcuts({
  modalOpen,
  isQueueing,
  setIsQueueing,
  column,
  setColumn,
  sectionTasks,
  sectionStarts,
  queueTasks,
  sectionsWindow,
  setSectionsWindow,
  queueWindow,
  setQueueWindow,
  openModal,
  pushTaskToTimeline,
  postponeTask,
  enqueue,
  dequeue,
  dequeueAll,
  swapInQueue,
}: Params) {
  const bh = BACKLOG_SHORTCUTS;

  useShortcuts({
    name: "backlogView",
    enabled: !modalOpen,
    keys: (key, event) => {
      const inQueue = column === "queue";
      const tasks = inQueue ? queueTasks : sectionTasks;
      const n = tasks.length;
      const cursor = inQueue ? queueWindow.cursor : sectionsWindow.cursor;
      const task = tasks[cursor];
      const setWindow = inQueue ? setQueueWindow : setSectionsWindow;

      if (key === bh.toggleQueueing) {
        setIsQueueing((v) => !v);
        setColumn("sections");
        return true;
      }

      if (isQueueing && key === bh.dequeueAll) {
        dequeueAll();
        return true;
      }

      if (isQueueing && key === bh.escape) {
        setIsQueueing(false);
        return true;
      }

      if (
        isQueueing &&
        !inQueue &&
        (key === bh.enqueue || key === bh.enqueueEnter)
      ) {
        event.preventDefault();
        if (task) enqueue(task.id);
        return true;
      }

      if (key === bh.newTask) {
        openModal();
        return true;
      }

      if (key === bh.columnRight || key === bh.columnRightArrow) {
        event.preventDefault();
        setColumn("queue");
        return true;
      }
      if (key === bh.columnLeft || key === bh.columnLeftArrow) {
        event.preventDefault();
        setColumn("sections");
        return true;
      }

      if (key === bh.edit) {
        if (task) openModal(task);
        return true;
      }
      if (key === bh.pushTimeline) {
        if (task) pushTaskToTimeline(task);
        return true;
      }
      if (key === bh.pushTimelineFront) {
        if (task) pushTaskToTimeline(task, true);
        return true;
      }
      if (key === bh.postpone) {
        if (task) postponeTask(task.id);
        return true;
      }
      if (key === bh.dequeue && inQueue) {
        if (task) dequeue(task.id);
        return true;
      }

      if (key === bh.taskDown || key === bh.taskDownArrow) {
        event.preventDefault();
        setWindow((w) => W.moveSingle(w, 1, n));
        return true;
      }
      if (key === bh.taskUp || key === bh.taskUpArrow) {
        event.preventDefault();
        setWindow((w) => W.moveSingle(w, -1, n));
        return true;
      }
      if (key === bh.taskFirst) {
        setWindow(W.first);
        return true;
      }
      if (key === bh.taskLast) {
        setWindow((w) => W.last(w, n));
        return true;
      }

      const direction = key === bh.shiftDown ? 1 : key === bh.shiftUp ? -1 : 0;
      if (!direction) return false;

      if (inQueue) {
        const other = tasks[cursor + direction];
        if (!task || !other) return true;
        swapInQueue(task.id, other.id);
        setQueueWindow((w) => W.moveSingle(w, direction, n));
        return true;
      }

      const sectionIdx = findSectionIdx(sectionStarts, cursor);
      const currentStart = sectionStarts[sectionIdx] ?? 0;
      const target =
        direction === 1
          ? sectionStarts[sectionIdx + 1]
          : cursor > currentStart
            ? currentStart
            : sectionStarts[sectionIdx - 1];
      if (target !== undefined) {
        setSectionsWindow((w) => W.withCursor(w, target));
      }
      return true;
    },
  });
}
