import { Circle, Group, Text } from "react-konva";
import { ENEMY_RADIUS, EVENT_COLOR, TAG_COLORS } from "@/lib/canvas/constants";
import type { TodoItem } from "@/lib/todos/todo-models";
import { isTask } from "@/lib/todos/todo-utils";
import { tagsMapping } from "@/lib/todos/mappings";
import { useRef } from "react";
import type Konva from "konva";

interface EnemyProps {
  todo: TodoItem;
  onDragEnd?: (x: number, y: number) => void;
  onClick?: () => void;
  isKillMode?: boolean;
  isDraggingEnabled?: boolean;
}

export const Enemy = ({
  todo,
  onDragEnd,
  onClick,
  isKillMode = false,
  isDraggingEnabled = false,
}: EnemyProps) => {
  const groupRef = useRef<Konva.Group>(null);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    onDragEnd?.(node.x(), node.y());
  };

  // Get color and emoji based on task type
  const color = isTask(todo) ? TAG_COLORS[todo.tag] : EVENT_COLOR;
  const emoji = isTask(todo) ? tagsMapping[todo.tag].emoji : "⏰";

  return (
    <Group
      ref={groupRef}
      x={todo.x}
      y={todo.y}
      draggable={isDraggingEnabled}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      onTap={onClick}
    >
      {/* Enemy circle */}
      <Circle
        radius={ENEMY_RADIUS}
        fill={color}
        stroke={isKillMode ? "#ef4444" : "#1e293b"} // red-500 in kill mode, slate-800 otherwise
        strokeWidth={isKillMode ? 4 : 2}
        shadowColor="black"
        shadowBlur={10}
        shadowOpacity={0.3}
        shadowOffsetX={2}
        shadowOffsetY={2}
      />

      {/* Emoji */}
      <Text
        text={emoji}
        fontSize={28}
        fill="white"
        align="center"
        verticalAlign="middle"
        offsetX={14}
        offsetY={14}
      />

      {/* Task name below circle */}
      <Text
        text={todo.name}
        y={ENEMY_RADIUS + 10}
        fontSize={14}
        fill="white"
        align="center"
        width={ENEMY_RADIUS * 3}
        offsetX={ENEMY_RADIUS * 1.5}
        wrap="word"
        ellipsis={true}
      />
    </Group>
  );
};
