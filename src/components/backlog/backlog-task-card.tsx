import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { getBacklogTagPreset } from "@/lib/backlog/backlog-tag-presets";
import { SNOOZE_PRESETS } from "@/lib/backlog/snooze-presets";
import { isTaskSnoozed } from "@/lib/backlog/backlog-task-utils";
import type { BacklogTask } from "@/lib/stores/backlog-store";
import { cn, tw } from "@/lib/utils";
import {
  AlarmClock,
  Flame,
  Moon,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Zap,
} from "lucide-react";

const cardStyles = tw`
  flex items-center justify-between gap-3 bg-card px-3 py-2.5 shadow-xs
  ring-1 ring-foreground/5 transition-[background-color,box-shadow]
`;

const nextBadgeStyles = tw`
  animate-shimmer bg-linear-to-r from-foreground via-muted-foreground
  to-foreground bg-size-[200%_100%] bg-clip-text text-transparent
  *:[svg]:text-foreground
`;

type Props = {
  task: BacklogTask;
  isSelected: boolean;
  isMoving: boolean;
  zenMode?: boolean;
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
  zenMode = false,
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
  const TagIcon = tagPreset?.icon;
  const snoozed = isTaskSnoozed(task);

  return (
    <div
      ref={cardRef}
      className={cn(
        cardStyles,
        isSelected && "bg-accent ring-foreground/40",
        isMoving &&
          isSelected &&
          "ring-0 outline-1 outline-foreground/60 outline-dashed"
      )}
      onClick={onSelect}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {zenMode ? (
          <Skeleton className="h-3 w-1/4 animate-none rounded-full bg-foreground/10" />
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-sm font-medium">
              <span className="font-mono text-muted-foreground">
                #{task.id}
              </span>{" "}
              {task.name}
            </p>
            {TagIcon && (
              <TagIcon
                strokeWidth={1.5}
                className="size-3.5 text-muted-foreground"
              />
            )}
          </div>
        )}
        {!zenMode && task.description && (
          <p className="text-xs text-muted-foreground">{task.description}</p>
        )}
        {(task.isNext || task.tag.trim() || snoozed) && (
          <div className="flex flex-wrap gap-3">
            {task.isNext && (
              <Badge className={nextBadgeStyles}>
                <Zap data-icon="inline-start" />
                next
              </Badge>
            )}
            {task.tag.trim() && <Badge variant="secondary">{task.tag}</Badge>}
            {snoozed && (
              <Badge variant="secondary">
                <Moon data-icon="inline-start" />
                snoozed
              </Badge>
            )}
          </div>
        )}
      </div>

      {!zenMode && (
        <div className="flex shrink-0 items-center gap-0.5">
          {onPushToTimeline && (
            <Button
              variant="ghost"
              size="icon-sm"
              title="Push to timeline"
              onClick={(e) => {
                e.stopPropagation();
                onPushToTimeline();
              }}
            >
              <Plus />
            </Button>
          )}
          {onToggleNext && (
            <Button
              variant="ghost"
              size="icon-sm"
              title="Toggle next"
              onClick={(e) => {
                e.stopPropagation();
                onToggleNext();
              }}
            >
              <Flame />
            </Button>
          )}
          {onSnooze && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Snooze presets"
                    onClick={(e) => e.stopPropagation()}
                  />
                }
              >
                <AlarmClock />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuGroup>
                  {SNOOZE_PRESETS.map((preset) => (
                    <DropdownMenuItem
                      key={preset.key}
                      onClick={() => onSnooze(preset.minutes)}
                    >
                      {preset.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                {snoozed && onClearSnooze && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onClearSnooze()}
                      >
                        Clear snooze
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            title="Postpone"
            onClick={(e) => {
              e.stopPropagation();
              onPostpone();
            }}
          >
            <RotateCcw />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="ml-2 hover:text-destructive"
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
