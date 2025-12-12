import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useTasksStore,
  type TaskGroup as TaskGroupData,
} from "@/domain/stores/tasks-store";
import type { DropResult } from "@hello-pangea/dnd";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import React, { useState, useEffect } from "react";
import { TaskItem } from "./task-item";

export const TaskGroup = ({ group }: { group: TaskGroupData }) => {
  const addTask = useTasksStore((s) => s.addTask);
  const removeGroup = useTasksStore((s) => s.removeGroup);
  const updateGroupName = useTasksStore((s) => s.updateGroupName);
  const reorderTasks = useTasksStore((s) => s.reorderTasks);
  const removeAllTasks = useTasksStore((s) => s.removeAllTasks);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [editGroupName, setEditGroupName] = useState(group.name);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tasksCleared, setTasksCleared] = useState(false);

  // Reset tasksCleared when tasks are added back to the group
  useEffect(() => {
    if (group.tasks.length > 0 && tasksCleared) {
      setTasksCleared(false);
    }
  }, [group.tasks.length, tasksCleared]);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(group.id, newTaskTitle.trim());
      setNewTaskTitle("");
      // Reset the tasks cleared state when adding new tasks
      setTasksCleared(false);
    }
  };

  const handleRemoveGroup = () => {
    if (group.tasks.length > 0 && !tasksCleared) {
      // First click: remove all tasks
      removeAllTasks(group.id);
      setTasksCleared(true);
    } else {
      // Second click or no tasks: remove the group entirely
      removeGroup(group.id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  const handleGroupNameEdit = () => {
    if (isEditingGroupName) {
      updateGroupName(group.id, editGroupName);
      setIsEditingGroupName(false);
    } else {
      setIsEditingGroupName(true);
    }
  };

  const handleGroupNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGroupNameEdit();
    } else if (e.key === "Escape") {
      setEditGroupName(group.name);
      setIsEditingGroupName(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex !== destinationIndex) {
      reorderTasks(group.id, sourceIndex, destinationIndex);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-gray-600"
          >
            {isCollapsed ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {isEditingGroupName ? (
            <Input
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
              onBlur={handleGroupNameEdit}
              onKeyDown={handleGroupNameKeyPress}
              className="h-7 text-base font-semibold"
              autoFocus
            />
          ) : (
            <h3
              className="cursor-pointer text-lg font-semibold hover:text-blue-600"
              onClick={() => setIsEditingGroupName(true)}
            >
              {group.name}
            </h3>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">
            {group.tasks.length} task{group.tasks.length !== 1 ? "s" : ""}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRemoveGroup}
            className={
              group.tasks.length > 0 && !tasksCleared
                ? "text-orange-400 hover:text-orange-600"
                : "text-red-400 hover:text-red-600"
            }
            title={
              group.tasks.length > 0 && !tasksCleared
                ? "Click to clear all tasks"
                : "Click to delete group"
            }
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={group.id}>
              {(provided) => (
                <div
                  className="mb-3 space-y-2"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {group.tasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <TaskItem
                            task={task}
                            groupId={group.id}
                            isDragging={snapshot.isDragging}
                            dragHandleProps={provided.dragHandleProps}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="flex gap-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Add a new task..."
              className="flex-1"
            />
            <Button onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
              <Plus className="size-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
