import {
  computeSmartGroups,
  type SmartGroup,
} from "@/lib/backlog/smart-groups";
import { toTimelineMilestoneFromBacklog } from "@/lib/backlog/backlog-to-timeline";
import type { BacklogTask } from "@/lib/stores/planning-store";
import { usePlanningStore } from "@/lib/stores/planning-store";
import { useTimelineStore } from "@/lib/stores/timeline-store";
import {
  BACKLOG_GRID_COLUMNS,
  BACKLOG_GROUPS,
  type GridGroup,
  useBacklogGridStore,
} from "@/lib/stores/backlog-grid-store";
import { showUndoNotification } from "@/lib/notifications/show-undo-notification";
import { DONE_PREFIX } from "@/lib/timeline/timeline-models";
import { isMilestone } from "@/lib/timeline/timeline-models";
import {
  Window as W,
  Window2D,
  type UiWindow,
} from "@/shared-lib/shortcuts/window";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { SNOOZE_PRESETS } from "@/lib/backlog/snooze-presets";
import {
  Badge,
  Box,
  Button,
  Grid,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BacklogGridCell } from "./backlog-grid-cell";
import { BacklogModal } from "./backlog-modal";
import { BacklogPostponed } from "./backlog-postponed";
import { BacklogTaskCard } from "./backlog-task-card";
import { useAllTasksSorted, useTasksByGroups } from "./use-backlog-groups";
import classes from "./backlog-view.module.css";

const GROUPS = BACKLOG_GROUPS;
const FIRST_GROUP = GROUPS[0] ?? 1;

