import { ActionIcon, Button, Card, Group, Stack, Text } from "@mantine/core";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useMemo } from "react";
import type { BacklogTask } from "@/lib/stores/planning-store";
import { usePlanningStore } from "@/lib/stores/planning-store";
import type { Milestone } from "@/lib/timeline/timeline-models";
import { DONE_PREFIX } from "@/lib/timeline/timeline-models";
import { tagsMapping } from "@/lib/todos/mappings";
import {
  LinkedTaskBadge,
  type LinkedTaskDisplayState,
} from "./linked-task-badge";
import classes from "./timeline-view.module.css";

type Props = {
  item: Milestone;
  isSelected: boolean;
  activeIdx: number;
  milestoneRef: (el: HTMLDivElement | null) => void;
  onSelect: () => void;
  onEdit: () => void;
  onToggleDone: () => void;
  onDelete: () => void;
  onEditBacklogTask?: (task: BacklogTask) => void;
  variant?: "default" | "suggested";
  onUseSuggestion?: () => void;
  onDismissSuggestion?: () => void;
};

export function MilestoneCard({
  item,
  isSelected,
  activeIdx,
  milestoneRef,
  onSelect,
  onEdit,
  onToggleDone,
  onDelete,
  onEditBacklogTask,
  onUseSuggestion,
  onDismissSuggestion,
  variant = "default",
}: Props) {
  const tasks = usePlanningStore((s) => s.tasks);
  const postponedTasks = usePlanningStore((s) => s.postponedTasks);
  const postponeTask = usePlanningStore((s) => s.postponeTask);
  const activateTask = usePlanningStore((s) => s.activateTask);
  const updatePostponedTask = usePlanningStore((s) => s.updatePostponedTask);

  const tag = tagsMapping[item.tag];
  const done = item.completed;

  const taskIds = useMemo(() => new Set(item.taskIds ?? []), [item.taskIds]);

  const allTasksById = useMemo(() => {
    const map = new Map<number, { task: BacklogTask; postponed: boolean }>();
    for (const t of tasks) {
      if (taskIds.has(t.id)) map.set(t.id, { task: t, postponed: false });
    }
    for (const t of postponedTasks) {
      if (taskIds.has(t.id)) map.set(t.id, { task: t, postponed: true });
    }
    return map;
  }, [tasks, postponedTasks, taskIds]);

  const boundEntries = useMemo(
    () =>
      [...taskIds]
        .map((id) => allTasksById.get(id))
        .filter(Boolean) as NonNullable<ReturnType<typeof allTasksById.get>>[],
    [taskIds, allTasksById]
  );

  const cycleTask = (id: number) => {
    const entry = allTasksById.get(id);
    if (!entry) return;
    const { task, postponed } = entry;
    if (!postponed) {
      postponeTask(id);
      Promise.resolve().then(() => {
        updatePostponedTask({ ...task, name: `${DONE_PREFIX}${task.name}` });
      });
    } else if (task.name.startsWith(DONE_PREFIX)) {
      updatePostponedTask({
        ...task,
        name: task.name.slice(DONE_PREFIX.length),
      });
    } else {
      activateTask(id);
    }
  };

  const getDisplayState = (
    postponed: boolean,
    name: string
  ): LinkedTaskDisplayState => {
    if (!postponed) return "active";
    return name.startsWith(DONE_PREFIX) ? "done" : "postponed";
  };

  const getDisplayName = (postponed: boolean, name: string): string => {
    if (postponed && name.startsWith(DONE_PREFIX)) {
      return name.slice(DONE_PREFIX.length);
    }
    return name;
  };

  const cardClassName = [
    variant === "suggested" ? classes.ghostItem : "",
    isSelected && !done ? classes.selectedItem : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card
      ref={(el) => {
        if (activeIdx >= 0) milestoneRef(el);
      }}
      withBorder
      padding="xs"
      className={cardClassName || undefined}
      onClick={() => {
        if (variant === "default" && !done && activeIdx >= 0) onSelect();
      }}
    >
      <Group gap="xs" wrap="nowrap" justify="space-between">
        <Group gap="xs" wrap="nowrap">
          <Text fz={isSelected ? "h1" : undefined}>{tag?.emoji}</Text>
          <Stack gap={2} style={{ minWidth: 0 }}>
            <Text
              fw={isSelected ? 600 : 400}
              size="sm"
              c={done ? "dimmed" : undefined}
              td={done ? "line-through" : undefined}
              fz={isSelected ? "h1" : undefined}
            >
              {item.name}
            </Text>
            {boundEntries.length > 0 && (
              <Group gap={4} wrap="wrap">
                {boundEntries.map(({ task, postponed }) => (
                  <LinkedTaskBadge
                    key={task.id}
                    task={task}
                    displayState={getDisplayState(postponed, task.name)}
                    displayName={getDisplayName(postponed, task.name)}
                    onCycle={() => cycleTask(task.id)}
                    onEdit={() => onEditBacklogTask?.(task)}
                  />
                ))}
              </Group>
            )}
          </Stack>
        </Group>

        {variant === "suggested" ? (
          <Group gap={4} wrap="nowrap">
            <Button
              size="xs"
              variant="light"
              leftSection={<Plus size={12} />}
              onClick={(e) => {
                e.stopPropagation();
                onUseSuggestion?.();
              }}
            >
              Add
            </Button>
            <ActionIcon
              size="xs"
              variant="subtle"
              onClick={(e) => {
                e.stopPropagation();
                onDismissSuggestion?.();
              }}
              title="Dismiss suggestion"
            >
              <X size={12} />
            </ActionIcon>
          </Group>
        ) : (
          <Group gap={4} wrap="nowrap">
            {!done && (
              <ActionIcon
                size="xs"
                variant="subtle"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Pencil size={12} />
              </ActionIcon>
            )}
            <ActionIcon
              size="xs"
              variant="subtle"
              color="green"
              onClick={(e) => {
                e.stopPropagation();
                onToggleDone();
              }}
            >
              <Check size={12} />
            </ActionIcon>
            <ActionIcon
              size="xs"
              variant="subtle"
              color="red"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 size={12} />
            </ActionIcon>
          </Group>
        )}
      </Group>
    </Card>
  );
}
