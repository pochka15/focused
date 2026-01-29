export type KeyHandler = (key: string, event: KeyboardEvent) => boolean;

export const nuphyPriorities = {
  root: 1,
  tablePanel: 2,
  addTodo: 3,
  help: 4,
  notesPanel: 5,
  command: 6,
  canvasBoard: 7,
} as const;

export type KnownNuphy = keyof typeof nuphyPriorities;
