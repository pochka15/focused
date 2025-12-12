import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRootNuphy } from "@/lib/nuphy/use-root-nuphy";
import { cn } from "@/lib/random/utils";
import { useTodosStore } from "@/lib/stores/todos-store";
import { sortByUrgency } from "@/lib/todos/todo-utils";
import { nth } from "lodash";
import { TodoForm } from "./todos/todo-form";
import { TodoTableRow } from "./todos/todo-table-row";

export const MainPanel = () => {
  const notSortedTodos = useTodosStore((it) => it.todos);
  const reorder = useTodosStore((it) => it.reorder);
  const bulkDelete = useTodosStore((it) => it.bulkDelete);
  const todos = sortByUrgency(notSortedTodos);

  const {
    deleting,
    reordering,
    order: enteredNumbers,
  } = useRootNuphy({
    onSubmit: (order) => {
      if (reordering)
        reorder(
          order
            .map((num) => nth(todos, num - 1)?.id)
            .filter((it) => it !== undefined)
        );
      else if (deleting) {
        const ids = order
          .map((num) => nth(todos, num - 1)?.id)
          .filter((it) => it !== undefined);
        bulkDelete(ids);
      }
    },
  });

  const nextOrder = reordering
    ? new Map(
        enteredNumbers.map((n, nextInd) => [nth(todos, n - 1)?.id, nextInd + 1])
      )
    : new Map();

  const toDelete = deleting ? new Set(enteredNumbers) : new Set();

  return (
    <div className="grid max-w-7xl grid-cols-2 gap-2 2xl:ml-[500px]">
      <div className="p-4">
        {todos.length === 0 ? (
          <p className="text-muted-foreground text-sm">No todos yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className={cn(
                    "w-[50px]",
                    deleting && "text-red-300",
                    reordering && "text-blue-300"
                  )}
                >
                  #
                </TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Mode</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todos.map((todo, ind) => (
                <TodoTableRow
                  key={todo.id}
                  num={ind + 1}
                  todo={todo}
                  nextNum={nextOrder.get(todo.id)}
                  cross={toDelete.has(ind + 1)}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <div>
        <TodoForm />
      </div>
    </div>
  );
};
