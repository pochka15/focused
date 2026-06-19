export type SnoozePreset = {
  key: string;
  label: string;
  minutes: number;
};

export const SNOOZE_PRESETS: SnoozePreset[] = [
  { key: "1", label: "30m", minutes: 30 },
  { key: "2", label: "1h", minutes: 60 },
  { key: "3", label: "1.5h", minutes: 90 },
  { key: "4", label: "2h", minutes: 120 },
  { key: "5", label: "3h", minutes: 180 },
  { key: "6", label: "4h", minutes: 240 },
];
