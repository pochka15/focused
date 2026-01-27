import { Rect } from "react-konva";
import { CHARACTER_COLOR, CHARACTER_SIZE } from "@/lib/canvas/constants";

interface CharacterProps {
  x: number;
  y: number;
}

export const Character = ({ x, y }: CharacterProps) => {
  return (
    <Rect
      x={x - CHARACTER_SIZE / 2}
      y={y - CHARACTER_SIZE / 2}
      width={CHARACTER_SIZE}
      height={CHARACTER_SIZE}
      fill={CHARACTER_COLOR}
      strokeWidth={3}
      stroke="#0e7490" // cyan-700
      cornerRadius={4}
    />
  );
};
