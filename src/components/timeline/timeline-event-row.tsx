import { Button } from "@/components/ui/button";
import type { TimelineEvent } from "@/lib/timeline/timeline-models";
import { cn, tw } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { formatDuration, isEventBehind } from "./timeline-utils";

const rowStyles = tw`
  flex items-center justify-between gap-4 bg-card px-4 py-3 shadow-xs
  ring-1 ring-foreground/5
`;

type Props = {
  event: TimelineEvent;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (event: TimelineEvent) => void;
};

export const TimelineEventRow = ({ event, onEdit, onDelete }: Props) => {
  return (
    <div className={cn(rowStyles, isEventBehind(event) && "opacity-35")}>
      <div className="flex items-baseline gap-4">
        <span className="w-12 font-mono text-sm tabular-nums">
          {event.rawTime}
        </span>
        <div>
          <p className="text-sm font-medium">{event.name}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {formatDuration(event.durationMinutes)}
          </p>
        </div>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-xs" onClick={() => onEdit(event)}>
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          className="hover:text-destructive"
          onClick={() => onDelete(event)}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
};
