import { sortBy } from "lodash";
import type { Task, TodoItem } from "./todo-models";

export const sortByUrgency = (todos: TodoItem[]): TodoItem[] => {
  const priorities = { urgent: 0, normal: 1, evening: 2 } as const;
  return sortBy(todos, [
    (it) => !isTask(it),
    (it) => (isTask(it) ? priorities[it.urgencyLvl] : 0),
  ]);
};

export function isTask(todo: TodoItem): todo is Task {
  return "urgencyLvl" in todo;
}
