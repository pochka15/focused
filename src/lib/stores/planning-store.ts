import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type PlanningState = {
  goal: string;
  backlog: string;
  setGoal: (goal: string) => void;
  setBacklog: (backlog: string) => void;
};

export const usePlanningStore = create<PlanningState>()(
  persist(
    immer((set) => ({
      goal: "",
      backlog: "",
      setGoal: (goal) =>
        set((state) => {
          state.goal = goal;
        }),
      setBacklog: (backlog) =>
        set((state) => {
          state.backlog = backlog;
        }),
    })),
    {
      name: "planning-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ goal: state.goal, backlog: state.backlog }),
    }
  )
);
