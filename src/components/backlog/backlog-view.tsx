import {
  computeSmartGroups,
  type SmartGroup,
} from "@/lib/backlog/smart-groups";
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
} from "@/lib/backlog/backlog-route-mode";
import { isMilestone } from "@/lib/timeline/timeline-models";
import {
  Window as W,
  Window2D,
  type UiWindow,
} from "@/shared-lib/shortcuts/window";
import { SNOOZE_PRESETS } from "@/lib/backlog/snooze-presets";
import { Box, Button, Group, Text, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Plus } from "lucide-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { BacklogGridNarrowView } from "./backlog-grid-narrow-view";
import { BacklogGridWideView } from "./backlog-grid-wide-view";
import { BacklogModal } from "./backlog-modal";
import { BacklogPostponedOrDone } from "./backlog-postponed-or-done";
import { BacklogTinderView } from "./backlog-tinder-view";
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

  const assignTask = useBacklogGridStore((s) => s.assignTask);
  const removeTaskFromGrid = useBacklogGridStore((s) => s.removeTask);
  const swapWithin = useBacklogGridStore((s) => s.swapWithin);

  const isWide = useMediaQuery("(min-width: 900px)") ?? false;

  const [nowTick, setNowTick] = useState(() => Date.now());
  const tinderView = pathname.startsWith("/backlog")
    ? getBacklogRouteView(search) === "tinder"
    : false;

  const [window2D, setWindow2D] = useState(() =>
    Window2D.create<GridGroup>(GROUPS)
  );
  const [isMoving, setIsMoving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<BacklogTask | undefined>();

  const [focusedSmartGroupIdx, setFocusedSmartGroupIdx] = useState(0);
  const [expandedSmartGroupId, setExpandedSmartGroupId] = useState<
    SmartGroup["id"] | null
  >(null);
  const [snoozeTargetTaskId, setSnoozeTargetTaskId] = useState<number | null>(
    null
  );
  const [tinderWindow, setTinderWindow] = useState<UiWindow>(() => W.create());

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

  const smartGroups = useMemo(
    () => computeSmartGroups(activeBacklogTasks, nowTick),
    [activeBacklogTasks, nowTick]
  );

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

  const expandedGroup =
    expandedSmartGroupId === null
      ? null
      : (smartGroups.find((group) => group.id === expandedSmartGroupId) ??
        null);

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

  useEffect(() => {
    if (smartGroups.length === 0) {
      setFocusedSmartGroupIdx(0);
      setExpandedSmartGroupId(null);
      return;
    }

    if (focusedSmartGroupIdx > smartGroups.length - 1) {
      setFocusedSmartGroupIdx(smartGroups.length - 1);
    }

    if (
      expandedSmartGroupId &&
      !smartGroups.some((group) => group.id === expandedSmartGroupId)
    ) {
      setExpandedSmartGroupId(null);
    }
  }, [smartGroups, focusedSmartGroupIdx, expandedSmartGroupId]);

  useEffect(() => {
    setTinderWindow((windowState) =>
      W.shrinkTo(windowState, expandedGroup?.tasks.length ?? 0)
    );
  }, [expandedGroup]);

  const setWindowFor = (group: GridGroup, updater: (w: UiWindow) => UiWindow) =>
    setWindow2D((state) => Window2D.updateWindow(state, group, updater));

  const toggleTaskNext = (task: BacklogTask) => {
    updateTask({ ...task, isNext: !task.isNext });
  };

  const snoozeTask = (task: BacklogTask, minutes: number) => {
    const snoozeUntil = new Date(Date.now() + minutes * 60_000).toISOString();
    updateTask({ ...task, snoozeUntil });
  };

  const applySnoozeByTaskId = (taskId: number, minutes: number) => {
    const task = tasks.find((candidate) => candidate.id === taskId);
    if (!task) return;
    snoozeTask(task, minutes);
  };

  const clearTaskSnooze = (task: BacklogTask) => {
    if (!task.snoozeUntil) return;
    updateTask({ ...task, snoozeUntil: null });
  };

  const clearSnoozeByTaskId = (taskId: number) => {
    const task = tasks.find((candidate) => candidate.id === taskId);
    if (!task) return;
    clearTaskSnooze(task);
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
    const alreadyLinked = timelineItems.some(
      (item) =>
        isMilestone(item) &&
        !item.completed &&
        (item.taskIds ?? []).includes(task.id)
    );

    if (alreadyLinked) {
      notifications.show({
        title: "Already on timeline",
        message: `#${task.id} ${task.name}`,
        color: "yellow",
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

  const setRouteView = (view: "grid" | "tinder") => {
    void navigate({
      to: "/backlog",
      search: () => getBacklogRouteSearch(view),
    });
    setIsMoving(false);
    setExpandedSmartGroupId(null);
    setSnoozeTargetTaskId(null);
  };

  const getFocusedBacklogTask = (): BacklogTask | undefined => {
    const curTasks = isWide ? focusedTasks : allSorted;
    const cursorNow = isWide
      ? getWindow(focusedGroup).cursor
      : getWindow(FIRST_GROUP).cursor;
    return curTasks[cursorNow];
  };

  useBacklogShortcuts({
    modalOpen,
    tinderView,
    isWide,
    isMoving,
    snoozeTargetTaskId,
    smartGroups,
    focusedSmartGroupIdx,
    expandedGroup,
    focusedGroup,
    focusedTasks,
    allSorted,
    tinderWindow,
    getWindow,
    setIsMoving,
    setSnoozeTargetTaskId,
    setFocusedSmartGroupIdx,
    setExpandedSmartGroupId,
    setTinderWindow,
    setWindow2D,
    setWindowFor,
    setRouteView,
    openModal,
    assignTask,
    swapWithin,
    pushTaskToTimeline,
    postponeTask,
    toggleTaskNext,
    applySnoozeByTaskId,
    clearSnoozeByTaskId,
    getFocusedBacklogTask,
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
            className={
              tinderView ? classes.filterPillActive : classes.filterPill
            }
            onClick={() => {
              if (!tinderView) setRouteView("tinder");
            }}
          >
            Tinder
          </button>
          <button
            className={
              !tinderView ? classes.filterPillActive : classes.filterPill
            }
            onClick={() => {
              if (tinderView) setRouteView("grid");
            }}
          >
            Grid
          </button>
        </Group>

        {snoozeTargetTaskId !== null && (
          <Group gap={6} mb="sm" wrap="wrap">
            <Text size="xs" c="dimmed">
              Snooze picker:
            </Text>
            {SNOOZE_PRESETS.map((preset) => (
              <Button
                key={preset.key}
                size="compact-xs"
                variant="light"
                onClick={() => {
                  applySnoozeByTaskId(snoozeTargetTaskId, preset.minutes);
                  setSnoozeTargetTaskId(null);
                }}
              >
                {preset.key}:{preset.label}
              </Button>
            ))}
            <Button
              size="compact-xs"
              color="red"
              variant="light"
              onClick={() => {
                clearSnoozeByTaskId(snoozeTargetTaskId);
                setSnoozeTargetTaskId(null);
              }}
            >
              0:clear
            </Button>
            <Text size="xs" c="dimmed">
              Esc to cancel
            </Text>
          </Group>
        )}
      </Box>

      {tinderView ? (
        <BacklogTinderView
          smartGroups={smartGroups}
          focusedSmartGroupIdx={focusedSmartGroupIdx}
          expandedSmartGroupId={expandedSmartGroupId}
          expandedGroup={expandedGroup}
          tinderCursor={tinderWindow.cursor}
          cardRefs={cardRefs}
          onFocusSmartGroupIdx={setFocusedSmartGroupIdx}
          onExpandSmartGroup={(groupId) => {
            setExpandedSmartGroupId(groupId);
            setTinderWindow((windowState) => W.withCursor(windowState, 0));
          }}
          onSelectExpandedTask={(idx) =>
            setTinderWindow((windowState) => W.withCursor(windowState, idx))
          }
          onEditTask={openModal}
          onPostponeTask={postponeTask}
          onPushTaskToTimeline={pushTaskToTimeline}
          onToggleTaskNext={toggleTaskNext}
          onSnoozeTask={snoozeTask}
          onClearTaskSnooze={clearTaskSnooze}
          onDeleteTask={deleteWithUndo}
        />
      ) : !isWide ? (
        <BacklogGridNarrowView
          allSorted={allSorted}
          hasAnyTasks={tasks.length > 0}
          mobileWindow={getWindow(FIRST_GROUP)}
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
