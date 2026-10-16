import {
  AudioLines,
  CakeSlice,
  Candy,
  Lollipop,
  PlaneLanding,
  Repeat,
  Shapes,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { NewMilestone } from "../timeline/timeline-models";

export type Tag = {
  key: string;
  icon: LucideIcon;
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
    icon: Sparkles,
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
    icon: PlaneLanding,
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
    icon: Lollipop,
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
    icon: AudioLines,
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
    icon: Repeat,
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
    icon: Candy,
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
    icon: CakeSlice,
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
    icon: Shapes,
    description: "Другое",
    autoFill: {
      priority: 2,
      tag: "other",
      mode: "light",
      type: "task",
    },
  },
};
