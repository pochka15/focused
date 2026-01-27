import { STARTING_POINT } from "./constants";
import { moveToward } from "./canvas-utils";
import { calcMinutesLeft } from "@/lib/todos/todo-utils";
import type { Event } from "@/lib/todos/todo-models";

/**
 * Calculate new position for an event based on time elapsed
 * Events move toward the starting point proportionally to how much time has passed
 * 
 * @param event The event to calculate position for
 * @param currentX Current X position of the event
 * @param currentY Current Y position of the event
 * @param previousMinutesLeft Minutes left when last calculated (stored separately)
 * @returns New position {x, y} or null if calculation not possible
 */
export const calculateEventPosition = (
  event: Event,
  currentX: number,
  currentY: number,
  previousMinutesLeft: number
): { x: number; y: number } | null => {
  const currentMinutesLeft = calcMinutesLeft(event.rawTime);
  
  if (currentMinutesLeft === null || previousMinutesLeft <= 0) {
    return null;
  }

  // Calculate how much time has passed as a ratio
  // If time went from 60min to 30min, ratio is 0.5 (move halfway to target)
  const timePassedRatio = 1 - currentMinutesLeft / previousMinutesLeft;
  
  // Clamp ratio between 0 and 1
  const clampedRatio = Math.max(0, Math.min(1, timePassedRatio));

  // Move toward starting point by the ratio
  return moveToward(
    currentX,
    currentY,
    STARTING_POINT.x,
    STARTING_POINT.y,
    clampedRatio
  );
};

/**
 * Get current minutes left for an event (for tracking)
 */
export const getCurrentMinutesLeft = (event: Event): number | null => {
  return calcMinutesLeft(event.rawTime);
};
