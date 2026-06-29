import type {
  Milestone,
  TimelineEvent,
  TimelineItem,
} from "@/lib/timeline/timeline-models";
import {
  TIMELINE_SHORTCUTS,
  TIMELINE_CARD_SHORTCUTS,
} from "@/lib/shortcuts/shortcut-mappings";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { Window as W, type UiWindow } from "@/shared-lib/shortcuts/window";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { useState } from "react";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";

type UseTimelineShortcutsArgs = {
  milestoneModalOpen: boolean;
  eventModalOpen: boolean;
  quickNoteRef: RefObject<HTMLTextAreaElement | null>;
  windowData: UiWindow;
  setWindowData: Dispatch<SetStateAction<UiWindow>>;
  activeMilestones: Milestone[];
  items: TimelineItem[];
  reorder: (fromIndex: number, toIndex: number) => void;
  setEditingMilestone: Dispatch<SetStateAction<Milestone | undefined>>;
  setMilestoneModalOpen: Dispatch<SetStateAction<boolean>>;
  setEditingEvent: Dispatch<SetStateAction<TimelineEvent | undefined>>;
  setEventModalOpen: Dispatch<SetStateAction<boolean>>;
  onToggleDone: (item: Milestone) => void;
  onDelete: (item: Milestone) => void;
  toggleShowCompletedMilestones: () => void;
  focusNotesTab: () => void;
  onCycleTask: (taskId: number) => void;
};

export const useTimelineShortcuts = ({
  milestoneModalOpen,
  eventModalOpen,
  quickNoteRef,
  windowData,
  setWindowData,
  activeMilestones,
  items,
  reorder,
  setEditingMilestone,
  setMilestoneModalOpen,
  setEditingEvent,
  setEventModalOpen,
  onToggleDone,
  onDelete,
  toggleShowCompletedMilestones,
  focusNotesTab,
  onCycleTask,
}: UseTimelineShortcutsArgs) => {
  const { enabled: isInsideCard, data: insideCardData } = useShortcutsMode(
    "editingMilestoneCardTasks"
  );
  const [isRemoving, setIsRemoving] = useState(false);

  const { enableMode, disableModes } = useShortcuts({
    name: "timelineView",
    enabled: !milestoneModalOpen && !eventModalOpen && !isInsideCard,
    keys: (key, event) => {
      const isEscape = key === TIMELINE_SHORTCUTS.escape;
      const isQuickNoteFocused =
        document.activeElement === quickNoteRef.current;

      if (isRemoving) {
        setIsRemoving(false);
        if (key === TIMELINE_SHORTCUTS.removeConfirm) {
          const item = activeMilestones[windowData.cursor];
          if (item) onDelete(item);
        }
        return true;
      }

      // Case quick note focused
      if (isQuickNoteFocused && isEscape) {
        event.preventDefault();
        quickNoteRef.current?.blur();
        return true;
      } else if (isQuickNoteFocused) return true;

      // Case focus quick note
      if (key === TIMELINE_SHORTCUTS.quickNote) {
        event.preventDefault();
        quickNoteRef.current?.focus();
        return true;
      }

      if (key === TIMELINE_SHORTCUTS.openNotes) {
        event.preventDefault();
        focusNotesTab();
        return true;
      }

      if (key === TIMELINE_SHORTCUTS.remove) {
        event.preventDefault();
        setIsRemoving(true);
        return true;
      }

      const n = activeMilestones.length;
      if (key === TIMELINE_SHORTCUTS.newMilestone) {
        setEditingMilestone(undefined);
        setMilestoneModalOpen(true);
        return true;
      }
      if (key === TIMELINE_SHORTCUTS.newEvent) {
        setEditingEvent(undefined);
        setEventModalOpen(true);
        return true;
      }
      if (
        key === TIMELINE_SHORTCUTS.moveDown ||
        key === TIMELINE_SHORTCUTS.moveDownArrow
      ) {
        event.preventDefault();
        setWindowData((w) => W.moveSingle(w, 1, n));
        return true;
      }
      if (
        key === TIMELINE_SHORTCUTS.moveUp ||
        key === TIMELINE_SHORTCUTS.moveUpArrow
      ) {
        event.preventDefault();
        setWindowData((w) => W.moveSingle(w, -1, n));
        return true;
      }
      if (key === TIMELINE_SHORTCUTS.reorderDown) {
        const cur = windowData.cursor;
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
      if (key === TIMELINE_SHORTCUTS.reorderUp) {
        const cur = windowData.cursor;
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
      if (key === TIMELINE_SHORTCUTS.first) {
        setWindowData(W.create());
        return true;
      }
      if (key === TIMELINE_SHORTCUTS.last) {
        setWindowData((w) => W.last(w, n));
        return true;
      }
      if (key === TIMELINE_SHORTCUTS.edit) {
        const item = activeMilestones[windowData.cursor];
        if (item) {
          setEditingMilestone(item);
          setMilestoneModalOpen(true);
        }
        return true;
      }
      if (key === TIMELINE_SHORTCUTS.toggleDone) {
        const item = activeMilestones[windowData.cursor];
        if (item) onToggleDone(item);
        return true;
      }
      if (key === TIMELINE_SHORTCUTS.toggleCompleted) {
        event.preventDefault();
        toggleShowCompletedMilestones();
        return true;
      }

      // we use exit shortcut also to enter it
      if (key === TIMELINE_CARD_SHORTCUTS.exit) {
        const item = activeMilestones[windowData.cursor];
        if (item && item.taskIds && item.taskIds.length > 0) {
          enableMode("editingMilestoneCardTasks", {
            milestoneId: item.id,
            taskIndex: 0,
          });
          return true;
        }
      }
      return false;
    },
  });

  useShortcuts({
    name: "timelineCardView",
    enabled: isInsideCard && !milestoneModalOpen && !eventModalOpen,
    keys: (key, event) => {
      const item = activeMilestones.find(
        (m) => m.id === insideCardData.milestoneId
      );
      if (!item || !item.taskIds) return false;

      const taskIds = item.taskIds;
      const currentIndex = insideCardData.taskIndex;

      if (key === TIMELINE_CARD_SHORTCUTS.moveUp) {
        event.preventDefault();
        const newIndex = Math.max(0, currentIndex - 1);
        enableMode("editingMilestoneCardTasks", {
          milestoneId: item.id,
          taskIndex: newIndex,
        });
        return true;
      }

      if (key === TIMELINE_CARD_SHORTCUTS.moveDown) {
        event.preventDefault();
        const newIndex = Math.min(taskIds.length - 1, currentIndex + 1);
        enableMode("editingMilestoneCardTasks", {
          milestoneId: item.id,
          taskIndex: newIndex,
        });
        return true;
      }

      if (key === TIMELINE_CARD_SHORTCUTS.toggleTaskDone) {
        event.preventDefault();
        const taskId = taskIds[currentIndex];
        if (taskId) onCycleTask(taskId);
        return true;
      }

      if (
        key === TIMELINE_CARD_SHORTCUTS.exit ||
        key === TIMELINE_CARD_SHORTCUTS.escape
      ) {
        event.preventDefault();
        disableModes(["editingMilestoneCardTasks"]);
        return true;
      }

      return false;
    },
  });

  return { isRemoving };
};
