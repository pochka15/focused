import {
  Drawer,
  DrawerDescription,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { getDefaultPosition, hasPosition } from "@/lib/canvas/canvas-utils";
import { STARTING_POINT } from "@/lib/canvas/constants";
import { useNuphy } from "@/lib/nuphy/nuphy-provider";
import { useNuphyMode } from "@/lib/stores/nuphys-store";
import { useTodosStore } from "@/lib/stores/todos-store";
import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Circle, Layer, Stage, Text } from "react-konva";
import { Character } from "./canvas-character";
import { Enemy } from "./canvas-enemy";
import { SelectionRectangle } from "./selection-rectangle";
import { TodoForm } from "./todos/todo-form";

export const CanvasBoard = () => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [spawnPosition, setSpawnPosition] = useState({ x: 0, y: 0 });
  const [characterPosition, setCharacterPosition] = useState({
    ...STARTING_POINT,
  });
  const [isKillMode, setIsKillMode] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedEnemyIds, setSelectedEnemyIds] = useState<Set<string>>(
    new Set()
  );
  const [isMouseDown, setIsMouseDown] = useState(false);

  const stageRef = useRef<Konva.Stage>(null);

  const todos = useTodosStore((s) => s.todos);
  const editTodo = useTodosStore((s) => s.editTodo);
  const completeTodo = useTodosStore((s) => s.archiveTodo);

  const { enabled: isFormOpen } = useNuphyMode("editingTodo");

  const { enableMode, disableModes } = useNuphy({
    name: "canvasBoard",
    enabled: true,
    keys: (key, event) => {
      // Kill mode toggle
      if (key === "a" && !isFormOpen) {
        setIsKillMode((prev) => !prev);
        return true;
      }

      return false;
    },
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Migrate todos without positions
  useEffect(() => {
    todos.forEach((todo, index) => {
      if (!hasPosition(todo)) {
        const defaultPos = getDefaultPosition(index);
        editTodo({ ...todo, x: defaultPos.x, y: defaultPos.y });
      }
    });
  }, []);

  // Track Space key state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") setIsSpacePressed(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") setIsSpacePressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Handle canvas right-click to spawn enemy
  const handleStageRightClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();

    // Ignore if clicking on enemy
    if (e.target !== e.target.getStage()) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    // Convert screen coordinates to world coordinates
    const transform = stage.getAbsoluteTransform().copy().invert();
    const worldPos = transform.point(pointerPosition);

    // Clear selection rectangle if showing
    setSelectionStart(null);
    setSelectionEnd(null);

    setSpawnPosition({ x: worldPos.x, y: worldPos.y });
    enableMode("editingTodo");
  };

  // Handle mouse down on stage to start selection or clear selection
  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Ignore if space is pressed
    if (isSpacePressed) return;

    setIsMouseDown(true);

    // If clicking on empty stage, clear selection and potentially start new selection
    if (e.target === e.target.getStage()) {
      setSelectedEnemyIds(new Set());

      const stage = e.target.getStage();
      if (!stage) return;

      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;

      // Convert screen coordinates to world coordinates
      const transform = stage.getAbsoluteTransform().copy().invert();
      const worldPos = transform.point(pointerPosition);

      // Start selection
      setSelectionStart(worldPos);
      setSelectionEnd(worldPos);
    }
  };

  // Handle mouse move for selection rectangle
  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!selectionStart || !isMouseDown) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    const transform = stage.getAbsoluteTransform().copy().invert();
    const worldPos = transform.point(pointerPosition);

    setSelectionEnd(worldPos);
  };

  // Handle mouse up to end selection
  const handleStageMouseUp = () => {
    setIsMouseDown(false);

    if (selectionStart && selectionEnd) {
      // Calculate which enemies are in the selection rectangle
      const minX = Math.min(selectionStart.x, selectionEnd.x);
      const maxX = Math.max(selectionStart.x, selectionEnd.x);
      const minY = Math.min(selectionStart.y, selectionEnd.y);
      const maxY = Math.max(selectionStart.y, selectionEnd.y);

      const selected = new Set<string>();
      todos.forEach((todo) => {
        if (
          todo.x >= minX &&
          todo.x <= maxX &&
          todo.y >= minY &&
          todo.y <= maxY
        ) {
          selected.add(todo.id);
        }
      });

      setSelectedEnemyIds(selected);

      // Clear selection rectangle
      setSelectionStart(null);
      setSelectionEnd(null);
    }
  };

  // Handle enemy click
  const handleEnemyClick = (todoId: string, x: number, y: number) => {
    if (isKillMode) {
      // In kill mode: mark task as completed (ghost) and teleport character
      const todo = todos.find((t) => t.id === todoId);
      if (todo) {
        editTodo({ ...todo, completed: true });
      }
      setCharacterPosition({ x, y });
      setIsKillMode(false);
    }
  };

  // Handle enemy right-click to edit
  const handleEnemyRightClick = (todoId: string) => {
    enableMode("editingTodo", { id: todoId });
  };

  // Handle enemy drag - if enemy is in selection, drag all selected
  const handleEnemyDrag = (todoId: string, newX: number, newY: number) => {
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;

    const deltaX = newX - todo.x;
    const deltaY = newY - todo.y;

    if (selectedEnemyIds.has(todoId)) {
      // Drag all selected enemies
      todos.forEach((t) => {
        if (selectedEnemyIds.has(t.id)) {
          editTodo({ ...t, x: t.x + deltaX, y: t.y + deltaY });
        }
      });
    } else {
      // Drag only this enemy
      editTodo({ ...todo, x: newX, y: newY });
    }
  };

  return (
    <>
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        draggable={isSpacePressed}
        onMouseDown={handleStageMouseDown}
        onContextMenu={handleStageRightClick}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
      >
        <Layer>
          {/* Starting point marker */}
          <Circle
            x={STARTING_POINT.x}
            y={STARTING_POINT.y}
            radius={20}
            fill="#10b981" // emerald-500
            stroke="#047857" // emerald-700
            strokeWidth={3}
          />
          <Text
            x={STARTING_POINT.x}
            y={STARTING_POINT.y - 40}
            text="START"
            fontSize={16}
            fill="white"
            fontStyle="bold"
            offsetX={25}
          />

          {/* Character */}
          <Character x={characterPosition.x} y={characterPosition.y} />

          {/* Enemies */}
          {todos.map((todo) => (
            <Enemy
              key={todo.id}
              todo={todo}
              isKillMode={isKillMode}
              isSelected={selectedEnemyIds.has(todo.id)}
              isGhost={todo.completed || false}
              isDraggingEnabled={true}
              onClick={() => handleEnemyClick(todo.id, todo.x, todo.y)}
              onRightClick={() => handleEnemyRightClick(todo.id)}
              onDragEnd={(x, y) => handleEnemyDrag(todo.id, x, y)}
            />
          ))}

          {/* Selection rectangle */}
          {selectionStart && selectionEnd && (
            <SelectionRectangle
              x={selectionStart.x}
              y={selectionStart.y}
              width={selectionEnd.x - selectionStart.x}
              height={selectionEnd.y - selectionStart.y}
              visible={true}
            />
          )}

          {/* Kill mode indicator */}
          {isKillMode && (
            <Text
              x={dimensions.width / 2}
              y={50}
              text="🎯 KILL MODE - Click enemy to complete"
              fontSize={24}
              fill="#ef4444" // red-500
              fontStyle="bold"
              align="center"
              offsetX={200}
            />
          )}
        </Layer>
      </Stage>

      {/* Todo form drawer */}
      <Drawer
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) disableModes(["editingTodo"]);
        }}
        direction="right"
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Task</DrawerTitle>
            <DrawerDescription />
          </DrawerHeader>
          <div className="px-4 pb-4">
            <TodoForm x={spawnPosition.x} y={spawnPosition.y} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
