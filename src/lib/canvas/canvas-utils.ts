import { STARTING_POINT } from "./constants";

/**
 * Calculate distance between two points
 */
export const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

/**
 * Calculate distance from starting point
 */
export const distanceFromStart = (x: number, y: number): number => {
  return distance(x, y, STARTING_POINT.x, STARTING_POINT.y);
};

/**
 * Calculate new position moving toward target by a ratio
 * @param currentX Current X position
 * @param currentY Current Y position
 * @param targetX Target X position (usually STARTING_POINT.x)
 * @param targetY Target Y position (usually STARTING_POINT.y)
 * @param ratio How much to move (0 = no move, 1 = reach target, 0.5 = halfway)
 */
export const moveToward = (
  currentX: number,
  currentY: number,
  targetX: number,
  targetY: number,
  ratio: number
): { x: number; y: number } => {
  const newX = currentX + (targetX - currentX) * ratio;
  const newY = currentY + (targetY - currentY) * ratio;
  return { x: newX, y: newY };
};

/**
 * Check if a todo has position coordinates (for migration)
 */
export const hasPosition = (todo: { x?: number; y?: number }): boolean => {
  return typeof todo.x === "number" && typeof todo.y === "number";
};

/**
 * Default position generator for migrated todos
 */
export const getDefaultPosition = (index: number) => ({
  x: STARTING_POINT.x + (index + 1) * 150,
  y: STARTING_POINT.y + (Math.random() * 200 - 100), // Random Y offset
});
