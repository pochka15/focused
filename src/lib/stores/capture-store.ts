import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type CapturedTaskScope = "work" | "personal";
export type CapturedTaskUrgency = "next" | "few-hours" | "today";
export type CapturedTaskSize = "quick" | "medium" | "big";
export type CapturedTaskEnergy = "deep" | "normal" | "light";
export type CapturedTaskCompletion = "final" | "splittable";

export type CapturedTask = {
  id: number;
  name: string;
  description: string;
  scope: CapturedTaskScope;
  urgency: CapturedTaskUrgency;
  size: CapturedTaskSize;
  energy: CapturedTaskEnergy;
  completion: CapturedTaskCompletion;
};

type CaptureState = {
  nextId: number;
  consumeNextId: () => number;
};

export const formatCapturedTask = (t: CapturedTask): string => {
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
