import type { NewTodoItem, TodoItem } from "@/lib/todos/todo-models";
import { remove } from "lodash";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface TodosState {
  todos: TodoItem[];
  history: TodoItem[];

  getTodos: () => TodoItem[];
  addTodo: (t: NewTodoItem, pushFront: boolean) => void;
  editTodo: (t: TodoItem) => void;
  archiveTodo: (id: string) => void;
  bulkArchive: (ids: string[]) => void;
  bulkDelete: (ids: string[]) => void;
  archiveAllTodos: () => void;
  reorder: (ids: string[]) => void;
  getHistory: () => TodoItem[];
  clearHistory: () => void;
  clear: () => void;
}

export const useTodosStore = create<TodosState>()(
  persist(
    immer((set, get) => ({
      todos: [],
      history: [],

      getTodos: () => get().todos,

      addTodo: (todo: NewTodoItem, pushFront: boolean) =>
        set((state) => {
          const newTask = {
            ...todo,
            id: crypto.randomUUID(),
          };
          if (pushFront) {
            state.todos.unshift(newTask);
          } else {
            state.todos.push(newTask);
          }
        }),

      editTodo: (todo: TodoItem) =>
        set((state) => {
          const index = state.todos.findIndex((t) => t.id === todo.id);
          if (index !== -1) {
            state.todos[index] = todo;
          }
        }),

      archiveTodo: (id: string) =>
        set((state) => {
          const todoToRemove = state.todos.find((t) => t.id === id);
          if (todoToRemove) {
            state.history.push(todoToRemove);
          }
          remove(state.todos, { id });
        }),

      bulkArchive: (ids: string[]) =>
        set((state) => {
          const idsSet = new Set(ids);
          const todosToDelete = state.todos.filter((todo) =>
            idsSet.has(todo.id)
          );
          state.history.push(...todosToDelete);
          state.todos = state.todos.filter((todo) => !idsSet.has(todo.id));
        }),

      bulkDelete: (ids: string[]) =>
        set((state) => {
          const idsSet = new Set(ids);
          state.todos = state.todos.filter((todo) => !idsSet.has(todo.id));
        }),

      archiveAllTodos: () =>
        set((state) => {
          state.history.push(...state.todos);
          state.todos = [];
        }),

      reorder: (ids: string[]) =>
        set((state) => {
          const existing = new Map(state.todos.map((todo) => [todo.id, todo]));
          const given = new Set();
          const orderedTodos = ids
            .filter((id) => {
              if (given.has(id)) return false;
              given.add(id);
              return existing.has(id);
            })
            .map((id) => existing.get(id)!);
          const remainingTodos = state.todos.filter(
            (todo) => !given.has(todo.id)
          );
          state.todos = orderedTodos.concat(remainingTodos);
        }),

      getHistory: () => get().history,

      clear: () => {
        set((state) => {
          state.todos = [];
          state.history = [];
        });
      },

      clearHistory: () =>
        set((state) => {
          state.history = [];
        }),
    })),
    {
      name: "tasks-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ todos: state.todos, history: state.history }),
      onRehydrateStorage: () => (state) => {
        // Ensure todos and history are always arrays
        if (!state?.todos || !Array.isArray(state.todos)) {
          state!.todos = [];
        }
        if (!state?.history || !Array.isArray(state.history)) {
          state!.history = [];
        }
      },
    }
  )
);
