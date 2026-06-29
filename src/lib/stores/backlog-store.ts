import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type BacklogTask = {
  id: number;
  name: string;
  description: string;
  isNext: boolean;
  tag: string;
  snoozeUntil: string | null;
  isDone: boolean;
  isPostponed: boolean;
};

type BacklogState = {
  nextId: number;
  consumeNextId: () => number;
  tasks: BacklogTask[];
  addTask: (task: BacklogTask) => void;
  updateTask: (task: BacklogTask) => void;
  removeTask: (id: number) => void;
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
      addTask: (task) =>
        set((state) => {
          state.tasks.push(task);
        }),
      updateTask: (task) =>
        set((state) => {
          const idx = state.tasks.findIndex((t) => t.id === task.id);
          if (idx !== -1) state.tasks[idx] = task;
        }),
      removeTask: (id) =>
        set((state) => {
          state.tasks = state.tasks.filter((t) => t.id !== id);
        }),
    })),
    {
      name: "backlog-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        nextId: state.nextId,
        tasks: state.tasks,
      }),
    }
  )
);
