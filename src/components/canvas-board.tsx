import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Circle, Text } from "react-konva";
import { Enemy } from "./canvas-enemy";
import { Character } from "./canvas-character";
import { SelectionRectangle } from "./selection-rectangle";
import { useTodosStore } from "@/lib/stores/todos-store";
import { useNuphy } from "@/lib/nuphy/nuphy-provider";
import { useNuphyMode } from "@/lib/stores/nuphys-store";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TodoForm } from "./todos/todo-form";
import {
  STARTING_POINT,
  KILL_ANIMATION_DURATION,
  TELEPORT_ANIMATION_DURATION,
  EVENT_MOVE_ANIMATION_DURATION,
  ENEMY_RADIUS,
} from "@/lib/canvas/constants";
import { hasPosition, getDefaultPosition } from "@/lib/canvas/canvas-utils";
import { calculateEventPosition, getCurrentMinutesLeft } from "@/lib/canvas/event-positioning";
import { isTask } from "@/lib/todos/todo-utils";
import type { Event } from "@/lib/todos/todo-models";
import type Konva from "konva";

export const CanvasBoard = () => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [spawnPosition, setSpawnPosition] = useState({ x: 0, y: 0 });
  const [characterPosition, setCharacterPosition] = useState({ ...STARTING_POINT });
  const [isKillMode, setIsKillMode] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const lastFocusTimeRef = useRef<number>(Date.now());
  const eventMinutesRef = useRef<Map<string, number>>(new Map());

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

  // Track event minutes for position calculations
  useEffect(() => {
    todos.forEach((todo) => {
      if (!isTask(todo)) {
        const minutes = getCurrentMinutesLeft(todo);
        if (minutes !== null && !eventMinutesRef.current.has(todo.id)) {
          eventMinutesRef.current.set(todo.id, minutes);
        }
      }
    });
  }, [todos]);

  // Handle window focus to update event positions
  useEffect(() => {
    const handleFocus = () => {
      const now = Date.now();
      const timeSinceFocus = now - lastFocusTimeRef.current;
      lastFocusTimeRef.current = now;

      // Only process if significant time has passed (more than 10 seconds)
      if (timeSinceFocus < 10000) return;

      todos.forEach((todo) => {
        if (!isTask(todo)) {
          const event = todo as Event;
          const previousMinutes = eventMinutesRef.current.get(event.id);
          
          if (previousMinutes !== undefined) {
            const newPosition = calculateEventPosition(
              event,
              event.x,
              event.y,
              previousMinutes
            );

            if (newPosition) {
              // Update position in store
              editTodo({ ...event, x: newPosition.x, y: newPosition.y });
              
              // Update tracked minutes
              const currentMinutes = getCurrentMinutesLeft(event);
              if (currentMinutes !== null) {
                eventMinutesRef.current.set(event.id, currentMinutes);
              }
            }
          }
        }
      });
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [todos, editTodo]);

  // Track Space and Shift key state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") setIsSpacePressed(true);
      if (e.key === "Shift") setIsShiftPressed(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") setIsSpacePressed(false);
      if (e.key === "Shift") setIsShiftPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Handle canvas click to spawn enemy or start selection
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Ignore if clicking on enemy
    if (e.target !== e.target.getStage()) return;

    // If space is pressed, allow dragging the stage
    if (isSpacePressed) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    // Convert screen coordinates to world coordinates
    const transform = stage.getAbsoluteTransform().copy().invert();
    const worldPos = transform.point(pointerPosition);

    // If shift is pressed, start selection (but don't do anything yet)
    if (isShiftPressed) {
      setSelectionStart(worldPos);
      setSelectionEnd(worldPos);
      return;
    }

    setSpawnPosition({ x: worldPos.x, y: worldPos.y });
    enableMode("editingTodo");
  };

  // Handle mouse move for selection rectangle
  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isShiftPressed || !selectionStart) return;

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
    if (selectionStart && selectionEnd) {
      // Selection complete - for now, just clear it
      setSelectionStart(null);
      setSelectionEnd(null);
    }
  };

  // Handle enemy click
  const handleEnemyClick = (todoId: string, x: number, y: number) => {
    if (isKillMode) {
      // In kill mode: complete the task and teleport character
      completeTodo(todoId);
      setCharacterPosition({ x, y });
      setIsKillMode(false);
    } else {
      // Normal click: open edit form
      enableMode("editingTodo", { id: todoId });
    }
  };

  // Handle enemy drag (Shift + drag)
  const handleEnemyDrag = (todoId: string, x: number, y: number) => {
    const todo = todos.find((t) => t.id === todoId);
    if (todo) {
      editTodo({ ...todo, x, y });
    }
  };

  return (
    <>
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        draggable={isSpacePressed}
        onClick={handleStageClick}
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
              isDraggingEnabled={false}
              onClick={() => handleEnemyClick(todo.id, todo.x, todo.y)}
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

      {/* Spawn enemy dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) disableModes(["editingTodo"]);
        }}
      >
        <DialogContent
          className="max-w-md"
          style={{
            position: "fixed",
            left: `${Math.min(spawnPosition.x + 100, dimensions.width - 400)}px`,
            top: `${Math.min(spawnPosition.y, dimensions.height - 600)}px`,
          }}
        >
          <TodoForm spawnX={spawnPosition.x} spawnY={spawnPosition.y} />
        </DialogContent>
      </Dialog>
    </>
  );
};
