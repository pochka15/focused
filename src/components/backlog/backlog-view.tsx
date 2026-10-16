import { groupIntoSections } from "@/lib/backlog/backlog-sections";
import { toTimelineMilestoneFromBacklog } from "@/lib/backlog/backlog-to-timeline";
import type { BacklogTask } from "@/lib/stores/backlog-store";
import { useBacklogStore } from "@/lib/stores/backlog-store";
import { useTimelineStore } from "@/lib/stores/timeline-store";
import { showUndoNotification } from "@/lib/notifications/show-undo-notification";
import { isMilestone, type Milestone } from "@/lib/timeline/timeline-models";
import { Window as W, type UiWindow } from "@/shared-lib/shortcuts/window";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { cn, tw } from "@/lib/utils";
import { ListPlus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import { BacklogModal } from "./backlog-modal";
import { BacklogPostponedOrDone } from "./backlog-postponed-or-done";
import { BacklogTaskCard } from "./backlog-task-card";
import {
  useBacklogShortcuts,
  type BacklogColumn,
} from "./use-backlog-shortcuts";

const sectionTitleStyles = tw`
  flex items-center gap-2 text-[0.625rem] font-semibold tracking-widest
  text-muted-foreground uppercase
`;

const queueColumnStyles = tw`
  flex flex-col gap-3 bg-muted/30 p-3 transition-shadow lg:sticky lg:top-14
`;

export function BacklogView() {
  const tasks = useBacklogStore((s) => s.tasks);
  const queue = useBacklogStore((s) => s.queue);
  const addTask = useBacklogStore((s) => s.addTask);
  const updateTask = useBacklogStore((s) => s.updateTask);
  const removeTask = useBacklogStore((s) => s.removeTask);
  const consumeNextId = useBacklogStore((s) => s.consumeNextId);
  const enqueue = useBacklogStore((s) => s.enqueue);
  const dequeue = useBacklogStore((s) => s.dequeue);
  const setQueue = useBacklogStore((s) => s.setQueue);
  const swapInQueue = useBacklogStore((s) => s.swapInQueue);
  const timelineItems = useTimelineStore((s) => s.items);
  const addTimelineItem = useTimelineStore((s) => s.addItem);
  const editTimelineItem = useTimelineStore((s) => s.editItem);

  // Periodic re-render so snoozed tasks wake up without interaction.
  const [nowTick, setNowTick] = useState(() => Date.now());

  const [column, setColumn] = useState<BacklogColumn>("sections");
  const [isQueueing, setIsQueueing] = useState(false);
  const [sectionsWindow, setSectionsWindow] = useState<UiWindow>(W.create());
  const [queueWindow, setQueueWindow] = useState<UiWindow>(W.create());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<BacklogTask | undefined>();

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const { queueTasks, sections, postponedTasks, doneTasks } = useMemo(() => {
    const active = tasks.filter((task) => !task.isPostponed && !task.isDone);
    const activeById = new Map(active.map((task) => [task.id, task]));
    const queueTasks = queue
      .map((id) => activeById.get(id))
      .filter(Boolean) as BacklogTask[];
    const queued = new Set(queueTasks.map((task) => task.id));
    return {
      queueTasks,
      sections: groupIntoSections(
        active.filter((t) => !queued.has(t.id)),
        nowTick
      ),
      postponedTasks: tasks.filter((task) => task.isPostponed && !task.isDone),
      doneTasks: tasks.filter((task) => task.isDone),
    };
  }, [tasks, queue, nowTick]);

  const { sectionTasks, sectionStarts } = useMemo(() => {
    const sectionStarts: number[] = [];
    const sectionTasks: BacklogTask[] = [];
    for (const section of sections) {
      sectionStarts.push(sectionTasks.length);
      sectionTasks.push(...section.tasks);
    }
    return { sectionTasks, sectionStarts };
  }, [sections]);

  const cardRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    setSectionsWindow((w) => W.shrinkTo(w, sectionTasks.length));
  }, [sectionTasks.length]);

  useEffect(() => {
    setQueueWindow((w) => W.shrinkTo(w, queueTasks.length));
  }, [queueTasks.length]);

  const focusedTask =
    column === "queue"
      ? queueTasks[queueWindow.cursor]
      : sectionTasks[sectionsWindow.cursor];

  useEffect(() => {
    if (focusedTask) {
      cardRefs.current
        .get(focusedTask.id)
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedTask]);

  const snoozeTask = (task: BacklogTask, minutes: number) => {
    const snoozeUntil = new Date(Date.now() + minutes * 60_000).toISOString();
    updateTask({ ...task, snoozeUntil });
  };

  const clearTaskSnooze = (task: BacklogTask) => {
    if (!task.snoozeUntil) return;
    updateTask({ ...task, snoozeUntil: null });
  };

  const deleteWithUndo = (task: BacklogTask) => {
    removeTask(task.id);
    showUndoNotification(
      `del-task-${task.id}`,
      `"${task.name}" removed`,
      () => addTask(task),
      "bottom-left"
    );
  };

  const pushTaskToTimeline = (task: BacklogTask, pushFront = false) => {
    const openMilestones = timelineItems.filter(
      (item) => isMilestone(item) && !item.completed
    ) as Milestone[];

    const targetMilestone = openMilestones[openMilestones.length - 1];

    if (targetMilestone) {
      if ((targetMilestone.taskIds ?? []).includes(task.id)) {
        toast.warning(`Already linked to "${targetMilestone.name}"`, {
          description: `#${task.id} ${task.name}`,
        });
        return;
      }

      editTimelineItem({
        ...targetMilestone,
        taskIds: [...(targetMilestone.taskIds ?? []), task.id],
      });
      dequeue(task.id);
      toast.success(`Linked to "${targetMilestone.name}"`, {
        description: `#${task.id} ${task.name}`,
      });
      return;
    }

    addTimelineItem(toTimelineMilestoneFromBacklog(task), pushFront);
    dequeue(task.id);
    toast.success("Added to timeline", {
      description: `#${task.id} ${task.name}`,
    });
  };

  const dequeueAll = () => {
    if (queue.length === 0) return;
    const previous = [...queue];
    setQueue([]);
    showUndoNotification(
      "dequeue-all",
      "Queue cleared",
      () => setQueue(previous),
      "bottom-left"
    );
  };

  const handleDeleteAllDone = () => {
    tasks.filter((t) => t.isDone).forEach((task) => removeTask(task.id));
  };

  const postponeTask = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) updateTask({ ...task, isPostponed: true });
  };

  const activateTask = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) updateTask({ ...task, isPostponed: false });
  };

  const handleSubmit = (values: Omit<BacklogTask, "id">) => {
    if (editingTask) {
      updateTask({ ...values, id: editingTask.id });
    } else {
      addTask({ ...values, id: consumeNextId() });
    }
    setEditingTask(undefined);
  };

  const openModal = (task?: BacklogTask) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const toggleQueueing = () => {
    setIsQueueing((v) => !v);
    setColumn("sections");
  };

  useBacklogShortcuts({
    modalOpen,
    isQueueing,
    setIsQueueing,
    column,
    setColumn,
    sectionTasks,
    sectionStarts,
    queueTasks,
    sectionsWindow,
    setSectionsWindow,
    queueWindow,
    setQueueWindow,
    openModal,
    pushTaskToTimeline,
    postponeTask,
    enqueue,
    dequeue,
    dequeueAll,
    swapInQueue,
  });

  const setCardRef = (id: number) => (el: HTMLDivElement | null) => {
    cardRefs.current.set(id, el);
  };

  return (
    <div>
      <BacklogModal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(undefined);
        }}
        onSubmit={handleSubmit}
        editing={editingTask}
      />

      <div className="sticky top-0 z-10 -mx-4 mb-4 flex items-center justify-between gap-4 bg-background/90 px-4 py-2 backdrop-blur-sm">
        <h2 className="text-lg font-semibold tracking-wider uppercase">
          Backlog
        </h2>
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant={isQueueing ? "default" : "outline"}
            onClick={toggleQueueing}
          >
            <ListPlus data-icon="inline-start" />
            {isQueueing ? "Queueing…" : "Queue"}
          </Button>
          <Button size="xs" variant="outline" onClick={() => openModal()}>
            <Plus data-icon="inline-start" />
            New
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div className="flex flex-col gap-6">
          {sections.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {tasks.length > 0 ? (
                "Everything is queued or parked."
              ) : (
                <>
                  No tasks yet. Press <Kbd>n</Kbd> to add one.
                </>
              )}
            </p>
          )}
          {sections.map((section, sectionIdx) => {
            const start = sectionStarts[sectionIdx] ?? 0;
            const Icon = section.icon;
            return (
              <section key={section.tag} className="flex flex-col gap-2">
                <p className={sectionTitleStyles}>
                  <Icon strokeWidth={1.5} className="size-3.5" />
                  {section.title}
                  <span className="font-mono">({section.tasks.length})</span>
                </p>
                {section.tasks.map((task, idx) => {
                  const flatIdx = start + idx;
                  return (
                    <BacklogTaskCard
                      key={task.id}
                      task={task}
                      isSelected={
                        column === "sections" &&
                        flatIdx === sectionsWindow.cursor
                      }
                      isQueueing={isQueueing}
                      cardRef={setCardRef(task.id)}
                      onSelect={() => {
                        setColumn("sections");
                        setSectionsWindow((w) => W.withCursor(w, flatIdx));
                      }}
                      onEdit={() => openModal(task)}
                      onEnqueue={
                        isQueueing ? () => enqueue(task.id) : undefined
                      }
                      onPostpone={() => postponeTask(task.id)}
                      onPushToTimeline={() => pushTaskToTimeline(task)}
                      onSnooze={(minutes) => snoozeTask(task, minutes)}
                      onClearSnooze={() => clearTaskSnooze(task)}
                      onDelete={() => deleteWithUndo(task)}
                    />
                  );
                })}
              </section>
            );
          })}
        </div>

        <aside
          className={cn(
            queueColumnStyles,
            column === "queue" && "ring-1 ring-foreground/25",
            isQueueing &&
              "ring-0 outline-1 outline-foreground/60 outline-dashed"
          )}
        >
          <div className="flex items-center justify-between">
            <p className={sectionTitleStyles}>
              Queue
              <span className="font-mono">({queueTasks.length})</span>
            </p>
            {isQueueing && (
              <Badge>
                <ListPlus data-icon="inline-start" />
                queueing
              </Badge>
            )}
          </div>
          {queueTasks.length === 0 && (
            <p className="text-xs text-muted-foreground/60 italic">
              Empty. Press <Kbd>q</Kbd> to start queueing.
            </p>
          )}
          {queueTasks.map((task, idx) => (
            <BacklogTaskCard
              key={task.id}
              task={task}
              showTagIcon
              isSelected={column === "queue" && idx === queueWindow.cursor}
              cardRef={setCardRef(task.id)}
              onSelect={() => {
                setColumn("queue");
                setQueueWindow((w) => W.withCursor(w, idx));
              }}
              onEdit={() => openModal(task)}
              onPushToTimeline={() => pushTaskToTimeline(task)}
              onDequeue={() => dequeue(task.id)}
            />
          ))}
        </aside>
      </div>

      <BacklogPostponedOrDone
        postponedTasks={postponedTasks}
        doneTasks={doneTasks}
        onActivate={activateTask}
        onDelete={deleteWithUndo}
        onDeleteDone={handleDeleteAllDone}
      />
    </div>
  );
}
