import { find, remove } from "lodash";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskGroup {
  id: string;
  name: string;
  tasks: Task[];
}

interface TasksState {
  groups: TaskGroup[];

  // Group actions
  addGroup: (name: string) => void;
  removeGroup: (groupId: string) => void;
  updateGroupName: (groupId: string, name: string) => void;

  // Task actions
  addTask: (groupId: string, title: string, pushFront?: boolean) => void;
  addNextTask: (groupId: string, title: string) => void;
  removeTask: (groupId: string, taskId: string) => void;
  removeAllTasks: (groupId: string) => void;
  updateTask: (groupId: string, taskId: string, updates: Partial<Task>) => void;
  toggleTask: (groupId: string, taskId: string) => void;
  reorderTasks: (groupId: string, fromIndex: number, toIndex: number) => void;
}

// Helper functions for cleaner lookups
const findGroupById = (groups: TaskGroup[], groupId: string) =>
  find(groups, { id: groupId });

const findTaskById = (tasks: Task[], taskId: string) =>
  find(tasks, { id: taskId });

export const useTasksStore = create<TasksState>()(
  persist(
    immer((set) => ({
      groups: [],

      addGroup: (name: string) =>
        set((state) => {
          state.groups.push({
            id: crypto.randomUUID(),
            name,
            tasks: [],
          });
        }),

      removeGroup: (groupId: string) =>
        set((state) => {
          remove(state.groups, { id: groupId });
        }),

      updateGroupName: (groupId: string, name: string) =>
        set((state) => {
          const group = findGroupById(state.groups, groupId);
          if (group) {
            group.name = name;
          }
        }),

      addTask: (groupId: string, title: string, pushFront?: boolean) =>
        set((state) => {
          const group = findGroupById(state.groups, groupId);
          if (group) {
            const x = { id: crypto.randomUUID(), title, completed: false };
            if (pushFront) group.tasks.unshift(x);
            else group.tasks.push(x);
          }
        }),

      addNextTask: (groupId: string, title: string) =>
        set((state) => {
          const group = findGroupById(state.groups, groupId);
          if (group) {
            const firstIncompleteIndex = group.tasks.findIndex(
              (task) => !task.completed
            );
            const insertIndex =
              firstIncompleteIndex === -1
                ? group.tasks.length
                : firstIncompleteIndex + 1;
            group.tasks.splice(insertIndex, 0, {
              id: crypto.randomUUID(),
              title,
              completed: false,
            });
          }
        }),

      removeTask: (groupId: string, taskId: string) =>
        set((state) => {
          const group = findGroupById(state.groups, groupId);
          if (group) {
            remove(group.tasks, { id: taskId });
          }
        }),

      removeAllTasks: (groupId: string) =>
        set((state) => {
          const group = findGroupById(state.groups, groupId);
          if (group) {
            group.tasks = [];
          }
        }),

      updateTask: (groupId: string, taskId: string, updates: Partial<Task>) =>
        set((state) => {
          const group = findGroupById(state.groups, groupId);
          if (group) {
            const task = findTaskById(group.tasks, taskId);
            if (task) {
              Object.assign(task, updates);
            }
          }
        }),

      toggleTask: (groupId: string, taskId: string) =>
        set((state) => {
          const group = findGroupById(state.groups, groupId);
          if (group) {
            const task = findTaskById(group.tasks, taskId);
            if (task) {
              task.completed = !task.completed;
            }
          }
        }),

      reorderTasks: (groupId: string, fromIndex: number, toIndex: number) =>
        set((state) => {
          const group = findGroupById(state.groups, groupId);
          if (group && group.tasks[fromIndex]) {
            const [movedTask] = group.tasks.splice(fromIndex, 1);
            if (movedTask) {
              group.tasks.splice(toIndex, 0, movedTask);
            }
          }
        }),
    })),
    {
      name: "tasks-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ groups: state.groups }),
      onRehydrateStorage: () => (state) => {
        // Ensure groups is always an array
        if (!state?.groups || !Array.isArray(state.groups)) {
          state!.groups = [];
        }
      },
    }
  )
);
