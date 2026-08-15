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
import { Box, Button, Group, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Plus } from "lucide-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { BacklogGridNarrowView } from "./backlog-grid-narrow-view";
import { BacklogGridWideView } from "./backlog-grid-wide-view";
import { BacklogModal } from "./backlog-modal";
import { BacklogPostponedOrDone } from "./backlog-postponed-or-done";
import { useBacklogShortcuts } from "./use-backlog-shortcuts";
import { useAllTasksSorted, useTasksByGroups } from "./use-backlog-groups";
import classes from "./backlog-view.module.css";

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
        notifications.show({
          title: `Already linked to "${targetMilestone.name}"`,
          message: `#${task.id} ${task.name}`,
          color: "yellow",
        });
        return;
      }

      editTimelineItem({
        ...targetMilestone,
        taskIds: [...(targetMilestone.taskIds ?? []), task.id],
      });
      notifications.show({
        title: `Linked to "${targetMilestone.name}"`,
        message: `#${task.id} ${task.name}`,
        color: "teal",
      });
      return;
    }

    addTimelineItem(toTimelineMilestoneFromBacklog(task), pushFront);
    notifications.show({
      title: "Added to timeline",
      message: `#${task.id} ${task.name}`,
      color: "teal",
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
    <Box>
      <BacklogModal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(undefined);
        }}
        onSubmit={handleSubmit}
        editing={editingTask}
      />

      <Box className={classes.stickyHeader}>
        <Group justify="space-between" mb="sm">
          <Title order={3}>Backlog</Title>
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              leftSection={<Plus size={14} />}
              onClick={() => openModal()}
            >
              New
            </Button>
          </Group>
        </Group>

        <Group gap={6} mb="md" align="center" wrap="wrap">
          <button
            className={zenMode ? classes.filterPillActive : classes.filterPill}
            onClick={() => {
              if (!zenMode) setRouteView("zen");
            }}
          >
            Zen
          </button>
          <button
            className={!zenMode ? classes.filterPillActive : classes.filterPill}
            onClick={() => {
              if (zenMode) setRouteView("full");
            }}
          >
            Full
          </button>
        </Group>
      </Box>

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
    </Box>
  );
}
