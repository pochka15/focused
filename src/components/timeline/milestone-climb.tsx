import type { Milestone } from "@/lib/timeline/timeline-models";
import { tagsMapping } from "@/lib/todos/mappings";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, tw } from "@/lib/utils";
import { memo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const circleStyles = tw`
  flex size-14 cursor-grab items-center justify-center rounded-full bg-card
  text-muted-foreground shadow-sm ring-1 ring-foreground/10
  transition-[scale,color] will-change-transform [contain:layout_style_paint]
  hover:scale-108 hover:text-foreground active:cursor-grabbing
`;

type Props = {
  completed: Milestone[];
  onEdit: (milestone: Milestone) => void;
  onDelete: (milestone: Milestone) => void;
  onReorder: (fromIdx: number, toIdx: number) => void;
};

type SortableItemProps = {
  milestone: Milestone;
  onEdit: (milestone: Milestone) => void;
  onDelete: (milestone: Milestone) => void;
};

const SortableItem = memo(
  ({ milestone, onEdit, onDelete }: SortableItemProps) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useSortable({ id: milestone.id });

    const style = {
      transform: CSS.Transform.toString(transform),
    };

    const Icon = tagsMapping[milestone.tag].icon;

    return (
      <Tooltip disabled={isDragging}>
        <TooltipTrigger
          render={
            <div
              ref={setNodeRef}
              style={style}
              className={cn(circleStyles, isDragging && "opacity-50 shadow-lg")}
              {...attributes}
              {...listeners}
              onClick={() => onEdit(milestone)}
              onContextMenu={(e) => {
                e.preventDefault();
                onDelete(milestone);
              }}
            />
          }
        >
          <Icon strokeWidth={1.5} className="pointer-events-none size-6" />
        </TooltipTrigger>
        <TooltipContent side="left">{milestone.name}</TooltipContent>
      </Tooltip>
    );
  }
);
SortableItem.displayName = "SortableItem";

export function MilestoneClimb({
  completed,
  onEdit,
  onDelete,
  onReorder,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  if (completed.length === 0) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = completed.findIndex((m) => m.id === active.id);
    const newIndex = completed.findIndex((m) => m.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={completed.map((m) => m.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex w-full flex-col-reverse items-center gap-1.5 py-1 pr-1 pl-5">
          {completed.map((milestone) => (
            <SortableItem
              key={milestone.id}
              milestone={milestone}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
