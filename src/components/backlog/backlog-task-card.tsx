import type { BacklogTask, BacklogTaskKind } from "@/lib/stores/planning-store";
import { ActionIcon, Badge, Card, Group, Stack, Text } from "@mantine/core";
import { Pencil, RotateCcw, Trash2, Zap } from "lucide-react";
import classes from "./backlog-view.module.css";

export const KIND_META: Record<
  BacklogTaskKind,
  { emoji: string; label: string; color: string }
> = {
  "doing-it-today": { emoji: "🔨", label: "Let's get it done", color: "blue" },
  "they-asked-me-to": {
    emoji: "📨",
    label: "They asked me to check",
    color: "gray",
  },
  "thank-yourself-later": {
    emoji: "🤩",
    label: "Thank yourself later",
    color: "teal",
  },
};

type Props = {
  task: BacklogTask;
  isSelected: boolean;
  isMoving: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
  onSelect: () => void;
  onEdit: () => void;
  onPostpone: () => void;
  onDelete: () => void;
};

export function BacklogTaskCard({
  task,
  isSelected,
  isMoving,
  cardRef,
  onSelect,
  onEdit,
  onPostpone,
  onDelete,
}: Props) {
  const kind = KIND_META[task.kind];

  return (
    <Card
      ref={cardRef}
      withBorder
      padding="xs"
      className={
        isMoving && isSelected
          ? classes.movingRow
          : isSelected
            ? classes.selectedRow
            : undefined
      }
      onClick={onSelect}
    >
      <Group justify="space-between" wrap="nowrap" gap="sm">
        <Stack gap={4} style={{ flex: 1 }}>
          <Group gap={6} wrap="nowrap">
            <Text size="sm" lh={1}>
              {kind.emoji}
            </Text>
            <Text size="sm" fw={500}>
              #{task.id} {task.name}
            </Text>
          </Group>
          {task.description && (
            <Text size="xs" c="dimmed">
              {task.description}
            </Text>
          )}
          <Group gap={4} wrap="wrap">
            {task.isNext && (
              <Badge size="xs" color="red" leftSection={<Zap size={9} />}>
                next
              </Badge>
            )}
            <Badge size="xs" color={kind.color} variant="light">
              {kind.label}
            </Badge>
            {task.chunkable && (
              <Badge size="xs" variant="outline" color="orange">
                ⚡ quick win
              </Badge>
            )}
          </Group>
        </Stack>

        <Group gap={4} wrap="nowrap">
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
          <ActionIcon
            size="xs"
            variant="subtle"
            title="Postpone"
            onClick={(e) => {
              e.stopPropagation();
              onPostpone();
            }}
          >
            <RotateCcw size={12} />
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
      </Group>
    </Card>
  );
}
