import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type CapturedTaskScope = "work" | "personal";
export type CapturedTaskUrgency = "next" | "few-hours" | "today";
export type CapturedTaskSize = "quick" | "medium" | "big";
export type CapturedTaskEnergy = "deep" | "normal" | "light";

export type CapturedTask = {
  id: number;
  name: string;
  description: string;
  scope: CapturedTaskScope;
  urgency: CapturedTaskUrgency;
  size: CapturedTaskSize;
  energy: CapturedTaskEnergy;
};

type CaptureState = {
  queue: CapturedTask[];
  nextId: number;
  addToQueue: (t: Omit<CapturedTask, "id">) => void;
  clearQueue: () => void;
  consumeNextId: () => number;
};

export const formatCapturedTask = (t: CapturedTask): string => {
  const line = `- #${t.id} ${t.name} [${t.scope}|${t.urgency}|${t.size}|${t.energy}]`;
  return t.description ? `${line}\n  - ${t.description}` : line;
};

export const useCaptureStore = create<CaptureState>()(
  persist(
    immer((set, get) => ({
      queue: [],
      nextId: 1,

      addToQueue: (t) =>
        set((state) => {
          const id = state.nextId;
          state.nextId += 1;
          state.queue.push({ ...t, id });
        }),

      clearQueue: () =>
        set((state) => {
          state.queue = [];
        }),

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
      partialize: (state) => ({ queue: state.queue, nextId: state.nextId }),
    }
  )
);
