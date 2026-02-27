import { cn } from "@/lib/random/utils";
import { useTodosStore } from "@/lib/stores/todos-store";
import { tagsMapping, type TagName } from "@/lib/todos/mappings";
import { isTask } from "@/lib/todos/todo-utils";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";

const targetTags: TagName[] = [
  "good-one",
  "light-good",
  "deep-routine",
  "light-routine",
];

export const Stats = () => {
  const { enabled: showingHelp } = useShortcutsMode("showingHelp");
  const todos = useTodosStore((it) => it.todos);

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 text-4xl",
        showingHelp && "hidden"
      )}
    >
      <div className="flex gap-2">
        {targetTags.map((tag) => {
          const tasks = todos.filter(
            (t) => isTask(t) && t.completed && t.tag === tag
          );
          const emoji = tagsMapping[tag].emoji;

          return tasks.map((_, ind) => (
            <span key={`${tag}-${ind}`}>{emoji}</span>
          ));
        })}
      </div>
    </div>
  );
};
