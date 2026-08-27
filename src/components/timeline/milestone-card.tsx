import { ActionIcon, Button, Card, Group, Stack, Text } from "@mantine/core";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useMemo } from "react";
import type { BacklogTask } from "@/lib/stores/backlog-store";
import { useBacklogStore } from "@/lib/stores/backlog-store";
import { useTimelineStore } from "@/lib/stores/timeline-store";
import type { Milestone } from "@/lib/timeline/timeline-models";
import { tagsMapping } from "@/lib/todos/mappings";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";
import { cycleTask } from "./milestone-card-utils";
import { getTaskDisplayState } from "./timeline-view-utils";
import {
  LinkedTaskBadge,
  type LinkedTaskDisplayState,
} from "./linked-task-badge";
import classes from "./timeline-view.module.css";

type Props = {
  item: Milestone;
  isSelected: boolean;
  isRemoving?: boolean;
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
  isRemoving = false,
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
  const tasks = useBacklogStore((s) => s.tasks);
  const updateTask = useBacklogStore((s) => s.updateTask);
  const editItem = useTimelineStore((s) => s.editItem);
  const editingMode = useShortcutsMode("editingMilestoneCardTasks");

  const tag = tagsMapping[item.tag];
  const done = item.completed;

  const pomodoros = item.pomodoros ?? 0;

  const taskIds = useMemo(() => new Set(item.taskIds ?? []), [item.taskIds]);

  const allTasksById = useMemo(() => {
    const map = new Map<number, BacklogTask>();
    for (const t of tasks) {
      if (taskIds.has(t.id)) map.set(t.id, t);
    }
    return map;
  }, [tasks, taskIds]);

  const boundEntries = useMemo(
    () =>
      [...taskIds]
        .map((id) => allTasksById.get(id))
        .filter(Boolean) as BacklogTask[],
    [taskIds, allTasksById]
  );

  const cycleTaskHandler = (id: number) => {
    const task = allTasksById.get(id);
    if (task) cycleTask(task, updateTask);
  };

  const getDisplayState = (task: BacklogTask): LinkedTaskDisplayState => {
    return getTaskDisplayState(task);
  };

  const cardClassName = [
    variant === "suggested" ? classes.ghostItem : "",
    isSelected && !done ? classes.selectedItem : "",
    isRemoving && !done ? classes.removingItem : "",
  ]
    .filter(Boolean)
    .join(" ");

  const bumpPomodoros = () => editItem({ ...item, pomodoros: pomodoros + 1 });

  return (
    <Card
      ref={(el) => {
        if (activeIdx >= 0) milestoneRef(el);
      }}
      withBorder
      padding="xs"
      pos="relative"
      className={cardClassName || undefined}
      onClick={() => {
        if (variant === "default" && !done && activeIdx >= 0) onSelect();
      }}
    >
      {variant === "default" && (
        <button
          type="button"
          className={[
            classes.pomodoroDot,
            pomodoros % 2 === 1 ? classes.pomodoroDotActive : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={(e) => {
            e.stopPropagation();
            bumpPomodoros();
          }}
        />
      )}
      <Group gap="xs" wrap="nowrap" justify="space-between">
        <Group gap="xs" wrap="nowrap">
          <Text
            fz={isSelected ? "h1" : undefined}
            style={variant === "default" ? { cursor: "pointer" } : undefined}
            onClick={(e) => {
              if (variant !== "default") return;
              e.stopPropagation();
              bumpPomodoros();
            }}
          >
            {tag?.emoji}
          </Text>
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
                {boundEntries.map((task, idx) => {
                  const isFocused =
                    editingMode.enabled &&
                    editingMode.data.milestoneId === item.id &&
                    editingMode.data.taskIndex === idx;
                  return (
                    <LinkedTaskBadge
                      key={task.id}
                      task={task}
                      displayState={getDisplayState(task)}
                      displayName={task.name}
                      onCycle={() => cycleTaskHandler(task.id)}
                      onEdit={() => onEditBacklogTask?.(task)}
                      focused={isFocused}
                    />
                  );
                })}
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
