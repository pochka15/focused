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
  newBacklogTask: "shift+N",
  newEvent: "v",
  pickFromQueue: "p",
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

export const TIMELINE_QUEUE_PICK_SHORTCUTS = {
  escape: "Escape",
  pickFirst: "k",
  pickSecond: "j",
} as const;

export const TIMELINE_CARD_SHORTCUTS = {
  escape: "Escape",
  moveUp: "k",
  moveDown: "j",
  toggleTaskDone: "l",
  exit: "f",
} as const;

export const BACKLOG_SHORTCUTS = {
  escape: "Escape",
  newTask: "n",
  edit: "e",
  pushTimeline: "p",
  pushTimelineFront: "shift+P",
  postpone: "x",
  toggleQueueing: "q",
  enqueue: "a",
  enqueueEnter: "Enter",
  dequeue: "d",
  dequeueAll: "shift+D",
  columnRight: "l",
  columnLeft: "h",
  columnRightArrow: "ArrowRight",
  columnLeftArrow: "ArrowLeft",
  taskDown: "j",
  taskUp: "k",
  taskDownArrow: "ArrowDown",
  taskUpArrow: "ArrowUp",
  taskFirst: "g",
  taskLast: "shift+G",
  // Sections column: jump between sections. Queue column: reorder.
  shiftDown: "shift+J",
  shiftUp: "shift+K",
} as const;

export const BACKLOG_MODAL_SHORTCUTS = {
  submit: "Enter",
  toggleFocus: "ctrl+n",
  tagKeys: ["n", "m", "h", "j", "k", "l"],
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
