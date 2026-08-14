import type { BacklogTask } from "@/lib/stores/backlog-store";
import { Window as W, type UiWindow } from "@/shared-lib/shortcuts/window";
import { Stack, Text } from "@mantine/core";
import type { RefObject } from "react";
import { BacklogTaskCard } from "./backlog-task-card";

type Props = {
  allSorted: BacklogTask[];
  hasAnyTasks: boolean;
  mobileWindow: UiWindow;
  zenMode: boolean;
  cardRefs: RefObject<Map<number, HTMLDivElement | null>>;
  onSelectTask: (windowState: UiWindow) => void;
  onEditTask: (task: BacklogTask) => void;
  onPostponeTask: (taskId: number) => void;
  onPushTaskToTimeline: (task: BacklogTask) => void;
  onToggleTaskNext: (task: BacklogTask) => void;
  onSnoozeTask: (task: BacklogTask, minutes: number) => void;
  onClearTaskSnooze: (task: BacklogTask) => void;
  onDeleteTask: (task: BacklogTask) => void;
};

export function BacklogGridNarrowView({
  allSorted,
  hasAnyTasks,
  mobileWindow,
  zenMode,
  cardRefs,
  onSelectTask,
  onEditTask,
  onPostponeTask,
  onPushTaskToTimeline,
  onToggleTaskNext,
  onSnoozeTask,
  onClearTaskSnooze,
  onDeleteTask,
}: Props) {
  return (
    <Stack gap="xs" maw={800}>
      {allSorted.length === 0 && (
        <Text c="dimmed" size="sm">
          {hasAnyTasks
            ? "No tasks match the current mode."
            : "No tasks yet. Press n to add one."}
        </Text>
      )}
      {allSorted.map((task, idx) => (
        <BacklogTaskCard
          key={task.id}
          task={task}
          isSelected={idx === mobileWindow.cursor}
          isMoving={false}
          zenMode={zenMode}
          cardRef={(el) => {
            cardRefs.current.set(task.id, el);
          }}
          onSelect={() => onSelectTask(W.withCursor(mobileWindow, idx))}
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
  );
}
