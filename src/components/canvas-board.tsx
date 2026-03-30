import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  findRightMostTodo,
  getDefaultPosition,
  hasPosition,
} from "@/lib/canvas/canvas-utils";
import { STARTING_POINT } from "@/lib/canvas/constants";
import { useTodosStore } from "@/lib/stores/todos-store";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Circle, Layer, Stage, Text } from "react-konva";
import { Enemy } from "./canvas-enemy";
import { helpCommands } from "./help";
import { SelectionRectangle } from "./selection-rectangle";
import { useTheme } from "./theme-provider";
import { TodoForm } from "./todos/todo-form";

export const CanvasBoard = () => {
  const { theme } = useTheme();
  const [prefersDark, setPrefersDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
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

  const isDarkMode = theme === "dark" || (theme === "system" && prefersDark);

  const canvasTheme = isDarkMode
    ? {
        startFill: "#a7c080",
        startStroke: "#83c092",
        startText: "#333c43",
        killIndicator: "#e67e80",
        enemyStroke: "#2d353b",
        enemySelectedStroke: "#7fbbb3",
        enemyKillStroke: "#e67e80",
        enemyLabel: "#d3c6aa",
        eventLabel: "#e69875",
        selectionFill: "rgba(127, 187, 179, 0.2)",
        selectionStroke: "#7fbbb3",
      }
    : {
        startFill: "#10b981",
        startStroke: "#047857",
        startText: "#ffffff",
        killIndicator: "#ef4444",
        enemyStroke: "#1e293b",
        enemySelectedStroke: "#22d3ee",
        enemyKillStroke: "#ef4444",
        enemyLabel: "#0f172a",
        eventLabel: "#f472b6",
        selectionFill: "rgba(34, 211, 238, 0.2)",
        selectionStroke: "#22d3ee",
      };

  const todos = useTodosStore((s) => s.todos);
  const editTodo = useTodosStore((s) => s.editTodo);

  const { enabled: isFormOpen } = useShortcutsMode("editingTodo");
  const { enabled: isEditingNotifications } = useShortcutsMode(
    "editingNotifications"
  );

  const { enableMode, disableModes } = useShortcuts({
    name: "canvasBoard",
    enabled: !isEditingNotifications,
    keys: (key, event) => {
      // Kill mode toggle
      if (key === "a" && !isFormOpen) {
        setIsKillMode((prev) => !prev);
        return true;
      }

      if (key == helpCommands.newTodo.key && !isFormOpen) {
        event.preventDefault();
        const rightMostTodo = findRightMostTodo(todos);
        const spawnPosition =
          rightMostTodo && hasPosition(rightMostTodo)
            ? { x: rightMostTodo.x + 70, y: rightMostTodo.y - 70 }
            : STARTING_POINT;
        enableMode("editingTodo", { spawnPosition });
        return true;
      }

      // Pan to right-most task
      if (key === "f" && !isFormOpen) {
        const stage = stageRef.current;
        if (!stage) return false;

        const rightMostTodo = findRightMostTodo(todos);

        if (rightMostTodo && hasPosition(rightMostTodo)) {
          // Calculate the position to center the right-most task
          const centerX = dimensions.width / 2;
          const centerY = dimensions.height / 2;

          // Set stage position so that the right-most task is at the center
          stage.position({
            x: centerX - rightMostTodo.x,
            y: centerY - rightMostTodo.y,
          });
          stage.batchDraw();
        }
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

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleMediaThemeChange = (event: MediaQueryListEvent) => {
      setPrefersDark(event.matches);
    };

    mediaQuery.addEventListener("change", handleMediaThemeChange);
    return () =>
      mediaQuery.removeEventListener("change", handleMediaThemeChange);
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

    enableMode("editingTodo", {
      spawnPosition: { x: worldPos.x, y: worldPos.y },
    });
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
      // In kill mode: mark task as completed (ghost)
      const todo = todos.find((t) => t.id === todoId);
      if (todo) {
        editTodo({ ...todo, completed: true });
      }
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

  if (isEditingNotifications) return null;
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
            fill={canvasTheme.startFill}
            stroke={canvasTheme.startStroke}
            strokeWidth={3}
          />
          <Text
            x={STARTING_POINT.x}
            y={STARTING_POINT.y - 40}
            text="START"
            fontSize={16}
            fill={canvasTheme.startText}
            fontStyle="bold"
            offsetX={25}
          />

          {/* Enemies */}
          {todos.map((todo) => (
            <Enemy
              key={todo.id}
              todo={todo}
              isKillMode={isKillMode}
              isSelected={selectedEnemyIds.has(todo.id)}
              isGhost={todo.completed || false}
              isDraggingEnabled={true}
              themeColors={{
                defaultStroke: canvasTheme.enemyStroke,
                selectedStroke: canvasTheme.enemySelectedStroke,
                killStroke: canvasTheme.enemyKillStroke,
                label: canvasTheme.enemyLabel,
                eventLabel: canvasTheme.eventLabel,
              }}
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
              fillColor={canvasTheme.selectionFill}
              strokeColor={canvasTheme.selectionStroke}
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
              fill={canvasTheme.killIndicator}
              fontStyle="bold"
              align="center"
              offsetX={200}
            />
          )}
        </Layer>
      </Stage>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) disableModes(["editingTodo"]);
        }}
      >
        <DialogContent className="min-w-1/3">
          <DialogHeader>
            <DialogTitle>Task</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <TodoForm />
        </DialogContent>
      </Dialog>
    </>
  );
};
