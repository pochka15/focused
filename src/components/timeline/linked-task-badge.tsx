import type { BacklogTask } from "@/lib/stores/backlog-store";
import { cn } from "@/lib/utils";
import {
  ArchiveRestore,
  CheckCircle2,
  Circle,
  type LucideIcon,
} from "lucide-react";

export type LinkedTaskDisplayState = "active" | "done" | "postponed";

const STATE_ICONS: Record<LinkedTaskDisplayState, LucideIcon> = {
  active: Circle,
  done: CheckCircle2,
  postponed: ArchiveRestore,
};

const STATE_TEXT: Record<LinkedTaskDisplayState, string> = {
  active: "text-foreground/80",
  done: "text-muted-foreground line-through",
  postponed: "text-muted-foreground/70",
};

type Props = {
  task: BacklogTask;
  displayState: LinkedTaskDisplayState;
  displayName: string;
  onCycle: () => void;
  onEdit?: () => void;
  focused?: boolean;
};

export function LinkedTaskBadge({
  task,
  displayState,
  displayName,
  onCycle,
  onEdit,
  focused = false,
}: Props) {
  const Icon = STATE_ICONS[displayState];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-1.5 py-0.5 text-xs",
        focused && "bg-accent"
      )}
    >
      <button
        type="button"
        className={cn("flex shrink-0", STATE_TEXT[displayState])}
        onClick={(e) => {
          e.stopPropagation();
          onCycle();
        }}
        title={
          displayState === "active"
            ? "Mark done"
            : displayState === "done"
              ? "Unmark"
              : "Return to backlog"
        }
      >
        <Icon className="size-3" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.();
        }}
        title="Edit task"
        className={cn(
          "font-medium",
          STATE_TEXT[displayState],
          onEdit && "underline decoration-foreground/20 underline-offset-3"
        )}
      >
        <span className="font-mono opacity-60">#{task.id}</span> {displayName}
      </button>
    </span>
  );
}
