import type { BacklogTask } from "@/lib/stores/planning-store";
import type { GridGroup } from "@/lib/stores/backlog-grid-store";
import { Badge, Box, Group, Stack, Text } from "@mantine/core";
import type { RefObject } from "react";
import { BacklogTaskCard } from "./backlog-task-card";
import { GROUP_LABELS } from "./use-backlog-groups";
import classes from "./backlog-view.module.css";

type Props = {
  group: GridGroup;
  focusedGroup: GridGroup;
  tasks: BacklogTask[];
  cursor: number;
  isMoving: boolean;
  cardRefs: RefObject<Map<number, HTMLDivElement | null>>;
  onSelect: (idx: number) => void;
  onFocusGroup: (group: GridGroup) => void;
  onEdit: (task: BacklogTask) => void;
  onPostpone: (task: BacklogTask) => void;
  onDelete: (task: BacklogTask) => void;
};

export function BacklogGridCell({
  group,
  focusedGroup,
  tasks,
  cursor,
  isMoving,
  cardRefs,
  onSelect,
  onFocusGroup,
  onEdit,
  onPostpone,
  onDelete,
}: Props) {
  const isFocused = group === focusedGroup;

  return (
    <Box className={isFocused ? classes.cellFocused : classes.cell}>
      <Group justify="space-between" mb={6}>
        <Text size="xs" fw={600} c={isFocused ? "blue" : "dimmed"}>
          {GROUP_LABELS[group]}
        </Text>
        {isFocused && isMoving && (
          <Badge size="xs" color="orange" variant="filled">
            moving
          </Badge>
        )}
      </Group>
      <Stack gap="xs">
        {tasks.map((task, idx) => (
          <BacklogTaskCard
            key={task.id}
            task={task}
            isSelected={isFocused && idx === cursor}
            isMoving={isMoving}
            cardRef={(el) => {
              cardRefs.current.set(task.id, el);
            }}
            onSelect={() => {
              onFocusGroup(group);
              onSelect(idx);
            }}
            onEdit={() => onEdit(task)}
            onPostpone={() => onPostpone(task)}
            onDelete={() => onDelete(task)}
          />
        ))}
        {tasks.length === 0 && (
          <Text size="xs" c="dimmed" fs="italic">
            Empty
          </Text>
        )}
      </Stack>
    </Box>
  );
}
