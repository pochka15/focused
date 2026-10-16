import { Mountain, Feather, Shapes, type LucideIcon } from "lucide-react";

export type Tag = {
  key: string;
  icon: LucideIcon;
  description: string;
};

export const orderedTags = ["bigger", "smaller", "other"] as const;

export type TagName = (typeof orderedTags)[number];

export const DEFAULT_TAG: TagName = "other";

export const tagsMapping: Record<TagName, Tag> = {
  bigger: {
    key: "j",
    icon: Mountain,
    description: "Окно побольше",
  },
  smaller: {
    key: "k",
    icon: Feather,
    description: "Окно поменьше",
  },
  other: {
    key: "l",
    icon: Shapes,
    description: "Другое",
  },
};

export const isTagName = (value: unknown): value is TagName =>
  typeof value === "string" && value in tagsMapping;

export const getTag = (value: string | null | undefined): Tag =>
  tagsMapping[isTagName(value) ? value : DEFAULT_TAG];

// Tags used before the "bigger/smaller/other" simplification.
const LEGACY_TAGS: Record<string, TagName> = {
  "good-one": "bigger",
  "deep-routine": "bigger",
  "new-urgent": "bigger",
  "daily-noise": "bigger",
  "light-good": "smaller",
  "light-routine": "smaller",
  pleasures: "smaller",
};

export const migrateTagName = (value: unknown): TagName => {
  if (isTagName(value)) return value;
  if (typeof value === "string" && value in LEGACY_TAGS) {
    return LEGACY_TAGS[value]!;
  }
  return DEFAULT_TAG;
};
