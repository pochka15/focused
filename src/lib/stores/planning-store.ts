import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// What kind of intention this task carries
export type BacklogTaskKind =
  | "doing-it-today" // Let's get it done — finite, ships
  | "they-asked-me-to" // They asked me to check — unclear signal, just observing
  | "thank-yourself-later"; // Thank yourself later — compound payoff, no ceiling

export type BacklogTask = {
  id: number;
  name: string;
  description: string;
  kind: BacklogTaskKind;
  isNext: boolean;
  chunkable: boolean;
};

export const formatBacklogTask = (t: BacklogTask): string => {
  const tags: string[] = [t.kind];
  if (t.isNext) tags.push("next");
  if (t.chunkable) tags.push("chunkable");
  const line = `- #${t.id} ${t.name} [${tags.join("|")}]`;
  return t.description ? `${line}\n  - ${t.description}` : line;
};

type PlanningState = {
  nextId: number;
  consumeNextId: () => number;
  goal: string;
  tasks: BacklogTask[];
  postponedTasks: BacklogTask[];
  setGoal: (goal: string) => void;
  addTask: (task: BacklogTask) => void;
  updateTask: (task: BacklogTask) => void;
  removeTask: (id: number) => void;
  restoreTask: (task: BacklogTask) => void;
  postponeTask: (id: number) => void;
  activateTask: (id: number) => void;
  updatePostponedTask: (task: BacklogTask) => void;
  removePostponedByNamePrefix: (prefix: string) => number[];
};

export const usePlanningStore = create<PlanningState>()(
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
      goal: "",
      tasks: [],
      postponedTasks: [],
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
          state.postponedTasks = state.postponedTasks.filter(
            (t) => t.id !== id
          );
        }),
      postponeTask: (id) =>
        set((state) => {
          const idx = state.tasks.findIndex((t) => t.id === id);
          if (idx === -1) return;
          const [task] = state.tasks.splice(idx, 1);
          state.postponedTasks.push(task!);
        }),
      activateTask: (id) =>
        set((state) => {
          const idx = state.postponedTasks.findIndex((t) => t.id === id);
          if (idx === -1) return;
          const [task] = state.postponedTasks.splice(idx, 1);
          state.tasks.push(task!);
        }),
      updatePostponedTask: (task) =>
        set((state) => {
          const idx = state.postponedTasks.findIndex((t) => t.id === task.id);
          if (idx !== -1) state.postponedTasks[idx] = task;
        }),
      removePostponedByNamePrefix: (prefix) => {
        let removedIds: number[] = [];
        set((state) => {
          removedIds = state.postponedTasks
            .filter((task) => task.name.startsWith(prefix))
            .map((task) => task.id);
          if (removedIds.length === 0) return;
          const removed = new Set(removedIds);
          state.postponedTasks = state.postponedTasks.filter(
            (task) => !removed.has(task.id)
          );
        });
        return removedIds;
      },
      restoreTask: (task) =>
        set((state) => {
          state.tasks.push(task);
        }),
    })),
    {
      name: "planning-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        nextId: state.nextId,
        goal: state.goal,
        tasks: state.tasks,
        postponedTasks: state.postponedTasks,
      }),
    }
  )
);
