import type { SmartGroup } from "@/lib/backlog/smart-groups";
import type { BacklogTask } from "@/lib/stores/backlog-store";
import { Badge, Box, Group, Stack, Text } from "@mantine/core";
import type { RefObject } from "react";
import { BacklogTaskCard } from "./backlog-task-card";
import classes from "./backlog-view.module.css";

type Props = {
  smartGroups: SmartGroup[];
  focusedSmartGroupIdx: number;
  expandedSmartGroupId: SmartGroup["id"] | null;
  expandedGroup: SmartGroup | null;
  tinderCursor: number;
  cardRefs: RefObject<Map<number, HTMLDivElement | null>>;
  onFocusSmartGroupIdx: (idx: number) => void;
  onExpandSmartGroup: (groupId: SmartGroup["id"]) => void;
  onSelectExpandedTask: (idx: number) => void;
  onEditTask: (task: BacklogTask) => void;
  onPostponeTask: (taskId: number) => void;
  onPushTaskToTimeline: (task: BacklogTask) => void;
  onToggleTaskNext: (task: BacklogTask) => void;
  onSnoozeTask: (task: BacklogTask, minutes: number) => void;
  onClearTaskSnooze: (task: BacklogTask) => void;
  onDeleteTask: (task: BacklogTask) => void;
};

export function BacklogTinderView({
  smartGroups,
  focusedSmartGroupIdx,
  expandedSmartGroupId,
  expandedGroup,
  tinderCursor,
  cardRefs,
  onFocusSmartGroupIdx,
  onExpandSmartGroup,
  onSelectExpandedTask,
  onEditTask,
  onPostponeTask,
  onPushTaskToTimeline,
  onToggleTaskNext,
  onSnoozeTask,
  onClearTaskSnooze,
  onDeleteTask,
}: Props) {
  return (
    <Stack gap="xs" maw={900} mx="auto" w="100%">
      {smartGroups.length === 0 && (
        <Text c="dimmed" size="sm">
          No tasks yet. Press n to add one.
        </Text>
      )}

      {smartGroups.map((group, idx) => {
        const focused = idx === focusedSmartGroupIdx;
        const expanded = group.id === expandedSmartGroupId;

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
              onFocusSmartGroupIdx(idx);
              if (!expandedGroup) return;
              if (group.id !== expandedSmartGroupId) {
                onExpandSmartGroup(group.id);
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
                    isSelected={taskIdx === tinderCursor}
                    isMoving={false}
                    cardRef={(el) => {
                      cardRefs.current.set(task.id, el);
                    }}
                    onSelect={() => onSelectExpandedTask(taskIdx)}
                    onEdit={() => onEditTask(task)}
                    onPostpone={() => onPostponeTask(task.id)}
                    onPushToTimeline={() => onPushTaskToTimeline(task)}
                    onToggleNext={() => onToggleTaskNext(task)}
                    onSnooze={(minutes) => onSnoozeTask(task, minutes)}
                    onClearSnooze={() => onClearTaskSnooze(task)}
                    onDelete={() => onDeleteTask(task)}
                  />
                ))}
              </Stack>
            )}
          </Box>
        );
      })}
    </Stack>
  );
}
