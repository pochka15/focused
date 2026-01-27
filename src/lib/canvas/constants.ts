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
  "good-one": "#fbbf24", // amber-400
  "light-good": "#a78bfa", // violet-400
  "new-urgent": "#f87171", // red-400
  "deep-routine": "#60a5fa", // blue-400
  "light-routine": "#34d399", // emerald-400
  "daily-noise": "#fb923c", // orange-400
  pleasures: "#f472b6", // pink-400
  other: "#94a3b8", // slate-400
};

// Event color (for events without tags)
export const EVENT_COLOR = "#818cf8"; // indigo-400

// Character color
export const CHARACTER_COLOR = "#22d3ee"; // cyan-400

// Animation durations (ms)
export const KILL_ANIMATION_DURATION = 500;
export const TELEPORT_ANIMATION_DURATION = 300;
export const EVENT_MOVE_ANIMATION_DURATION = 800;
