let priority = 1;
const next = () => priority++;

export const shortcutsPriorities = {
  command: next(), // handled first
  notesPanel: next(),
  help: next(),
  // ------ Modals
  structuredTaskStep: next(), // inside modal
  structuredTask: next(),
  planningSession: next(),
  editingBacklog: next(),
  // ------ Panels
  notificationsPanel: next(),
  addTodo: next(),
  // ------ Rest
  canvasBoard: next(),
  tablePanel: next(),
  root: next(),
} as const;
