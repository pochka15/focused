export type KeyHandler = (key: string, event: KeyboardEvent) => boolean;

export const nuphyPriorities = {
  root: 1,
  tablePanel: 2,
  addTodo: 3,
  canvasBoard: 4,
  help: 5,
  notesPanel: 6,
  command: 7,
} as const;

export type KnownNuphy = keyof typeof nuphyPriorities;
