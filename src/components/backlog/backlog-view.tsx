import { toTimelineMilestoneFromBacklog } from "@/lib/backlog/backlog-to-timeline";
import type { BacklogTask } from "@/lib/stores/backlog-store";
import { useBacklogStore } from "@/lib/stores/backlog-store";
import { useTimelineStore } from "@/lib/stores/timeline-store";
import {
  BACKLOG_GRID_COLUMNS,
  BACKLOG_GROUPS,
  type GridGroup,
  useBacklogGridStore,
} from "@/lib/stores/backlog-grid-store";
import { showUndoNotification } from "@/lib/notifications/show-undo-notification";
import {
  getBacklogRouteSearch,
  getBacklogRouteView,
  type BacklogRouteView,
} from "@/lib/backlog/backlog-route-mode";
import { isMilestone, type Milestone } from "@/lib/timeline/timeline-models";
import {
  Window as W,
  Window2D,
  type UiWindow,
} from "@/shared-lib/shortcuts/window";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { BacklogGridNarrowView } from "./backlog-grid-narrow-view";
import { BacklogGridWideView } from "./backlog-grid-wide-view";
import { BacklogModal } from "./backlog-modal";
import { BacklogPostponedOrDone } from "./backlog-postponed-or-done";
import { useBacklogShortcuts } from "./use-backlog-shortcuts";
import { useAllTasksSorted, useTasksByGroups } from "./use-backlog-groups";

const GROUPS = BACKLOG_GROUPS;
const FIRST_GROUP = GROUPS[0] ?? 1;

