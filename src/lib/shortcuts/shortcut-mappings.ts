export const NAVIGATION_SHORTCUTS = {
  timeline: "t",
  backlog: "b",
  notifications: "r",
} as const;

export const ROOT_SHORTCUTS = {
  help: "shift+?",
  notifications: NAVIGATION_SHORTCUTS.notifications,
  backlog: NAVIGATION_SHORTCUTS.backlog,
  timeline: NAVIGATION_SHORTCUTS.timeline,
  syncing: "s",
} as const;

export const TIMELINE_SHORTCUTS = {
  escape: "Escape",
  newMilestone: "n",
  newEvent: "v",
  remove: "d",
  removeConfirm: "e",
  edit: "e",
  toggleDone: "a",
  moveDown: "j",
  moveDownArrow: "ArrowDown",
  moveUp: "k",
  moveUpArrow: "ArrowUp",
  reorderDown: "shift+J",
  reorderUp: "shift+K",
  openNotes: "m",
  quickNote: "cmd+k",
  first: "g",
  last: "shift+G",
} as const;

export const TIMELINE_CARD_SHORTCUTS = {
  escape: "Escape",
  moveUp: "k",
  moveDown: "j",
  toggleTaskDone: "a",
  exit: "f",
} as const;

export const BACKLOG_SHORTCUTS = {
  switchMode: "q",
  newTask: "n",
  edit: "e",
  pushTimeline: "p",
  pushTimelineFront: "shift+P",
  postpone: "x",
  snoozePicker: "z",
  moveTask: "m",
  toggleNext: "a",
  groupRight: "l",
  groupLeft: "h",
  groupRightArrow: "ArrowRight",
  groupLeftArrow: "ArrowLeft",
  taskDown: "j",
  taskUp: "k",
  taskDownArrow: "ArrowDown",
  taskUpArrow: "ArrowUp",
  taskFirst: "g",
  taskLast: "shift+G",
  swapDown: "shift+J",
  swapUp: "shift+K",
} as const;

export const BACKLOG_VIEW_SHORTCUTS = {
  cancelSnooze: "Escape",
  clearSnooze: "0",
} as const;

export const BACKLOG_MODAL_SHORTCUTS = {
  submit: "Enter",
  toggleFocus: "ctrl+n",
  stepBack: "h",
  stepForward: "l",
  cycleDown: "j",
  cycleUp: "k",
} as const;

export const MILESTONE_MODAL_SHORTCUTS = {
  submit: "Enter",
  toggleFocus: "ctrl+n",
} as const;

export const EVENT_MODAL_SHORTCUTS = {
  submit: "Enter",
} as const;

export const TIMELINE_NOTES_SHORTCUTS = {
  close: "Escape",
} as const;
