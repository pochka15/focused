import type {
  NewTimelineItem,
  TimelineItem,
} from "@/lib/timeline/timeline-models";
import { remove } from "lodash";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface TimelineState {
  items: TimelineItem[];
  history: TimelineItem[];
  quickNote: string;
  showCompletedMilestones: boolean;

  addItem: (item: NewTimelineItem, pushFront?: boolean) => void;
  editItem: (item: TimelineItem) => void;
  archiveItem: (id: string) => void;
  restoreItem: (item: TimelineItem) => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  setQuickNote: (note: string) => void;
  toggleShowCompletedMilestones: () => void;
  clear: () => void;
}

export const useTimelineStore = create<TimelineState>()(
  persist(
    immer((set) => ({
      items: [],
      history: [],
      quickNote: "",
      showCompletedMilestones: true,

      addItem: (item, pushFront = false) =>
        set((state) => {
          const newItem = { ...item, id: crypto.randomUUID() } as TimelineItem;
          if (pushFront) state.items.unshift(newItem);
          else state.items.push(newItem);
        }),

      editItem: (item) =>
        set((state) => {
          const idx = state.items.findIndex((t) => t.id === item.id);
          if (idx !== -1) state.items[idx] = item;
        }),

      archiveItem: (id) =>
        set((state) => {
          const item = state.items.find((t) => t.id === id);
          if (item) state.history.push(item);
          remove(state.items, { id });
        }),

      restoreItem: (item) =>
        set((state) => {
          state.history = state.history.filter((h) => h.id !== item.id);
          state.items.push(item);
        }),

      reorder: (fromIndex, toIndex) =>
        set((state) => {
          const item = state.items[fromIndex];
          if (!item) return;
          state.items.splice(fromIndex, 1);
          state.items.splice(toIndex, 0, item);
        }),

      setQuickNote: (note) =>
        set((state) => {
          state.quickNote = note;
        }),

      toggleShowCompletedMilestones: () =>
        set((state) => {
          state.showCompletedMilestones = !state.showCompletedMilestones;
        }),

      clear: () =>
        set((state) => {
          state.items = [];
          state.history = [];
          state.quickNote = "";
          state.showCompletedMilestones = true;
        }),
    })),
    {
      name: "timeline-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        history: state.history,
        quickNote: state.quickNote,
        showCompletedMilestones: state.showCompletedMilestones,
      }),
    }
  )
);
