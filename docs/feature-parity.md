# Feature Parity

Tracks features from the original canvas-based app against the new Mantine + TanStack Router version.

## Timeline (replaces Canvas Board)

- [x] Timeline view of active milestones (left column)
- [x] Event items with time + duration (right column, sorted by time)
- [x] Add milestone (`n` shortcut or button)
- [x] Edit selected milestone (`e` shortcut or pencil icon)
- [x] Mark milestone complete (`a` shortcut or check icon)
- [x] Delete/archive milestone (`d` shortcut or trash icon)
- [x] Reorder milestones via drag-and-drop (`@hello-pangea/dnd`)
- [x] Reorder milestones via keyboard (`J`/`K` — shift selected item up/down)
- [x] `j`/`k` and arrow key navigation between milestones
- [x] Completed milestones collapsible section
- [x] Add event (`v` shortcut or button)
- [x] Edit event (pencil icon)
- [x] Delete event (trash icon)
- [x] Tag badges with color per tag (8 tags preserved)
- [x] Mode badge (deep/light) on each milestone

## Backlog

- [x] Single grid of all backlog tasks (replaces two-column layout)
- [x] All fields visible: name, urgency, scope, size, energy
- [x] Visual icons per field (Zap=urgency, Briefcase/User=scope, Battery=energy, Maximize/Minus=size)
- [x] Badge colors: next=red, few-hours=orange, today=yellow, work=blue, personal=green
- [x] Default sort: urgency (next→few-hours→today) → scope (work first) → name
- [x] Add task (`n` shortcut or button)
- [x] Edit selected task (`e` shortcut or pencil icon)
- [x] Delete task (`d` shortcut or trash icon)
- [x] Postpone task (`x` shortcut or rotate icon)
- [x] Postponed tasks in collapsible accordion
- [x] Activate postponed task (button)
- [x] `j`/`k` keyboard navigation between rows
- [x] Filter by urgency: `1`=next, `2`=few-hours, `3`=today (toggle)
- [x] Filter by scope: `w`=work, `p`=personal (toggle)
- [x] Filter by energy: `f`=deep, `g`=normal, `h`=light (toggle)
- [x] Active filters displayed as badge pills with reset button

## Notifications

- [x] Table layout with one row per notification
- [x] Fields: name, time (HH:MM), repeats, complete checkbox, description
- [x] Move row up/down (chevron buttons)
- [x] Add row (button or Tab on last field auto-adds)
- [x] Delete row (trash icon)
- [x] Reset all times to 11:00 and mark incomplete
- [x] Save button (also Enter shortcut)
- [x] `r` shortcut navigates to notifications page
- [x] Error row highlighting on invalid data

## Navigation & Shortcuts

- [x] TanStack Router file-based routing (`/`, `/backlog`, `/notifications`)
- [x] Mantine AppShell navbar with route links
- [x] `g t` → Timeline, `g b` → Backlog, `r` → Notifications
- [x] `s` → Sync (check due notifications)
- [x] In-timeline: `n` new, `e` edit, `a` complete, `d` delete, `j`/`k`/arrows nav, `v` add event
- [x] In-backlog: `n` new, `e` edit, `d` delete, `x` postpone, `j`/`k`/arrows nav, filter shortcuts
- [x] `useShortcuts` hook preserved with priority-based dispatch
- [x] Keyboard shortcut hints visible in UI (navbar descriptions, hint text in views)

## Planning Session

- [x] "Plan with AI" button in navbar sidebar (bottom)
- [x] Time block selection (1h / 2h / 3h / half-day)
- [x] Brain fuel selection (low / med / full)
- [x] AI mode selection (democratic / dictatorship)
- [x] Optional note for AI
- [x] Goal field (persisted to planning store)
- [x] Copies prompt to clipboard on submit
- [x] Context includes: completed milestones, today's events with times AND durations
- [x] Context includes: full backlog task list

## Persistence

- [x] Timeline items in localStorage (`timeline-storage`)
- [x] Migration: old canvas todos (no `type` field) auto-migrated to milestones
- [x] Backlog tasks in localStorage (`planning-storage`)
- [x] Notifications in localStorage (`notifications-storage`)
- [x] Planning goal in localStorage (`planning-storage`)
- [x] Capture store ID counter in localStorage (`capture-storage`)

## Theming

- [x] Dark/light theme via Mantine `defaultColorScheme="dark"`
- [x] CSS Modules for component-specific styles (no Tailwind)
- [x] Mantine default color palette and typography

## Removed (intentionally)

- Canvas board (Konva.js) — replaced by timeline list view
- Help overlay (`h` shortcut) — use navbar + shortcut hints in UI
- Command line (`:` shortcut) — removed, nav now via shortcuts/navbar
- Notes panel (`j` shortcut) — removed for simplicity
- Stats panel — removed
- shadcn/ui components — replaced by Mantine
- Tailwind CSS — removed entirely
