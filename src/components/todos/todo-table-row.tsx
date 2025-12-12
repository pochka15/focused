import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/random/utils";
import type { Task, TodoItem } from "@/lib/todos/todo-models";
import type { FC } from "react";
import { isTask } from "@/lib/todos/todo-utils";

export const modes: Record<Task["mode"], string> = {
  deep: "На подумать",
  light: "На чилле",
};

export const tags: Record<Task["tag"], string> = {
  "just-do-it": "Just Do It",
  "nicely-done": "Раздать стиль",
  garbage: "Хрень",
};

export const TodoTableRow: FC<{
  todo: TodoItem;
  num: number;
  cross: boolean;
  nextNum?: number;
}> = ({ todo, num, cross, nextNum }) => {
  return isTask(todo) ? (
    <TableRow className={cn(cross && "text-muted-foreground line-through")}>
      <TableCell className="w-[50px] font-mono">
        {num}
        {nextNum ? ` -> ${nextNum}` : ""}
      </TableCell>
      <TableCell className="font-medium">
        <span
          className={cn(
            "wrap-break-word",
            todo.completed && "text-muted-foreground line-through"
          )}
        >
          {todo.name}
        </span>
      </TableCell>
      <TableCell>
        <span className="py-1 font-medium">
          {todo.urgencyLvl === "urgent" ? "🔥 Горит" : todo.urgencyLvl}
        </span>
      </TableCell>
      <TableCell>
        <span className="py-1">{tags[todo.tag]}</span>
      </TableCell>
      <TableCell>
        <span className="py-1">{modes[todo.mode]}</span>
      </TableCell>
    </TableRow>
  ) : (
    <TableRow className={cn(cross && "text-muted-foreground line-through")}>
      <TableCell className="w-[50px] font-mono">{num}</TableCell>
      <TableCell className="font-medium">{todo.name}</TableCell>
      <TableCell colSpan={2}>
        <span className="text-muted-foreground text-sm">Event</span>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-muted-foreground text-xs">
          {new Date(todo.date).toLocaleDateString()}
        </span>
      </TableCell>
    </TableRow>
  );
};
