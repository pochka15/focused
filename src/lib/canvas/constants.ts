import { tagsMapping, type TagName } from "@/lib/todos/mappings";

// Starting point (player character spawn position)
export const STARTING_POINT = {
  x: 300,
  y: 400,
};

// Entity sizes
export const ENEMY_RADIUS = 40;
export const CHARACTER_SIZE = 50;

// Tag to color mapping for enemy circles
export const TAG_COLORS: Record<TagName, string> = {
  "good-one": "#dbbc7f", // warm yellow
  "light-good": "#d699b6", // mauve
  "new-urgent": "#e67e80", // soft red
  "deep-routine": "#7fbbb3", // muted aqua
  "light-routine": "#83c092", // soft green
  "daily-noise": "#e69875", // warm orange
  pleasures: "#a7c080", // sage green
  other: "#9aa79d", // neutral gray-green
};

// Event color (for events without tags)
export const EVENT_COLOR = "#7fbbb3"; // muted aqua

// Character color
export const CHARACTER_COLOR = "#83c092"; // soft green

// Animation durations (ms)
export const KILL_ANIMATION_DURATION = 500;
export const TELEPORT_ANIMATION_DURATION = 300;
export const EVENT_MOVE_ANIMATION_DURATION = 800;
