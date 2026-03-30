import { Rect } from "react-konva";

interface SelectionRectangleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  fillColor?: string;
  strokeColor?: string;
}

export const SelectionRectangle = ({
  x,
  y,
  width,
  height,
  visible,
  fillColor = "rgba(34, 211, 238, 0.2)",
  strokeColor = "#22d3ee",
}: SelectionRectangleProps) => {
  if (!visible) return null;

  return (
    <Rect
      x={Math.min(x, x + width)}
      y={Math.min(y, y + height)}
      width={Math.abs(width)}
      height={Math.abs(height)}
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={2}
      dash={[5, 5]}
    />
  );
};
