import { Circle, Group, Text } from "react-konva";
import { ENEMY_RADIUS, EVENT_COLOR, TAG_COLORS } from "@/lib/canvas/constants";
import type { TodoItem, Event } from "@/lib/todos/todo-models";
import {
  isTask,
  calcMinutesLeft,
  checkEventIsSoon,
  isEvent,
} from "@/lib/todos/todo-utils";
import { tagsMapping } from "@/lib/todos/mappings";
import { useRef } from "react";
import type Konva from "konva";

interface EnemyProps {
  todo: TodoItem;
  onDragEnd?: (x: number, y: number) => void;
  onClick?: () => void;
  onRightClick?: () => void;
  isKillMode?: boolean;
  isSelected?: boolean;
  isDraggingEnabled?: boolean;
}

export const Enemy = ({
  todo,
  onDragEnd,
  onClick,
  onRightClick,
  isKillMode = false,
  isSelected = false,
  isDraggingEnabled = false,
}: EnemyProps) => {
  const groupRef = useRef<Konva.Group>(null);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    onDragEnd?.(node.x(), node.y());
  };

  const handleContextMenu = (e: Konva.KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault();
    onRightClick?.();
  };

  // Get color and emoji based on task type
  const color = isTask(todo) ? TAG_COLORS[todo.tag] : EVENT_COLOR;
  const emoji = isTask(todo) ? tagsMapping[todo.tag].emoji : "⏰";

  const getMinutesLeft = (): number | null => {
    return isEvent(todo) ? calcMinutesLeft((todo as Event).rawTime) : null;
  };

  const showEventTexts = (todo: TodoItem): boolean => {
    return isEvent(todo) && checkEventIsSoon(todo);
  };

  return (
    <Group
      ref={groupRef}
      x={todo.x}
      y={todo.y}
      draggable={isDraggingEnabled}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      onTap={onClick}
      onContextMenu={handleContextMenu}
    >
      {/* Enemy circle */}
      <Circle
        radius={ENEMY_RADIUS}
        fill={color}
        stroke={isKillMode ? "#ef4444" : isSelected ? "#22d3ee" : "#1e293b"} // red in kill mode, cyan if selected, slate otherwise
        strokeWidth={isKillMode || isSelected ? 4 : 2}
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

      {/* Task/Event label below circle */}
      {isTask(todo) ? (
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
      ) : showEventTexts(todo) ? (
        <>
          {/* Event time and name */}
          <Text
            text={`${(todo as Event).rawTime} - ${todo.name}`}
            y={ENEMY_RADIUS + 10}
            fontSize={14}
            fill="#f472b6"
            align="center"
            width={ENEMY_RADIUS * 3}
            offsetX={ENEMY_RADIUS * 1.5}
            wrap="word"
            ellipsis={true}
          />
          {/* Minutes left if event is soon */}
          <Text
            text={`(in ${getMinutesLeft()} minutes)`}
            y={ENEMY_RADIUS + 28}
            fontSize={12}
            fill="#f472b6"
            align="center"
            width={ENEMY_RADIUS * 3}
            offsetX={ENEMY_RADIUS * 1.5}
          />
        </>
      ) : null}
    </Group>
  );
};
