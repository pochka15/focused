import { getBacklogTagPreset } from "@/lib/backlog/backlog-tag-presets";
import { SNOOZE_PRESETS } from "@/lib/backlog/snooze-presets";
import { isTaskSnoozed } from "@/lib/backlog/backlog-task-utils";
import type { BacklogTask } from "@/lib/stores/planning-store";
import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import {
  AlarmClock,
  Flame,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Zap,
} from "lucide-react";
import classes from "./backlog-view.module.css";

type Props = {
  task: BacklogTask;
  isSelected: boolean;
  isMoving: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
  onSelect: () => void;
  onEdit: () => void;
  onPostpone: () => void;
  onPushToTimeline?: () => void;
  onToggleNext?: () => void;
  onSnooze?: (minutes: number) => void;
  onClearSnooze?: () => void;
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
  onPushToTimeline,
  onToggleNext,
  onSnooze,
  onClearSnooze,
  onDelete,
}: Props) {
  const tagPreset = getBacklogTagPreset(task.tag);
  const snoozed = isTaskSnoozed(task);

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
          <Group gap={6} wrap="wrap">
            <Text size="sm" fw={500}>
              #{task.id} {task.name}
            </Text>
            {tagPreset && (
              <Text size="sm" lh={1}>
                {tagPreset.emoji}
              </Text>
            )}
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
            {task.tiny && (
              <Badge size="xs" variant="outline" color="orange">
                tiny
              </Badge>
            )}
            {task.tag.trim() && (
              <Badge
                size="xs"
                color={tagPreset?.color ?? "gray"}
                variant="light"
              >
                {task.tag}
              </Badge>
            )}
            {snoozed && (
              <Badge size="xs" color="violet" variant="outline">
                snoozed
              </Badge>
            )}
          </Group>
        </Stack>

        <Group gap={8} wrap="nowrap">
          {onPushToTimeline && (
            <ActionIcon
              variant="subtle"
              color="blue"
              title="Push to timeline"
              onClick={(e) => {
                e.stopPropagation();
                onPushToTimeline();
              }}
            >
              <Plus size={16} />
            </ActionIcon>
          )}
          {onToggleNext && (
            <ActionIcon
              variant="subtle"
              title="Toggle next"
              onClick={(e) => {
                e.stopPropagation();
                onToggleNext();
              }}
            >
              <Flame size={16} />
            </ActionIcon>
          )}
          {onSnooze && (
            <Menu withinPortal position="bottom-end">
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  title="Snooze presets"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AlarmClock size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                {SNOOZE_PRESETS.map((preset) => (
                  <Menu.Item
                    key={preset.key}
                    onClick={() => onSnooze(preset.minutes)}
                  >
                    {preset.label}
                  </Menu.Item>
                ))}
                {snoozed && onClearSnooze && (
                  <Menu.Item color="red" onClick={() => onClearSnooze()}>
                    Clear snooze
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          )}
          <ActionIcon
            variant="subtle"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Pencil size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            title="Postpone"
            onClick={(e) => {
              e.stopPropagation();
              onPostpone();
            }}
          >
            <RotateCcw size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            style={{ marginLeft: 8 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
}