export function BacklogView() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search });
  const tasks = useBacklogStore((s) => s.tasks);
  const addTask = useBacklogStore((s) => s.addTask);
  const updateTask = useBacklogStore((s) => s.updateTask);
  const removeTask = useBacklogStore((s) => s.removeTask);
  const consumeNextId = useBacklogStore((s) => s.consumeNextId);
  const timelineItems = useTimelineStore((s) => s.items);
  const addTimelineItem = useTimelineStore((s) => s.addItem);
  const editTimelineItem = useTimelineStore((s) => s.editItem);

  const assignTask = useBacklogGridStore((s) => s.assignTask);
  const removeTaskFromGrid = useBacklogGridStore((s) => s.removeTask);
  const swapWithin = useBacklogGridStore((s) => s.swapWithin);

  const isWide = useMediaQuery("(min-width: 900px)") ?? false;

  // Periodic re-render so snoozed badges expire without interaction.
  const [, setNowTick] = useState(() => Date.now());
  const zenMode = pathname.startsWith("/backlog")
    ? getBacklogRouteView(search) === "zen"
    : false;

  const [window2D, setWindow2D] = useState(() =>
    Window2D.create<GridGroup>(GROUPS)
  );
  const [isMoving, setIsMoving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<BacklogTask | undefined>();

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const { activeBacklogTasks, postponedTasks, doneTasks } = useMemo(() => {
    const activeBacklogTasks = tasks.filter(
      (task) => !task.isPostponed && !task.isDone
    );
    const postponedTasks = tasks.filter(
      (task) => task.isPostponed && !task.isDone
    );
    const doneTasks = tasks.filter((task) => task.isDone);
    return { activeBacklogTasks, postponedTasks, doneTasks };
  }, [tasks]);

  const groupedTasksBase = useTasksByGroups(activeBacklogTasks, GROUPS);
  const allSorted = useAllTasksSorted(activeBacklogTasks);

  const focusedGroup = window2D.focusedGroup;
  const windows = window2D.windows;
  const cardRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  const groupColumns = useMemo(
    () =>
      Array.from({ length: BACKLOG_GRID_COLUMNS }, (_, colIdx) =>
        GROUPS.filter((_, idx) => idx % BACKLOG_GRID_COLUMNS === colIdx)
      ),
    []
  );

  const getWindow = (group: GridGroup): UiWindow =>
    windows[group] ?? W.create();
  const getTasksForGroup = (group: GridGroup): BacklogTask[] =>
    groupedTasksBase[group] ?? [];

  const focusedTasks = isWide ? getTasksForGroup(focusedGroup) : allSorted;
  const focusedCursor = isWide
    ? getWindow(focusedGroup).cursor
    : getWindow(FIRST_GROUP).cursor;

  useEffect(() => {
    const sizes = Object.fromEntries(
      GROUPS.map((group) => [group, getTasksForGroup(group).length])
    ) as Record<GridGroup, number>;
    setWindow2D((state) => Window2D.shrinkAllTo(state, sizes));
  }, [groupedTasksBase]);

  useEffect(() => {
    const task = focusedTasks[focusedCursor];
    if (task) {
      cardRefs.current.get(task.id)?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedCursor, focusedGroup, focusedTasks]);

  const setWindowFor = (group: GridGroup, updater: (w: UiWindow) => UiWindow) =>
    setWindow2D((state) => Window2D.updateWindow(state, group, updater));

  const toggleTaskNext = (task: BacklogTask) => {
    updateTask({ ...task, isNext: !task.isNext });
  };

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
    removeTaskFromGrid(task.id);
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
      toast.success(`Linked to "${targetMilestone.name}"`, {
        description: `#${task.id} ${task.name}`,
      });
      return;
    }

    addTimelineItem(toTimelineMilestoneFromBacklog(task), pushFront);
    toast.success("Added to timeline", {
      description: `#${task.id} ${task.name}`,
    });
  };

  const handleDeleteAllDone = () => {
    tasks
      .filter((t) => t.isDone)
      .forEach((task) => {
        removeTask(task.id);
        removeTaskFromGrid(task.id);
      });
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
      const id = consumeNextId();
      addTask({ ...values, id });
      if (isWide && focusedGroup !== 1) assignTask(id, focusedGroup);
    }
    setEditingTask(undefined);
  };

  const openModal = (task?: BacklogTask) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const setRouteView = (view: BacklogRouteView) => {
    void navigate({
      to: "/backlog",
      search: () => getBacklogRouteSearch(view),
    });
    setIsMoving(false);
  };

  useBacklogShortcuts({
    modalOpen,
    zenMode,
    isWide,
    isMoving,
    focusedGroup,
    focusedTasks,
    allSorted,
    getWindow,
    setIsMoving,
    setWindow2D,
    setWindowFor,
    setRouteView,
    openModal,
    assignTask,
    swapWithin,
    pushTaskToTimeline,
    postponeTask,
    toggleTaskNext,
  });

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
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold tracking-wider uppercase">
            Backlog
          </h2>
          <ToggleGroup
            size="sm"
            spacing={0}
            value={[zenMode ? "zen" : "full"]}
            onValueChange={(value) => {
              const next = value[0];
              if (next === "zen" && !zenMode) setRouteView("zen");
              if (next === "full" && zenMode) setRouteView("full");
            }}
          >
            <ToggleGroupItem value="zen">Zen</ToggleGroupItem>
            <ToggleGroupItem value="full">Full</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <Button size="xs" variant="outline" onClick={() => openModal()}>
          <Plus data-icon="inline-start" />
          New
        </Button>
      </div>

      {!isWide ? (
        <BacklogGridNarrowView
          allSorted={allSorted}
          hasAnyTasks={tasks.length > 0}
          mobileWindow={getWindow(FIRST_GROUP)}
          zenMode={zenMode}
          cardRefs={cardRefs}
          onSelectTask={(windowState) =>
            setWindowFor(FIRST_GROUP, () => windowState)
          }
          onEditTask={openModal}
          onPostponeTask={postponeTask}
          onPushTaskToTimeline={pushTaskToTimeline}
          onToggleTaskNext={toggleTaskNext}
          onSnoozeTask={snoozeTask}
          onClearTaskSnooze={clearTaskSnooze}
          onDeleteTask={deleteWithUndo}
        />
      ) : (
        <BacklogGridWideView
          groupColumns={groupColumns}
          focusedGroup={focusedGroup}
          groupedTasks={groupedTasksBase}
          windows={windows}
          isMoving={isMoving}
          zenMode={zenMode}
          cardRefs={cardRefs}
          onSelectTask={(group, idx) =>
            setWindowFor(group, (windowState) => W.withCursor(windowState, idx))
          }
          onFocusGroup={(group) =>
            setWindow2D((state) => Window2D.setFocusedGroup(state, group))
          }
          onEditTask={openModal}
          onPostponeTask={(task) => postponeTask(task.id)}
          onPushTaskToTimeline={pushTaskToTimeline}
          onToggleTaskNext={toggleTaskNext}
          onSnoozeTask={snoozeTask}
          onClearTaskSnooze={clearTaskSnooze}
          onDeleteTask={deleteWithUndo}
        />
      )}

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
