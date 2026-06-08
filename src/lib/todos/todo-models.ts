import type { TagName, TodoMode } from "./mappings";

export type NewTask = {
  name: string;
  priority: number;
  tag: TagName;
  mode: TodoMode;
  x: number;
  y: number;
  completed?: boolean;
};
