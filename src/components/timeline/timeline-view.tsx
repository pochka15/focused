import { BacklogModal } from "@/components/backlog/backlog-modal";
import { showUndoNotification } from "@/lib/notifications/show-undo-notification";
import type { BacklogTask } from "@/lib/stores/backlog-store";
import { useBacklogStore } from "@/lib/stores/backlog-store";
import { useTimelineStore } from "@/lib/stores/timeline-store";
import {
  isMilestone,
  isTimelineEvent,
  type Milestone,
  type NewMilestone,
  type NewTimelineEvent,
  type TimelineEvent,
} from "@/lib/timeline/timeline-models";
import {
  toSuggestedMilestone,
  useSoonEvents,
} from "@/lib/timeline/use-soon-events";
import { tagsMapping } from "@/lib/todos/mappings";
import { Window as W, type UiWindow } from "@/shared-lib/shortcuts/window";
import { Box, Button, Group, Stack, Tabs, Text } from "@mantine/core";
import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { EventModal } from "./event-modal";
import { MilestoneCard } from "./milestone-card";
import { cycleTask } from "./milestone-card-utils";
import { MilestoneClimb } from "./milestone-climb";
import { MilestonesStatsBar } from "./milestones-stats-bar";
import { MilestoneModal } from "./milestone-modal";
import { QuickNoteCard } from "./quick-note-card";
import { TimelineEventRow } from "./timeline-event-row";
import { TimelineNotesTab } from "./timeline-notes-tab";
import { TimelineSectionHeader } from "./timeline-section-header";
import { createTasksMap, getDoneTasks } from "./timeline-view-utils";
import classes from "./timeline-view.module.css";
import { useTimelineShortcuts } from "./use-timeline-shortcuts";

type TimelineTab = "milestones" | "completed" | "events" | "notes";

const MARK_TASKS_DONE_MESSAGE = "Ssup with tasks?";

