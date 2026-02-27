import { cn } from "@/lib/random/utils";
import { useTodosStore } from "@/lib/stores/todos-store";
import { formatHistory } from "@/lib/todos/history-utils";
import { sortByPriority } from "@/lib/todos/todo-utils";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "./theme-provider";

interface CommandLineProps {
  className?: string;
}

export const CommandLine = ({ className }: CommandLineProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [command, setCommand] = useState("");
  const { setTheme } = useTheme();
  const { enabled } = useShortcutsMode("showingCommand");
  const reorder = useTodosStore((it) => it.reorder);
  const getTodos = useTodosStore((it) => it.getTodos);
  const getHistory = useTodosStore((it) => it.getHistory);
  const clearHistory = useTodosStore((it) => it.clearHistory);
  const clear = useTodosStore((it) => it.clear);

  const { enableMode, disableModes } = useShortcuts({
    name: "command",
    enabled,
    keys: (key) => {
      if (key === "Escape") {
        disableModes(["showingCommand"]);
      } else if (key === "Enter") {
        disableModes(["showingCommand"]);
        submit();
      }
      return true;
    },
  });

  const submit = () => {
    switch (command) {
      case "theme-dark":
        setTheme("dark");
        break;
      case "theme-light":
        setTheme("light");
        break;
      case "theme-system":
        setTheme("system");
        break;
      case "sort":
        reorder(sortByPriority(getTodos()).map((it) => it.id));
        break;
      case "help":
        enableMode("showingHelp");
        break;
      case "new":
        enableMode("editingTodo");
        break;
      case "rm":
        enableMode("selectingTodos", { order: [], operation: "delete" });
        break;
      case "history":
        const history = getHistory();
        if (history.length === 0) {
          console.log("No deleted todos in history");
        } else {
          navigator.clipboard
            .writeText(formatHistory(history))
            .then(() => console.log("History copied to clipboard"))
            .catch(() => console.log("Failed to copy history"));
        }
        break;
      case "clear-history":
        clearHistory();
        console.log("History cleared");
        break;
      case "clear":
        clear();
        console.log("History cleared");
        break;
    }
  };

  useEffect(() => {
    if (enabled) inputRef.current?.focus();
    setCommand("");
  }, [enabled]);

  return (
    <div
      className={cn(
        "bg-background border-border fixed right-0 bottom-0 left-0 z-50 border-t p-2",
        !enabled && "hidden",
        className
      )}
    >
      <input
        ref={inputRef}
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        className="text-foreground max-w-full flex-1 border-none bg-transparent font-mono text-sm outline-none"
        autoComplete="off"
        spellCheck="false"
      />
    </div>
  );
};
