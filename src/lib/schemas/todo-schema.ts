import {
  findTag,
  orderedTags,
  todoKinds,
  todoModes,
} from "@/lib/todos/mappings";
import type {
  Event,
  NewEvent,
  NewTodoItem,
  Task,
  TodoItem,
} from "@/lib/todos/todo-models";
import { isTask } from "@/lib/todos/todo-utils";
import z from "zod";

export const todoSchema = z.object({
  name: z.string().min(1).trim(),
  priority: z.number(),
  tag: z.enum(orderedTags),
  mode: z.enum(todoModes),
  todoKind: z.enum(todoKinds),
  eventRawTime: z.string(),
  pushFront: z.boolean(),
});

export type FTodo = z.infer<typeof todoSchema>;

export const getDefaultTodo = (): FTodo => ({
  name: "",
  priority: 1,
  tag: "light-routine",
  mode: "deep",
  todoKind: "task",
  eventRawTime: new Date().toTimeString().slice(0, 5),
  pushFront: true,
});

const toEvent = (data: FTodo): NewEvent => ({
  name: data.name,
  rawTime: data.eventRawTime,
});

export const autoFillNewTodoItem = (data: FTodo): NewTodoItem => {
  const tag = findTag(data.tag);
  const filled = tag ? { ...data, ...tag.autoFill } : data;
  return filled.todoKind === "event" ? toEvent(filled) : filled;
};

export const autoFillTodoItem = (id: string, data: FTodo): TodoItem => ({
  id,
  ...autoFillNewTodoItem(data),
});

const buildTask = (todo: Task): FTodo => {
  const base = getDefaultTodo();
  return {
    todoKind: "task",
    name: todo.name,
    priority: todo.priority,
    tag: todo.tag,
    mode: todo.mode,
    eventRawTime: base.eventRawTime,
    pushFront: base.pushFront,
  };
};

const buildEvent = (todo: Event): FTodo => {
  const base = getDefaultTodo();
  return {
    todoKind: "event",
    name: todo.name,
    priority: base.priority,
    tag: base.tag,
    mode: base.mode,
    eventRawTime: todo.rawTime,
    pushFront: base.pushFront,
  };
};

export const fromTodoItem = (todo: TodoItem): FTodo =>
  isTask(todo) ? buildTask(todo) : buildEvent(todo);
