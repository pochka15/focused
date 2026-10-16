import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type BacklogTask = {
  id: number;
  name: string;
  description: string;
  tag: string;
  snoozeUntil: string | null;
  isDone: boolean;
  isPostponed: boolean;
};

type BacklogState = {
  nextId: number;
  consumeNextId: () => number;
  tasks: BacklogTask[];
  // Ordered task ids planned to be picked next (first = top).
  queue: number[];
  addTask: (task: BacklogTask) => void;
  updateTask: (task: BacklogTask) => void;
  removeTask: (id: number) => void;
  enqueue: (id: number) => void;
  dequeue: (id: number) => void;
  setQueue: (ids: number[]) => void;
  swapInQueue: (aId: number, bId: number) => void;
};

export const useBacklogStore = create<BacklogState>()(
  persist(
    immer((set, get) => ({
      nextId: 1,
      consumeNextId: () => {
        const id = get().nextId;
        set((state) => {
          state.nextId += 1;
        });
        return id;
      },
      tasks: [],
      queue: [],
      addTask: (task) =>
        set((state) => {
          state.tasks.push(task);
        }),
      updateTask: (task) =>
        set((state) => {
          const idx = state.tasks.findIndex((t) => t.id === task.id);
          if (idx !== -1) state.tasks[idx] = task;
          if (task.isDone || task.isPostponed) {
            state.queue = state.queue.filter((id) => id !== task.id);
          }
        }),
      removeTask: (id) =>
        set((state) => {
          state.tasks = state.tasks.filter((t) => t.id !== id);
          state.queue = state.queue.filter((qid) => qid !== id);
        }),
      enqueue: (id) =>
        set((state) => {
          if (!state.queue.includes(id)) state.queue.push(id);
        }),
      dequeue: (id) =>
        set((state) => {
          state.queue = state.queue.filter((qid) => qid !== id);
        }),
      setQueue: (ids) =>
        set((state) => {
          state.queue = ids;
        }),
      swapInQueue: (aId, bId) =>
        set((state) => {
          const a = state.queue.indexOf(aId);
          const b = state.queue.indexOf(bId);
          if (a < 0 || b < 0) return;
          state.queue[a] = bId;
          state.queue[b] = aId;
        }),
    })),
    {
      name: "backlog-storage",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        nextId: state.nextId,
        tasks: state.tasks,
        queue: state.queue,
      }),
      migrate: (persisted, version) => {
        const state = persisted as Partial<BacklogState>;
        if (version < 1) {
          // v1: "next" flag replaced by the queue.
          const legacy = (state.tasks ?? []) as (BacklogTask & {
            isNext?: boolean;
          })[];
          state.queue = legacy
            .filter((t) => t.isNext && !t.isDone && !t.isPostponed)
            .map((t) => t.id);
          state.tasks = legacy.map((task) => {
            const copy = { ...task };
            delete copy.isNext;
            return copy;
          });
        }
        return state as BacklogState;
      },
    }
  )
);
