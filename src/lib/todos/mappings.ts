import type { NewTask } from "@/lib/todos/todo-models";

export type Tag = {
  key: string;
  emoji: string;
  description: string;
  autoFill: Omit<NewTask, "name" | "x" | "y">;
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

export const todoModes = ["deep", "light"] as const;

export type TagName = (typeof orderedTags)[number];
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
    description: "А теперь время для флекса",
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
