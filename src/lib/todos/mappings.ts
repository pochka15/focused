import type { NewTask } from "@/lib/todos/todo-models";
import { find } from "lodash";

export type Tag = {
  key: string;
  emoji: string;
  description: string;
  autoFill: Omit<NewTask, "name">;
};

export const orderedTags = [
  "good-one",
  "light-good",
  "new-urgent",
  "deep-routine",
  "light-routine",
  "daily-noise",
  "pleasures",
  "other",
] as const;

export const todoKinds = ["event", "task"] as const;
export const todoModes = ["deep", "light"] as const;

export type TagName = (typeof orderedTags)[number];
export type TodoKind = (typeof todoKinds)[number];
export type TodoMode = (typeof todoModes)[number];

export const tagsMapping: Record<TagName, Tag> = {
  "good-one": {
    key: "u",
    emoji: "🌟",
    description: "О, a это прям хорошо",
    autoFill: {
      priority: 2,
      tag: "good-one",
      mode: "deep",
    },
  },
  "new-urgent": {
    key: "o",
    emoji: "✈️",
    description: "Прилетела срочная хрень",
    autoFill: {
      priority: 1,
      tag: "new-urgent",
      mode: "deep",
    },
  },
  "light-good": {
    key: "i",
    emoji: "🍭",
    description: "Недолго что-то полезное поделать",
    autoFill: {
      priority: 2,
      tag: "light-good",
      mode: "light",
    },
  },
  "daily-noise": {
    key: "l",
    emoji: "🥖",
    description: "Daily Noise",
    autoFill: {
      priority: 2,
      tag: "daily-noise",
      mode: "deep",
    },
  },
  "deep-routine": {
    key: "j",
    emoji: "⭐",
    description: "Раунды по работе",
    autoFill: {
      priority: 2,
      tag: "deep-routine",
      mode: "deep",
    },
  },
  "light-routine": {
    key: "k",
    emoji: "🍬",
    description: "Мелкие рабочие моменты",
    autoFill: {
      priority: 2,
      tag: "light-routine",
      mode: "light",
    },
  },
  pleasures: {
    key: "n",
    emoji: "🍰",
    description: "Чиста для себя пакайфавать",
    autoFill: {
      priority: 3,
      tag: "pleasures",
      mode: "light",
    },
  },
  other: {
    key: "m",
    emoji: "🌊",
    description: "Другое",
    autoFill: {
      priority: 2,
      tag: "other",
      mode: "light",
    },
  },
};

export const findTag = (tagName: string): Tag | undefined => {
  return tagsMapping[tagName as TagName];
};

export const findTagByKey = (key: string): Tag | undefined => {
  return find(tagsMapping, (tag) => tag.key === key);
};

export const todoType: Record<TodoKind, [string, string]> = {
  event: ["Event", "Q"],
  task: ["Task", "W"],
} as const;

export const pushFrontVariants: Record<string, [string, string]> = {
  true: ["⬆️", "A"],
  false: ["⬇️", "S"],
} as const;

export const colors = {
  editing: "text-green-500",
  deleting: "text-red-300",
  soonEvent: "text-pink-500",
};
