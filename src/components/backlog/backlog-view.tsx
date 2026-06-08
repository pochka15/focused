import type { BacklogTask, BacklogTaskKind } from "@/lib/stores/planning-store";
import { usePlanningStore } from "@/lib/stores/planning-store";
import { KIND_META } from "./backlog-task-card";
import {
  BACKLOG_GRID_COLUMNS,
  BACKLOG_GROUPS,
  type GridGroup,
  useBacklogGridStore,
} from "@/lib/stores/backlog-grid-store";
import { showUndoNotification } from "@/lib/notifications/show-undo-notification";
import { DONE_PREFIX } from "@/lib/timeline/timeline-models";
import {
  Window as W,
  Window2D,
  type UiWindow,
} from "@/shared-lib/shortcuts/window";
import { Box, Button, Grid, Group, Stack, Text, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Plus, Zap as ZapIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { BacklogModal } from "./backlog-modal";
import { BacklogTaskCard } from "./backlog-task-card";
import { BacklogGridCell } from "./backlog-grid-cell";
import { BacklogPostponed } from "./backlog-postponed";
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

  const assignTask = useBacklogGridStore((s) => s.assignTask);
  const removeTaskFromGrid = useBacklogGridStore((s) => s.removeTask);
  const swapWithin = useBacklogGridStore((s) => s.swapWithin);

  const isWide = useMediaQuery("(min-width: 900px)") ?? false;

  const [showOnlyNext, setShowOnlyNext] = useState(false);

  type KindPreset = BacklogTaskKind | "chunkable" | null;
  const [kindPreset, setKindPreset] = useState<KindPreset>(null);

  // s: thank-yourself-later → doing-it-today → clear
  const S_CYCLE: KindPreset[] = [
    "thank-yourself-later",
    "doing-it-today",
    null,
  ];
  // d: they-asked-me-to → chunkable → clear
  const D_CYCLE: KindPreset[] = ["they-asked-me-to", "chunkable", null];

  const cycleGroup = (cycle: KindPreset[]) =>
    setKindPreset((cur) => {
      const idx = cycle.indexOf(cur);
      return cycle[(idx + 1) % cycle.length] ?? null;
    });

  const resetFilters = () => {
    setShowOnlyNext(false);
    setKindPreset(null);
  };

  const [window2D, setWindow2D] = useState(() =>
    Window2D.create<GridGroup>(GROUPS)
  );
  const [isMoving, setIsMoving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<BacklogTask | undefined>();

  const focusedGroup = window2D.focusedGroup;
  const windows = window2D.windows;

  const cycleFocusedGroup = (direction: 1 | -1) =>
    setWindow2D((state) => Window2D.cycleFocusedGroup(state, direction));
  const setFocusedGroup = (group: GridGroup) =>
    setWindow2D((state) => Window2D.setFocusedGroup(state, group));

  const cardRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  const groupedTasksBase = useTasksByGroups(tasks, GROUPS, showOnlyNext);
  const allSortedBase = useAllTasksSorted(tasks, showOnlyNext);

  const applyKindFilter = (list: BacklogTask[]) => {
    if (!kindPreset) return list;
    if (kindPreset === "chunkable") return list.filter((t) => t.chunkable);
    return list.filter((t) => t.kind === kindPreset);
  };

  const allSorted = useMemo(
    () => applyKindFilter(allSortedBase),
    [allSortedBase, kindPreset]
  );

  const groupTasksMap = useMemo<Record<GridGroup, BacklogTask[]>>(
    () =>
      Object.fromEntries(
        GROUPS.map((group) => [
          group,
          applyKindFilter(groupedTasksBase[group] ?? []),
        ])
      ) as Record<GridGroup, BacklogTask[]>,
    [groupedTasksBase, kindPreset]
  );

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
    groupTasksMap[group] ?? [];

  const focusedTasks = isWide ? getTasksForGroup(focusedGroup) : allSorted;
  const focusedCursor = isWide
    ? getWindow(focusedGroup).cursor
    : getWindow(FIRST_GROUP).cursor;

  useEffect(() => {
    const sizes = Object.fromEntries(
      GROUPS.map((group) => [group, getTasksForGroup(group).length])
    ) as Record<GridGroup, number>;
    setWindow2D((state) => Window2D.shrinkAllTo(state, sizes));
  }, [groupTasksMap]);

  useEffect(() => {
    const task = focusedTasks[focusedCursor];
    if (task)
      cardRefs.current.get(task.id)?.scrollIntoView({ block: "nearest" });
  }, [focusedCursor, focusedGroup]);

  const setWindowFor = (group: GridGroup, updater: (w: UiWindow) => UiWindow) =>
    setWindow2D((state) => Window2D.updateWindow(state, group, updater));

  const deleteWithUndo = (task: BacklogTask) => {
    removeTask(task.id);
    removeTaskFromGrid(task.id);
    showUndoNotification(`del-task-${task.id}`, `"${task.name}" removed`, () =>
      restoreTask(task)
    );
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

  useShortcuts({
    name: "backlogView",
    enabled: !modalOpen,
    keys: (key, event) => {
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
        setFocusedGroup(numericKey as GridGroup);
        return true;
      }

      if (key === "l" || key === "ArrowRight") {
        event.preventDefault();
        cycleFocusedGroup(1);
        return true;
      }

      if (key === "h" || key === "ArrowLeft") {
        event.preventDefault();
        cycleFocusedGroup(-1);
        return true;
      }

      if (key === "n") {
        openModal();
        return true;
      }
      if (key === "e") {
        const task = curTasks[cursorNow];
        if (task) openModal(task);
        return true;
      }
      if (key === "x") {
        const task = curTasks[cursorNow];
        if (task) postponeTask(task.id);
        return true;
      }
      if (key === "m") {
        setIsMoving(true);
        return true;
      }

      if (key === "j" || key === "ArrowDown") {
        event.preventDefault();
        if (isWide) setWindowFor(focusedGroup, (w) => W.moveSingle(w, 1, n));
        else setWindowFor(FIRST_GROUP, (w) => W.moveSingle(w, 1, n));
        return true;
      }
      if (key === "k" || key === "ArrowUp") {
        event.preventDefault();
        if (isWide) setWindowFor(focusedGroup, (w) => W.moveSingle(w, -1, n));
        else setWindowFor(FIRST_GROUP, (w) => W.moveSingle(w, -1, n));
        return true;
      }
      if (key === "g") {
        if (isWide) setWindowFor(focusedGroup, W.first);
        else setWindowFor(FIRST_GROUP, W.first);
        return true;
      }
      if (key === "shift+G") {
        if (isWide) setWindowFor(focusedGroup, (w) => W.last(w, n));
        else setWindowFor(FIRST_GROUP, (w) => W.last(w, n));
        return true;
      }

      let direction = key === "shift+J" ? 1 : key === "shift+K" ? -1 : 0;

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
        setWindowFor(group, (w) => W.moveSingle(w, direction, n));
        return true;
      }
      if (key === "a") {
        setShowOnlyNext((v) => !v);
        return true;
      }
      if (key === "s") {
        cycleGroup(S_CYCLE);
        return true;
      }
      if (key === "d") {
        cycleGroup(D_CYCLE);
        return true;
      }
      if (key === "r") {
        resetFilters();
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
            <Text size="xs" c="dimmed">
              {isWide
                ? `n=new · e=edit · x=postpone · m=move · ${GROUPS.join("/")}=group · h/l/←/→=group ±1 · j/k/g/G=nav · J/K=swap · a=next · s/d=filter · r=reset`
                : "n=new · e=edit · x=postpone · j/k/g/G=nav · a=next · s/d=filter · r=reset"}
            </Text>
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
          {/* Next / All */}
          <button
            className={
              showOnlyNext ? classes.filterPillActive : classes.filterPill
            }
            onClick={() => setShowOnlyNext((v) => !v)}
          >
            <ZapIcon size={13} /> {showOnlyNext ? "Next" : "All"}
          </button>

          <Text size="sm" c="dimmed" mx={4}>
            ·
          </Text>

          {/* Group s: thank-yourself-later → doing-it-today */}
          {(["thank-yourself-later", "doing-it-today"] as const).map(
            (preset) => (
              <button
                key={preset}
                className={
                  kindPreset === preset
                    ? classes.filterPillActive
                    : classes.filterPill
                }
                onClick={() => cycleGroup(S_CYCLE)}
              >
                {KIND_META[preset].emoji} {KIND_META[preset].label}
                <Text component="span" size="xs" opacity={0.6} ml={2}>
                  s
                </Text>
              </button>
            )
          )}

          <Text size="sm" c="dimmed" mx={4}>
            ·
          </Text>

          {/* Group d: they-asked-me-to → chunkable */}
          <button
            className={
              kindPreset === "they-asked-me-to"
                ? classes.filterPillActive
                : classes.filterPill
            }
            onClick={() => cycleGroup(D_CYCLE)}
          >
            {KIND_META["they-asked-me-to"].emoji}{" "}
            {KIND_META["they-asked-me-to"].label}
            <Text component="span" size="xs" opacity={0.6} ml={2}>
              d
            </Text>
          </button>
          <button
            className={
              kindPreset === "chunkable"
                ? classes.filterPillActive
                : classes.filterPill
            }
            onClick={() => cycleGroup(D_CYCLE)}
          >
            ⚡ Can do in 15 min
            <Text component="span" size="xs" opacity={0.6} ml={2}>
              d
            </Text>
          </button>
        </Group>
      </Box>

      {!isWide ? (
        <Stack gap="xs" maw={800}>
          {allSorted.length === 0 && (
            <Text c="dimmed" size="sm">
              {tasks.length === 0
                ? "No tasks yet. Press n to add one."
                : "No tasks match the filter."}
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
                setWindowFor(FIRST_GROUP, (w) => W.withCursor(w, idx))
              }
              onEdit={() => openModal(task)}
              onPostpone={() => postponeTask(task.id)}
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
                      setWindowFor(group, (w) => W.withCursor(w, idx))
                    }
                    onFocusGroup={setFocusedGroup}
                    onEdit={(task) => openModal(task)}
                    onPostpone={(task) => postponeTask(task.id)}
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
