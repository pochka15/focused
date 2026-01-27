import type { TagName, TodoMode } from "./mappings";

export type NewTask = {
  name: string;
  priority: number;
  tag: TagName;
  mode: TodoMode;
  x: number;
  y: number;
};

export type Task = NewTask & {
  id: string;
};

export type NewEvent = {
  name: string;
  rawTime: string;
  x: number;
  y: number;
};

export type Event = NewEvent & {
  id: string;
};

export type NewTodoItem = NewTask | NewEvent;
export type TodoItem = Task | Event;
