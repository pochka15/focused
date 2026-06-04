import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type BacklogTaskScope = "work" | "personal";
export type BacklogTaskUrgency = "next" | "few-hours" | "today";
export type BacklogTaskSize = "quick" | "medium" | "big";
export type BacklogTaskEnergy = "deep" | "normal" | "light";
export type BacklogTaskCompletion = "final" | "splittable";

export type BacklogTask = {
  id: number;
  name: string;
  description: string;
  scope: BacklogTaskScope;
  urgency: BacklogTaskUrgency;
  size: BacklogTaskSize;
  energy: BacklogTaskEnergy;
  completion: BacklogTaskCompletion;
};

type CaptureState = {
  nextId: number;
  consumeNextId: () => number;
};

export const formatBacklogTask = (t: BacklogTask): string => {
  const tags: string[] = [t.scope, t.urgency, t.size, t.energy];
  if (t.completion === "splittable") tags.push("splittable");
  const line = `- #${t.id} ${t.name} [${tags.join("|")}]`;
  return t.description ? `${line}\n  - ${t.description}` : line;
};

export const useCaptureStore = create<CaptureState>()(
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
    })),
    {
      name: "capture-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ nextId: state.nextId }),
    }
  )
);
