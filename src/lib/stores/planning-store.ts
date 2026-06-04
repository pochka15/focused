import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type PlanningState = {
  goal: string;
  setGoal: (goal: string) => void;
};

export const usePlanningStore = create<PlanningState>()(
  persist(
    immer((set) => ({
      goal: "",
      setGoal: (goal) =>
        set((state) => {
          state.goal = goal;
        }),
    })),
    {
      name: "planning-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ goal: state.goal }),
    }
  )
);
