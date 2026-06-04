import type { BacklogTask } from "@/lib/stores/capture-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type PlanningState = {
  goal: string;
  tasks: BacklogTask[];
  setGoal: (goal: string) => void;
  addTask: (task: BacklogTask) => void;
  updateTask: (task: BacklogTask) => void;
  removeTask: (id: number) => void;
  clearTasks: () => void;
};

export const usePlanningStore = create<PlanningState>()(
  persist(
    immer((set) => ({
      goal: "",
      tasks: [],
      setGoal: (goal) =>
        set((state) => {
          state.goal = goal;
        }),
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
      clearTasks: () =>
        set((state) => {
          state.tasks = [];
        }),
    })),
    {
      name: "planning-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        goal: state.goal,
        tasks: state.tasks,
      }),
    }
  )
);
