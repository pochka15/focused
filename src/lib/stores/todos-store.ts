import type { NewTask, TodoItem } from "@/lib/todos/todo-models";
import { remove } from "lodash";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface TodosState {
  todos: TodoItem[];

  addTask: (t: NewTask) => void;
  removeTodo: (id: string) => void;
  bulkDelete: (ids: string[]) => void;
  removeAllTodos: () => void;
  reorder: (ids: string[]) => void;
}

export const useTodosStore = create<TodosState>()(
  persist(
    immer((set) => ({
      todos: [],

      addTask: (task: NewTask) =>
        set((state) => {
          state.todos.push({
            ...task,
            id: crypto.randomUUID(),
            completed: false,
          });
        }),

      removeTodo: (id: string) =>
        set((state) => {
          remove(state.todos, { id });
        }),

      bulkDelete: (ids: string[]) =>
        set((state) => {
          const set = new Set(ids);
          state.todos = state.todos.filter((todo) => !set.has(todo.id));
        }),

      removeAllTodos: () =>
        set((state) => {
          state.todos = [];
        }),

      reorder: (ids: string[]) =>
        set((state) => {
          const existing = new Map(state.todos.map((todo) => [todo.id, todo]));
          const given = new Set(ids);
          const orderedTodos = ids
            .map((id) => existing.get(id))
            .filter((it) => it !== undefined);
          const remainingTodos = state.todos.filter(
            (todo) => !given.has(todo.id)
          );
          state.todos = orderedTodos.concat(remainingTodos);
        }),
    })),
    {
      name: "tasks-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ todos: state.todos }),
      onRehydrateStorage: () => (state) => {
        // Ensure groups is always an array
        if (!state?.todos || !Array.isArray(state.todos)) {
          state!.todos = [];
        }
      },
    }
  )
);