export function TimelineView() {
  const items = useTimelineStore((s) => s.items);
  const addItem = useTimelineStore((s) => s.addItem);
  const editItem = useTimelineStore((s) => s.editItem);
  const archiveItem = useTimelineStore((s) => s.archiveItem);
  const restoreItem = useTimelineStore((s) => s.restoreItem);
  const reorder = useTimelineStore((s) => s.reorder);
  const quickNote = useTimelineStore((s) => s.quickNote);
  const setQuickNote = useTimelineStore((s) => s.setQuickNote);

  const milestones = items.filter(isMilestone);
  const activeMilestones = milestones.filter((m) => !m.completed);
  const events = useMemo(
    () =>
      items
        .filter(isTimelineEvent)
        .sort((a, b) => a.rawTime.localeCompare(b.rawTime)),
    [items]
  );

  const [windowData, setWindowData] = useState<UiWindow>(W.create());
  const [activeTab, setActiveTab] = useState<TimelineTab>("milestones");
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<
    Milestone | undefined
  >();
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | undefined>();
  const [editedBacklogTask, setEditedBacklogTask] = useState<
    BacklogTask | undefined
  >();

  const showBacklogModal = editedBacklogTask !== undefined;
  const updateTask = useBacklogStore((s) => s.updateTask);
  const addTask = useBacklogStore((s) => s.addTask);
  const consumeNextId = useBacklogStore((s) => s.consumeNextId);
  const backlog = useBacklogStore((s) => s.tasks);
  const allTasksMap = useMemo(() => createTasksMap(backlog), [backlog]);

  const milestoneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const quickNoteRef = useRef<HTMLTextAreaElement | null>(null);

  const getIncompleteTaskIds = (taskIds: number[] | undefined): number[] => {
    const doneTasks = getDoneTasks(backlog);
    const doneIds = new Set(doneTasks.map((t) => t.id));
    return taskIds?.filter((id) => !doneIds.has(id)) ?? [];
  };

  const addHelperTask = (taskIds: number[]) => {
    addItem(
      {
        ...tagsMapping["other"].autoFill,
        type: "task",
        name: MARK_TASKS_DONE_MESSAGE,
        completed: false,
        taskIds,
      },
      true
    );
  };

  const handleToggleMilestoneDone = (item: Milestone) => {
    const isHelperTask = item.name === MARK_TASKS_DONE_MESSAGE;

    if (!item.completed && !isHelperTask) {
      const ids = getIncompleteTaskIds(item.taskIds);
      if (ids.length > 0) addHelperTask(ids);
    }

    editItem({ ...item, completed: !item.completed });
  };

  const handleCycleTask = (taskId: number) => {
    const task = allTasksMap.get(taskId);
    if (task) cycleTask(task, updateTask);
  };

  const focusMilestonesTab = () => {
    setActiveTab("milestones");
  };

  const focusNotesTab = () => {
    setActiveTab("notes");
  };

  const handleReorderCompleted = (fromIdx: number, toIdx: number) => {
    // Find indices in full items array
    const fromMilestone = completedMilestones[fromIdx];
    const toMilestone = completedMilestones[toIdx];

    if (!fromMilestone || !toMilestone) return;

    const fromItemIdx = items.findIndex((t) => t.id === fromMilestone.id);
    const toItemIdx = items.findIndex((t) => t.id === toMilestone.id);

    if (fromItemIdx >= 0 && toItemIdx >= 0) {
      reorder(fromItemIdx, toItemIdx);
    }
  };

  useEffect(() => {
    setWindowData((w) => W.shrinkTo(w, activeMilestones.length));
  }, [activeMilestones.length]);

  useEffect(() => {
    milestoneRefs.current[windowData.cursor]?.scrollIntoView({
      block: "nearest",
    });
  }, [windowData.cursor]);

  const deleteWithUndo = (item: ReturnType<typeof items.find>) => {
    if (!item) return;
    archiveItem(item.id);
    showUndoNotification(
      `del-${item.id}`,
      `"${item.name}" removed`,
      () => restoreItem(item),
      "bottom-left"
    );
  };

  const handleDeleteAllCompleted = () => {
    const toDelete = completedMilestones;
    if (toDelete.length === 0) return;

    toDelete.forEach((item) => archiveItem(item.id));
    showUndoNotification(
      "del-all-completed",
      `${toDelete.length} completed milestone${toDelete.length === 1 ? "" : "s"} removed`,
      () => toDelete.forEach((item) => restoreItem(item)),
      "bottom-left"
    );
  };

  const { isRemoving } = useTimelineShortcuts({
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
    onToggleDone: handleToggleMilestoneDone,
    onDelete: deleteWithUndo,
    focusNotesTab,
    onCycleTask: handleCycleTask,
  });

  const handleMilestoneSubmit = (newItem: NewMilestone) => {
    if (editingMilestone) {
      editItem({ ...editingMilestone, ...newItem });
    } else {
      addItem(newItem);
    }
    setEditingMilestone(undefined);
  };

  const handleEventSubmit = (newItem: NewTimelineEvent) => {
    if (editingEvent) {
      editItem({ ...editingEvent, ...newItem });
    } else {
      addItem(newItem);
    }
    setEditingEvent(undefined);
  };

  const selectedMilestone = activeMilestones[windowData.cursor];

  const visibleActiveMilestones = useMemo(
    () => milestones.filter((milestone) => !milestone.completed),
    [milestones]
  );

  const completedMilestones = useMemo(
    () => milestones.filter((milestone) => milestone.completed),
    [milestones]
  );

  const {
    soonEvents: visibleSoonEvents,
    useSuggestedEvent,
    dismissSuggestedEvent,
  } = useSoonEvents(events);

  const addSuggestedEvent = (event: TimelineEvent) => {
    addItem(toSuggestedMilestone(event));
    archiveItem(event.id);
    useSuggestedEvent(event);
  };

  return (
    <Box>
      <MilestoneModal
        opened={milestoneModalOpen}
        onClose={() => {
          setMilestoneModalOpen(false);
          setEditingMilestone(undefined);
        }}
        onSubmit={handleMilestoneSubmit}
        editing={editingMilestone}
      />
      <BacklogModal
        opened={showBacklogModal}
        onClose={() => setEditedBacklogTask(undefined)}
        onSubmit={(values) => {
          if (editedBacklogTask) {
            updateTask({ ...editedBacklogTask, ...values });
          } else {
            addTask({ id: consumeNextId(), ...values });
          }
          setEditedBacklogTask(undefined);
        }}
        editing={editedBacklogTask}
      />
      <EventModal
        opened={eventModalOpen}
        onClose={() => {
          setEventModalOpen(false);
          setEditingEvent(undefined);
        }}
        onSubmit={handleEventSubmit}
        editing={editingEvent}
      />

      <Tabs
        value={activeTab}
        onChange={(value) =>
          setActiveTab((value as TimelineTab) ?? "milestones")
        }
      >
        <Tabs.List>
          <Tabs.Tab value="milestones">Milestones</Tabs.Tab>
          <Tabs.Tab value="completed">Completed</Tabs.Tab>
          <Tabs.Tab value="events">Events</Tabs.Tab>
          <Tabs.Tab value="notes">Notes</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="milestones" pt="md">
          <TimelineSectionHeader
            title="Milestones"
            hint=""
            buttonLabel="New"
            onButtonClick={() => {
              setEditingMilestone(undefined);
              setMilestoneModalOpen(true);
            }}
          />

          <Box>
            {activeMilestones.length === 0 && (
              <Text c="dimmed" size="sm">
                No active milestones. Press <kbd>n</kbd> to add one.
              </Text>
            )}

            <Stack gap="xs">
                {visibleActiveMilestones.map((item) => {
                  const isSelected =
                    !item.completed && selectedMilestone?.id === item.id;
                  const activeIdx = activeMilestones.findIndex(
                    (m) => m.id === item.id
                  );
                  return (
                    <Box key={item.id} className={classes.cardContainer}>
                      <MilestoneCard
                        item={item}
                        isSelected={isSelected}
                        isRemoving={isSelected && isRemoving}
                        activeIdx={activeIdx}
                        milestoneRef={(el) => {
                          if (activeIdx >= 0) {
                            milestoneRefs.current[activeIdx] = el;
                          }
                        }}
                        onSelect={() =>
                          setWindowData((w) => W.withCursor(w, activeIdx))
                        }
                        onEdit={() => {
                          setEditingMilestone(item);
                          setMilestoneModalOpen(true);
                        }}
                        onToggleDone={() => handleToggleMilestoneDone(item)}
                        onDelete={() => deleteWithUndo(item)}
                        onEditBacklogTask={setEditedBacklogTask}
                      />
                    </Box>
                  );
                })}

                {visibleSoonEvents.map(({ event }) => (
                  <Box key={event.id} className={classes.cardContainer}>
                    <MilestoneCard
                      variant="suggested"
                      item={toSuggestedMilestone(event)}
                      isSelected={false}
                      activeIdx={-1}
                      milestoneRef={() => {}}
                      onSelect={() => {}}
                      onEdit={() => {}}
                      onToggleDone={() => {}}
                      onDelete={() => {}}
                      onUseSuggestion={() => addSuggestedEvent(event)}
                      onDismissSuggestion={() =>
                        dismissSuggestedEvent(event.id)
                      }
                    />
                  </Box>
                ))}

                <Box className={classes.quickCardContainer}>
                  <QuickNoteCard
                    key="timeline-quick-note"
                    textareaRef={(el) => {
                      quickNoteRef.current = el;
                    }}
                    value={quickNote}
                    onChange={setQuickNote}
                  />
                </Box>
              </Stack>
            </Box>

          {activeTab === "milestones" && <MilestonesStatsBar />}
        </Tabs.Panel>

        <Tabs.Panel value="completed" pt="md">
          <TimelineSectionHeader
            title="Completed Milestones"
            hint=""
            buttonLabel=""
            onButtonClick={() => {}}
          />

          {completedMilestones.length > 0 && (
            <Group justify="flex-end" mb="xs">
              <Button
                size="xs"
                color="red"
                variant="light"
                leftSection={<Trash2 size={14} />}
                onClick={handleDeleteAllCompleted}
              >
                Delete All
              </Button>
            </Group>
          )}

          {completedMilestones.length === 0 && (
            <Text c="dimmed" size="sm">
              No completed milestones.
            </Text>
          )}

          {completedMilestones.length > 0 && (
            <MilestoneClimb
              completed={completedMilestones}
              onEdit={(milestone) => {
                setEditingMilestone(milestone);
                setMilestoneModalOpen(true);
              }}
              onDelete={deleteWithUndo}
              onReorder={handleReorderCompleted}
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="events" pt="md">
          <TimelineSectionHeader
            title="Events"
            hint=""
            buttonLabel="New"
            onButtonClick={() => {
              setEditingEvent(undefined);
              setEventModalOpen(true);
            }}
          />

          {events.length === 0 && (
            <Text c="dimmed" size="sm">
              No events today. Press <kbd>v</kbd> to add one.
            </Text>
          )}

          <Stack gap="xs">
            {events.map((ev) => (
              <Box key={ev.id} className={classes.cardContainer}>
                <TimelineEventRow
                  event={ev}
                  onEdit={(event) => {
                    setEditingEvent(event);
                    setEventModalOpen(true);
                  }}
                  onDelete={deleteWithUndo}
                />
              </Box>
            ))}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="notes" pt="md">
          <TimelineNotesTab
            active={activeTab === "notes"}
            onClose={focusMilestonesTab}
          />
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}
