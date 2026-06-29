import type { NewMilestone } from "../timeline/timeline-models";

export type Tag = {
  key: string;
  emoji: string;
  description: string;
  autoFill: Omit<NewMilestone, "name">;
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
      type: "task",
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
      type: "task",
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
      type: "task",
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
      type: "task",
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
      type: "task",
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
      type: "task",
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
      type: "task",
    },
  },
  other: {
    key: "m",
    emoji: "🦥",
    description: "Другое",
    autoFill: {
      priority: 2,
      tag: "other",
      mode: "light",
      type: "task",
    },
  },
};
