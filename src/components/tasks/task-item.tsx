import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTasksStore, type Task } from "@/domain/stores/tasks-store";
import { cn } from "@/lib/utils";
import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { Check, GripVertical, X } from "lucide-react";
import { useState } from "react";

export const TaskItem = ({
  task,
  groupId,
  isDragging,
  dragHandleProps,
}: {
  task: Task;
  groupId: string;
  isDragging: boolean;
  dragHandleProps: DraggableProvidedDragHandleProps | null;
}) => {
  const removeTask = useTasksStore((s) => s.removeTask);
  const toggleTask = useTasksStore((s) => s.toggleTask);
  const updateTask = useTasksStore((s) => s.updateTask);
  const [isEditing, setIsEditing] = useState(false);
  const [wipTitle, setWipTitle] = useState(task.title);

  const handleEdit = () => {
    if (isEditing) updateTask(groupId, task.id, { title: wipTitle });
    setIsEditing((x) => !x);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEdit();
    } else if (e.key === "Escape") {
      setWipTitle(task.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      {...dragHandleProps}
      className={cn(
        "flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 group transition-all duration-200 hover:shadow-md cursor-grab",
        isDragging
          ? "opacity-50 rotate-1 scale-105 shadow-lg cursor-grabbing"
          : "opacity-100"
      )}
    >
      <GripVertical
        className={cn(
          "size-4 text-gray-400 transition-opacity",
          isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      />
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => toggleTask(groupId, task.id)}
        className={task.completed ? "text-green-600" : "text-gray-400"}
      >
        <Check className="size-4" />
      </Button>

      {isEditing ? (
        <Input
          value={wipTitle}
          onChange={(e) => setWipTitle(e.target.value)}
          onBlur={handleEdit}
          onKeyDown={handleKeyPress}
          className="flex-1 h-6 text-sm"
          autoFocus
        />
      ) : (
        <span
          className={cn(
            "flex-1 text-sm cursor-pointer",
            task.completed && "line-through text-gray-500"
          )}
          onClick={() => setIsEditing(true)}
        >
          {task.title}
        </span>
      )}

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => removeTask(groupId, task.id)}
        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
};
