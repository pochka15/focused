let priority = 1;
const next = () => priority++;

export const shortcutsPriorities = {
  command: next(), // handled first
  help: next(),
  // ------ Modals
  structuredTaskStep: next(), // inside modal
  structuredTask: next(),
  planningSession: next(),
  editingBacklog: next(),
  // ------ Panels
  notesPanel: next(),
  notificationsPanel: next(),
  addTodo: next(),
  // ------ Rest
  canvasBoard: next(),
  root: next(),
} as const;
