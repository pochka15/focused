import type {
  Milestone,
  NewTimelineItem,
  TimelineItem,
} from "@/lib/timeline/timeline-models";
import { migrateTagName } from "@/lib/todos/mappings";
import { remove } from "lodash";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// v1: milestone tags collapsed to bigger/smaller/other, mode/priority dropped.
const migrateItem = (item: TimelineItem): TimelineItem => {
  if (item.type !== "task") return item;
  const copy = { ...item } as Milestone & {
    mode?: unknown;
    priority?: unknown;
  };
  delete copy.mode;
  delete copy.priority;
  return { ...copy, tag: migrateTagName(item.tag) };
};

interface TimelineState {
  items: TimelineItem[];
  history: TimelineItem[];
  quickNote: string;
  notesText: string;
  showCompletedMilestones: boolean;

  addItem: (item: NewTimelineItem, pushFront?: boolean) => void;
  editItem: (item: TimelineItem) => void;
  archiveItem: (id: string) => void;
  restoreItem: (item: TimelineItem) => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  setQuickNote: (note: string) => void;
  setNotesText: (text: string) => void;
  toggleShowCompletedMilestones: () => void;
  clear: () => void;
}

export const useTimelineStore = create<TimelineState>()(
  persist(
    immer((set) => ({
      items: [],
      history: [],
      quickNote: "",
      notesText: "",
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

      setNotesText: (text) =>
        set((state) => {
          state.notesText = text;
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
          state.notesText = "";
          state.showCompletedMilestones = true;
        }),
    })),
    {
      name: "timeline-storage",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => {
        const state = persisted as Partial<TimelineState>;
        if (version < 1) {
          state.items = (state.items ?? []).map(migrateItem);
          state.history = (state.history ?? []).map(migrateItem);
        }
        return state as TimelineState;
      },
      partialize: (state) => ({
        items: state.items,
        history: state.history,
        quickNote: state.quickNote,
        notesText: state.notesText,
        showCompletedMilestones: state.showCompletedMilestones,
      }),
    }
  )
);
