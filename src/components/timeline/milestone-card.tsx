import { Button } from "@/components/ui/button";
import { cn, tw } from "@/lib/utils";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useMemo } from "react";
import type { BacklogTask } from "@/lib/stores/backlog-store";
import { useBacklogStore } from "@/lib/stores/backlog-store";
import { useTimelineStore } from "@/lib/stores/timeline-store";
import type { Milestone } from "@/lib/timeline/timeline-models";
import { getTag } from "@/lib/todos/mappings";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";
import { cycleTask } from "./milestone-card-utils";
import { getTaskDisplayState } from "./timeline-view-utils";
import {
  LinkedTaskBadge,
  type LinkedTaskDisplayState,
} from "./linked-task-badge";

const cardStyles = tw`
  relative flex w-full max-w-4xl items-center justify-between gap-3 bg-card
  px-4 py-3 shadow-xs ring-1 ring-foreground/5 transition-shadow
`;

const pomodoroDotStyles = tw`
  absolute top-1 left-1 size-2.5 rounded-full bg-muted-foreground opacity-50
  blur-[1.5px] transition-[background-color,opacity]
`;

type Props = {
  item: Milestone;
  isSelected: boolean;
  isRemoving?: boolean;
  activeIdx: number;
  milestoneRef: (el: HTMLDivElement | null) => void;
  onSelect: () => void;
  onEdit: () => void;
  onToggleDone: () => void;
  onDelete: () => void;
  onEditBacklogTask?: (task: BacklogTask) => void;
  variant?: "default" | "suggested";
  onUseSuggestion?: () => void;
  onDismissSuggestion?: () => void;
};

export function MilestoneCard({
  item,
  isSelected,
  isRemoving = false,
  activeIdx,
  milestoneRef,
  onSelect,
  onEdit,
  onToggleDone,
  onDelete,
  onEditBacklogTask,
  onUseSuggestion,
  onDismissSuggestion,
  variant = "default",
}: Props) {
  const tasks = useBacklogStore((s) => s.tasks);
  const updateTask = useBacklogStore((s) => s.updateTask);
  const editItem = useTimelineStore((s) => s.editItem);
  const editingMode = useShortcutsMode("editingMilestoneCardTasks");

  const TagIcon = getTag(item.tag).icon;
  const done = item.completed;

  const pomodoros = item.pomodoros ?? 0;

  const taskIds = useMemo(() => new Set(item.taskIds ?? []), [item.taskIds]);

  const allTasksById = useMemo(() => {
    const map = new Map<number, BacklogTask>();
    for (const t of tasks) {
      if (taskIds.has(t.id)) map.set(t.id, t);
    }
    return map;
  }, [tasks, taskIds]);

  const boundEntries = useMemo(
    () =>
      [...taskIds]
        .map((id) => allTasksById.get(id))
        .filter(Boolean) as BacklogTask[],
    [taskIds, allTasksById]
  );

  const cycleTaskHandler = (id: number) => {
    const task = allTasksById.get(id);
    if (task) cycleTask(task, updateTask);
  };

  const getDisplayState = (task: BacklogTask): LinkedTaskDisplayState => {
    return getTaskDisplayState(task);
  };

  const bumpPomodoros = () => editItem({ ...item, pomodoros: pomodoros + 1 });

  const isEditingTasks =
    editingMode.enabled && editingMode.data.milestoneId === item.id;

  const canTrackPomodoros = variant === "default" && isSelected;

  return (
    <div
      ref={(el) => {
        if (activeIdx >= 0) milestoneRef(el);
      }}
      className={cn(
        cardStyles,
        variant === "suggested" &&
          "bg-transparent opacity-70 shadow-none ring-0 outline-1 outline-foreground/25 outline-dashed",
        isSelected && !done && "py-5 ring-2 ring-foreground",
        isRemoving && !done && "ring-2 ring-destructive"
      )}
      onClick={() => {
        if (variant === "default" && !done && activeIdx >= 0) onSelect();
      }}
    >
      {canTrackPomodoros && (
        <button
          type="button"
          className={cn(
            pomodoroDotStyles,
            pomodoros % 2 === 1 && "bg-foreground opacity-100"
          )}
          onClick={(e) => {
            e.stopPropagation();
            bumpPomodoros();
          }}
        />
      )}
      <div className="flex min-w-0 items-center gap-3">
        {TagIcon && (
          <TagIcon
            strokeWidth={1.5}
            className={cn(
              "shrink-0 text-muted-foreground",
              isSelected ? "size-9 text-foreground" : "size-4",
              canTrackPomodoros && "cursor-pointer"
            )}
            onClick={(e) => {
              if (!canTrackPomodoros) return;
              e.stopPropagation();
              bumpPomodoros();
            }}
          />
        )}
        <div className="flex min-w-0 flex-col gap-1">
          <p
            className={cn(
              "text-sm",
              isSelected && "text-3xl font-semibold tracking-tight",
              done && "text-muted-foreground line-through"
            )}
          >
            {item.name}
          </p>
          {boundEntries.length > 0 && (
            <div
              className={cn(
                "-ml-1.5 flex gap-1",
                isEditingTasks ? "flex-col items-start" : "flex-wrap"
              )}
            >
              {boundEntries.map((task, idx) => {
                const isFocused =
                  isEditingTasks && editingMode.data.taskIndex === idx;
                return (
                  <LinkedTaskBadge
                    key={task.id}
                    task={task}
                    displayState={getDisplayState(task)}
                    displayName={task.name}
                    onCycle={() => cycleTaskHandler(task.id)}
                    onEdit={() => onEditBacklogTask?.(task)}
                    focused={isFocused}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {variant === "suggested" ? (
        <div className="flex shrink-0 gap-1">
          <Button
            size="xs"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onUseSuggestion?.();
            }}
          >
            <Plus data-icon="inline-start" />
            Add
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDismissSuggestion?.();
            }}
            title="Dismiss suggestion"
          >
            <X />
          </Button>
        </div>
      ) : (
        <div className="flex shrink-0 gap-1">
          {!done && (
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil />
            </Button>
          )}
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onToggleDone();
            }}
          >
            <Check />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            className="hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 />
          </Button>
        </div>
      )}
    </div>
  );
}
