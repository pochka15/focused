import type { BacklogTask } from "@/lib/stores/planning-store";
import { Flex, Group, Text, UnstyledButton } from "@mantine/core";
import { ArchiveRestore, CheckCircle2, Circle } from "lucide-react";
import classes from "./linked-task-badge.module.css";
import type { ReactNode } from "react";

export type LinkedTaskDisplayState = "active" | "done" | "postponed";

const STATE_ICONS: Record<LinkedTaskDisplayState, ReactNode> = {
  active: <Circle size={10} />,
  done: <CheckCircle2 size={10} />,
  postponed: <ArchiveRestore size={10} />,
};

const STATE_COLORS: Record<LinkedTaskDisplayState, string> = {
  active: "gray",
  done: "green",
  postponed: "orange",
};

type Props = {
  task: BacklogTask;
  displayState: LinkedTaskDisplayState;
  displayName: string;
  onCycle: () => void;
  onEdit?: () => void;
};

export function LinkedTaskBadge({
  task,
  displayState,
  displayName,
  onCycle,
  onEdit,
}: Props) {
  return (
    <Group gap={4} wrap="nowrap">
      <UnstyledButton
        className={classes.cycleBtn}
        onClick={(e) => {
          e.stopPropagation();
          onCycle();
        }}
        title={
          displayState === "active"
            ? "Mark done"
            : displayState === "done"
              ? "Unmark done"
              : "Return to backlog"
        }
      >
        <Flex c={STATE_COLORS[displayState]} lh={1}>
          {STATE_ICONS[displayState]}
        </Flex>
      </UnstyledButton>
      <UnstyledButton
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.();
        }}
        title="Edit task"
        style={{ cursor: onEdit ? "pointer" : undefined }}
      >
        <Text
          size="xs"
          c={STATE_COLORS[displayState]}
          span
          style={{
            textDecoration: onEdit ? "underline" : "none",
            fontWeight: 500,
          }}
        >
          #{task.id} {displayName}
        </Text>
      </UnstyledButton>
    </Group>
  );
}
