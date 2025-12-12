import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTasksStore, type Task } from "@/lib/stores/tasks-store";
import { cn } from "@/lib/random/utils";
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
        "group flex cursor-grab items-center gap-2 rounded-md border border-gray-200 bg-white p-2 transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800",
        isDragging
          ? "scale-105 rotate-1 cursor-grabbing opacity-50 shadow-lg"
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
          className="h-6 flex-1 text-sm"
          autoFocus
        />
      ) : (
        <span
          className={cn(
            "flex-1 cursor-pointer text-sm",
            task.completed && "text-gray-500 line-through"
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
        className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
};
