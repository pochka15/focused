import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, safeParseNumber } from "@/lib/random/utils";
import type { SelectOperation } from "@/lib/shortcuts/shortcuts-modes";
import { useTodosStore } from "@/lib/stores/todos-store";
import { colors } from "@/lib/todos/mappings";
import {
  calcMinutesLeft,
  checkEventIsSoon,
  isEvent,
} from "@/lib/todos/todo-utils";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { nth } from "lodash";
import { useEffect, useState } from "react";
import { TodoForm } from "./todos/todo-form";
import { TodoTableRow } from "./todos/todo-table-row";

const SoonEvents = () => {
  const todos = useTodosStore((it) => it.todos);
  const events = todos.filter((todo) => isEvent(todo));
  const soonEvents = events
    .filter(checkEventIsSoon)
    .sort(
      (a, b) => calcMinutesLeft(a.rawTime)!! - calcMinutesLeft(b.rawTime)!!
    );
  const { enabled: editing } = useShortcutsMode("editingTodo");

  return soonEvents?.length && !editing ? (
    <div className="flex w-full flex-col items-center justify-center gap-2 pt-4">
      {soonEvents.map((event) => (
        <p key={event.id} className="text-6xl font-bold text-pink-500">
          {event.name} at {event.rawTime}
        </p>
      ))}
    </div>
  ) : null;
};

const TablePanel = () => {
  const todos = useTodosStore((it) => it.todos);
  const { enabled: focusing } = useShortcutsMode("focusing");
  const { enabled: selecting, data: selectingTodosData } =
    useShortcutsMode("selectingTodos");
  const { enabled: editing, data: editingTodoData } =
    useShortcutsMode("editingTodo");
  const reorder = useTodosStore((it) => it.reorder);
  const bulkArchive = useTodosStore((it) => it.bulkArchive);
  const bulkDelete = useTodosStore((it) => it.bulkDelete);
  const isReorderOp = selecting && selectingTodosData.operation === "reorder";
  const isArchiveOp = selecting && selectingTodosData.operation === "archive";
  const isDeleteOp = selecting && selectingTodosData.operation === "delete";
  const kindaDeleting = isArchiveOp || isDeleteOp;
  const isEditOp = selecting && selectingTodosData.operation === "edit";
  const selectedId = editing ? editingTodoData?.id : undefined;

  const nextOrder = isReorderOp
    ? new Map(
        selectingTodosData.order.map((n, nextInd) => [
          nth(todos, n - 1)?.id,
          nextInd + 1,
        ])
      )
    : new Map();

  const toDelete = kindaDeleting
    ? new Set(selectingTodosData.order)
    : new Set();

  const displayedTodos = focusing ? todos.slice(0, 2) : todos;
  const remainingCount = focusing ? Math.max(0, todos.length - 2) : 0;

  const { enableMode, disableModes } = useShortcuts({
    name: "tablePanel",
    enabled: selecting || focusing,
    keys: (key, evt) => {
      if (key == "Escape") {
        disableModes(["selectingTodos", "focusing"]);
        return true;
      }

      if (key == "Enter") {
        if (isReorderOp) {
          reorder(
            selectingTodosData.order
              .map((num) => nth(todos, num - 1)?.id)
              .filter((it) => it !== undefined)
          );
          disableModes(["selectingTodos"]);
        } else if (kindaDeleting) {
          const ids = selectingTodosData.order
            .map((num) => nth(todos, num - 1)?.id)
            .filter((it) => it !== undefined);
          if (isArchiveOp) bulkArchive(ids);
          else bulkDelete(ids);
          disableModes(["selectingTodos"]);
        }
        return true;
      }

      const n = safeParseNumber(key);
      if (!n) return false;
      evt.preventDefault();

      if (isEditOp) {
        const id = nth(todos, n - 1)?.id;
        if (id) enableMode("editingTodo", { id });
        return true;
      }

      if (kindaDeleting || isReorderOp) {
        let operation: SelectOperation = "archive";
        if (isDeleteOp) operation = "delete";
        else if (isReorderOp) operation = "reorder";

        enableMode("selectingTodos", {
          operation,
          order: [...selectingTodosData.order, n],
        });
        return true;
      }

      return false;
    },
  });

  return (
    <div className={cn("flex flex-col gap-2 p-4", editing && "hidden")}>
      {todos.length === 0 ? (
        <p className="text-muted-foreground text-sm">No todos yet</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className={cn(
                    "w-[50px]",
                    kindaDeleting && colors.deleting,
                    isReorderOp && "min-w-20 text-blue-300",
                    isEditOp && colors.editing,
                    focusing && "text-violet-600"
                  )}
                >
                  #
                </TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Mode</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedTodos.map((todo, ind) => (
                <TodoTableRow
                  key={todo.id}
                  num={ind + 1}
                  todo={todo}
                  nextNum={nextOrder.get(todo.id)}
                  cross={toDelete.has(ind + 1)}
                  editing={selectedId === todo.id}
                />
              ))}
            </TableBody>
          </Table>
          {focusing && remainingCount > 0 && (
            <p className="text-muted-foreground mt-2 text-sm">
              {remainingCount} more todo{remainingCount !== 1 ? "s" : ""}{" "}
              remaining
            </p>
          )}
        </>
      )}
    </div>
  );
};

export const MainPanel = () => {
  const [, forceUpdate] = useState({});

  // Re-render on window focus
  useEffect(() => {
    const reRender = () => forceUpdate({});
    window.addEventListener("focus", reRender);
    const interval = setInterval(reRender, 60 * 1000);

    return () => {
      window.removeEventListener("focus", reRender);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <TablePanel />
      <SoonEvents />
      <TodoForm />
    </div>
  );
};