export function BacklogView() {
  const tasks = usePlanningStore((s) => s.tasks);
  const postponedTasks = usePlanningStore((s) => s.postponedTasks);
  const addTask = usePlanningStore((s) => s.addTask);
  const updateTask = usePlanningStore((s) => s.updateTask);
  const removeTask = usePlanningStore((s) => s.removeTask);
  const restoreTask = usePlanningStore((s) => s.restoreTask);
  const postponeTask = usePlanningStore((s) => s.postponeTask);
  const activateTask = usePlanningStore((s) => s.activateTask);
  const removePostponedByNamePrefix = usePlanningStore(
    (s) => s.removePostponedByNamePrefix
  );
  const consumeNextId = usePlanningStore((s) => s.consumeNextId);
  const timelineItems = useTimelineStore((s) => s.items);
  const addTimelineItem = useTimelineStore((s) => s.addItem);

  const assignTask = useBacklogGridStore((s) => s.assignTask);
  const removeTaskFromGrid = useBacklogGridStore((s) => s.removeTask);
  const swapWithin = useBacklogGridStore((s) => s.swapWithin);

  const isWide = useMediaQuery("(min-width: 900px)") ?? false;

  const [nowTick, setNowTick] = useState(() => Date.now());
  const [showOnlyNext, setShowOnlyNext] = useState(false);
  const [tinderMode, setTinderMode] = useState(true);

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

  const smartGroups = useMemo(
    () => computeSmartGroups(tasks, nowTick),
    [tasks, nowTick]
  );

  const backlogTasks = useMemo(
    () => (showOnlyNext ? tasks.filter((task) => task.isNext) : tasks),
    [tasks, showOnlyNext]
  );

  const groupedTasksBase = useTasksByGroups(backlogTasks, GROUPS);
  const allSorted = useAllTasksSorted(backlogTasks);

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
      () => restoreTask(task),
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
    const removedIds = removePostponedByNamePrefix(DONE_PREFIX);
    removedIds.forEach((id) => removeTaskFromGrid(id));
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

  const toggleMode = () => {
    setTinderMode((current) => !current);
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

  useShortcuts({
    name: "backlogView",
    enabled: !modalOpen,
    keys: (key, event) => {
      if (snoozeTargetTaskId !== null) {
        if (key === "Escape") {
          setSnoozeTargetTaskId(null);
          return true;
        }
        if (key === "0") {
          clearSnoozeByTaskId(snoozeTargetTaskId);
          setSnoozeTargetTaskId(null);
          return true;
        }
        const preset = SNOOZE_PRESETS.find((item) => item.key === key);
        if (preset) {
          applySnoozeByTaskId(snoozeTargetTaskId, preset.minutes);
          setSnoozeTargetTaskId(null);
          return true;
        }
      }

      if (key === "q") {
        event.preventDefault();
        toggleMode();
        return true;
      }

      if (key === "n") {
        openModal();
        return true;
      }

      if (tinderMode) {
        const focusedSmartGroup = smartGroups[focusedSmartGroupIdx];

        if (!expandedGroup) {
          if (key === "j" || key === "ArrowDown") {
            event.preventDefault();
            setFocusedSmartGroupIdx((idx) =>
              Math.min(idx + 1, Math.max(0, smartGroups.length - 1))
            );
            return true;
          }

          if (key === "k" || key === "ArrowUp") {
            event.preventDefault();
            setFocusedSmartGroupIdx((idx) => Math.max(0, idx - 1));
            return true;
          }

          if (key === "l" && focusedSmartGroup) {
            setExpandedSmartGroupId(focusedSmartGroup.id);
            setTinderWindow((windowState) => W.withCursor(windowState, 0));
            return true;
          }

          return false;
        }

        const curTasks = expandedGroup.tasks;
        const n = curTasks.length;
        const cursor = tinderWindow.cursor;
        const currentTask = curTasks[cursor];

        if (key === "Escape" || key === "l") {
          setExpandedSmartGroupId(null);
          return true;
        }

        if (key === "j" || key === "ArrowDown") {
          event.preventDefault();
          setTinderWindow((windowState) => W.moveSingle(windowState, 1, n));
          return true;
        }

        if (key === "k" || key === "ArrowUp") {
          event.preventDefault();
          setTinderWindow((windowState) => W.moveSingle(windowState, -1, n));
          return true;
        }

        if (key === "g") {
          setTinderWindow((windowState) => W.first(windowState));
          return true;
        }

        if (key === "shift+G") {
          setTinderWindow((windowState) => W.last(windowState, n));
          return true;
        }

        if (key === "e" && currentTask) {
          openModal(currentTask);
          return true;
        }

        if (key === "p" && currentTask) {
          pushTaskToTimeline(currentTask);
          return true;
        }

        if (key === "shift+P" && currentTask) {
          pushTaskToTimeline(currentTask, true);
          return true;
        }

        if (key === "x" && currentTask) {
          postponeTask(currentTask.id);
          return true;
        }

        if (key === "a" && currentTask) {
          toggleTaskNext(currentTask);
          return true;
        }

        if (key === "z" && currentTask) {
          setSnoozeTargetTaskId(currentTask.id);
          return true;
        }

        return false;
      }

      const curTasks = isWide ? focusedTasks : allSorted;
      const n = curTasks.length;
      const cursorNow = isWide
        ? getWindow(focusedGroup).cursor
        : getWindow(FIRST_GROUP).cursor;

      const numericKey = Number(key);
      const isGroupNumber =
        Number.isInteger(numericKey) && GROUPS.includes(numericKey);

      if (isMoving) {
        if (isGroupNumber) {
          const destGroup = numericKey as GridGroup;
          const task = curTasks[cursorNow];
          if (task) assignTask(task.id, destGroup);
          setIsMoving(false);
          return true;
        }
        setIsMoving(false);
        return false;
      }

      if (isGroupNumber) {
        setWindow2D((state) =>
          Window2D.setFocusedGroup(state, numericKey as GridGroup)
        );
        return true;
      }

      if (key === "l" || key === "ArrowRight") {
        event.preventDefault();
        setWindow2D((state) => Window2D.cycleFocusedGroup(state, 1));
        return true;
      }

      if (key === "h" || key === "ArrowLeft") {
        event.preventDefault();
        setWindow2D((state) => Window2D.cycleFocusedGroup(state, -1));
        return true;
      }

      if (key === "e") {
        const task = curTasks[cursorNow];
        if (task) openModal(task);
        return true;
      }
      if (key === "p") {
        const task = curTasks[cursorNow];
        if (task) pushTaskToTimeline(task);
        return true;
      }
      if (key === "shift+P") {
        const task = curTasks[cursorNow];
        if (task) pushTaskToTimeline(task, true);
        return true;
      }
      if (key === "x") {
        const task = curTasks[cursorNow];
        if (task) postponeTask(task.id);
        return true;
      }
      if (key === "z") {
        const task = getFocusedBacklogTask();
        if (task) setSnoozeTargetTaskId(task.id);
        return true;
      }
      if (key === "m") {
        setIsMoving(true);
        return true;
      }

      if (key === "j" || key === "ArrowDown") {
        event.preventDefault();
        if (isWide)
          setWindowFor(focusedGroup, (windowState) =>
            W.moveSingle(windowState, 1, n)
          );
        else
          setWindowFor(FIRST_GROUP, (windowState) =>
            W.moveSingle(windowState, 1, n)
          );
        return true;
      }
      if (key === "k" || key === "ArrowUp") {
        event.preventDefault();
        if (isWide)
          setWindowFor(focusedGroup, (windowState) =>
            W.moveSingle(windowState, -1, n)
          );
        else
          setWindowFor(FIRST_GROUP, (windowState) =>
            W.moveSingle(windowState, -1, n)
          );
        return true;
      }
      if (key === "g") {
        if (isWide) setWindowFor(focusedGroup, W.first);
        else setWindowFor(FIRST_GROUP, W.first);
        return true;
      }
      if (key === "shift+G") {
        if (isWide)
          setWindowFor(focusedGroup, (windowState) => W.last(windowState, n));
        else setWindowFor(FIRST_GROUP, (windowState) => W.last(windowState, n));
        return true;
      }

      const direction = key === "shift+J" ? 1 : key === "shift+K" ? -1 : 0;

      if (direction) {
        const group = isWide ? focusedGroup : FIRST_GROUP;
        const cur = getWindow(group).cursor;
        const fromTask = curTasks[cur];
        const toTask = curTasks[cur + direction];
        if (!fromTask || !toTask) return true;

        swapWithin(
          group,
          fromTask.id,
          toTask.id,
          curTasks.map((task) => task.id)
        );
        setWindowFor(group, (windowState) =>
          W.moveSingle(windowState, direction, n)
        );
        return true;
      }

      if (key === "a") {
        setShowOnlyNext((value) => !value);
        return true;
      }

      return false;
    },
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
              tinderMode ? classes.filterPillActive : classes.filterPill
            }
            onClick={() => {
              if (!tinderMode) toggleMode();
            }}
          >
            Tinder
          </button>
          <button
            className={
              !tinderMode ? classes.filterPillActive : classes.filterPill
            }
            onClick={() => {
              if (tinderMode) toggleMode();
            }}
          >
            Backlog
          </button>
          {!tinderMode && (
            <button
              className={
                showOnlyNext ? classes.filterPillActive : classes.filterPill
              }
              onClick={() => setShowOnlyNext((value) => !value)}
            >
              {showOnlyNext ? "Next" : "All"}
            </button>
          )}
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

      {tinderMode ? (
        <Stack gap="xs" maw={900} mx="auto" w="100%">
          {smartGroups.length === 0 && (
            <Text c="dimmed" size="sm">
              No tasks yet. Press n to add one.
            </Text>
          )}

          {smartGroups.map((group, idx) => {
            const focused = idx === focusedSmartGroupIdx;
            const expanded = group.id === expandedSmartGroupId;
            const cursor = tinderWindow.cursor;

            return (
              <Box
                key={group.id}
                className={
                  expanded
                    ? classes.smartGroupExpanded
                    : focused
                      ? classes.smartGroupFocused
                      : classes.smartGroup
                }
                onClick={() => {
                  setFocusedSmartGroupIdx(idx);
                  if (!expandedGroup) return;
                  if (group.id !== expandedSmartGroupId) {
                    setExpandedSmartGroupId(group.id);
                    setTinderWindow((windowState) =>
                      W.withCursor(windowState, 0)
                    );
                  }
                }}
              >
                <Group gap={8} wrap="nowrap">
                  <Text>{group.emoji}</Text>
                  <Stack gap={0}>
                    <Group gap={6} wrap="wrap">
                      <Text size="sm" fw={700}>
                        {group.title}
                      </Text>
                      {focused && !expanded && (
                        <Badge size="xs" color="blue" variant="outline">
                          focused
                        </Badge>
                      )}
                      {expanded && (
                        <Badge size="xs" color="indigo" variant="filled">
                          expanded
                        </Badge>
                      )}
                    </Group>
                    <Text size="sm">{group.summary}</Text>
                  </Stack>
                </Group>

                {expanded && (
                  <Stack gap="xs" mt="sm">
                    {group.tasks.map((task, taskIdx) => (
                      <BacklogTaskCard
                        key={task.id}
                        task={task}
                        isSelected={taskIdx === cursor}
                        isMoving={false}
                        cardRef={(el) => {
                          cardRefs.current.set(task.id, el);
                        }}
                        onSelect={() =>
                          setTinderWindow((windowState) =>
                            W.withCursor(windowState, taskIdx)
                          )
                        }
                        onEdit={() => openModal(task)}
                        onPostpone={() => postponeTask(task.id)}
                        onPushToTimeline={() => pushTaskToTimeline(task)}
                        onToggleNext={() => toggleTaskNext(task)}
                        onSnooze={(minutes) => snoozeTask(task, minutes)}
                        onClearSnooze={() => clearTaskSnooze(task)}
                        onDelete={() => deleteWithUndo(task)}
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            );
          })}
        </Stack>
      ) : !isWide ? (
        <Stack gap="xs" maw={800}>
          {allSorted.length === 0 && (
            <Text c="dimmed" size="sm">
              {tasks.length === 0
                ? "No tasks yet. Press n to add one."
                : "No tasks match the current mode."}
            </Text>
          )}
          {allSorted.map((task, idx) => (
            <BacklogTaskCard
              key={task.id}
              task={task}
              isSelected={idx === getWindow(FIRST_GROUP).cursor}
              isMoving={false}
              cardRef={(el) => {
                cardRefs.current.set(task.id, el);
              }}
              onSelect={() =>
                setWindowFor(FIRST_GROUP, (windowState) =>
                  W.withCursor(windowState, idx)
                )
              }
              onEdit={() => openModal(task)}
              onPostpone={() => postponeTask(task.id)}
              onPushToTimeline={() => pushTaskToTimeline(task)}
              onToggleNext={() => toggleTaskNext(task)}
              onSnooze={(minutes) => snoozeTask(task, minutes)}
              onClearSnooze={() => clearTaskSnooze(task)}
              onDelete={() => deleteWithUndo(task)}
            />
          ))}
        </Stack>
      ) : (
        <Grid>
          {groupColumns.map((colGroups, colIdx) => (
            <Grid.Col key={colIdx} span={12 / BACKLOG_GRID_COLUMNS}>
              <Stack gap="md">
                {colGroups.map((group) => (
                  <BacklogGridCell
                    key={group}
                    group={group}
                    focusedGroup={focusedGroup}
                    tasks={getTasksForGroup(group)}
                    cursor={getWindow(group).cursor}
                    isMoving={isMoving}
                    cardRefs={cardRefs}
                    onSelect={(idx) =>
                      setWindowFor(group, (windowState) =>
                        W.withCursor(windowState, idx)
                      )
                    }
                    onFocusGroup={(focusGroup) =>
                      setWindow2D((state) =>
                        Window2D.setFocusedGroup(state, focusGroup)
                      )
                    }
                    onEdit={(task) => openModal(task)}
                    onPostpone={(task) => postponeTask(task.id)}
                    onPushToTimeline={(task) => pushTaskToTimeline(task)}
                    onToggleNext={toggleTaskNext}
                    onSnooze={snoozeTask}
                    onClearSnooze={clearTaskSnooze}
                    onDelete={deleteWithUndo}
                  />
                ))}
              </Stack>
            </Grid.Col>
          ))}
        </Grid>
      )}

      <BacklogPostponed
        tasks={postponedTasks}
        onActivate={activateTask}
        onDelete={deleteWithUndo}
        onDeleteDone={handleDeleteAllDone}
      />
    </Box>
  );
}
