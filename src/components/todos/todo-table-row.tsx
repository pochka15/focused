import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/random/utils";
import { colors, findTag } from "@/lib/todos/mappings";
import type { TodoItem } from "@/lib/todos/todo-models";
import { checkEventIsSoon, isTask } from "@/lib/todos/todo-utils";
import type { FC } from "react";

export const TodoTableRow: FC<{
  todo: TodoItem;
  num: number;
  cross: boolean;
  editing: boolean;
  nextNum?: number;
}> = ({ todo, num, cross, editing, nextNum }) => {
  const tag = isTask(todo) ? findTag(todo.tag) : undefined;
  const sTag = tag ? `${tag?.emoji} ${tag?.description}` : "tag not found";

  return isTask(todo) ? (
    <TableRow className={cn(cross && colors.deleting)}>
      <TableCell
        className={cn("w-[50px] font-mono", editing && colors.editing)}
      >
        {num}
        {nextNum ? ` -> ${nextNum}` : ""}
      </TableCell>
      <TableCell className="font-medium text-balance whitespace-normal">
        <span> {todo.name}</span>
      </TableCell>
      <TableCell>
        <span className="py-1 font-medium">{todo.priority}</span>
      </TableCell>
      <TableCell className="font-medium text-balance whitespace-normal">
        <span className="py-1">{sTag}</span>
      </TableCell>
      <TableCell>
        <span className="py-1">{todo.mode}</span>
      </TableCell>
    </TableRow>
  ) : (
    <TableRow className={cn(cross && colors.deleting)}>
      <TableCell
        className={cn("w-[50px] font-mono", editing && colors.editing)}
      >
        {num}
        {nextNum ? ` -> ${nextNum}` : ""}
      </TableCell>
      <TableCell className="font-medium text-balance whitespace-normal">
        {todo.name}
      </TableCell>
      <TableCell colSpan={3}>
        <span className={cn(checkEventIsSoon(todo) && colors.soonEvent)}>
          {todo.rawTime}
        </span>
      </TableCell>
    </TableRow>
  );
};
