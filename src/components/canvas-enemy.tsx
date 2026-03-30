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
  isGhost?: boolean;
  isDraggingEnabled?: boolean;
  themeColors?: {
    defaultStroke: string;
    selectedStroke: string;
    killStroke: string;
    label: string;
    eventLabel: string;
  };
}

export const Enemy = ({
  todo,
  onDragEnd,
  onClick,
  onRightClick,
  isKillMode = false,
  isSelected = false,
  isGhost = false,
  isDraggingEnabled = false,
  themeColors,
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
  const opacity = isGhost ? 0.3 : 1;
  const defaultStrokeColor = themeColors?.defaultStroke ?? "#1e293b";
  const selectedStrokeColor = themeColors?.selectedStroke ?? "#22d3ee";
  const killStrokeColor = themeColors?.killStroke ?? "#ef4444";
  const labelColor = themeColors?.label ?? "#0f172a";
  const eventLabelColor = themeColors?.eventLabel ?? "#f472b6";

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
      opacity={opacity}
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
        stroke={
          isKillMode
            ? killStrokeColor
            : isSelected
              ? selectedStrokeColor
              : defaultStrokeColor
        }
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
          fill={labelColor}
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
            fill={eventLabelColor}
            wrap="word"
            ellipsis={true}
          />
          {/* Minutes left if event is soon */}
          <Text
            text={`(in ${getMinutesLeft()} minutes)`}
            y={ENEMY_RADIUS + 28}
            fontSize={12}
            fill={eventLabelColor}
          />
        </>
      ) : null}
    </Group>
  );
};
