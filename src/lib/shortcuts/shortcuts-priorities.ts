let priority = 1;
const next = () => priority++;

export const shortcutsPriorities = {
  keystrokes: next(), // handled first
  command: next(),
  notesPanel: next(),
  help: next(),
  notificationsPanel: next(),
  canvasBoard: next(),
  addTodo: next(),
  tablePanel: next(),
  root: next(),
} as const;
