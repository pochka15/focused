import type { Milestone } from "@/lib/timeline/timeline-models";
import { tagsMapping } from "@/lib/todos/mappings";
import { Tooltip } from "@mantine/core";
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
import classes from "./milestone-climb.module.css";

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

    return (
      <Tooltip label={milestone.name} position="left" disabled={isDragging}>
        <div
          ref={setNodeRef}
          style={style}
          className={`${classes.circle} ${isDragging ? classes.dragging : ""}`}
          {...attributes}
          {...listeners}
          onClick={() => onEdit(milestone)}
          onContextMenu={(e) => {
            e.preventDefault();
            onDelete(milestone);
          }}
        >
          <span className={classes.emoji}>
            {tagsMapping[milestone.tag].emoji}
          </span>
        </div>
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
        <div className={classes.stack}>
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
