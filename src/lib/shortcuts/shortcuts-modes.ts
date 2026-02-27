export type Mode<T = unknown> = { enabled: boolean; data: T };

export type SelectOperation = "archive" | "delete" | "reorder" | "edit";
type Position = { x: number; y: number };
type EditedTodoData = { id?: string; spawnPosition?: Position };

export type Modes = {
  showingHelp: Mode;
  showingCommand: Mode;
  editingNotifications: Mode;
  selectingTodos: Mode<{
    order: number[];
    operation: SelectOperation;
  }>;
  editingTodo: Mode<EditedTodoData>;
  focusing: Mode;
  showingNotes: Mode;
};

export type ModeName = keyof Modes;

export const getDefaultModes = (): Modes => ({
  showingHelp: { enabled: false, data: {} },
  showingCommand: { enabled: false, data: {} },
  selectingTodos: { enabled: false, data: { order: [], operation: "archive" } },
  editingTodo: { enabled: false, data: {} },
  focusing: { enabled: false, data: {} },
  showingNotes: { enabled: false, data: {} },
  editingNotifications: { enabled: false, data: {} },
});
