import type { BacklogTask } from "@/lib/stores/backlog-store";
import type { GridGroup } from "@/lib/stores/backlog-grid-store";
import { Badge } from "@/components/ui/badge";
import { cn, tw } from "@/lib/utils";
import { MoveVertical } from "lucide-react";
import type { RefObject } from "react";
import { BacklogTaskCard } from "./backlog-task-card";
import { GROUP_LABELS } from "./use-backlog-groups";

const cellStyles = tw`
  flex min-h-70 flex-col gap-3 bg-muted/30 p-3 transition-shadow
`;

type Props = {
  group: GridGroup;
  focusedGroup: GridGroup;
  tasks: BacklogTask[];
  cursor: number;
  isMoving: boolean;
  zenMode: boolean;
  cardRefs: RefObject<Map<number, HTMLDivElement | null>>;
  onSelect: (idx: number) => void;
  onFocusGroup: (group: GridGroup) => void;
  onEdit: (task: BacklogTask) => void;
  onPostpone: (task: BacklogTask) => void;
  onPushToTimeline: (task: BacklogTask) => void;
  onToggleNext: (task: BacklogTask) => void;
  onSnooze: (task: BacklogTask, minutes: number) => void;
  onClearSnooze: (task: BacklogTask) => void;
  onDelete: (task: BacklogTask) => void;
};

export function BacklogGridCell({
  group,
  focusedGroup,
  tasks,
  cursor,
  isMoving,
  zenMode,
  cardRefs,
  onSelect,
  onFocusGroup,
  onEdit,
  onPostpone,
  onPushToTimeline,
  onToggleNext,
  onSnooze,
  onClearSnooze,
  onDelete,
}: Props) {
  const isFocused = group === focusedGroup;

  return (
    <div className={cn(cellStyles, isFocused && "ring-1 ring-foreground/25")}>
      <div className="flex items-center justify-between">
        <p
          className={cn(
            "text-[0.625rem] font-semibold tracking-widest uppercase",
            isFocused ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {GROUP_LABELS[group]}
        </p>
        {isFocused && isMoving && (
          <Badge>
            <MoveVertical data-icon="inline-start" />
            moving
          </Badge>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((task, idx) => (
          <BacklogTaskCard
            key={task.id}
            task={task}
            isSelected={isFocused && idx === cursor}
            isMoving={isMoving}
            zenMode={zenMode}
            cardRef={(el) => {
              cardRefs.current.set(task.id, el);
            }}
            onSelect={() => {
              onFocusGroup(group);
              onSelect(idx);
            }}
            onEdit={() => onEdit(task)}
            onPostpone={() => onPostpone(task)}
            onPushToTimeline={() => onPushToTimeline(task)}
            onToggleNext={() => onToggleNext(task)}
            onSnooze={(minutes) => onSnooze(task, minutes)}
            onClearSnooze={() => onClearSnooze(task)}
            onDelete={() => onDelete(task)}
          />
        ))}
        {tasks.length === 0 && (
          <p className="text-xs text-muted-foreground/60 italic">Empty</p>
        )}
      </div>
    </div>
  );
}
