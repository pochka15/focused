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
import { getBacklogTagPreset } from "@/lib/backlog/backlog-tag-presets";
import { SNOOZE_PRESETS } from "@/lib/backlog/snooze-presets";
import { isTaskSnoozed } from "@/lib/backlog/backlog-task-utils";
import type { BacklogTask } from "@/lib/stores/backlog-store";
import { cn, tw } from "@/lib/utils";
import {
  AlarmClock,
  ListPlus,
  Moon,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

const cardStyles = tw`
  flex items-center justify-between gap-3 bg-card px-3 py-2.5 shadow-xs
  ring-1 ring-foreground/5 transition-[background-color,box-shadow]
`;

const linkRegex = /\b(?:https?:\/\/|www\.)[^\s]+/gi;
const truncateLinks = (description: string): string =>
  description.replace(linkRegex, (link) =>
    link.length > 80 ? `${link.slice(0, 80)}...` : link
  );

type Props = {
  task: BacklogTask;
  isSelected: boolean;
  // Highlights the selection as "about to be queued".
  isQueueing?: boolean;
  showTagIcon?: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
  onSelect: () => void;
  onEdit: () => void;
  onPostpone?: () => void;
  onPushToTimeline?: () => void;
  onEnqueue?: () => void;
  onDequeue?: () => void;
  onSnooze?: (minutes: number) => void;
  onClearSnooze?: () => void;
  onDelete?: () => void;
};

const stop =
  (fn: () => void) =>
  (e: React.MouseEvent): void => {
    e.stopPropagation();
    fn();
  };

export function BacklogTaskCard({
  task,
  isSelected,
  isQueueing = false,
  showTagIcon = false,
  cardRef,
  onSelect,
  onEdit,
  onPostpone,
  onPushToTimeline,
  onEnqueue,
  onDequeue,
  onSnooze,
  onClearSnooze,
  onDelete,
}: Props) {
  const tagPreset = getBacklogTagPreset(task.tag);
  const TagIcon = showTagIcon ? tagPreset?.icon : undefined;
  const snoozed = isTaskSnoozed(task);

  return (
    <div
      ref={cardRef}
      className={cn(
        cardStyles,
        isSelected && "bg-accent ring-foreground/40",
        isQueueing &&
          isSelected &&
          "ring-0 outline-1 outline-foreground/60 outline-dashed"
      )}
      onClick={onSelect}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-sm font-medium">
            <span className="font-mono text-muted-foreground">#{task.id}</span>{" "}
            {task.name}
          </p>
          {TagIcon && (
            <TagIcon
              strokeWidth={1.5}
              className="size-3.5 text-muted-foreground"
            />
          )}
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground wrap-break-word">
            {truncateLinks(task.description)}
          </p>
        )}
        {snoozed && (
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary">
              <Moon data-icon="inline-start" />
              until{" "}
              {new Date(task.snoozeUntil!).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        {onEnqueue && (
          <Button
            variant="ghost"
            size="icon-sm"
            title="Add to queue"
            onClick={stop(onEnqueue)}
          >
            <ListPlus />
          </Button>
        )}
        {onPushToTimeline && (
          <Button
            variant="ghost"
            size="icon-sm"
            title="Push to timeline"
            onClick={stop(onPushToTimeline)}
          >
            <Plus />
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
        {onPostpone && (
          <Button
            variant="ghost"
            size="icon-sm"
            title="Postpone"
            onClick={stop(onPostpone)}
          >
            <RotateCcw />
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" onClick={stop(onEdit)}>
          <Pencil />
        </Button>
        {onDequeue && (
          <Button
            variant="ghost"
            size="icon-sm"
            title="Remove from queue"
            onClick={stop(onDequeue)}
          >
            <X />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="ml-2 hover:text-destructive"
            onClick={stop(onDelete)}
          >
            <Trash2 />
          </Button>
        )}
      </div>
    </div>
  );
}
