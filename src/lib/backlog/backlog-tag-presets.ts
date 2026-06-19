export type BacklogTagPreset = {
  value: string;
  label: string;
  emoji: string;
  color: string;
};

export const BACKLOG_TAG_PRESETS: BacklogTagPreset[] = [
  {
    value: "real value",
    label: "Хорошая ценность",
    emoji: "🌟",
    color: "yellow",
  },
  {
    value: "thank me later",
    label: "Скажешь спасибо позже",
    emoji: "🙏",
    color: "teal",
  },
  {
    value: "duty task",
    label: "Классическая дежурная",
    emoji: "⚙️",
    color: "gray",
  },
  {
    value: "dessert",
    label: "На десерт",
    emoji: "🍰",
    color: "pink",
  },
  {
    value: "maybe vibes",
    label: "Вроде и прек, но хз",
    emoji: "🌀",
    color: "indigo",
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
