import { shortcutsPriorities } from "@/lib/shortcuts/shortcuts-priorities";

export type KeyHandler = (key: string, event: KeyboardEvent) => boolean;

export type KnownShortcutsListener = keyof typeof shortcutsPriorities;
