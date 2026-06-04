let priority = 1;
const next = () => priority++;

export const shortcutsPriorities = {
  command: next(), // handled first
  notesPanel: next(),
  help: next(),
  structuredTask: next(),
  planningSession: next(),
  editingBacklog: next(),
  notificationsPanel: next(),
  canvasBoard: next(),
  addTodo: next(),
  tablePanel: next(),
  root: next(),
} as const;
