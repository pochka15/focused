import { sortBy } from "lodash";
import type { Task, TodoItem } from "./todo-models";

export const sortByUrgency = (todos: TodoItem[]): TodoItem[] => {
  const priorities = { p1: 0, p2: 1, p3: 2 } as const;
  return sortBy(todos, [
    (it) => !isTask(it),
    (it) => (isTask(it) ? priorities[it.priority] : 0),
  ]);
};

export function isTask(todo: TodoItem): todo is Task {
  const key: keyof Task = "priority";
  return key in todo;
}
