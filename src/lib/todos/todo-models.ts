export type NewTask = {
  name: string;
  priority: "p1" | "p2" | "p3";
  tag: "garbage" | "nicely-done" | "just-do-it";
  mode: "deep" | "light";
};

export type Task = NewTask & {
  id: string;
  completed: boolean;
};

export type Event = {
  id: string;
  name: string;
  date: Date;
};

export type TodoItem = Task | Event;
