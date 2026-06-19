import {
  isMilestone,
  isTimelineEvent,
  type Milestone,
  type NewMilestone,
  type NewTimelineEvent,
  type TimelineEvent,
} from "@/lib/timeline/timeline-models";
import {
  useSoonEvents,
  toSuggestedMilestone,
} from "@/lib/timeline/use-soon-events";
import { useTimelineStore } from "@/lib/stores/timeline-store";
import { showUndoNotification } from "@/lib/notifications/show-undo-notification";
import { Window as W, type UiWindow } from "@/shared-lib/shortcuts/window";
import { Box, Stack, Tabs, Text } from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BacklogTask } from "@/lib/stores/planning-store";
import { usePlanningStore } from "@/lib/stores/planning-store";
import { BacklogModal } from "@/components/backlog/backlog-modal";
import { EventModal } from "./event-modal";
import { MilestoneCard } from "./milestone-card";
import { MilestoneModal } from "./milestone-modal";
import { QuickNoteCard } from "./quick-note-card";
import { TimelineEventRow } from "./timeline-event-row";
import { TimelineSectionHeader } from "./timeline-section-header";
import { CollapsedMilestonesCard } from "./collapsed-milestones-card";
import { useTimelineShortcuts } from "./use-timeline-shortcuts";
import classes from "./timeline-view.module.css";

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
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<
    Milestone | undefined
  >();
  const showCompletedMilestones = useTimelineStore(
    (s) => s.showCompletedMilestones
  );
  const toggleShowCompletedMilestones = useTimelineStore(
    (s) => s.toggleShowCompletedMilestones
  );
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | undefined>();
  const [editedBacklogTask, setEditedBacklogTask] = useState<
    BacklogTask | undefined
  >();

  const showBacklogModal = editedBacklogTask !== undefined;
  const updateTask = usePlanningStore((s) => s.updateTask);
  const addTask = usePlanningStore((s) => s.addTask);
  const consumeNextId = usePlanningStore((s) => s.consumeNextId);

  const windowRef = useRef(windowData);
  windowRef.current = windowData;
  const milestoneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const quickNoteRef = useRef<HTMLTextAreaElement | null>(null);

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

  useTimelineShortcuts({
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

  const visibleCompletedMilestones = useMemo(
    () =>
      showCompletedMilestones
        ? milestones.filter((milestone) => milestone.completed)
        : [],
    [milestones, showCompletedMilestones]
  );

  const completedCount = milestones.length - activeMilestones.length;

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

      <Tabs defaultValue="milestones">
        <Tabs.List>
          <Tabs.Tab value="milestones">Milestones</Tabs.Tab>
          <Tabs.Tab value="events">Events</Tabs.Tab>
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
                    onToggleDone={() =>
                      editItem({ ...item, completed: !item.completed })
                    }
                    onDelete={() => deleteWithUndo(item)}
                    onEditBacklogTask={setEditedBacklogTask}
                  />
                </Box>
              );
            })}

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

            {!showCompletedMilestones && completedCount > 0 && (
              <Box className={classes.cardContainer}>
                <CollapsedMilestonesCard
                  key="collapsed-milestones"
                  count={completedCount}
                  onClick={toggleShowCompletedMilestones}
                />
              </Box>
            )}

            {visibleCompletedMilestones.map((item) => (
              <Box key={item.id} className={classes.cardContainer}>
                <MilestoneCard
                  item={item}
                  isSelected={false}
                  activeIdx={-1}
                  milestoneRef={() => {}}
                  onSelect={() => {}}
                  onEdit={() => {
                    setEditingMilestone(item);
                    setMilestoneModalOpen(true);
                  }}
                  onToggleDone={() =>
                    editItem({ ...item, completed: !item.completed })
                  }
                  onDelete={() => deleteWithUndo(item)}
                  onEditBacklogTask={setEditedBacklogTask}
                />
              </Box>
            ))}
          </Stack>

          {visibleSoonEvents.length > 0 && (
            <Stack gap="xs" mt="md">
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
                    onDismissSuggestion={() => dismissSuggestedEvent(event.id)}
                  />
                </Box>
              ))}
            </Stack>
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
      </Tabs>
    </Box>
  );
}
