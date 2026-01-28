import { cn } from "@/lib/random/utils";
import { useNuphyMode } from "@/lib/stores/nuphys-store";
import { useTodosStore } from "@/lib/stores/todos-store";
import { tagsMapping, type TagName } from "@/lib/todos/mappings";
import { isTask } from "@/lib/todos/todo-utils";

const deepRoutineTag: TagName = "deep-routine";
const emoji = tagsMapping[deepRoutineTag].emoji;

export const Stats = () => {
  const { enabled: showingHelp } = useNuphyMode("showingHelp");
  const todos = useTodosStore((it) => it.todos);
  const tasks = todos.filter(
    (t) => isTask(t) && t.completed && t.tag === deepRoutineTag
  );

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 text-4xl",
        showingHelp && "hidden"
      )}
    >
      <div className="flex gap-2">
        {tasks.map((_, ind) => (
          <span key={ind}>{emoji}</span>
        ))}
      </div>
    </div>
  );
};
