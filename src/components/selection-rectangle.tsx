import { Rect } from "react-konva";

interface SelectionRectangleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
}

export const SelectionRectangle = ({
  x,
  y,
  width,
  height,
  visible,
}: SelectionRectangleProps) => {
  if (!visible) return null;

  return (
    <Rect
      x={Math.min(x, x + width)}
      y={Math.min(y, y + height)}
      width={Math.abs(width)}
      height={Math.abs(height)}
      fill="rgba(34, 211, 238, 0.2)" // cyan-400 with 20% opacity
      stroke="#22d3ee" // cyan-400
      strokeWidth={2}
      dash={[5, 5]}
    />
  );
};
