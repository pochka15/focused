let priority = 1;
const next = () => priority++;

// Note: only one shortcuts handler can be bound to the name at a time, so no two
// useShortcuts should be enabled with the same name.
export const shortcutsPriorities = {
  // Notes panel (highest — eats all keys while focused)
  notesPanel: next(),
  // Modals (absorb all keys when open)
  milestoneModal: next(),
  eventModal: next(),
  backlogModal: next(),
  planningSession: next(),
  // Views
  notificationsView: next(),
  timelineView: next(),
  backlogView: next(),
  // Root (lowest)
  root: next(),
} as const;
