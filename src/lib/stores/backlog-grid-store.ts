import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export const BACKLOG_GRID_COLUMNS = 2;
export const BACKLOG_GRID_ROWS = 2;
export const BACKLOG_GRID_GROUP_COUNT =
  BACKLOG_GRID_COLUMNS * BACKLOG_GRID_ROWS;

export type GridGroup = number;

export const BACKLOG_GROUPS: GridGroup[] = Array.from(
  { length: BACKLOG_GRID_GROUP_COUNT },
  (_, i) => i + 1
);

const createEmptyGroups = (): Record<GridGroup, number[]> =>
  Object.fromEntries(BACKLOG_GROUPS.map((group) => [group, []]));

type GridState = {
  groups: Record<GridGroup, number[]>;

  assignTask: (taskId: number, group: GridGroup) => void;
  removeTask: (taskId: number) => void;
  swapWithin: (
    group: GridGroup,
    fromTaskId: number,
    toTaskId: number,
    visibleIds?: number[]
  ) => void;
  getOrderedIds: (group: GridGroup, validIds: Set<number>) => number[];
};

export const useBacklogGridStore = create<GridState>()(
  persist(
    immer((set, get) => ({
      groups: createEmptyGroups(),

      assignTask: (taskId, group) =>
        set((state) => {
          // Remove from all groups
          for (const g of BACKLOG_GROUPS) {
            state.groups[g] = (state.groups[g] ?? []).filter(
              (id) => id !== taskId
            );
          }
          state.groups[group] ??= [];
          state.groups[group].push(taskId);
        }),

      removeTask: (taskId) =>
        set((state) => {
          for (const g of BACKLOG_GROUPS) {
            state.groups[g] = (state.groups[g] ?? []).filter(
              (id) => id !== taskId
            );
          }
        }),

      swapWithin: (group, fromTaskId, toTaskId, visibleIds) =>
        set((state) => {
          state.groups[group] ??= [];
          const arr = state.groups[group];
          if (visibleIds?.length) {
            const seen = new Set(arr);
            for (const id of visibleIds) {
              if (!seen.has(id)) {
                arr.push(id);
                seen.add(id);
              }
            }
          }

          const fromIdx = arr.indexOf(fromTaskId);
          const toIdx = arr.indexOf(toTaskId);
          if (fromIdx < 0 || toIdx < 0) {
            return;
          }

          const tmp = arr[fromIdx]!;
          arr[fromIdx] = arr[toIdx]!;
          arr[toIdx] = tmp;
        }),

      getOrderedIds: (group, validIds) => {
        const { groups } = get();
        return (groups[group] ?? []).filter((id) => validIds.has(id));
      },
    })),
    {
      name: "backlog-grid-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ groups: state.groups }),
    }
  )
);
