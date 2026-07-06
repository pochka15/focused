import type { BacklogTask } from "@/lib/stores/backlog-store";
import {
  BACKLOG_GRID_COLUMNS,
  type GridGroup,
} from "@/lib/stores/backlog-grid-store";
import type { UiWindow } from "@/shared-lib/shortcuts/window";
import { Grid, Stack } from "@mantine/core";
import type { RefObject } from "react";
import { BacklogGridCell } from "./backlog-grid-cell";

type Props = {
  groupColumns: GridGroup[][];
  focusedGroup: GridGroup;
  groupedTasks: Record<GridGroup, BacklogTask[]>;
  windows: Record<GridGroup, UiWindow>;
  isMoving: boolean;
  cardRefs: RefObject<Map<number, HTMLDivElement | null>>;
  onSelectTask: (group: GridGroup, idx: number) => void;
  onFocusGroup: (group: GridGroup) => void;
  onEditTask: (task: BacklogTask) => void;
  onPostponeTask: (task: BacklogTask) => void;
  onPushTaskToTimeline: (task: BacklogTask) => void;
  onToggleTaskNext: (task: BacklogTask) => void;
  onSnoozeTask: (task: BacklogTask, minutes: number) => void;
  onClearTaskSnooze: (task: BacklogTask) => void;
  onDeleteTask: (task: BacklogTask) => void;
};

export function BacklogGridWideView({
  groupColumns,
  focusedGroup,
  groupedTasks,
  windows,
  isMoving,
  cardRefs,
  onSelectTask,
  onFocusGroup,
  onEditTask,
  onPostponeTask,
  onPushTaskToTimeline,
  onToggleTaskNext,
  onSnoozeTask,
  onClearTaskSnooze,
  onDeleteTask,
}: Props) {
  return (
    <Grid>
      {groupColumns.map((colGroups, colIdx) => (
        <Grid.Col key={colIdx} span={12 / BACKLOG_GRID_COLUMNS}>
          <Stack gap="md">
            {colGroups.map((group) => (
              <BacklogGridCell
                key={group}
                group={group}
                focusedGroup={focusedGroup}
                tasks={groupedTasks[group] ?? []}
                cursor={windows[group]?.cursor ?? 0}
                isMoving={isMoving}
                cardRefs={cardRefs}
                onSelect={(idx) => onSelectTask(group, idx)}
                onFocusGroup={onFocusGroup}
                onEdit={onEditTask}
                onPostpone={onPostponeTask}
                onPushToTimeline={onPushTaskToTimeline}
                onToggleNext={onToggleTaskNext}
                onSnooze={onSnoozeTask}
                onClearSnooze={onClearTaskSnooze}
                onDelete={onDeleteTask}
              />
            ))}
          </Stack>
        </Grid.Col>
      ))}
    </Grid>
  );
}
