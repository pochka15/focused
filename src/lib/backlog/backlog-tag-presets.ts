import {
  CakeSlice,
  Cog,
  Gem,
  HandHeart,
  Tornado,
  type LucideIcon,
} from "lucide-react";

export type BacklogTagPreset = {
  value: string;
  label: string;
  icon: LucideIcon;
};

export const BACKLOG_TAG_PRESETS: BacklogTagPreset[] = [
  {
    value: "real value",
    label: "Хорошая ценность",
    icon: Gem,
  },
  {
    value: "thank me later",
    label: "Скажешь спасибо позже",
    icon: HandHeart,
  },
  {
    value: "duty task",
    label: "Классическая дежурная",
    icon: Cog,
  },
  {
    value: "dessert",
    label: "На десерт",
    icon: CakeSlice,
  },
  {
    value: "maybe vibes",
    label: "Вроде и прек, но хз",
    icon: Tornado,
  },
];

export const normalizeBacklogTag = (value: string | null | undefined): string =>
  (value ?? "").trim().toLowerCase();

const TAG_PRESET_MAP = new Map(
  BACKLOG_TAG_PRESETS.map((preset) => [
    normalizeBacklogTag(preset.value),
    preset,
  ])
);

export const getBacklogTagPreset = (
  value: string | null | undefined
): BacklogTagPreset | undefined =>
  TAG_PRESET_MAP.get(normalizeBacklogTag(value));
