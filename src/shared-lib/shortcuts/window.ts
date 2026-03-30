import { inRange, range } from "lodash";

export type UiWindow = {
  cursor: number;
  size: number;
};

export type FancyWindow = ReturnType<typeof Fancy>;

export const Fancy = (w: UiWindow) => {
  return {
    range: () => range(w.cursor, w.cursor + w.size),
    inBounds: (i: number): boolean => {
      return inRange(i, w.cursor, w.cursor + w.size);
    },
    growDown: (max: number): UiWindow => {
      return {
        ...w,
        size: Math.min(w.size + 1, max - w.cursor),
      };
    },
    growUp: (): UiWindow => {
      const newCursor = Math.max(0, w.cursor - 1);
      const newSize = w.size + (w.cursor - newCursor);
      return {
        cursor: newCursor,
        size: newSize,
      };
    },
    slice: <T>(arr: T[]): T[] => {
      return arr.slice(w.cursor, w.cursor + w.size);
    },
    ...w,
  };
};
