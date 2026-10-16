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
import { Window as W, type UiWindow } from "@/shared-lib/shortcuts/window";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { EventModal } from "./event-modal";
import { MilestoneCard } from "./milestone-card";
import { cycleTask } from "./milestone-card-utils";
import { MilestoneClimb } from "./milestone-climb";
import { MilestonesStatsBar } from "./milestones-stats-bar";
import { MilestoneModal } from "./milestone-modal";
import { QueuePickRows } from "./queue-pick-rows";
import { QuickNoteCard } from "./quick-note-card";
import { TimelineEventRow } from "./timeline-event-row";
import { TimelineNotesTab } from "./timeline-notes-tab";
import { TimelineSectionHeader } from "./timeline-section-header";
import { createTasksMap, getDoneTasks } from "./timeline-view-utils";
import { useTimelineShortcuts } from "./use-timeline-shortcuts";

type TimelineTab = "milestones" | "completed" | "events" | "notes";

const MARK_TASKS_DONE_MESSAGE = "Ssup with tasks?";
const QUEUE_PICK_SIZE = 2;
const EMPTY_QUEUE_AUTO_HIDE_MS = 1200;

const EmptyHint = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-3 text-sm text-muted-foreground">{children}</p>
);

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

  const [creatingBacklogTask, setCreatingBacklogTask] = useState(false);
  const [queuePickOpen, setQueuePickOpen] = useState(false);

  const showBacklogModal =
    editedBacklogTask !== undefined || creatingBacklogTask;
  const closeBacklogModal = () => {
    setEditedBacklogTask(undefined);
    setCreatingBacklogTask(false);
  };
  const updateTask = useBacklogStore((s) => s.updateTask);
  const queue = useBacklogStore((s) => s.queue);
  const dequeue = useBacklogStore((s) => s.dequeue);
  const addTask = useBacklogStore((s) => s.addTask);
  const consumeNextId = useBacklogStore((s) => s.consumeNextId);
  const backlog = useBacklogStore((s) => s.tasks);
  const allTasksMap = useMemo(() => createTasksMap(backlog), [backlog]);

  const queuePickTasks = useMemo(
    () =>
      queue
        .map((id) => allTasksMap.get(id))
        .filter(
          (task): task is BacklogTask =>
            !!task && !task.isDone && !task.isPostponed
        )
        .slice(0, QUEUE_PICK_SIZE),
    [queue, allTasksMap]
  );

  useEffect(() => {
    if (!queuePickOpen || queuePickTasks.length > 0) return;
    const timer = window.setTimeout(
      () => setQueuePickOpen(false),
      EMPTY_QUEUE_AUTO_HIDE_MS
    );
    return () => window.clearTimeout(timer);
  }, [queuePickOpen, queuePickTasks.length]);

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
        type: "task",
        tag: "other",
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

  const pickFromQueue = (task: BacklogTask) => {
    const milestone = activeMilestones[windowData.cursor];
    if (!milestone) return;
    const taskIds = milestone.taskIds ?? [];
    if (!taskIds.includes(task.id)) {
      editItem({ ...milestone, taskIds: [...taskIds, task.id] });
    }
    dequeue(task.id);
    toast.success(`Linked to "${milestone.name}"`, {
      description: `#${task.id} ${task.name}`,
    });
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
    onNewBacklogTask: () => setCreatingBacklogTask(true),
    queuePickOpen,
    setQueuePickOpen,
    queuePickTasks,
    onPickFromQueue: pickFromQueue,
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
    useSuggestedEvent: markSuggestedEventUsed,
    dismissSuggestedEvent,
  } = useSoonEvents(events);

  const addSuggestedEvent = (event: TimelineEvent) => {
    addItem(toSuggestedMilestone(event));
    archiveItem(event.id);
    markSuggestedEventUsed(event);
  };

  return (
    <div>
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
        onClose={closeBacklogModal}
        onSubmit={(values) => {
          if (editedBacklogTask) {
            updateTask({ ...editedBacklogTask, ...values });
          } else {
            const id = consumeNextId();
            addTask({ id, ...values });
            toast.success("Added to inbox", {
              description: `#${id} ${values.name}`,
            });
          }
          closeBacklogModal();
        }}
        editing={editedBacklogTask}
        simple={creatingBacklogTask}
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
        onValueChange={(value) =>
          setActiveTab((value as TimelineTab) ?? "milestones")
        }
      >
        <TabsList variant="line">
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones" keepMounted className="pt-4">
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
            <EmptyHint>
              No active milestones. Press <Kbd>n</Kbd> to add one.
            </EmptyHint>
          )}

          <div className="flex max-w-4xl flex-col gap-2">
            {visibleActiveMilestones.map((item) => {
              const isSelected =
                !item.completed && selectedMilestone?.id === item.id;
              const activeIdx = activeMilestones.findIndex(
                (m) => m.id === item.id
              );
              return (
                <Fragment key={item.id}>
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
                  {isSelected && queuePickOpen && (
                    <QueuePickRows
                      tasks={queuePickTasks}
                      onPick={(task) => {
                        pickFromQueue(task);
                        setQueuePickOpen(false);
                      }}
                    />
                  )}
                </Fragment>
              );
            })}

            {visibleSoonEvents.map(({ event }) => (
              <MilestoneCard
                key={event.id}
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
            ))}

            <QuickNoteCard
              key="timeline-quick-note"
              textareaRef={(el) => {
                quickNoteRef.current = el;
              }}
              value={quickNote}
              onChange={setQuickNote}
            />
          </div>

          {activeTab === "milestones" && <MilestonesStatsBar />}
        </TabsContent>

        <TabsContent value="completed" keepMounted className="pt-4">
          <TimelineSectionHeader
            title="Completed Milestones"
            hint=""
            buttonLabel=""
            onButtonClick={() => {}}
          />

          {completedMilestones.length > 0 && (
            <div className="mb-2 flex justify-end">
              <Button
                size="xs"
                variant="destructive"
                onClick={handleDeleteAllCompleted}
              >
                <Trash2 data-icon="inline-start" />
                Delete All
              </Button>
            </div>
          )}

          {completedMilestones.length === 0 && (
            <EmptyHint>No completed milestones.</EmptyHint>
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
        </TabsContent>

        <TabsContent value="events" keepMounted className="pt-4">
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
            <EmptyHint>
              No events today. Press <Kbd>v</Kbd> to add one.
            </EmptyHint>
          )}

          <div className="flex max-w-4xl flex-col gap-2">
            {events.map((ev) => (
              <TimelineEventRow
                key={ev.id}
                event={ev}
                onEdit={(event) => {
                  setEditingEvent(event);
                  setEventModalOpen(true);
                }}
                onDelete={deleteWithUndo}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notes" keepMounted className="pt-4">
          <TimelineNotesTab
            active={activeTab === "notes"}
            onClose={focusMilestonesTab}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
