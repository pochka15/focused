import { sortBy } from "lodash";
import z from "zod";
import type { Event, Task, TodoItem } from "./todo-models";

const parseRawTime = (s: string): Date => {
  const errorMsg = "Invalid time format: HH:MM";
  const timeSchema = z
    .string()
    .regex(/^\d{1,2}:\d{2}$/, errorMsg)
    .transform((s) => {
      const [hours, minutes] = s.split(":").map(Number);

      if (hours === undefined || minutes === undefined)
        throw new Error(errorMsg);

      if (hours > 23 || minutes > 59) throw new Error("Invalid time values");

      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    });

  return timeSchema.parse(s);
};

export const calcMinutesLeft = (s: string): number | null => {
  try {
    const t = parseRawTime(s);
    const now = new Date();
    const timeDiff = t.getTime() - now.getTime();
    const minutes = Math.floor(timeDiff / (60 * 1000));
    return minutes;
  } catch {
    return null;
  }
};

export const checkEventIsSoon = (event: Event): boolean =>
  (calcMinutesLeft(event.rawTime) ?? 46) <= 45;

export const sortByPriority = (todos: TodoItem[]): TodoItem[] => {
  return sortBy(todos, [
    (it) => (!isTask(it) ? parseRawTime(it.rawTime) : null),
    (it) => (isTask(it) ? it.priority : 0),
  ]);
};

export function isTask(todo: TodoItem): todo is Task {
  const key: keyof Task = "priority";
  return key in todo;
}

export function isEvent(todo: TodoItem): todo is Event {
  const key: keyof Task = "priority";
  return !(key in todo);
}
