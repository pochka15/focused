import type {
  Milestone,
  TimelineEvent,
  TimelineItem,
} from "@/lib/timeline/timeline-models";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { Window as W, type UiWindow } from "@/shared-lib/shortcuts/window";
import type { Dispatch, RefObject, SetStateAction } from "react";

type UseTimelineShortcutsArgs = {
  milestoneModalOpen: boolean;
  eventModalOpen: boolean;
  quickNoteRef: RefObject<HTMLTextAreaElement | null>;
  milestoneRefs: RefObject<(HTMLDivElement | null)[]>;
  windowRef: RefObject<UiWindow>;
  setWindowData: Dispatch<SetStateAction<UiWindow>>;
  activeMilestones: Milestone[];
  items: TimelineItem[];
  reorder: (fromIndex: number, toIndex: number) => void;
  setEditingMilestone: Dispatch<SetStateAction<Milestone | undefined>>;
  setMilestoneModalOpen: Dispatch<SetStateAction<boolean>>;
  setEditingEvent: Dispatch<SetStateAction<TimelineEvent | undefined>>;
  setEventModalOpen: Dispatch<SetStateAction<boolean>>;
  editItem: (item: TimelineItem) => void;
  toggleShowCompletedMilestones: () => void;
};

export const useTimelineShortcuts = ({
  milestoneModalOpen,
  eventModalOpen,
  quickNoteRef,
  milestoneRefs,
  windowRef,
  setWindowData,
  activeMilestones,
  items,
  reorder,
  setEditingMilestone,
  setMilestoneModalOpen,
  setEditingEvent,
  setEventModalOpen,
  editItem,
  toggleShowCompletedMilestones,
}: UseTimelineShortcutsArgs) => {
  useShortcuts({
    name: "timelineView",
    enabled: !milestoneModalOpen && !eventModalOpen,
    keys: (key, event) => {
      const isEscape = key === "Escape";
      const isQuickNoteFocused =
        document.activeElement === quickNoteRef.current;

      // Case quick note focused
      if (isQuickNoteFocused && isEscape) {
        event.preventDefault();
        quickNoteRef.current?.blur();
        return true;
      } else if (isQuickNoteFocused) return true;

      // Case focus quick note
      if (key === "cmd+k") {
        event.preventDefault();
        quickNoteRef.current?.focus();
        return true;
      }

      const n = activeMilestones.length;
      if (key === "n") {
        setEditingMilestone(undefined);
        setMilestoneModalOpen(true);
        return true;
      }
      if (key === "v") {
        setEditingEvent(undefined);
        setEventModalOpen(true);
        return true;
      }
      if (key === "j" || key === "ArrowDown") {
        event.preventDefault();
        setWindowData((w) => W.moveSingle(w, 1, n));
        return true;
      }
      if (key === "k" || key === "ArrowUp") {
        event.preventDefault();
        setWindowData((w) => W.moveSingle(w, -1, n));
        return true;
      }
      if (key === "shift+J") {
        const cur = windowRef.current.cursor;
        const item = activeMilestones[cur];
        if (item && cur < n - 1) {
          const nextItem = activeMilestones[cur + 1];
          const fromIdx = items.findIndex((t) => t.id === item.id);
          const toIdx = nextItem
            ? items.findIndex((t) => t.id === nextItem.id)
            : fromIdx;
          reorder(fromIdx, toIdx);
          setWindowData((w) => W.moveSingle(w, 1, n));
        }
        return true;
      }
      if (key === "shift+K") {
        const cur = windowRef.current.cursor;
        const item = activeMilestones[cur];
        if (item && cur > 0) {
          const prevItem = activeMilestones[cur - 1];
          const fromIdx = items.findIndex((t) => t.id === item.id);
          const toIdx = prevItem
            ? items.findIndex((t) => t.id === prevItem.id)
            : fromIdx;
          reorder(fromIdx, toIdx);
          setWindowData((w) => W.moveSingle(w, -1, n));
        }
        return true;
      }
      if (key === "g") {
        setWindowData(W.create());
        return true;
      }
      if (key === "shift+G") {
        setWindowData((w) => W.last(w, n));
        return true;
      }
      if (key === "e") {
        const item = activeMilestones[windowRef.current.cursor];
        if (item) {
          setEditingMilestone(item);
          setMilestoneModalOpen(true);
        }
        return true;
      }
      if (key === "a") {
        const item = activeMilestones[windowRef.current.cursor];
        if (item) {
          editItem({ ...item, completed: true });
        }
        return true;
      }
      if (key === "c") {
        event.preventDefault();
        toggleShowCompletedMilestones();
        return true;
      }
      return false;
    },
  });
};
