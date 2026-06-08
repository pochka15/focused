import type { BacklogTask } from "@/lib/stores/planning-store";
import { Badge, Flex, Group, UnstyledButton } from "@mantine/core";
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
};

export function LinkedTaskBadge({
  task,
  displayState,
  displayName,
  onCycle,
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
      <Badge size="xs" variant="outline" color={STATE_COLORS[displayState]}>
        #{task.id} {displayName}
      </Badge>
    </Group>
  );
}
